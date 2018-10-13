"use strict";
function generateRoomId() {
    // Temp fix method to auto-generate roomIDs, until we implement a firebase function
    // Or game sessions manager server
    // Use by generating and checking if doc already exists, and regenerate if it does
    // Collision space is 35^roomIdLength
    var roomId = "";
    var charSet = "abcdefghijklmnopqrstuvwxyz0123456789";
    var charSetLength = charSet.length;
    var roomIdLength = 5;

    for (var i = 0; i < roomIdLength; i++) {
        roomId += charSet.charAt(Math.floor(Math.random() * charSetLength));
    }
    return roomId;
}


class SumoDisplay {
    /*
        SumoDisplay is the host-client object
        It contains:
            - Setup details for the application's webRTC signalling server
            - Event handlers for managing incoming connections and messages
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

        this.rooms = this.db.collection('rooms');

        // Initialize a hashmap to keep track of connected players
        this.players = {};

        this.maxGamePlayers = 4;
        this.inGamePlayers = ["","","",""];
        this.inGamePlayersHash = {};
        this.inGamePlayersCount = 0;

        // arrays of unity functions, idx by player num
        this.unityShakeFunctions = ["ShakePlayer1", "ShakePlayer2", "ShakePlayer3", "ShakePlayer4"];

        this.roomKey = "default";
    }



    // playerDoc: the document snapshot in firestore that represents the player.
    // return: SimplePeer object that represents the player.
    createPlayer(playerDoc) {
        console.log(`Creating player with name: ${playerDoc.id}.`);
        var player = new SimplePeer({ initiator: true, trickle: false });
        this.players[playerDoc.id] = player;

        // to mirror state in unity. We still add players to this.players so that we can handle disconnects
        if (!(this.inGamePlayersCount == this.maxGamePlayers)) {
            this.inGamePlayersCount++;
            var insertIdx = this.inGamePlayers.indexOf("");
            this.inGamePlayersHash[playerDoc.id] = insertIdx;
            this.inGamePlayers[insertIdx] = playerDoc.id;
        }

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
        gameInstance.SendMessage('UIManager', 'AddPlayer', playerDoc.id);
    }

    // playerDoc: the document snapshot in firestore that represents the player.
    handleDisconnect(playerDoc) {
        // to mirror state in unity. We still add players to this.players so that we can handle disconnects

        var inGameIdx = this.inGamePlayers.indexOf(playerDoc.id);
        if (inGameIdx != -1) {
            this.inGamePlayers[inGameIdx] = "";
            delete this.inGamePlayersHash[playerDoc.id];
            this.inGamePlayersCount--;
        }

        gameInstance.SendMessage('UIManager', 'RemovePlayer', playerDoc.id);


        console.log(`Disconnected from ${playerDoc.id}`);
        this.players[playerDoc.id].destroy();

        if(playerDoc.exists) playerDoc.ref.delete();
    }

    // data: data param from SimplePeer.on('data').
    handleData(data) {
        var d = JSON.parse(String.fromCharCode.apply(null, data));
        console.log("logging data received");
        console.log(d);
        // Add additional unity hooks here on receiving data. Currently not parsing data,
        // but logging to be able to see
        if (d.type === 'shake') {
            var sendingUser = d.user;
            console.log(d.user);
            console.log(this.inGamePlayersHash, this.inGamePlayers);
            if (this.inGamePlayersHash[sendingUser] != null) {
                gameInstance.SendMessage('GameController', this.unityShakeFunctions[this.inGamePlayersHash[sendingUser]]);
            }

        }
    }

    start() {
        console.log(`rooms/${this.roomKey}/players`);
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
        this.rooms.doc(this.roomKey).delete();
        this.detachListener();

        return "Room closed."
    }
}

var display = new SumoDisplay();
var roomSet = false;
var loadComplete = false;

function setRoom() {
    var roomId = generateRoomId();
    // check if room exists
    display.rooms.doc(roomId).get().then(function(doc){
        if (doc.exists) {
            console.log("room with key " + roomId + " already exists, trying again...");
            setRoom();
        } else {
            console.log(roomId);
            console.log(display.roomKey);
            console.log("room with key " + roomId + " does not exist, creating room...");
            display.rooms.doc(roomId).set({createTime: Date.now()});
            display.roomKey = roomId;
            console.log(display.roomKey);
            roomSet = true;
            if (loadComplete) {
                gameInstance.SendMessage('UIManager', 'SetRoomCode', display.roomKey);
            }
            // Only start here because it is async
            display.start();
        }
    });
}
setRoom();

window.addEventListener("loadComplete", function(e){
    loadComplete = true;
    if (roomSet) {
        gameInstance.SendMessage('UIManager', 'SetRoomCode', display.roomKey);
    }
},false);

onbeforeunload = () => display.close();

