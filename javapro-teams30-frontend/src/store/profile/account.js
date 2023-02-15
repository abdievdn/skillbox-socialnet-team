import axios from 'axios'
import router from '@/router'

export default {
  namespaced: true,
  state: {
    newEmail: '',
    newPassword: '',
    modalText: '',
    modalShow: false,
    notifications: [
      {
        icon: 'posts',
        name: 'О новых публикациях',
        type: 'POST',
        enable: false
      },
      {
        icon: 'comments',
        name: 'О новых комментариях к моим публикациям',
        type: 'POST_COMMENT',
        enable: false
      },
      {
        icon: 'reviews',
        name: 'О ответах на мои комментарии',
        type: 'COMMENT_COMMENT',
        enable: false
      },
      {
        icon: 'friends',
        name: 'О заявках в дузья',
        type: 'FRIEND_REQUEST',
        enable: false
      },
      {
        icon: 'messages',
        name: 'О новых личных сообщениях',
        type: 'MESSAGE',
        enable: false
      },
      {
        icon: 'birthdays',
        name: 'О дне рождения друга',
        type: 'FRIEND_BIRTHDAY',
        enable: false
      },
      {
        icon: 'likes',
        name: 'О лайках',
        type: 'POST_LIKE',
        enable: false
      }
    ]
  },
  getters: {
    getNotificationsSettings: s => s.notifications,
    getNewEmail: s => s.newEmail,
    getModalShow: s => s.modalShow,
    getNewPassword: s => s.newPassword,
    getModalText: s => s.modalText
  },
  mutations: {
    setModalText: (s, text) => (s.modalText = text),
    setModalShow: (s, show) => (s.modalShow = show),
    setNewEmail: (s, value) => (s.newEmail = value),
    setNewPassword: (s, value) => (s.newPassword = value),
    setNotificationsSettings: (s, notifications) =>
      s.notifications.map(el => (el.enable = notifications.find(n => n.type === el.type).enable))
  },
  actions: {
    async passwordRecovery({ commit }, email) {
      await axios({
        url: 'account/password/recovery',
        method: 'PUT',
        data: { email }
      })
        .then(_response => {
          commit('setModalText', 'На ваш E-mail было отправлено письмо со ссылкой для смены пароля.')
          commit('setModalShow', true)
        })
        .catch(_error => {
          commit('setModalText', 'Возникла ошибка при отправки письма, попробуйте ещё раз.')
          commit('setModalShow', true)
        })
    },
    async passwordChange({ rootState, commit }, { password, authorized }) {
      let data = { password };
      let urlEnd = "set";
      if (!authorized) {
        data.secret = router.history.current.query.token;
        urlEnd = "reset";
      }
      await axios({
        url: `account/password/${urlEnd}`,
        method: 'PUT',
        data
      })
        .then(_response => {
          commit('setModalText', 'Пароль успешно изменён!')
          commit('setModalShow', true)
        })
        .catch(_error => {
          commit('setModalText', 'Ошибка смены пароля, попробуйте ещё раз!')
          commit('setModalShow', true)
        })
    },
    async emailRecovery({ commit }, email) {
      await axios({
        url: 'account/email/recovery',
        method: 'PUT',
        data: email
      })
        .then(_response => {
          commit('setModalText', 'На ваш E-mail было отправлено письмо с подтверждением смены почты.')
          commit('setModalShow', true)
        })
        .catch(_error => {
          commit('setModalText', 'Возникла ошибка при отправки письма, попробуйте ещё раз.')
          commit('setModalShow', true)
        })
    },
    async changeNotifications({ dispatch }, data) {
      axios({
        url: 'account/notifications',
        method: 'PUT',
        data
      })
        .then(async response => {
          dispatch(
            'global/alert/setAlert',
            {
              status: 'success',
              text: 'Настройки уведомления изменены'
            },
            {
              root: true
            }
          )
          await dispatch('apiNotificationsSettings')
        })
        .catch(error => {
          dispatch(
            'global/alert/setAlert',
            {
              status: 'error',
              text: error.message
            },
            {
              root: true
            }
          )
        })
    },
    async apiNotificationsSettings({ commit }) {
      await axios({
        url: 'account/notifications',
        method: 'GET'
      })
        .then(response => {
          commit('setNotificationsSettings', response.data.data)
        })
        .catch(_error => {})
    },
    async changeEmail({}, { email }) {
      await axios({
        url: 'account/email',
        method: 'PUT',
        data: { email, secret: router.history.current.query.token }
      })
        .then(response => {})
        .catch(error => {})
    }
  }
}
