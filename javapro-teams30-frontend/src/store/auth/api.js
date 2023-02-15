import axios from 'axios'
import router from '@/router'
import { dispatchError } from "../../utils/error.utils";

export default {
  namespaced: true,
  state: {
    token: localStorage.getItem('user-token') || '',
    status: '',
    captcha: {}
  },
  getters: {
    getCaptcha: s => s.captcha,
    apiToken: s => s.token,
    isAuthenticated: state => !!state.token,
    authStatus: state => state.status
  },
  mutations: {
    setCaptcha: (s, captcha) => (s.captcha = captcha),
    setToken: (s, token) => (s.token = token),
    setStatus: (s, status) => (s.status = status)
  },
  actions: {
    async apiCaptcha({ commit }, _payload) {
      await axios({
        url: `auth/captcha`,
        method: 'GET'
      }).then(response => commit('setCaptcha', response.data))
        .catch(() => {});
    },
    async register({ dispatch }, user) {
      await axios({
        url: 'account/register',
        data: user,
        method: 'POST'
      }).then(async response => {
        router.push({ name: 'RegisterSuccess' });
        dispatch('global/alert/setAlert', { status: 'success', text: 'Регистрация прошла успешно' }, { root: true },);
        await dispatch('login', {
          email: user.email,
          password: user.passwd1
        });
      }).catch(error => dispatchError(dispatch, error));
    },
    async login({ commit, dispatch }, user) {
      commit('setStatus', 'loading')
      await axios({
        url: 'auth/login',
        data: user,
        method: 'POST'
      }).then(response => {
        const token = response.data.data.token
        localStorage.setItem('user-token', token)
        axios.defaults.headers.common['Authorization'] = token
        commit('setToken', token)
        commit('setStatus', 'success')
        commit('profile/info/setInfo', response.data.data, { root: true });
      }).catch(error => {
        dispatchError(dispatch, error);
        commit('setStatus', 'error');
        localStorage.removeItem('user-token');
      });
    },
    async logout({ commit, dispatch }) {
      await axios({
        url: 'auth/logout',
        method: 'POST'
      }).then(() => {
        commit('setToken', '')
        commit('setStatus', 'logout')
        commit('profile/dialogs/setDialogs', [], { root: true });
        localStorage.removeItem('user-token');
        delete axios.defaults.headers.common['Authorization'];
      }).catch(error => dispatchError(dispatch, error));
    }
  }
}
