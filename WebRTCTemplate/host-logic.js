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
    // remember to parse the json string to js object
    const playerData = JSON.parse(data);

    this.gameState.handleData(playerData);
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

