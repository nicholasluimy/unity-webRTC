<template>
<div class="center-vertical" id="game-over">
    <div class="centering-content game-over-header">
        <span>Game Over</span>
    </div>
    <div class="center-vertical player">
        <!-- IMPT: Image will change according to what player is assigned -->
        <img :src="playerAvatar" >
        <span>Nice la.</span>
        <span>But you can do better,</span>
        <span>{{ this.playerName }}.</span>
    </div>

    <div class="center-vertical">
        <img class="buttons" src="@/assets/game-over/button5.png" v-on:click="goToConfirmInGame">
        <img class="buttons" src="@/assets/game-over/button6.png" v-on:click="goToJoinRoom">
    </div>
</div>
</template>

<style lang="scss" scoped>
.game-over-header {
  font-size: 40px;
  margin-top: 10%;
  margin-bottom: 10%;
}

.player {
  font-size: 20px;
  margin-bottom: 20%;
  text-align: center;
  img {
    max-width: 80%;
    margin-bottom: 5%;
  }
}

.buttons {
  margin-top: 5%;
  max-width: 90%;
}
</style>

<script>
export default {
    mounted: function() {
        document.documentElement.classList.add("no-scroll");
    },
  methods: {
    goToConfirmInGame: function(event) {
      this.$router.replace('confirm-in-game')
    },
    goToJoinRoom: function(event) {
      // clean up
      this.clientConnection.close()
      this.shakeListener.stop()

      this.roomId = null
      this.clientConnection = null
      this.shakeListener = null
    
      this.$router.replace('join-room')
    }
  },
  computed: {
      playerName: {
        get() { return this.$store.state.playerName }
      },
      roomId: {
        set(value) { this.$store.commit('updateRoomId', value) }
      },
      clientConnection: {
        get() { return this.$store.state.clientConnection },
        set(value) { this.$store.commit('updateClientConnection', value) }
      },
      playerAvatar: {
        set(value) { this.$store.commit('updatePlayerAvatar', value) }
      },
      shakeListener: {
        get() { return this.$store.state.shakeListener },
        set(value) { this.$store.commit('updateShakeListener', value) }
      }
  }
}
</script>
