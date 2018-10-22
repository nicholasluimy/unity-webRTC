<template>
<div class="center-vertical" id="game-over">
    <div class="centering-content game-over-header">
        <span>Game Over</span>
    </div>
    <div class="center-vertical player">
        <!-- IMPT: Image will change according to what player is assigned -->
        <img src="@/assets/join-room/player1.png">
        <div>Name of Player</div>
    </div>

    <table>
      <tr>
        <th>RANK</th>
        <th>SCORE</th>
      </tr>
      <tr class="entry">
        <th>1</th>
        <th>12</th>
      </tr>
    </table>

    <div class="center-vertical">
        <img class="buttons" src="@/assets/game-over/button5.png">
        <img class="buttons" src="@/assets/game-over/button6.png">
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
  img {
    max-width: 50%;
    margin-bottom: 5%;
  }
}

table {
  font-size: 1.5em;
  margin-top: 20%;
  margin-bottom: 10%;
  border-spacing: 50px 0;

  .entry {
    font-size: 2em;
  }
}

.buttons {
  margin-top: 5%;
  max-width: 90%;
}
</style>