import axios from 'axios'
import { enrichQueryParams } from "../../utils/common.utils";
import { dispatchError } from "../../utils/error.utils";

export default {
  namespaced: true,
  state: {
    feeds: [],
    loading: true,
    offset: 0,
    perPage: 20
  },
  getters: {
    getFeeds: s => s.feeds,
    getLoading: s => s.loading,
    getPerPage: s => s.perPage,
    getOffset: s => s.offset
  },
  mutations: {
    setOffset: (s, offset) => (s.offset = offset + s.perPage),
    setLoading: (s, loading) => (s.loading = loading),
    setFeeds: (s, feeds) => (s.feeds = feeds),
    addFeed: (s, feeds) => (s.feeds = [...s.feeds, ...feeds]),
    setCommentsById: (s, payload) => {
      s.feeds[s.feeds.indexOf(s.feeds.find(el => el.id === payload.post_id))].comments = payload.value
    },
    setFeedsById: (s, payload) => {
      s.feeds[s.feeds.indexOf(s.feeds.find(el => el.id === payload.id))] = payload;
      s.feeds = [...s.feeds]; // for rerender list
    },
    resetFeeds: (s) => {
      s.feeds = [];
      s.offset = 0;
      s.loading = true;
    }
  },
  actions: {
    async apiFeeds({ commit }, payload) {
      let query = enrichQueryParams(payload);
      await axios({
        url: `feeds?${query.join('&')}`,
        method: 'GET'
      })
        .then(response => {
          payload
            ? commit('addFeed', response.data.data)
            : commit('setFeeds', response.data.data);
          response.data.data.length < payload.perPage && commit('setLoading', false);
        })
        .catch(() => commit('setLoading', false));
    },
    async apiFeedsById({ commit }, post_id) {
      await axios({
        url: `post/${post_id}`,
        method: 'GET'
      }).then(response => commit('setFeedsById', response.data.data))
        .catch(() => {});
    },
    async actionsFeed({ dispatch }, payload) {
      let url = payload.edit ? `post/${payload.post_id}` : `users/${payload.id}/wall`
      let method = payload.edit ? 'PUT' : 'POST'
      if (payload.publish_date) url += '?publish_date=' + payload.publish_date
      await axios({
        url,
        method,
        data: {
          title: payload.title,
          post_text: payload.post_text,
          tags: payload.tags
        }
      }).then(async response => {
          if (payload.edit) {
            await dispatch('users/info/apiWallById', payload.post_id, {
              root: true
            });
            await dispatch('profile/feeds/apiFeedsById', payload.post_id, {
              root: true
            });
          } else {
            if (payload.route === 'News') {
              await dispatch('apiFeeds')
            } else {
              await dispatch(
                'users/info/apiWall',
                { id: payload.id },
                { root: true }
              )
            }
          }
        }).catch(error => dispatchError(dispatch, error));
    },
    async deleteFeeds({ dispatch }, payload) {
      await axios({
        url: `post/${payload.post_id}`,
        method: 'DELETE'
      }).then(async response => {
        payload.route === 'News'
          ? await dispatch('apiFeeds')
          : await dispatch('users/info/apiWall', { id: payload.id }, { root: true });
        }).catch(error => dispatchError(dispatch, error));
    },
    async recoverFeed({ dispatch }, payload) {
      await axios({
        url: `post/${payload.post_id}/recover`,
        method: 'PUT'
      })
        .then(async () => {
          payload.route === 'News'
            ? await dispatch('apiFeeds')
            : await dispatch(
                'users/info/apiWall',
                {
                  id: payload.id
                },
                {
                  root: true
                }
              )
        })
        .catch(() => {})
    }
  }
}
