class FomoSumo {
	constructor() {
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

        this.isDisplay = null;

        /////
        //client specific
        /////
        this.playerName = null;
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

	generateRoomKey() {
		var roomId = "";
	    var charSet = "abcdefghijklmnopqrstuvwxyz0123456789";
	    var charSetLength = charSet.length;
	    var roomIdLength = 5;

	    for (var i = 0; i < roomIdLength; i++) {
	        roomId += charSet.charAt(Math.floor(Math.random() * charSetLength));
	    }
	    return roomId;
	}

	initCallbacks() {
		if (this.isDisplay) {
			this.onPlayerCreated = new Function();
	        this.onPlayerConnected = new Function();
	        this.onPlayerDisconnected = new Function();
	        this.onPlayerData = new Function();
	        this.onRoomCreatedSuccess = new Function();
	        this.onRoomCreatedFail = new Function();
		} else {
			this.onJoinedRoom = new Function();
	        this.onConnected = new Function();
	        this.onDisconnected = new Function();
	        this.onHostData = new Function();
		}
		
	}

	tryConnectDisplay() {
		firebase.auth().signInAnonymously().catch(error => {
            console.error("Failed to initialize client.");
            console.log(error);
        });

        this.detachAuthStateListener = firebase.auth().onAuthStateChanged(authState => {
            if (authState) {
                console.log(`Initialized display "${roomKey}:${authState.uid}".`);

                this.isRoomExists(roomKey).then(room => {
                    if (!room.exists) {
                        console.log(`Room "${roomKey} is available."`);
                        this.createRoom(roomKey).then(() => {
                            this.initCallbacks();
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

	joinRoom() {
		this.onJoinedRoom();
        return this.db.collection(`rooms/${this.roomKey}/players`).doc(this.playerName).set({
            uid: this.firebase.auth().currentUser.uid
        });
	}

	handleListener() {
		if (this.isDisplay) {
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
		} else {
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
    }

	tryConnectClient(roomKey) {
		this.firebase.auth().signInAnonymously().catch(error => {
            console.error("Fail to initialize player.");
            console.log(error);
        });

        this.detachAuthStateListener = this.firebase.auth().onAuthStateChanged(player => {
            if (player) {
                console.log(`Initialized player "${this.playerName}:${player.uid}".`);
                this.initCalbacks();
                this.joinRoom().then(() => this.handleListener());

            } else {
                console.log(`Player has been decommissioned.`);
            }
        });
	}

	start(roomKey = null, playerName = null) {
		this.isDisplay = roomKey === null;
		roomKey = roomkey || generateRoomKey();
        if (this.isDisplay) {
        	tryConnectDisplay();
        } else {
        	this.playerName = playerName || "nofomo";
        	tryConnectClient(roomKey);
        }
	}

	send(data, playerId = null) {

		if (this.isDisplay && playerId ) {
			this.players[playerId].send(data);
		} else if (!this.isDisplay && !playerId) {
			this.player.send(data);
		}
    }

	// privates
	handleError(error) {
        console.log(error);
    }

    sendAnswer(playerDoc, data) {
        console.log(`Sending answer to room "${this.roomKey}".`);
        return playerDoc.ref.set({
            answer: data,
            answerUid: this.firebase.auth().currentUser.uid,
        }, { merge: true });
    }

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

    receiveOffer(playerDoc) {
        let offer = playerDoc.data().offer;
        if (offer != undefined) {
            console.log(`Received offer from room "${this.roomKey}."`);
            this.player.signal(offer);
            this.detachListener();
        }
    }

    receiveAnswer(playerDoc) {
        var answer = playerDoc.data().answer;
        if (answer) {
            console.log(`Received ${playerDoc.id}'s answer.`);

            this.players[playerDoc.id].signal(answer);
        }
    }

    handleConnect() {
   		if (this.isDisplay) {
   			this.onPlayerConnected(playerDoc.id);
   		} else {
			this.onConnected();
   		}
    }

    handleDisconnect() {
        if (this.isDisplay) {
	        	if (this.players[playerDoc.id]) {
	            this.players[playerDoc.id].destroy()
	            this.players[playerDoc.id] = null
	            delete this.players[playerDoc.id]
	        }

	        // delete firebase entry
	        if (playerDoc.exists) playerDoc.ref.delete()

	        // Do callback after removing, otherwise will try to broadcast to disconnected player
	        this.onPlayerDisconnected(playerDoc.id);
        } else {
        	this.onDisconnected();

	        this.player = null;
	        this.detachAuthStateListener();

	        return this.db.collection(`rooms/${this.roomKey}/players`).doc(this.playerName)
	            .delete()
	            .then(() => this.firebase.auth().signOut());
        }
    }

    handleData(data) {
        if (this.isDisplay) {
        	this.onPlayerData(data);	
        } else {
        	this.onHostData(data);
        }
    }

    isRoomExists(roomKey) {
        console.log(`Checking availability of room "${roomKey}".`);

        return this.db.collection('rooms').doc(roomKey).get();
    }

    createRoom(roomKey) {
        if (this.isDisplay) {
        	console.log(`Creating Room with key: ${roomKey}.`);

	        return this.db.collection('rooms').doc(this.roomKey).set({
	            createTime: Date.now(),
	            uid: firebase.auth().currentUser.uid
	        });
        }
    }

    createPlayer(playerDoc) {
        if (this.isDisplay) {
        	console.log(`Creating player with name: ${playerDoc.id}.`);
	        var player = new SimplePeer({ initiator: true, trickle: false, objectMode: true });
	        player.name = playerDoc.id

	        this.players[playerDoc.id] = player;

	        this.onPlayerCreated(playerDoc.id);

	        return player;
        }
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


}


















