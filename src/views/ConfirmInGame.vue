<template>
   <div class="center-vertical" id="confirmed-in-game">
    <div class="confirmed-in-game-header">
        <span>You're in!</span>
        <br/>
        <span class="sub-header">Waiting for your friends...</span>
    </div>
    <div class="avatar">
        <!-- IMPT: Image and name will change according to what player is assigned -->
        <img src="@/assets/join-room/player1.png">
        <div>{{this.playerName}}</div>
    </div>

    <div class="disclaimer">
        <span>Once all your players are in, </span>
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

export default {
  mounted: function() {
    console.log("mounted")
    this.playerName = this.$store.state.playerName
    this.roomId = this.$store.state.roomId

    this.clientConnection = new SumoClient(this.$firebase, this.playerName, this.roomId);
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
  }
}
</script>
