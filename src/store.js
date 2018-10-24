import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    playerName: '',
    roomId: '',
    clientConnection: null
  },
  mutations: {
    updateRoomId(state, value) { state.roomId = value },
    updatePlayerName(state, value) { state.playerName = value}
  },
  actions: {

  }
})
