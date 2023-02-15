import axios from 'axios'
import moment from 'moment'
import { dispatchError } from "../../utils/error.utils";

export default {
  namespaced: true,
  state: {
    info: null
  },
  getters: {
    getInfo(state) {
      if (!state.info) return;
      let result = {
        ...state.info
      };
      result.fullName = result.first_name + ' ' + result.last_name;
      result.ages = moment().diff(result.birth_date, 'years');
      return result;
    }
  },
  mutations: {
    setInfo: (s, info) => (s.info = info)
  },
  actions: {
    async apiInfo({ commit }) {
      await axios({
        url: 'users/me',
        method: 'GET'
      }).then(async response => {
        await commit('setInfo', response.data.data)
      }).catch(_error => {});
    },
    async apiChangeInfo({ dispatch }, user) {
      await axios({
        url: 'users/me',
        method: 'PUT',
        data: user
      }).then(_response => {
        dispatch(
          'global/alert/setAlert',
          { status: 'success', text: 'Информация обновлена' },
          { root: true }
        )
      }).catch(error => dispatchError(dispatch, error));
    },
    async deleteInfo() {
      await axios({
        url: 'users/me',
        method: 'DELETE'
      }).then(_response => {})
        .catch(_error => {});
    },
    async apiAccountRecover({ dispatch }) {
      await axios({
        url: `/users/me/recover`,
        method: 'POST'
      }).then(_response => dispatch('apiInfo'))
        .catch(_error => {});
    }
  }
}
