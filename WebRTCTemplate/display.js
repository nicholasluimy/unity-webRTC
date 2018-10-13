"use strict";
class SumoDisplay {
    /*
        SumoDisplay is the host-client object
        It contains:
            - Setup details for the application's webRTC signalling server
            - Event handlers for managing incoming connections and messages
     */
    constructor(roomKey) {
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

        this.roomKey = roomKey;
    }

    createRoom() {
        console.log(`Creating Room with key: ${this.roomKey}.`);
        this.db.collection('rooms').doc(this.roomKey).set({});
    }

    // playerDoc: the document snapshot in firestore that represents the player.
    // return: SimplePeer object that represents the player.
    createPlayer(playerDoc) {
        console.log(`Creating player with name: ${playerDoc.id}.`);
        let player = new SimplePeer({ initiator: true, trickle: false });

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
        playerDoc.ref.set({
            offer: data
        }, { merge: true });
    }

    // playerDoc: the document snapshot in firestore that represents the player.
    receiveAnswer(playerDoc) {
        let answer = playerDoc.data().answer;
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
        console.log(`Disconnected from ${playerDoc.id}`);
        this.players[playerDoc.id].destroy();
        delete this.players[playerDoc.id];
        if(playerDoc.exists) playerDoc.ref.delete();
    }

    // data: data param from SimplePeer.on('data').
    handleData(data) {
        let d = JSON.parse(String.fromCharCode.apply(null, data));
        console.log("logging data received");
        console.log(d);
        // Add additional unity hooks here on receiving data. Currently not parsing data,
        // but logging to be able to see
        if (d.type === 'flap') {
            gameInstance.SendMessage('Bird', 'TriggerBird');
        } else if (d.type === 'restart') {
            gameInstance.SendMessage('GameControl', 'RestartGame');
        }

    }

    start() {
        this.createRoom();

        this.detachListener = this.db.collection(`rooms/${this.roomKey}/players`).onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                // new player joined
                if (change.type === 'added') {
                    var player = display.createPlayer(change.doc);

                    player.on('signal', data => this.sendOffer(change.doc, data));
                    player.on('error', error => this.handleError(error));
                    player.on('connect', () => this.handleConnect(change.doc));
                    player.on('close', () => this.handleDisconnect(change.doc));
                    player.on('data', data => this.handleData(data));
                }

                // player answer to offer
                if (change.type === 'modified') {
                    display.receiveAnswer(change.doc);
                }

                // player left
                if (change.type === 'removed') {
                    this.handleDisconnect(change.doc);
                }
            });
        });
    }

    close() {
        console.log(`Closing room "${this.roomKey}".`);
        this.db.collection('rooms').doc(this.roomKey).delete();
        this.detachListener();

        return "Room closed."
    }
}

while (true) {
    let roomKey = prompt("Enter your room key.");
    if (roomKey.trim() === "") continue;

    if (roomKey) break;
}

let display = new SumoDisplay(roomKey);
display.start();

onbeforeunload = () => display.close();

