<template>
   <div class="center-vertical" id="confirmed-in-game">
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

.avatar {
  text-align: center;
  margin-top: 10%;
}
.disclaimer {
  text-align: center;
  margin-top: 50%;
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
    console.log("mounted")

    this.clientConnection = new SumoClient(this.$firebase, this.playerName, this.roomId);

    this.clientConnection.onHostData = data => {

      try{
        const json = JSON.parse(data)
        const type = json.type
        const payload = json.payload
        switch(type) {
            case "gameChanged":
                // json.payload is in form below.
                // TODO: Set sensor polling mode, display game
                /*
                    {
                        game: "Flappy Sumo / Sumo Ring",
                        mode: "shake / tilt",
                    }
                 */
                if(payload.game === "Flappy Sumo" && payload.mode === "shake") {
                  this.startShakeDetection();
                }

                if(payload.game === "Sumo Ring" && payload.mode === "tilt") {
                  // start tilt detection
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
                // TODO: Handle room closed and new room opened, prompt to re-enter roomKey
                this.roomId = null

                goToJoinRoom()

                this.clientConnection.close()
                this.clientConnection = null

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
    goToJoinRoom: function(event) {
      this.$router.push('join-room')
    },
    startShakeDetection: function() {
      var self = this
      var myShakeEvent = new Shake({
          timeout: 100
      });

      myShakeEvent.start();

      window.addEventListener('shake', function() {
          //function to call when shake occurs
          console.log("shake");
          self.$store.state.clientConnection.player.send(JSON.stringify({
              type: "shake",
              user: self.playerName,
              payload: "shakeSent"
          }));
      }, false);
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
      }
  }
}
</script>
