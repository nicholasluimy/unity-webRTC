<template>
   <div class="center-vertical" id="disconnected">
    <div class="disconnected-header">
        <span>Oops, you disconnected.</span>
    </div>
    <div class="avatar">
        <!-- IMPT: Image and name will change according to what player is assigned -->
        <img src="@/assets/disconnected/disconnected.png">
    </div>

    <div class="center-vertical">
        <img class="buttons" src="@/assets/game-over/button5.png" v-on:click="goToConfirmInGame">
        <img class="buttons" src="@/assets/game-over/button6.png" v-on:click="goToJoinRoom">
    </div>
</div>
</template>

<style lang="scss" scoped>
.disconnected-header {
  font-size: 40px;
  text-align: center;
}

.avatar {
  text-align: center;
  margin-top: 10%;
  margin-bottom: 30%;

  img {
    max-width: 80%;
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
    }
</script>