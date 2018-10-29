"use strict";

var SimplePeer = require('simple-peer')

export default class SumoClient {
    /*
        SumoClient is the host-client object
        It contains:
            - Setup details for the application's webRTC signalling server
            - Event handlers for managing incoming connections and messages
                -- TODO: allow host to send operating mode, to define what sensor data to send
                E.g running game X, requires only shake data
     */
    constructor(firebase, playerName, roomKey) {

        this.firebase = firebase;

        // Initialize Cloud Firestore through Firebase
        this.db = firebase.firestore();

        // Disable deprecated features
        this.db.settings({
            timestampsInSnapshots: true
        });

        this.playerName = playerName;
        this.roomKey = roomKey;

        this.onJoinedRoom = new Function();
        this.onConnected = new Function();
        this.onDisconnected = new Function();
        this.onHostData = new Function();

        this.player = new SimplePeer({
            initator: false,
            trickle: false,
            objectMode: true,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478?transport=udp' },
                    {
                        urls: "turn:178.128.27.249:3478",
                        username: "test",
                        credential: "test"
                    },
                ]
            },
            channelConfig: {
                //maxPacketLifeTime: 50,
                maxRetransmits: 0,
                ordered: false
            }
        });
    }

    joinRoom() {
        console.log(`${this.playerName} joined the room "${this.roomKey}".`);
        this.onJoinedRoom();
        return this.db.collection(`rooms/${this.roomKey}/players`).doc(this.playerName).set({
            uid: this.firebase.auth().currentUser.uid
        });
    }

    sendAnswer(playerDoc, data) {
        console.log(`Sending answer to room "${this.roomKey}".`);
        return playerDoc.ref.set({
            answer: data,
            answerUid: this.firebase.auth().currentUser.uid,
        }, { merge: true });
    }

    receiveOffer(playerDoc) {
        let offer = playerDoc.data().offer;
        if (offer != undefined) {
            console.log(`Received offer from room "${this.roomKey}."`);
            this.player.signal(offer);
            this.detachListener();
        }
    }

    handleError(error) {
        console.log(error);
    }

    // playerDoc: the document snapshot in firestore that represents the player.
    handleConnect() {
        console.log(`Connected to ${this.roomKey}`);
        this.onConnected();
    }

    // playerDoc: the document snapshot in firestore that represents the player.
    handleDisconnect() {
        console.log(`Disconnected from ${this.roomKey}`);
        this.onDisconnected();

        this.player = null;
        this.detachAuthStateListener();

        return this.db.collection(`rooms/${this.roomKey}/players`).doc(this.playerName)
            .delete()
            .then(() => this.firebase.auth().signOut());
    }

    handleData(data) {
        console.log("Received raw data from host.");
        console.log(data);

        this.onHostData(data);
    }

    send(data) {
        console.log("Sending data to host")

        this.player.send(data)
    }

    handleListener() {
        this.detachListener = this.db.collection(`rooms/${this.roomKey}/players`).doc(this.playerName)
            .onSnapshot(snapshot => {
                this.player.on('error', error => this.handleError(error));
                this.player.on('connect', () => this.handleConnect());
                this.player.on('close', () => this.handleDisconnect());
                this.player.on('data', data => this.handleData(data));
                this.player.on('signal', data => this.sendAnswer(snapshot, data));

                this.receiveOffer(snapshot);
            });
    }

    start() {
        this.firebase.auth().signInAnonymously().catch(error => {
            console.error("Fail to initialize player.");
            console.log(error);
        });

        this.detachAuthStateListener = this.firebase.auth().onAuthStateChanged(player => {
            if (player) {
                console.log(`Initialized player "${this.playerName}:${player.uid}".`);

                this.joinRoom().then(() => this.handleListener());

            } else {
                console.log(`Player has been decommissioned.`);
            }
        });
    }

    close() {
        this.player.destroy();

        return "Player left."
    }

}