<template>
    <div id="choose-display">
        <div class="display-header">
            <span>Before we start, let's set up! </span>
            <div class="sub-header">You need 1) a screen connected to the Internet, and 2) your mobile device(s) as your personal motion controller. Go to fomosumo.com on both.</div>
            <toggle-button id="switch" v-model="displayType" :value="false"
               :color="{checked: '#dbb985', unchecked: '#dbb985'}"
               :switchColor="{checked: '#e13d61', unchecked: '#e13d61'}"
               :height="50"
               :width="120"
               :sync="true"
               :labels="{checked: 'PLAYER', unchecked: 'SCREEN'}"/>
        </div>
        <div class="display-options">
            <div class="display-option center-vertical option-left" v-on:click="launchClient" v-if="displayType === true">
              <div>
                This is my mobile device.
              </div>
                <img class="player" src="@/assets/display/player.png">
            </div>
            <div class="display-option center-vertical option-right" v-on:click="launchHost" v-if="displayType === false">
              <div>
                This is the shared screen.
              </div>
                <img class="screen" src="@/assets/display/screen.png">
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
$mobile: 320px;
$desktop: 768px;

%center {
  justify-content: center; /* center items vertically, in this case */
  align-items: center; /* center items horizontally, in this case */
  flex-direction: column;
}

#switch {
  font-size: 14px;
  margin-top: 15px;
}

#choose-display{
  height: 100vh;
  overflow-y: scroll;
}

.display-header {
  font-size: 28px;
  margin-bottom: 7%;
  text-align: center;

  .sub-header {
    font-size: 14px;
    padding-top: 2%;
  }
}

.display-options {
    display: flex;
  @extend %center;
  text-align: center;
    align-items: center;
    justify-content: center;
  @media only screen and (max-width: $mobile) {
    flex-direction: column;
  }

  @media only screen and (min-width: $desktop) {
    flex-direction: row;
  }
}

.display-option {

  .display-text {
    padding-top: 2%;
    font-size: 1.2em;
    margin-bottom: 10%;
  }

  .player {
    max-width: 25%;
  }

  .screen {
    max-width: 40%;
      padding-top: 40px;
  }

  img {
    padding-top: 4%;
  }
}

@media (min-width: $desktop) {
    .display-options {
        align-items: start;
    }

    .display-option {
        padding: 8px;
        .player {
            width: 112px;
            max-width: none;
        }
    }
    .option-left {
        border-right: 1px solid grey;
    }

    .option-right {
        .display-text {
            padding-top: 52px;
        }
    }


}
</style>

<script>
export default {
  methods: {
    launchClient: function() {
      this.$router.push('join-room')
    },
    launchHost: function(){
        window.location.href = "https://host.fomosumo.com";
    }
  },
  data () {
    return {
      displayType: false
    }
  }
}
</script>
