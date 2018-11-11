import Vue from 'vue'
import Vuelidate from 'vuelidate'
import VueAnalytics from 'vue-analytics'
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import App from './App.vue'
import router from './router'
import './registerServiceWorker'
import store from './store'
import ToggleButton from 'vue-js-toggle-button'

Vue.use(ToggleButton)
Vue.use(Vuelidate)
Vue.use(VueAnalytics, {
  id: 'UA-128076363-1',
  router, 
  store
})

/*
Read this SO because it is OKAY to expose this 'apiKey'
https://stackoverflow.com/questions/37482366/is-it-safe-to-expose-firebase-apikey-to-the-public/37484053#37484053
*/
Vue.prototype.$firebase = firebase.initializeApp({
  apiKey: "AIzaSyCwsUgjOL08tNrAZ_Mq012YmrUWZ5Z1NAk",
  authDomain: "fomosumos.firebaseapp.com",
  databaseURL: "https://fomosumos.firebaseio.com",
  projectId: "fomosumos",
  storageBucket: "fomosumos.appspot.com",
  messagingSenderId: "903886436512"
})

// Disable deprecated features
Vue.prototype.$firebase.firestore().settings({
  timestampsInSnapshots: true
});

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
