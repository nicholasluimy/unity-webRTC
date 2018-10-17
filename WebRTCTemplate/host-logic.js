"use strict";
var display = new SumoDisplay();
var roomSet = false;
var loadComplete = false;
var gameState = new GameState();
var roomKey = "(not-set)";

window.addEventListener("loadComplete", function(e){
    loadComplete = true;
    if (roomSet) {
        gameInstance.SendMessage('UIManager', 'SetRoomCode', this.roomKey);
    }
},false);

window.onbeforeunload = () => display.close();

display.onPlayerCreated = playerId  => {
    // Add players to gameState, and track result
    // Used to determine if we can disconnect from the game
    this.gameState.addPlayer(playerId);
}

display.onPlayerDisconnected = playerId => {
    this.gameState.dropPlayer(playerId);
}

display.onPlayerData = data => {
    this.gameState.handleData(data);
}

display.onRoomCreatedSuccess = roomKey => {
    this.roomKey = roomKey;
    roomSet = true;

    if (loadComplete) {
        gameInstance.SendMessage('UIManager', 'SetRoomCode', this.roomKey);
    }
}

display.onRoomCreatedFail = roomKey => {
    // retry
    display.start(generateRoomId());
}

display.start(generateRoomId());


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

/*
function setRoom() {
    // recursive function so that we can keep trying until we get a room
    var roomId = generateRoomId();
    display.roomKey = roomId;

    // check if room exists
    display.isRoomExists(roomId).then(function(doc){
        if (doc.exists) {
            console.log("room with key " + roomId + " already exists, trying again...");
            setRoom();
        } else {
            console.log(roomId);
            console.log(display.roomKey);
            console.log("room with key " + roomId + " does not exist, creating room...");

            display.roomKey = roomId;
            // Only start here because it is async
            display.start();
            roomSet = true;
            if (loadComplete) {
                gameInstance.SendMessage('UIManager', 'SetRoomCode', display.roomKey);
            }
        }
    });
}
setRoom();
*/

