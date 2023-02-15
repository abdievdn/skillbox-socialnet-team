import axios from 'axios'
import moment from 'moment'
import router from '@/router'

export default {
  namespaced: true,
  state: {
    loading: true,
    info: null,
    wall: [],
    users: null,
    offset: null,
    perPage: 20
  },
  getters: {
    getInfo(state) {
      if (!state.info) return
      let result = {
        ...state.info
      }
      // если понадобиться то добавить склонение (для публикаций, но нужен или пол или отчество)
      // библиотека - petrovich
      result.fullName = result.first_name + ' ' + result.last_name
      result.ages = moment().diff(result.birth_date, 'years')
      result.is_onlined = moment().diff(moment(result.last_online_time), 'seconds') <= 60
      return result
    },
    getUsersInfo(state) {
      if (!state.users) return
      let result = {
        ...state.users
      }
      // если понадобиться то добавить склонение (для публикаций, но нужен или пол или отчество)
      // библиотека - petrovich
      result.fullName = result.first_name + ' ' + result.last_name
      result.ages = moment().diff(result.birth_date, 'years')
      result.is_onlined = moment().diff(moment(result.last_online_time), 'seconds') <= 60
      return result
    },
    getPerPage: s => s.perPage,
    getOffset: s => s.offset,
    getLoading: s => s.loading,
    getWall: s => s.wall,
    getWallPostedLength: s => s.wall.filter(el => el.type === 'POSTED').length,
    getWallQueuedLength: s => s.wall.filter(el => el.type === 'QUEUED').length,
    getWallDeletedLength: s => s.wall.filter(el => el.type === 'DELETED').length
  },
  mutations: {
    setFriendStatus: (s, { userId, status }) => {
      s.users.find(user => user.id === userId).friend_status = status
    },
    removeOffset: s => (s.offset = null),
    setOffset: (s, offset) => (s.offset = offset + s.perPage),
    setLoading: (s, loading) => (s.loading = loading),
    setInfo: (s, info) => (s.info = info),
    setWall: (s, wall) => (s.wall = wall),
    addWall: (s, wall) => (s.wall = [...s.wall, ...wall]),
    setWallById: (s, payload) => {
      s.wall[s.wall.indexOf(s.wall.find(el => el.id === payload.id))] = payload.value;
      s.wall = [...s.wall]; //for rerender
    },
    setCommentsById: (s, payload) => {
      s.wall[s.wall.indexOf(s.wall.find(el => el.id === payload.id))].comments = payload.value
    },
    setUsersInfo: (s, info) => (s.users = info)
  },
  actions: {
    async apiInfo({ commit }, id) {
      await axios({
        url: `users/${id}`,
        method: 'GET'
      })
        .then(async response => {
          await commit('setInfo', response.data.data)
        })
        .catch(_error => {})
    },
    async apiWall({ commit }, { id, offset, perPage }) {
      await axios({
        url: `users/${id}/wall${offset ? '?offset=' + offset : ''}${perPage ? '&perPage=' + perPage : ''}`,
        method: 'GET'
      })
        .then(response => {
          offset ? commit('addWall', response.data.data) : commit('setWall', response.data.data)
          if (response.data.data.length < this.getters['users/info/getPerPage']) commit('setLoading', false)
        })
        .catch(() => {
          commit('setLoading', false)
        })
    },
    async apiWallById({ commit }, id) {
      await axios({
        url: `post/${id}`,
        method: 'GET'
      })
        .then(response => {
          commit('setWallById', {
            id,
            value: response.data.data
          })
        })
        .catch(error => {})
    },
    async apiCommentsById({ commit }, id) {
      await axios({
        url: `post/${id}/comments`,
        method: 'GET'
      })
        .then(response => {
          commit('setCommentsById', response.data.data)
        })
        .catch(error => {})
    },
    async userInfoId({ commit, dispatch }, { id, offset, perPage }) {
      await axios({
        url: `users/${id}`,
        method: 'GET'
      })
        .then(async response => {
          await dispatch('apiWall', { id, offset, perPage })
          await commit('setUsersInfo', response.data.data)
        })
        .catch(error => {})
    }
  }
}
