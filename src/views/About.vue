<template>
<div id="about">
  <div class="center-horizontal about-header">
      <span>The Game&nbsp;</span>
      <img src="@/assets/main-menu/browserlogo.png" />
  </div>
  <div class="text">
    <p>Introducing FomoSumo, a one-of-its-kind web-based motion-controlled multiplayer game suite. Okay, but what does this mean?</p>
    <p>WEB-BASED: Don't bother downloading anything onto your device. We don't want to hog up any of that precious space. Instead, just simply key in <a href="www.fomosumo.com">www.fomosumo.com</a> on your mobile browsers and start playing.</p>
    <p>MOTION-CONTROLLED: We turned your mobile device into a motion controller. Remember the Nintendo Wii or Switch? Why spend money on those, when the only mobile controller you need is right there in your hands already?</p>
    <p>MULTIPLAYER: No more FOMO. Instead of staring at your respective screens, you and your friends can enjoy the ensuring ridiculousness that comes with playing in the same space.</p>
    <p>GAME SUITE: That's right, not just one, lonely game. With FomoSumo, the possibilities are endless. Developers can access our library and build their own games.</p>

    <p>But honestly, what does all of these really mean? Put simply, ENDLESS FUN.</p>
  </div>
  <div class="center-horizontal about-header">
      <span>The Creators&nbsp;</span>
      <img src="@/assets/main-menu/browserlogo.png" />
  </div>
  <div class="text">
    <p>We are Nicholas, Hui Qi, Kang Fei and Charis, a bunch of NUS/Yale-NUS students from CS3216: Software Product Engineering for Digital Markets. This application is part of our final project. If you enjoyed our games, please vote for us at <a target="_blank" href="http://isteps.comp.nus.edu.sg/event/13th-steps/module/CS3216/project/2">STePS!</a>. If you didn't, it would be greatly appreciated if you could head over to the Help section and let us know how we can improve.</p>
    <p>Thank you so much for playing FomoSumo!</p>
  </div>
</div>
</template>

<style lang="scss" scoped>

#about {
  height: 100%;
  overflow-y: scroll;
}

.about-header {
  font-size: 36px;
  margin-top: 10%;

  img {
    margin-top: 5px;
    max-width: 20%;
    display: inline;
    vertical-align: middle;
  }
}

.text {
  margin-left: 10px;
  margin-right: 10px;
}
</style>