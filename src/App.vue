<template>
  <div id="app">
    <transition name="fade" mode="out-in">
      <router-view/>
    </transition>
  </div>
</template>

<style lang="scss">

@font-face {
  font-family: "Fredoka";
  src: url("assets/FredokaOne-Regular.ttf");
}

html{
  font-family: Fredoka, serif;
}

#app {
  margin: 0;
  padding: 0% 5% 10% 5%;
  background-color: #fff8ed;
  box-sizing: border-box;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

#app > div:first-child{
  margin-top: 5%;
}

%center {
  display: flex; /* establish flex container */
  justify-content: center; /* center items vertically, in this case */
  align-items: center; /* center items horizontally, in this case */
}

.center-vertical {
  @extend %center;
  flex-direction: column;
}

.center-horizontal {
  @extend %center;
  flex-direction: row;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

</style>
