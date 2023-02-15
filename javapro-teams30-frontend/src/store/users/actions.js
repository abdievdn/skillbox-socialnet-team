import axios from 'axios'
import { dispatchError } from "../../utils/error.utils";

export default {
  namespaced: true,
  actions: {
    async apiBlockUser({ dispatch }, id) {
      await axios({
        url: `friends/block_unblock/${id}`,
        method: 'POST'
      })
        .then(response => {
          dispatch(
            'global/alert/setAlert',
            {
              status: 'success',
              text: 'Пользователь заблокирован'
            },
            {
              root: true
            }
          )
          dispatch('profile/friends/apiFriends', null, {
            root: true
          })
        })
        .catch(error => dispatchError(dispatch, error));
    },
    async apiUnblockUser({ dispatch }, id) {
      await axios({
        url: `friends/block_unblock/${id}`,
        method: 'POST'
      })
        .then(response => {
          dispatch(
            'global/alert/setAlert',
            {
              status: 'success',
              text: 'Пользователь разблокирован'
            },
            {
              root: true
            }
          )
          dispatch('profile/friends/apiFriends', null, {
            root: true
          })
        })
        .catch(error => dispatchError(dispatch, error));
    }
  }
}
