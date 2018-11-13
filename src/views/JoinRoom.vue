<template>
   <div class="center-vertical no-scroll" id="join-room">
        <div class="join-room-header centering-content">
            <span>Join your friends here!</span>
        </div>
        <div class="join-room-roomcode center-vertical">
            <span>Room Code</span>
            <input id="roomcode-input" type="text" tabindex="1" v-model="roomId" spellcheck="false" v-on:input="reset">
            <div class="item-input-error-message">
              <p class="input-error" v-if="!$v.roomId.required">This field is required!</p>
              <p class="input-error" v-if="!$v.roomId.minLength || !$v.roomId.maxLength">The room code is 5 characters!</p>
              <p class="input-error" v-if="!$v.roomId.alphaNum">The room code is alphanumeric!</p>
              <p class="input-error" v-if="!isRoomExists">This room is not available!</p>
            </div>
        </div>
        <div class="join-room-usercode center-vertical">
            <span>Display name (&lt;12 characters)</span>
            <input id="usercode-input" type="text" tabindex="2" v-model="playerName">
            <div class="item-input-error-message">
              <p class="input-error" v-if="!$v.playerName.required">This field is required!</p>
              <p class="input-error" v-if="!$v.playerName.maxLength">This field must be less than 12 characters!</p>
              <p class="input-error" v-if="!$v.playerName.alphaNum">This field must contain only alphanumeric characters!</p>
            </div>
        </div>

        <div class="disclaimer center-vertical" v-if="!$v.$invalid">
            <span>By clicking PLAY, you are agreeing</span>
            <span>to our <a href="#">Terms of Service.</a></span>
        </div>

        <img id="join-room-join" src="@/assets/join-room/button_join.png" tabindex="3" v-on:click="play" v-if="!$v.$invalid">

    </div>
</template>

<style lang="scss" scoped>
#join-room {
  overflow: hidden;
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
    width: 100%;
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
    border-bottom: 2px solid #d8d8d8;
    width: 100%;
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
  font-size: 15px;
  text-align: center;
  .input-error {
    color: #e13d61;
    text-align: left;
  }

  .pending {
    color:gray;
  }
}

.disclaimer {
  align-items: center;
  font-size: 0.8em;
  margin-top: 10%;
}
</style>

<script>
import { required, alphaNum, minLength, maxLength } from 'vuelidate/lib/validators'

export default {
  mounted: function() {
    // clean up
    if(this.clientConnection){
      this.clientConnection.close()
      this.clientConnection = null
    }

    if(this.shakeListener) {
      this.shakeListener.stop()
      this.shakeListener = null
    }

    this.isRoomExists = true

  },
  methods: {
    goToConfirmInGame: function() {
      this.$router.push('confirm-in-game')
    },
    play: function() {
      this.setFullScreen()
      this.isRoomAvailable(this.roomId).then( doc => {
        if(doc.exists){
          this.goToConfirmInGame()
        }else{
          console.log("room not exists")
          this.isRoomExists = false
        }
      })

    },
    reset: function(){
      this.isRoomExists = true
    },
    isRoomAvailable: function(value) {
      if (!value) return false
      if (value.trim() === '' || value.trim().length != 5) return false

      return this.$firebase.firestore().collection('rooms').doc(value).get()
    },
    setFullScreen: function() {
       var element = document.documentElement
      if(element.requestFullScreen) {
        element.requestFullScreen();
      } else if(element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if(element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen();
      }

      // jack this to lock orientation if available (sorry edge and safari)
        var orientKey = 'orientation';
        if ('mozOrientation' in screen) {
            orientKey = 'mozOrientation';
        } else if ('msOrientation' in screen) {
            orientKey = 'msOrientation';
        }
        if (screen[orientKey] != undefined) {
            screen[orientKey].lock('portrait-primary');
        }


    }
  },
  computed: {
    roomId: {
      get() { return this.$store.state.roomId },
      set(value) { this.$store.commit('updateRoomId', value.toLowerCase()) }
    },
    playerName: {
      get() { return this.$store.state.playerName },
      set(value) { this.$store.commit('updatePlayerName', value) }
    },
    clientConnection: {
      get() { return this.$store.state.clientConnection },
      set(value) { this.$store.commit('updateClientConnection', value) }
    },
    shakeListener: {
      get() { return this.$store.state.shakeListener },
      set(value) { this.$store.commit('updateShakeListener', value) }
    }
  },
  validations: {
    roomId : {
      required,
      alphaNum,
      minLength: minLength(5),
      maxLength: maxLength(5)
    },
    playerName : {
      required,
      alphaNum,
      maxLength: maxLength(12)
    }
  },
  data: function() {
    return {
      isRoomExists: true
    }
  }
}
</script>
