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


      const hostData = JSON.parse(data)

      console.log("sumotype: " + hostData.sumoType);

      if(hostData.sumoType){
        switch(hostData.sumoType){
          default: case "orange": this.playerAvatar = orangeSumo; break
          case "green": this.playerAvatar = greenSumo; break
          case "blue": this.playerAvatar = blueSumo; break
          case "purple": this.playerAvatar = purpleSumo; break
        }
      }
    }

    this.clientConnection.start();

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
  computed: {
      playerName: {
        get() { return this.$store.state.playerName }
      },
      roomId: {
        get() { return this.$store.state.roomId }
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
