import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    playerName: null,
    playerAvatar: null,
    roomId: null,
    clientConnection: null,
    shakeListener: null,
    tiltInterval: null
  },
  mutations: {
    updateRoomId(state, value) { state.roomId = value },
    updatePlayerName(state, value) { state.playerName = value},
    updateClientConnection(state, value) { state.clientConnection = value },
    updatePlayerAvatar(state, value) { state.playerAvatar = value },
    updateShakeListener(state, value) { state.shakeListener = value },
    updateTiltInterval(state, value) { state.tiltInterval = value }
  },
  actions: {

  }
})
