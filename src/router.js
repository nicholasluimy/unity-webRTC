import Vue from 'vue'
import Router from 'vue-router'
import MainMenu from './views/MainMenu.vue'
import ChooseDisplay from './views/ChooseDisplay.vue'
import JoinRoom from './views/JoinRoom.vue'
import ConfirmInGame from './views/ConfirmInGame.vue'
import InGame from './views/InGame.vue'
import GameOver from './views/GameOver.vue'
import About from './views/About.vue'
import Help from './views/Help.vue'
import Disconnected from './views/Disconnected.vue'
import Tutorial from './views/Tutorial.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'main-menu',
      component: MainMenu
    },
    {
      path: '/choose-display',
      name: 'choose-display',
      component: ChooseDisplay
    },
    {
      path: '/join-room',
      name: 'join-room',
      component: JoinRoom
    },
    {
      path: '/confirm-in-game',
      name: 'confirm-in-game',
      component: ConfirmInGame
    },
    {
      path: '/in-game',
      name: 'in-game',
      component: InGame
    },
    {
      path: '/game-over',
      name: 'game-over',
      component: GameOver
    },
    {
      path: '/about',
      name: 'about',
      component: About
    },
    {
      path: '/help',
      name: 'help',
      component: Help
    },
    {
      path: '/disconnected',
      name: 'disconnected',
      component: Disconnected
    },
    {
      path: '/tutorial',
      name: 'tutorial',
      component: Tutorial
    }
  ]
})
