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

        // Anonymously login user
        firebase.auth().signInAnonymously();

        // Initialize Cloud Firestore through Firebase
        this.db = firebase.firestore();

        // Disable deprecated features
        this.db.settings({
            timestampsInSnapshots: true
        });

        this.rooms = this.db.collection('rooms');

        // Initialize a hashmap to keep track of connected players
        this.players = {};

        this.gameState = new GameState();
        this.roomKey = "default";
    }

    createRoom() {
        console.log(`Creating Room with key: ${this.roomKey}.`);

        return this.db.collection('rooms').doc(this.roomKey).set({
            createTime: Date.now(),
            uid: firebase.auth().currentUser.uid
        });
    }

    // playerDoc: the document snapshot in firestore that represents the player.
    // return: SimplePeer object that represents the player.
    createPlayer(playerDoc) {
        var player = new SimplePeer({ initiator: true, trickle: false });

        // Add players to gameState, and track result
        // Used to determine if we can disconnect from the game
        player.isInGame = this.gameState.addPlayer(playerDoc.id);
        this.players[playerDoc.id] = player;
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
    }

    // playerDoc: the document snapshot in firestore that represents the player.
    handleDisconnect(playerDoc) {
        if (this.players[playerDoc.id].isInGame = true) {
            this.gameState.dropPlayer(playerDoc.id);

        }

        console.log(`Disconnected from ${playerDoc.id}`);
        this.players[playerDoc.id].destroy();

        if (playerDoc.exists) return playerDoc.ref.delete();
    }

    // data: data param from SimplePeer.on('data').
    handleData(data) {
        var d = JSON.parse(String.fromCharCode.apply(null, data));
        var username = d.user;
        if (this.players[username] && this.players[username].isInGame) {
            this.gameState.handleData(d);
        }
    }

    handleListener(snapshot) {
        snapshot.docChanges().forEach(change => {
            // new player joined
            if (change.type === 'added') {
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
    }

    start() {
        console.log(`rooms/${this.roomKey}/players`);
        firebase.auth().signInAnonymously().catch(error => {
            console.error("Fail to initialize display.");
            console.log(error);
        });

        firebase.auth().onAuthStateChanged(room => {
            if (room) {
                console.log(`Initialized display "${this.roomKey}:${room.uid}".`);

                this.createRoom().then(() => {
                    this.detachListener = this.db.collection(`rooms/${this.roomKey}/players`)
                        .onSnapshot(snapshot => this.handleListener(snapshot));
                });

            } else {
                console.log(`Display has been decommissioned.`);
            }
        });
    }

    close() {
        console.log(`Closing room "${this.roomKey}".`);
        this.rooms.doc(this.roomKey).delete();
        this.detachListener();

        return "Room closed."
    }
}
