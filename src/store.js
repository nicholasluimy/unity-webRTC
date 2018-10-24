import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    playerName: null,
    playerAvatar: null,
    roomId: null,
    clientConnection: null
  },
  mutations: {
    updateRoomId(state, value) { state.roomId = value },
    updatePlayerName(state, value) { state.playerName = value},
    updateClientConnection(state, value) { state.clientConnection = value },
    updatePlayerAvatar(state, value) { state.playerAvatar = value }
  },
  actions: {

  }
})
