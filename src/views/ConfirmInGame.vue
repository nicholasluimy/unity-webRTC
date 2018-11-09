<template>
   <div class="center-vertical no-scroll" id="confirmed-in-game">
    <div class="confirmed-in-game-header">
        <span>You're in!</span>
        <br/>
        <span class="sub-header">Waiting for your friends...</span>
    </div>
    <div class="avatar">
        <!-- IMPT: Image and name will change according to what player is assigned -->
        <img :src="playerAvatar" >
        <div>{{this.playerName}}</div>
    </div>
    <div class="room-code">
      <span>Room Code: {{this.roomId}}</span>
    </div>
    <div class="disclaimer">
        <span>Once all your players are in, </span>
        <br/>
        <span>press START GAME on the big screen!</span>
    </div>
</div>
</template>

<style lang="scss" scoped>
.confirmed-in-game-header {
  font-size: 40px;
  text-align: center;

  .sub-header {
    font-size: 20px;
  }
}

.room-code {
  font-size: 1.2em;
  margin-top: 10%;
  color: #e13d61;
}

.avatar {
  text-align: center;
  margin-top: 10%;
}
.disclaimer {
  text-align: center;
  margin-top: 10%;
}

img {
  margin-bottom: 10%;
}
</style>
<script>
import SumoClient from '@/assets/js/SumoClient.js'
import Shake from 'shake.js'
import orangeSumo from '@/assets/join-room/player1.png'
import greenSumo from '@/assets/join-room/player2.png'
import blueSumo from '@/assets/join-room/player3.png'
import purpleSumo from '@/assets/join-room/player4.png'

export default {
  mounted: function() {
    // has existing connection already
    if(this.clientConnection) return

    this.clientConnection = new SumoClient(this.$firebase, this.playerName, this.roomId);

    this.clientConnection.onHostData = data => {

      try{
        const json = JSON.parse(data)
        const type = json.type
        const payload = json.payload
        switch(type) {
            case "gameChanged":
                // stop all sensors because we might switch games without going to joinRoom
                this.stopAllSensors();


                // json.payload is in form below.

                /*
                    {
                        game: "Flappy Sumo / Sumo Ring",
                        mode: "shake / tilt",
                    }
                 */
                if(payload.game === "Flappy Sumo" && payload.mode === "shake") {
                  this.startShakeDetection();
                }

                if((payload.game === "Sumo Ring" || payload.game === "Sumo Ball") && payload.mode === "tilt") {
                  // start tilt detection
                    this.startTiltDetection();
                }

                console.log("Game was changed to", payload.game);
                break;
            case "playerAdded":
                // json.payload is in form below.
                // TODO: Change state from connecting to connected/rejected
                // 0-4 int indicates player number. Use this to set player assets (color)
                /*
                    {
                        type: "playerAdded"
                        payload: {
                            success: true/false,
                            index: 0-4 int,
                        }
                    }
                 */
                if(payload.success){
                  const avatars = [orangeSumo, greenSumo, blueSumo, purpleSumo]
                  this.playerAvatar = avatars[payload.index]
                }

                console.log("didGetAddedToGame:", json.payload.success.toString());
                break;
            case "restartRoom":
                // no payload
                this.roomId = payload.roomId

                this.goToJoinRoom()
                break;
            case "gameStart":
                this.goToInGame()
                break;
            case "gameStop":
                this.goToGameOver();
                break;
            default:
                break;
        }
      } catch (e) {
        console.log("cannot parse json:" + data );

      }

    };

    this.clientConnection.start();
  },
  methods: {
    goToJoinRoom: function() {
      this.$router.replace('join-room')
    },
    goToInGame: function() {
      this.$router.replace("in-game")
    },
    goToGameOver: function() {
      this.$router.replace('game-over')
    },
    startShakeDetection: function() {
      var self = this
        console.log("in shake detection");
      console.log(this.shakeListener);
      if(this.shakeListener) {
          this.shakeListener.start();
          return;
      }

      this.shakeListener = new Shake({
          timeout: 100,
          threshold: 10
      });
      this.shakeListener.start();
        console.log("did try to start shake listener");
        console.log(this.shakeListener);
      window.addEventListener('shake', function() {
          //function to call when shake occurs
          console.log("shake");
          self.$store.state.clientConnection.send(JSON.stringify({
              type: "shake",
              user: self.playerName,
              payload: "shakeSent"
          }));
      }, false);
    },
      startTiltDetection: function() {
        var self = this;
        if (this.tiltListener) {
            return;
        }

        // prevents adding more than one listener
        if (!this.tiltEvent) {
            // Listener to tilt event and stores data to a caching variable
            window.addEventListener('deviceorientation', tiltHandler => {
                self.tiltValues = tiltHandler;
            }, false);
            this.tiltEvent = true;
        }

        // Poll the caching variable at a required rate
        this.tiltListener = setInterval(() => {
            let tiltData = self.tiltValues;
            if (tiltData != null) {
                // Beta is +-180, gamma is +-90
                // Let's remap it to be +-45 for beta, and 22.5 for gamma
                let tiltLR = tiltData.beta * 4;
                let tiltFB = -tiltData.gamma * 4;

                let tiltLRAbs = Math.abs(tiltLR);
                let tiltFBAbs = Math.abs(tiltFB);

                tiltLR = tiltLRAbs >= 180 ?
                    (tiltLR < 0 ? -180 : 180) :
                    tiltLR;

                tiltFB = tiltFBAbs >= 90 ?
                    (tiltFB < 0 ? -90 : 90) :
                    tiltFB;

                let jsonPayload = tiltLR.toString() + "|" + tiltFB.toString();
                self.$store.state.clientConnection.send(JSON.stringify({
                    type: "tilt",
                    user: self.playerName,
                    payload: jsonPayload,
                }));
            }

        }, 100);

      },
      stopAllSensors: function() {
        if (this.shakeListener) {
            this.shakeListener.stop();
        }
        if (this.tiltListener) {
            clearInterval(this.tiltListener);
            delete this.tiltListener;
        }

      }
  },
  computed: {
      playerName: {
        get() { return this.$store.state.playerName }
      },
      roomId: {
        get() { return this.$store.state.roomId },
        set(value) { this.$store.commit('updateRoomId', value) }
      },
      clientConnection: {
        get() { return this.$store.state.clientConnection },
        set(value) { this.$store.commit('updateClientConnection', value) }
      },
      playerAvatar: {
        get() { return this.$store.state.playerAvatar },
        set(value) { this.$store.commit('updatePlayerAvatar', value) }
      },
      shakeListener: {
        get() { return this.$store.state.shakeListener },
        set(value) { this.$store.commit('updateShakeListener', value) }
      }
  }
}
</script>
