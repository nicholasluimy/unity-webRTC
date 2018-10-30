<template>
    <div class="center-vertical no-scroll" id="choose-display">
        <div class="display-header">
            <span>Before we start, </br>let's set up! </span>
            <div class="sub-header">You need 1) a screen connected to the Internet, and 2) your mobile device(s) as your personal motion controller. Go to fomosumo.com on both.</div>
        </div>
        <div class="display-options">
            <div class="display-option center-vertical" v-on:click="launchClient">
              <div>
                Click me if you are reading this on your mobile device.
              </div>
                <img class="player" src="@/assets/display/player.png">
                <div class="display-text">PLAYER</div>
            </div>
            <div class="display-option center-vertical" v-on:click="launchHost">
              <div>
                Click me if you are reading this on the shared screen.
              </div>
                <img class="screen" src="@/assets/display/screen.png">
                <div class="display-text">SCREEN</div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
$mobile: 320px;
$desktop: 640px;

%center {
  justify-content: center; /* center items vertically, in this case */
  align-items: center; /* center items horizontally, in this case */
  flex-direction: column;
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
  @extend %center;
  text-align: center;
  @media only screen and (max-width: $mobile) {
    flex-direction: column;
  }

  @media only screen and (min-width: $desktop) {
    flex-direction: row;
  }
}

.display-option {
  display: inline-flex; /* inline can be centered with text-align*/
  /* width: 300px; */

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
  }

  img {
    padding-top: 2%;
  }
}
</style>

<script>
export default {
  methods: {
    launchClient: function(event) {
      this.$router.push('join-room')
    },
    launchHost: function(event){
        window.location.href = "https://host.fomosumo.com";
    }
  }
}
</script>
