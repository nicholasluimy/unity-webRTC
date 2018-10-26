"use strict";
class SumoDisplay {
    /*
        SumoDisplay is the host-client object
        It contains:
            - Setup details for the application's webRTC signalling server
            - Event handlers for managing incoming connections and messages
            - Game state object reference
                - (we instantiate through display)
     */
    constructor() {
        // Initialize Firebase
        firebase.initializeApp({
            apiKey: "AIzaSyCwsUgjOL08tNrAZ_Mq012YmrUWZ5Z1NAk",
            authDomain: "fomosumos.firebaseapp.com",
            databaseURL: "https://fomosumos.firebaseio.com",
            projectId: "fomosumos",
            storageBucket: "fomosumos.appspot.com",
            messagingSenderId: "903886436512"
        });

        // Initialize Cloud Firestore through Firebase
        this.db = firebase.firestore();

        // Disable deprecated features
        this.db.settings({
            timestampsInSnapshots: true
        });

        // Initialize a hashmap to keep track of connected players
        this.players = {};

        this.roomKey = "(not-set)";
        this.maxRetry = 5;
        this.retry = 0;

        this.onPlayerCreated = new Function();
        this.onPlayerConnected = new Function();
        this.onPlayerDisconnected = new Function();
        this.onPlayerData = new Function();
        this.onRoomCreatedSuccess = new Function();
        this.onRoomCreatedFail = new Function();
    }

    isRoomExists(roomKey) {
        console.log(`Checking availability of room "${roomKey}".`);

        return this.db.collection('rooms').doc(roomKey).get();
    }

    createRoom(roomKey) {
        console.log(`Creating Room with key: ${roomKey}.`);

        this.roomKey = roomKey;

        return this.db.collection('rooms').doc(this.roomKey).set({
            createTime: Date.now(),
            uid: firebase.auth().currentUser.uid
        });
    }

    // playerDoc: the document snapshot in firestore that represents the player.
    // return: SimplePeer object that represents the player.
    createPlayer(playerDoc) {
        console.log(`Creating player with name: ${playerDoc.id}.`);
        var player = new SimplePeer({ initiator: true, trickle: false, objectMode: true });

        this.players[playerDoc.id] = player;

        this.onPlayerCreated(playerDoc.id);

        return player;
    }

    // playerDoc: the document snapshot in firestore that represents the player.
    // data: data param from SimplePeer.on('signal').
    sendOffer(playerDoc, data) {
        if (!playerDoc.exists) {
            console.log("Player does not exists.");
            return;
        }

        console.log(`Sending offer to ${playerDoc.id}.`);

        return playerDoc.ref.set({
            offer: data,
            offerUid: firebase.auth().currentUser.uid,
        }, { merge: true });
    }

    // playerDoc: the document snapshot in firestore that represents the player.
    receiveAnswer(playerDoc) {
        var answer = playerDoc.data().answer;
        if (answer) {
            console.log(`Received ${playerDoc.id}'s answer.`);

            this.players[playerDoc.id].signal(answer);
        }
    }

    handleError(error) {
        console.log(error);
    }

    // playerDoc: the document snapshot in firestore that represents the player.
    handleConnect(playerDoc) {
        console.log(`Connected to ${playerDoc.id}`);

        this.onPlayerConnected(playerDoc.id);
    }

    // playerDoc: the document snapshot in firestore that represents the player.
    handleDisconnect(playerDoc) {
        console.log(`Disconnected from ${playerDoc.id}`);

        this.players[playerDoc.id].destroy();

        if (playerDoc.exists) return playerDoc.ref.delete();
        // Do callback after removing, otherwise will try to broadcast to disconnected player
        this.onPlayerDisconnected(playerDoc.id);
    }

    // data: data param from SimplePeer.on('data').
    handleData(data) {
        console.log("Received raw data from client.");
        console.log(data);

        this.onPlayerData(data);
    }

    broadcast(data) {
        console.log("Broadcasting data.");
        console.log(`Sending payload "${data}"`);
        Object.keys(this.players).forEach((playerId, index) => {
            console.log(playerId);
            // key: the name of the object key
            // index: the ordinal position of the key within the object 
            this.players[playerId].send(data);
        });
    }

    send(data, playerId) {
        console.log(`Sending data to ${playerId}`);
        console.log(`Sending payload "${data}"`);
        this.players[playerId].send(data);
    }

    handleListener() {
        console.log("Setting up listener for P2P candidates.");
        this.detachListener = this.db.collection(`rooms/${this.roomKey}/players`).onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                // new player joined
                if (change.type === 'added') {
                    console.log(`Player "${change.doc.id}" would like to start a peer connection.`);

                    var player = this.createPlayer(change.doc);

                    player.on('signal', data => this.sendOffer(change.doc, data));
                    player.on('error', error => this.handleError(error));
                    player.on('connect', () => this.handleConnect(change.doc));
                    player.on('close', () => this.handleDisconnect(change.doc));
                    player.on('data', data => this.handleData(data));
                }
                // player answer to offer
                if (change.type === 'modified') {
                    this.receiveAnswer(change.doc);
                }
                // player left
                if (change.type === 'removed') {
                    this.handleDisconnect(change.doc);
                }
            });
        });
    }

    start(roomKey) {

        this.retry++;

        if(this.retry >= this.maxRetry ){
            console.log("Exceeded number of retries to start game room. Aborting.");
            return;
        }

        console.log("Initializing display.");

        firebase.auth().signInAnonymously().catch(error => {
            console.error("Fail to initialize display.");
            console.log(error);
        });

        firebase.auth().onAuthStateChanged(authState => {
            if (authState) {
                console.log(`Initialized display "${roomKey}:${authState.uid}".`);

                this.isRoomExists(roomKey).then(room => {
                    if (!room.exists) {
                        console.log(`Room "${roomKey} is available."`);
                        this.createRoom(roomKey).then(() => {
                            this.handleListener();

                            this.onRoomCreatedSuccess(roomKey);
                        });
                    } else {
                        console.log(`Room "${roomKey}" is unavailable.`);

                        this.onRoomCreatedFail(roomKey);
                    }
                }).catch(error => {
                    console.log("Unknown error when creating room.");
                    console.log(error);
                })
            } else {
                console.log(`Display has been decommissioned.`);
            }
        });
    }

    restart(roomKey) {
        firebase.auth().signOut().then(() => {
            this.retry = 0;
            Object.keys(this.players).forEach((key, index) => {
                this.players[key].close();
            });
            this.players = {};
            this.roomKey = "(not-set)";
            this.start(roomKey);
        })

    }

    close() {
        console.log(`Closing room "${this.roomKey}".`);
        this.db.collection("rooms").doc(this.roomKey).delete();
        this.detachListener();

        return "Room closed."
    }
}
