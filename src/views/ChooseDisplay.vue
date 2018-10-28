<template>
    <div class="center-vertical" id="choose-display">
        <div class="display-header">
            <span>Who are you?</span>
        </div>
        <div class="display-options">
            <div class="display-option center-vertical" v-on:click="launchClient">
                <img class="player" src="@/assets/display/player.png">
                <div class="display-text">PLAYER</div>
            </div>
            <div class="display-option center-vertical" v-on:click="launchHost">
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
  font-size: 40px;
  margin-top: 10%;
  margin-bottom: 10%;
  text-align: center;
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
  width: 300px;

  .display-text {
    padding-top: 5%;
    font-size: 1.2em;
    margin-bottom: 20%;
  }

  .player {
    max-width: 45%;
  }
}
</style>

<script>
export default {
    mounted: function() {
        document.documentElement.classList.add("no-scroll");
    },

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
