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

        this.gestureListenerIntervals = {};
        this.gestureCacheStore = {};
        this.sensor = null;
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

    // client gesture handlers
    startShakeDetect() {
        // assign this so we dont lost context in helper functions
        let clientObj = this;
        if ('LinearAccelerationSensor' in window) {

            this.sensor = new LinearAccelerationSensor();
            this.sensor.addEventListener('reading', e => {
                clientObj.gestureCacheStore['shake'] = accelerometer;
            });
            this.sensor.start();


        } else if ('DeviceMotionEvent' in window) {

            window.addEventListener('devicemotion', function(eventHandler){
                clientObj.gestureCacheStore['shake'] = eventHandler.acceleration;
            }, false);
        }

        function processShake() {
            let accVal = clientObj.gestureCacheStore['shake'];
            let squaredLength = accVal.x * accVal.x + accVal.y * accVal.y + accVal.z * accVal.z;
            console.log("shake saving", accVal, squaredLength);
            if (squaredLength >= 25) {
                console.log("past threshold, sending values");
                clientObj.player.send(
                    JSON.stringify(
                        { type: "shake", user: clientObj.playerName, payload: "shakeSent"})
                );
            }
            // Unity source for reference
            //if (Input.acceleration.sqrMagnitude >= _sqrShakeDetectionThreshold
            //    && Time.unscaledTime >= _timeSinceLastShake + _minShakeInterval)
            //{
            //    _rb2d.AddForce(new Vector2(0, 1000));
            //    _timeSinceLastShake = Time.unscaledTime;
            //    _animator.SetTrigger("Flap");
            //}
        }

        this.gestureListenerIntervals['shake'] = setInterval(processShake, 200);
    }

    stopShakeDetect() {
        if (this.sensor != null) {
            this.sensor.stop();
            this.sensor = null;
        }
        clearInterval(this.gestureListenerIntervals['shake']);
        delete this.gestureListenerIntervals['shake'];

    }

}


// Controller state logic
let mainMenu = document.getElementById('main-menu');
let joinRoom = document.getElementById('join-room');
let inGame = document.getElementById('in-game');

// currently hard coded flow
function mainMenuPlayClicked() {
    mainMenu.style.display = "none";
    joinRoom.style.display = "block";
}
document.getElementById('main-menu-play').onclick = mainMenuPlayClicked;


var client = null;
function joinRoomPlayClicked() {
    joinRoom.style.display = "none";
    inGame.style.display = "block";

    var playerName = document.getElementById('usercode-input').value;
    var roomId = document.getElementById('roomcode-input').value;
    client = new SumoClient(playerName, roomId);
    client.start()

}
document.getElementById('join-room-join').onclick = joinRoomPlayClicked;


client.startShakeDetect();

onbeforeunload = () => client.close();



