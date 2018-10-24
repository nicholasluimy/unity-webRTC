<template>
   <div class="center-vertical" id="confirmed-in-game">
    <div class="confirmed-in-game-header">
        <span>You're in!</span>
        <br/>
        <span class="sub-header">Waiting for your friends...</span>
    </div>
    <div class="avatar">
        <!-- IMPT: Image and name will change according to what player is assigned -->
        <img :src="playerAvatarUrl" >
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
    this.playerName = this.$store.state.playerName
    this.roomId = this.$store.state.roomId

    this.clientConnection = new SumoClient(this.$firebase, this.playerName, this.roomId);

    this.clientConnection.onHostData = data => {
        let json = JSON.parse(data);

        switch(json.type) {
            case "gameChanged":
                // json.payload is in form below.
                // TODO: Set sensor polling mode, display game
                /*
                    {
                        game: "Flappy Sumo / Sumo Ring",
                        mode: "shake / tilt",
                    }
                 */
                console.log("Game was changed to", json.payload.game);
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
                console.log("didGetAddedToGame:", json.payload.success.toString());
                break;
            case "restartRoom":
                // no payload
                // TODO: Handle room closed and new room opened, prompt to re-enter roomKey
                break;
            default:
                break;
        }
        // const hostData = JSON.parse(data);
      //
      // console.log("sumotype: " + hostData.sumoType);
      //
      // if(hostData.sumoType){
      //   switch(hostData.sumoType){
      //     default: case "orange": this.playerAvatarUrl = orangeSumo; break;
      //     case "green": this.playerAvatarUrl = greenSumo; break;
      //     case "blue": this.playerAvatarUrl = blueSumo; break;
      //     case "purple": this.playerAvatarUrl = purpleSumo; break;
      //   }
      // }
    };

    this.clientConnection.start();

    this.$store.state.clientConnection = this.clientConnection

    this.startShakeDetection();
  },
  methods: {
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
  data: function() {
    return {
      playerName: 'Anonymous Sumo',
      playerAvatarUrl: orangeSumo
    }
  }
}
</script>
