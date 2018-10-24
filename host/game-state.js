"use strict";
class GameState {

    constructor() {
        this.maxGamePlayers = 4;
        this.inGamePlayers = ["","","",""];
        this.inGamePlayersHash = {};
        this.inGamePlayersCount = 0;

        this.gameStarted = false;
        this.removeQueue = [];

        this.currentGame = null;

        // arrays of unity functions, idx by player num
        this.unityShakeFunctions = ["ShakePlayer1", "ShakePlayer2", "ShakePlayer3", "ShakePlayer4"];
        this.unityTiltFunctions = ["TiltPlayer1", "TiltPlayer2", "TiltPlayer3", "TiltPlayer4"];
    }

    addPlayer(username) {
        if (this.gameStarted) {
            // Do not allow adding players while game is ongoing
            return {
                success: false,
                index: -1,
            }
        }
        if (this.inGamePlayers.indexOf(username) != -1) {
            // If username is already connected, silently allow it
            // This handles case when a player reconnects with same name
            // Also handles when multiple players have same name
            // in which case we just let both players control same avatar
            return {
                success: true,
                index: this.inGamePlayers.indexOf(username),
            };
        }

        if (!(this.inGamePlayersCount == this.maxGamePlayers)) {
            this.inGamePlayersCount++;
            var insertIdx = this.inGamePlayers.indexOf("");
            this.inGamePlayersHash[username] = insertIdx;
            this.inGamePlayers[insertIdx] = username;
            gameInstance.SendMessage('UIManager', 'AddPlayer', username);
            return {
                success: true,
                index: insertIdx,
            }
        }

        return {
            success: false,
            index: -1,
        };
    }

    dropPlayer(username) {
        if (this.gameStarted) {
            this.removeQueue.append(username);
            return;
        }

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

    blockAddPlayers() {
        this.gameStarted = true;
    }

    unblockAddPlayers() {
        this.gameStarted = false;
        while (!this.removeQueue.empty()) {
            this.dropPlayer(this.removeQueue.pop());
        }
    }

    restart() {
        this.maxGamePlayers = 4;
        this.inGamePlayers = ["","","",""];
        this.inGamePlayersHash = {};
        this.inGamePlayersCount = 0;

        this.gameStarted = false;
        this.removeQueue = [];
    }

    setCurrentGame(gameChangeDetails) {
        this.currentGame = gameChangeDetails;
    }
    getCurrentGame() {
        if (this.currentGame === null) {
            // If we try to get without setting, return error object
            return {
                game: "??Game",
                mode: "ERROR",
            }
        }

        return this.currentGame;
    }
}

