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

var display = new SumoDisplay();
var roomSet = false;
var loadComplete = false;

display.onPlayerCreated = playerId  => {
    // Add players to gameState, and track result
    // Used to determine if we can disconnect from the game
    // TODO
    //player.isInGame = this.gameState.addPlayer(playerDoc.id);
}

display.onPlayerDisconnected = playerId => {
    // TODO
    /*
    if (this.players[playerDoc.id].isInGame = true) {
        this.gameState.dropPlayer(playerDoc.id);
    }*/
}

display.onData = data => {
    //TODO
    /*function(data){
        if (player.isInGame) {
            this.gameState.handleData(data);
        }
    });*/
}

function setRoom() {
    // recursive function so that we can keep trying until we get a room
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

window.addEventListener("loadComplete", function(e){
    loadComplete = true;
    if (roomSet) {
        gameInstance.SendMessage('UIManager', 'SetRoomCode', display.roomKey);
    }
},false);

onbeforeunload = () => display.close();

