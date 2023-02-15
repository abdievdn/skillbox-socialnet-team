import Vue from 'vue'
import Vuex from 'vuex'
import global from './global'
import auth from './auth'
import profile from './profile'
import users from './users'


Vue.use(Vuex)

export default new Vuex.Store({
  namespaced: true,
  modules: {
    global,
    auth,
    profile,
    users
  },
  state: {
    // srcImg: fetch('https://jsonplaceholder.typicode.com/photos/1')
    // .then(response => response.json())
    // .then(json => {
    //   return json.url})
  },
  getters: {
    // getSrc: s => s.srcImg,
  },
  actions: {
    resetStore: ({ dispatch, commit }) => {
      commit('global/storage/setStorage', null);
      commit('profile/dialogs/setDialogs', []);
      commit('profile/feeds/resetFeeds');
      commit('profile/friends/resetFriends');
      commit('profile/requestsAndRecommendations/resetRequests', 'incoming');
      commit('profile/requestsAndRecommendations/resetRequests', 'outgoing');
      commit('profile/requestsAndRecommendations/setRecommendations', []);
      commit('profile/requestsAndRecommendations/setRecommendationsLoading', true);
      commit('profile/info/setInfo', null);
      commit('profile/notifications/setNotifications', []);
      commit('users/info/setWall', []);
      commit('users/info/setInfo', null);
      commit('users/info/setUsersInfo', null);
    }
  },
  mutations: {},
  strict: process.env.NODE_ENV !== 'production'
})
