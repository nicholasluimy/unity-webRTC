<template>
<div class="center-vertical" id="game-over">
    <div class="centering-content game-over-header">
        <span>Game Over</span>
    </div>
    <div class="center-vertical player">
        <!-- IMPT: Image will change according to what player is assigned -->
        <img src="@/assets/join-room/player1.png">
        <span>Nice la.</span>
        <span>But you can do better,</span>
        <span>nicholas.</span>
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
