"use strict";
class GameState {
    /*
        GameState is the JS object that tracks the state of the Unity-WebGL application
            - What game is currently being played
                TODO: What game is currently being played, and the type of sensor data required.
                - Requires message passing from unity -> display -> client
            - Who is currently in the game

     */
    constructor() {
        this.maxGamePlayers = 4;
        this.inGamePlayers = ["","","",""];
        this.inGamePlayersHash = {};
        this.inGamePlayersCount = 0;

        // arrays of unity functions, idx by player num
        this.unityShakeFunctions = ["ShakePlayer1", "ShakePlayer2", "ShakePlayer3", "ShakePlayer4"];
        this.unityTiltFunctions = ["TiltPlayer1", "TiltPlayer2", "TiltPlayer3", "TiltPlayer4"];
    }

    addPlayer(username) {
        if (!(this.inGamePlayersCount == this.maxGamePlayers)) {
            this.inGamePlayersCount++;
            var insertIdx = this.inGamePlayers.indexOf("");
            this.inGamePlayersHash[username] = insertIdx;
            this.inGamePlayers[insertIdx] = username;
            gameInstance.SendMessage('UIManager', 'AddPlayer', username);
            return true;
        }
        return false;
    }

    dropPlayer(username) {
        var inGameIdx = this.inGamePlayers.indexOf(username);
        if (inGameIdx != -1) {
            this.inGamePlayers[inGameIdx] = "";
            delete this.inGamePlayersHash[username];
            this.inGamePlayersCount--;
            gameInstance.SendMessage('UIManager', 'RemovePlayer', username);
        }
    }

    handleData(data) {
        console.log("game state received data");
        try {
            var sendingUser = data.user;
            console.log(data.user);
            console.log(this.inGamePlayersHash, this.inGamePlayers);
            if (data.type === 'shake') {
                if (this.inGamePlayersHash[sendingUser] != null) {
                    gameInstance.SendMessage('GameController', this.unityShakeFunctions[this.inGamePlayersHash[sendingUser]]);
                }
            } else if (data.type === 'tilt') {
                if (this.inGamePlayersHash[sendingUser] != null) {
                    // payload in tilt action is gamma|beta
                    gameInstance.SendMessage('GameController',
                        this.unityTiltFunctions[this.inGamePlayersHash[sendingUser]],
                        data.payload);
                }
            }
        }

        catch (error) {
            // log error and just not handle
            console.log(error);
        }
    }
}

