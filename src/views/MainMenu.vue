<template>
  <div id="desktop-container" class="no-scroll">
    <img src="@/assets/main-menu/leftsumo.png" class="desktop-only leftsumo">
    <div class="center-vertical no-scroll" id="main-menu">
      <img class="header-image" src="@/assets/main-menu/header.png">
      <img id="main-menu-play" class ="button" src="@/assets/main-menu/button_play.png" v-on:click="goToJoinRoom">
      <img id="about" class="button" src="@/assets/main-menu/button_about.png" v-on:click="goToAbout">
      <img id="help" class="button" src="@/assets/main-menu/button_help.png" v-on:click="goToHelp">
      <img class="sumo" src="@/assets/main-menu/sumo.png">
    </div>
    <img src="@/assets/main-menu/rightsumo.png" class="desktop-only rightsumo">
  </div>
</template>

<style lang="scss" scoped>
#main-menu {
  z-index: 1;
}

.button {
  padding-bottom: 3%;
  max-width: 70%;
}

#main-menu-play {
  padding-top: 10%;
}

.sumo {
  max-width: 90%;
}

.header {
  max-width: 100%;
  padding-top: 15%;
  padding-bottom: 10%;
}

#desktop-container {
  display: flex;
  align-items: center;
  justify-content: center;
  .desktop-only {
    display: none;
  }
  .leftsumo {
    margin-right: -8%;
    margin-top: -30%;
    max-width: 200px;
  }
  .rightsumo {
    margin-left: -8%;
    margin-top: -16%;
    max-width: 200px;
  }
}



@media (min-width: 768px) {
  #desktop-container {
    .desktop-only {
      display: inherit;
    }
  }

}

</style>
<script>
export default {
  methods: {
    goToJoinRoom: function() {
      this.$router.push('choose-display')
    },
    goToAbout: function() {
        window.open('//about.fomosumo.com','_blank');
    },
    goToHelp: function() {
      this.$router.push('help')
    }
  }
}
</script>
