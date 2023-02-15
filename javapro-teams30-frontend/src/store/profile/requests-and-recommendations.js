import axios from 'axios'
import { dispatchError } from "../../utils/error.utils";
import { enrichQueryParams } from "../../utils/common.utils";

export default {
  namespaced: true,
  state: {
    requests: {
      incoming: {
        value: [],
        loading: true,
        offset: 0,
        perPage: 20,
        total: 0,
      },
      outgoing: {
        value: [],
        loading: true,
        offset: 0,
        perPage: 20,
        total: 0,
      }
    },

    recommendations: [],
    recommendationsLoading: true,
  },
  getters: {
    getRequests: (s) => (type) => (s.requests[type].value),
    getLoading: (s) => (type) => (s.requests[type].loading),
    getPerPage: (s) => (type) => (s.requests[type].perPage),
    getOffset: (s) => (type) => (s.requests[type].offset),
    getRecommendations: s => (s.recommendations),
    getRecommendationsLoading: s => (s.recommendationsLoading),
  },
  mutations: {
    setRequests: (s, payload) => s.requests[payload.type].value = payload.value.length
      ? [ ...s.requests[payload.type].value, ...payload.value ]
      : payload.value,
    setLoading: (s, payload) => s.requests[payload.type].loading = payload.value,
    setPerPage: (s, payload) => s.requests[payload.type].perPage = payload.value,
    setTotal: (s, payload) => s.requests[payload.type].total = payload.value,
    setOffset: (s, payload) => s.requests[payload.type].offset = payload.value,
    addOffset: (s, type) => s.requests[type].offset += 1,
    resetRequests: (s, type) => {
      s.requests[type].value = [];
      s.requests[type].offset = 0;
      s.requests[type].total = 0;
      s.requests[type].loading = true;
    },
    setRequestStatus: (s, { id, status, type }) => {
      const requestUser = s.requests[type].value.find(user => user.id === id);
      if (requestUser) {
        s.requests[type].value = [ ...s.requests[type].value ].map(user => (user.id === id
            ? { ...user, friend_status: status }
            : user
        ));
      }
    },
    setRecommendations: (s, recommendations) => (s.recommendations = recommendations),
    setRecommendationsLoading: (s, recommendationsLoading) => (s.recommendationsLoading = recommendationsLoading),
    setRecommendationsRequestStatus: (s, { id }) => {
      s.recommendations = [...s.recommendations].map(item => (item.id === id
        ? { ...item, requestSended: !item.requestSended }
        : item
      ));
    },
    setRecommendationsStatus: (s, { id, status }) => {
      s.recommendations.find(user => user.id === id).friend_status = status;
    },
  },
  actions: {
    async apiRequests({ dispatch, commit, getters }, { type, params }) {
      let query = enrichQueryParams(params);
      commit('setLoading', { type, value: true });
      await axios({
        url: `friends/${type === 'incoming' ? 'request' : 'outgoing_requests'}?${ query.join('&') }`,
        method: 'GET'
      }).then(response => {
        commit('setRequests', { type, value: response.data.data });
        commit('setTotal', { type, value: response.data.total });
        response.data.total === getters['getRequests'](type).length && commit('setLoading', { type, value: false });
      }).catch(error => {
        dispatchError(dispatch, error);
        commit('setLoading', { type, value: false });
      });
    },
    async apiRejectFriend({ dispatch }, { id, text }) {
      axios({
        url: `friends/request/${ id }`,
        method: 'DELETE'
      }).then(response => {
        dispatch(
          'global/alert/setAlert',
          { status: 'success', text },
          { root: true }
        );
      }).catch(error => dispatchError(dispatch, error));
    },
    async apiAddRequestFriend({ dispatch, commit }, id) {
      return axios({
        url: `friends/request/${ id }`,
        method: 'POST'
      }).then(response => {
        dispatch(
          'global/alert/setAlert',
          { status: 'success', text: 'Заявка подтверждена' },
          { root: true }
        );
        commit('profile/friends/resetFriends', null, { root: true });
      }).catch(error => dispatchError(dispatch, error));
    },
    async apiRecommendations({ commit }, payload) {
      commit('setRecommendationsLoading', true);
      let query = enrichQueryParams(payload);
      await axios({
        url: `friends/recommendations?${ query.join('&') }`,
        method: 'GET'
      })
        .then(response => {
          commit('setRecommendations', response.data.data );
          commit('setRecommendationsLoading', false);
        })
        .catch(error => commit('setRecommendationsLoading', false));
    },
  }
}
