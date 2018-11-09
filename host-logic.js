"use strict";
var display = new SumoDisplay();
var roomSet = false;
var loadComplete = false;
var gameState = new GameState();
var roomKey = "(not-set)";

window.addEventListener("loadComplete", function (e) {
    loadComplete = true;
    if (roomSet) {
        gameInstance.SendMessage('UIManager', 'SetRoomCode', this.roomKey);
    }
}, false);

window.onbeforeunload = () => display.close();

display.onPlayerCreated = playerId => {
    // We used to insert player into game here. However, this would result in
    // sending error when sending message to client, since client handshake is incomplete
};

display.onPlayerConnected = playerId => {
    // // sample: sending private message to peer
    // display.send(JSON.stringify(`HOST says: Hello from host to ${playerId}!`), playerId);
    //
    // // sample: Broadcast info to all clients about a new player has joined the game
    // display.broadcast(JSON.stringify(`HOST says: ${playerId} has joined the room.`));

    // **Let the player know current game mode, and player's game status (isConnected?)**

    // Add players to gameState, and track result
    // Used to determine if we can disconnect from the game
    let addPlayerResult = this.gameState.addPlayer(playerId);
    display.send(JSON.stringify({
        type: "playerAdded",
        payload: addPlayerResult,
    }), playerId);

    display.send(JSON.stringify({
        type: "gameChanged",
        payload: gameState.getCurrentGame(),
    }), playerId);
};

display.onPlayerDisconnected = playerId => {
    console.log("player disconnected, passing to gameg state");
    this.gameState.dropPlayer(playerId);

    // // sample: Broadcast info to all clients about a new player has joined the game
    // display.broadcast(JSON.stringify(`HOST says: ${playerId} has left the room.`));
};

display.onPlayerData = data => {
    // remember to parse the json string to js object
    const playerData = JSON.parse(data);

    this.gameState.handleData(playerData);
};

display.onRoomCreatedSuccess = roomKey => {
    this.roomKey = roomKey;
    roomSet = true;

    if (loadComplete) {
        gameInstance.SendMessage('UIManager', 'SetRoomCode', this.roomKey);
    }
};

display.onRoomCreatedFail = roomKey => {
    // retry
    display.start(generateRoomId());
};


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

// Handlers for message passing from unity->display
// We do this here since this is the only component with reference to (gameInstance, display, gameState)
//  [otherwise it might be better to have the listeners in gameState]
window.addEventListener('success', function (e) { console.log("windowSuccess", e) }, false);
window.addEventListener('failure', function (e) { console.log("windowFailure", e) }, false);

window.addEventListener('restartRoom', function (e) {
    roomSet = false;

    // broadcast new info before connection is closed
    // no guarantee newroom id is not duplicate, but send anyway
    const newRoomId = generateRoomId()
    display.broadcast(JSON.stringify({
        type: "restartRoom",
        payload: {
            roomId: newRoomId
        }
    }))

    display.close()

    display.start(newRoomId);
    setTimeout(gameState.restart(), 1000);

}, false);

window.addEventListener('gameStart', function (e) {
    display.broadcast(JSON.stringify({
        type: "gameStart"
    }));

    gameState.blockAddPlayers();
}, false);

window.addEventListener('gameStop', function (e) {
    display.broadcast(JSON.stringify({
        type: "gameStop"
    }));

    gameState.unblockAddPlayers();
}, false);

gameState.clearedQueue = () => {
    gameInstance.SendMessage('GameController', 'ClearedQueue');
};

window.addEventListener('gameChanged', function (e) {
    // gameChangeDetails format
    /*
        {
			game: "Flappy Sumo / Sumo Ring",
			mode: "shake / tilt",
		}
    */
    let gameChangeDetails = e.detail;
    gameState.setCurrentGame(gameChangeDetails);
    display.broadcast(JSON.stringify({
        type: "gameChanged",
        payload: gameChangeDetails
    }))
}, false);














