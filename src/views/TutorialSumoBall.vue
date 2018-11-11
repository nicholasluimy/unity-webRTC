<template>
<div class="no-scroll" id="in-game">
    <div class="in-game-header">
        <h1>SUMO BAll: HOW TO PLAY</h1>
    </div>
    <!-- placeholder for tutorial -->
    <div class="in-game-footer">
        Press the button to kick the ball!
        <img id="push-button" src="@/assets/in-game/button_1.png" />
    </div>
</div>
</template>

<style lang="scss" scoped>
#in-game {
  transform: rotate(90deg);
  transform-origin:bottom left;
  
  position:absolute;
  top: -100vw;
  left: 0;
  
  height:100vw;
  width:100vh;
  margin: 0px !important;
}

.in-game-header {
  font-size: 18px;
  margin-top: 10%;
  text-align: center;
}

.in-game-footer {
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-icon {
  max-width: 80%;
}

#push-button {
  max-width: 50vw;
  margin: 3%;
}
</style>
