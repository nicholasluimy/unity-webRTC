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
        this.clearedQueue = new Function();

        this.gameName = "undefined";
        // arrays of unity functions, idx by player num
        this.unityShakeFunctions = ["ShakePlayer1", "ShakePlayer2", "ShakePlayer3", "ShakePlayer4"];
        this.unityTiltFunctions = ["TiltPlayer1", "TiltPlayer2", "TiltPlayer3", "TiltPlayer4"];
        this.unityKeypressFunctions = ["PushByPlayer1", "PushByPlayer2", "PushByPlayer3", "PushByPlayer4"];

        // actionsSemaphore functions like a semaphore for each player
        // Each internal array is a queue that we dequeue at a constant rate
        // If it hits a limit (limit depends on rate of dequeue and desired max input rate), then
        // any further inputs will be rejected
        this.actionsSemaphore  = [
            [],
            [],
            [],
            []
        ];
        this.numSemaphores = 2;
        this.semaphoreReleaseRate = 200; // This is in ms

        setInterval(() => {
            this.actionsSemaphore.forEach(function(playerSemaphoreQueue){
               playerSemaphoreQueue.pop();
            });
        }, this.semaphoreReleaseRate);
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
        if (username == "") {
            return;
        }
        console.log(username, this.gameStarted);
        if (this.gameStarted) {
            this.removeQueue.push(username);
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
            var sendingUserIdx = this.inGamePlayersHash[sendingUser];

            if (data.type === 'shake') {
                console.log(this.actionsSemaphore[sendingUserIdx]);
                if ( sendingUserIdx != null && this.actionsSemaphore[sendingUserIdx].length < this.numSemaphores) {
                    gameInstance.SendMessage('GameController',
                        this.unityShakeFunctions[sendingUserIdx]);
                    this.actionsSemaphore[sendingUserIdx].push(1);
                }
            } else if (data.type === 'tilt') {
                if ( sendingUserIdx != null && this.actionsSemaphore[sendingUserIdx].length < this.numSemaphores) {
                    // payload in tilt action is gamma|beta
                    gameInstance.SendMessage('GameController',
                        this.unityTiltFunctions[sendingUserIdx],
                        data.payload);
                    this.actionsSemaphore[sendingUserIdx].push(1);
                }
            } else if (data.type === "keypress") {
                if (sendingUserIdx != null) {
                    gameInstance.SendMessage('GameController',
                        this.unityKeypressFunctions[sendingUserIdx]);
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
        while (!this.removeQueue.length == 0) {
            console.log(this.removeQueue, this.removeQueue.length);
            this.dropPlayer(this.removeQueue.pop());
        }
        this.clearedQueue();
    }

    restart() {
        this.maxGamePlayers = 4;
        this.inGamePlayers.forEach((playerName) => {
            // It's ok to drop "" because we handle that in dropPlayer
            this.dropPlayer((playerName));
        });

        this.gameStarted = false;
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

