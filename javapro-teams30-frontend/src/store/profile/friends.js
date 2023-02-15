import axios from 'axios'
import { dispatchError } from "../../utils/error.utils";
import { enrichQueryParams } from "../../utils/common.utils";

export default {
  namespaced: true,
  state: {
    friends: [],
    total: 0,
    loading: true,
    offset: 0,
    perPage: 20,
  },
  getters: {
    getFriends: s => s.friends,
    getTotal: s => s.total,
    getLoading: s => s.loading,
    getPerPage: s => s.perPage,
    getOffset: s => s.offset,
  },
  mutations: {
    setOffset: (s, offset) => (s.offset = offset),
    addOffset: (s, offset) => (s.offset += 1),
    setLoading: (s, loading) => (s.loading = loading),
    setFriends: (s, friends) => (s.friends = friends.length ? [...s.friends, ...friends] : friends),
    setTotal: (s, total) => (s.total = total),
    setFriendsStatus: (s, { id, status }) => {
      const friend = s.friends.find(user => user.id === id);
      if (friend) {
        s.friends = [...s.friends].map(user => user.id === id
          ? { ...user, friend_status: status }
          : user,
        );
      }
    },
    resetFriends: (s) => {
      s.friends = [];
      s.offset = 0;
      s.total = 0;
      s.loading = true;
    },
  },
  actions: {
    async apiFriends({ commit, dispatch, getters }, payload) {
      let query = enrichQueryParams(payload);
      await axios({
        url: `friends?${query.join('&')}`,
        method: 'GET'
      })
        .then(response => {
          commit('setFriends', response.data.data);
          commit('setTotal', response.data.total);
          response.data.total === getters['getFriends'].length && commit('setLoading', false);
        })
        .catch(error => {
          dispatchError(dispatch, error);
          commit('setLoading', false);
        });
    },
    async apiDeleteFriends({ dispatch, commit }, { id, text }) {
      await axios({
        url: `friends/${id}`,
        method: 'DELETE'
      }).then(response => {
          dispatch(
            'global/alert/setAlert',
            { status: 'success', text: text},
            { root: true }
          );
      }).catch(error => dispatchError(dispatch, error));
    },
    async apiAddFriends({ dispatch, commit }, { id }) {
      await axios({
        url: `friends/${id}`,
        method: 'POST'
      }).then(async response => {
        dispatch(
          'global/alert/setAlert',
          { status: 'success', text: 'Заявка отправлена' },
          { root: true }
        );
      }).catch(error => dispatchError(dispatch, error));
    },
  }
}
