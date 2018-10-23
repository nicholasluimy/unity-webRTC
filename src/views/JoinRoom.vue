<template>
   <div class="center-vertical" id="join-room">
        <div class="join-room-header centering-content">
            <span>Join your friends here!</span>
        </div>
        <div class="join-room-roomcode center-vertical">
            <span>Room Code</span>
            <input id="roomcode-input" type="text" tabindex="1" v-model="roomId">
            <div class="item-input-error-message">
            This room does not exist. Please try again.
            </div>
        </div>
        <div class="join-room-usercode center-vertical">
            <span>Display name (&lt;12 characters)</span>
            <input id="usercode-input" type="text" tabindex="2" v-model="playerName">
            <div class="item-input-error-message">
            Please use alphanumeric characters only.
            </div>
        </div>

        <div class="disclaimer center-vertical">
            <span>By clicking PLAY, you are agreeing</span>
            <span>to our <a href="#">Terms of Service.</a></span>
        </div>

        <img id="join-room-join" src="@/assets/join-room/button_join.png" tabindex="3" v-on:click="goToConfirmInGame">

    </div>
</template>

<style lang="scss" scoped>
#join-room {
  overflow-y: hidden;
}
.join-room-header {
  font-size: 40px;
  text-align: center;
}
.join-room-roomcode {
  align-items: flex-start;
  margin-top: 10%;
  font-size: 20px;

  #roomcode-input {
    font-family: Fredoka, serif;
    font-size: 30px;
    color: #e13d61;
    margin-top: 5%;
    background-color: transparent;
    border: none;
    border-bottom: 2px solid #d8d8d8;
  }

  #roomcode-input:focus {
    border: none;
    border-bottom: 2px solid #e13d61;
  }
}
.join-room-usercode {
  align-items: flex-start;
  margin-top: 8%;
  font-size: 20px;

  #usercode-input {
    font-family: Fredoka, serif;
    font-size: 30px;
    color: #e13d61;
    margin-top: 5%;
    background-color: transparent;
    border: none;
    border-bottom: 2px solid #f51c1c;
  }

  #usercode-input:focus {
    border: none;
    border-bottom: 2px solid #e13d61;
  }
}

#join-room-join {
  margin-top: 40px;
  max-width: 80%;
}

.item-input-error-message {
  color: #e13d61;
  font-size: 15px;
  text-align: center;
}

.disclaimer {
  align-items: center;
  font-size: 0.8em;
  margin-top: 10%;
}
</style>

<script>
export default {
  methods: {
    goToConfirmInGame: function(event) {
      this.$store.state.roomId = this.roomId
      this.$store.state.playerName = this.playerName

      this.$router.push('confirm-in-game')
    },
    validateRoomCode: function() {
      console.log("validateRoomCode")
    },
    validatePlayerName: function() {
      console.log("validatePlayerName")
    }
  },
  data() {
    return {
      roomId: '',
      playerName: ''
    }
  }
}
</script>
