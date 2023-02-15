import axios from 'axios'

export default {
  namespaced: true,
  state: {
    notifications: []
  },
  getters: {
    getNotifications: s => s.notifications,
    getNotificationsLength: s => s.notifications.length,
    getNotificationsTextType: s => type => {
      switch (type) {
        case 'POST':
          return 'опубликовал новую запись'
        case 'POST_COMMENT':
          return 'оставил комментарий к вашему посту'
        case 'COMMENT_COMMENT':
          return 'ответил на ваш комментарий'
        case 'FRIEND_REQUEST':
          return 'отправил вам заявку в друзья'
        case 'FRIEND_BIRTHDAY':
          return 'день рождение'
        case 'MESSAGE':
          return 'прислал вам сообщение'
        case 'POST_LIKE':
          return 'поставил лайк вашему посту'
        case 'COMMENT_LIKE':
          return 'поставил лайк вашему комментарию'
      }
    }
  },
  mutations: {
    setNotifications: (s, value) => (s.notifications = value),
    addNotification: (s, value) => {
      // TODO: move to notificationId!
      if (!s.notifications.some(notification => notification.sent_time === value.sent_time)) {
        s.notifications = [value, ...s.notifications];
      }
    },
  },
  actions: {
    async apiNotifications({ commit, dispatch }) {
      await axios({
        url: 'notifications',
        method: 'GET'
      })
        .then(response => {
          commit('setNotifications', response.data.data)
        })
        .catch(() => {})
    },
    async readNotifications() {
      await axios({
        url: 'notifications?all=true',
        method: 'PUT'
      })
        .then(response => {})
        .catch(() => {})
    }
  }
}
