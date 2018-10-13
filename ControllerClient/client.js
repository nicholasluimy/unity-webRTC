"use strict";
class SumoClient {
    /*
        SumoClient is the host-client object
        It contains:
            - Setup details for the application's webRTC signalling server
            - Event handlers for managing incoming connections and messages
                -- TODO: allow host to send operating mode, to define what sensor data to send
                E.g running game X, requires only shake data
     */
    constructor(playerName, roomKey) {
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

        this.playerName = playerName;
        this.roomKey = roomKey;
    }

    joinRoom() {
        console.log(`${this.playerName} joined the room "${this.roomKey}".`);
        this.db.collection(`rooms/${this.roomKey}/players`).doc(this.playerName).set({});
    }

    sendAnswer(playerDoc, data) {
        console.log(`Sending answer to room "${this.roomKey}".`);
        playerDoc.ref.set({
            answer: data
        }, { merge: true });
    }

    receiveOffer(playerDoc) {
        let offer = playerDoc.data().offer;
        if (offer) {
            console.log(`Received offer from room "${this.roomKey}."`);
            this.player.signal(offer);
        }
    }

    handleError(error) {
        console.log(error);
    }

    // playerDoc: the document snapshot in firestore that represents the player.
    handleConnect() {
        console.log(`Connected to ${this.roomKey}`);
    }

    // playerDoc: the document snapshot in firestore that represents the player.
    handleDisconnect() {
        console.log(`Disconnected from ${this.roomKey}`);
        this.player.destroy();
        this.db.collection(`rooms/${this.roomKey}/players`).doc(this.playerName).delete();
    }

    start() {

        this.joinRoom();

        this.player = new SimplePeer({ initator: false, trickle: false });

        this.detachListener = this.db.collection(`rooms/${this.roomKey}/players`).doc(this.playerName).onSnapshot(snapshot => {
            this.receiveOffer(snapshot);

            this.player.on('error', error => this.handleError(error));
            this.player.on('connect', () => this.handleConnect());
            this.player.on('close', () => this.handleDisconnect(change.doc));
            this.player.on('signal', data => {
                this.sendAnswer(snapshot, data);
                this.detachListener();
            });
        });
    }

    close() {
        this.db.collection(`rooms/${this.roomKey}/players`).doc(this.playerName).delete();

        return "Player left."
    }

}

function flapBird() {
    client.player.send(JSON.stringify({ type: "flap", payload: "flapSent" }));
}

function restartGame() {
    client.player.send(JSON.stringify({ type: "restart", payload: "restartSent" }));
}

while (true) {
    var playerName = prompt("Enter your name.");
    if (playerName.trim() === "") continue;

    if (playerName) break;
}

while (true) {
    let roomKey = prompt("Enter room key.");
    if (roomKey.trim() === "") continue;

    if (roomKey) break;
}

let client = new SumoClient(playerName, roomKey);
client.start();

onbeforeunload = () => client.close();
