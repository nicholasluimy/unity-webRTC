<template>
  <div class="center-vertical" id="main-menu">
    <img class="header-image" src="@/assets/main-menu/header.png">
    <img id="main-menu-play" class ="button" src="@/assets/main-menu/button_play.png" v-on:click="goToJoinRoom">
    <img id="about" class="button" src="@/assets/main-menu/button_about.png" v-on:click="goToAbout">
    <img id="help" class="button" src="@/assets/main-menu/button_help.png" v-on:click="goToHelp">
    <img class="sumo" src="@/assets/main-menu/sumo.png">
  </div>
</template>

<style lang="scss" scoped>
.button {
  padding-bottom: 3%;
}

.sumo {
  max-width: 90%;
}

.header {
  max-width: 100%;
  padding-top: 15%;
  padding-bottom: 10%;
}
</style>
<script>
export default {
  methods: {
    goToJoinRoom: function(event) {
      this.$router.push('join-room')
    },
    goToAbout: function(event) {
      this.$router.push('about')
    },
    goToHelp: function(event) {
      this.$router.push('help')
    }
  }
}
</script>