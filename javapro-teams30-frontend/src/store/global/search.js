import axios from 'axios'
import router from '@/router'
import { enrichQueryParams } from "../../utils/common.utils";
import {dispatchError} from '../../utils/error.utils';

export default {
  namespaced: true,
  state: {
    tags: [],
    searchText: '',
    tabs: [
      {
        id: 'all',
        text: 'Всё'
      },
      {
        id: 'users',
        text: 'Люди'
      },
      {
        id: 'news',
        text: 'Новости'
      }
    ],
    geolocations: {
      countries: [],
      cities: [],
      citiesLoading: false,
    },
    tabSelect: 'all',
    result: {
      users: [],
      news: []
    },
    loading: false,
    status: ''
  },
  getters: {
    searchText: s => s.searchText,
    tabs: s => s.tabs,
    tabSelect: s => s.tabSelect,
    getTags: s => s.tags,
    getResult: s => s.result,
    getResultById: s => id => s.result[id],
    getStatus: s => s.status,
    getCountries: s => s.geolocations.countries,
    getCities: s => s.geolocations.cities,
    getCitiesLoading: s => s.geolocations.citiesLoading,
    getLoading: s => s.loading
  },
  mutations: {
    setUserStatus: (s, { id, status }) => {
      const user = s.result.users.find(user => user.id === id);
      if (user) {
        s.result.users = [...s.result.users].map(user => user.id === id
          ? { ...user, friend_status: status }
          : user
        );
      }
    },
    addTag: (s, tag) => (s.tags = [...s.tags, tag]),
    setTags: (s, tags) => (s.tags = tags),
    setSearchText: (s, value) => (s.searchText = value),
    setTabSelect: (s, id) => (s.tabSelect = id),
    routePushWithQuery(state, id) {
      let query = {}
      if (id !== 'all') query.tab = id
      if (state.searchText.length > 0) query.text = state.searchText
      router.push({
        name: 'Search',
        query
      })
    },
    setResult: (s, result) => (s.result[result.id] = result.value),
    setLoading: (s, result) => (s.loading = result),
    setCountries: (s, result) => (s.geolocations.countries = result),
    setCities: (s, result) => (s.geolocations.cities = result),
    setCitiesLoading: (s, result) => (s.geolocations.citiesLoading = result)
  },
  actions: {
    clearSearch({ commit }) {
      commit('setSearchText', '')
      commit('setResult', {
        id: 'users',
        value: []
      })
      commit('setResult', {
        id: 'news',
        value: []
      })
    },
    changeTab({ commit }, id) {
      commit('setTabSelect', id)
      commit('routePushWithQuery', id)
    },
    async apiCountries({commit}) {
      await axios({
        url: `geolocations/countries`,
        method: 'GET'
      }).then(response => commit('setCountries', response.data.data))
        .catch(error => {});
    },
    async apiCities({commit, dispatch}, payload) {
      const baseLocationUrl = 'geolocations/cities';
      let query = enrichQueryParams(payload, true);
      commit('setCitiesLoading', true);
      await axios({
        url: `${baseLocationUrl}/${payload.starts ? 'db' : 'uses'}?${query.join('&')}`,
        method: 'GET'
      }).then(dbResponse => {
        if (payload.starts && dbResponse.data.data.length === 0) {
          axios({
            url: `${baseLocationUrl}/api?${query.join('&')}`,
            method: 'GET'
          }).then((apiResponse) => {
            commit('setCities', apiResponse.data.data);
            commit('setCitiesLoading', false);
          })
        } else {
          commit('setCities', dbResponse.data.data);
          commit('setCitiesLoading', false);
        }
      }).catch(error => {
        commit('setCitiesLoading', false);
        dispatchError(dispatch, error);
      });
    },
    async searchUsers({ commit }, payload) {
      if (payload) {
        commit('setLoading', true);
        let query = enrichQueryParams(payload);
        await axios({
          url: `users/search?${query.join('&')}`,
          method: 'GET'
        }).then(response => {
          commit('setResult', {id: 'users', value: response.data.data});
          commit('setLoading', false);
        })
          .catch(error => {})
      } else {
        commit('setResult', { id: 'users', value: [] });
        commit('setLoading', false);
      }
    },
    async searchNews({ commit }, payload) {
      if (!payload || !payload.text) {
        alert('введите текст в поиск')
        return false
      }
      let query = enrichQueryParams(payload);
      await axios({
        url: `post?${query.join('&')}`,
        method: 'GET'
      }).then(response => commit('setResult', { id: 'news', value: response.data.data }))
        .catch(error => {})
    },
    async searchAll({ dispatch, commit }, text) {
      commit('setSearchText', text);
      await dispatch('searchUsers', { first_name: text });
      await dispatch('searchNews', { text });
    }
  }
}
