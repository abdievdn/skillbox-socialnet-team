import axios from 'axios'
import { dispatchError } from "../../utils/error.utils";
import { enrichQueryParams } from "../../utils/common.utils";
import {eventBus} from "../../main";

const mergeIncomingMessages = ({ commit, state }, response) => {
  const fromServerNewFirst = response.data.data
  fromServerNewFirst.forEach(m => (m.sid = '' + m.id))
  const onlyNewMessages = fromServerNewFirst.filter(msgServer => !state.messages.some(m => m.id === msgServer.id))
  if (onlyNewMessages.length > 0) {
    commit('addMessages', { messages: onlyNewMessages, total: response.data.total })
  }
}

//  [msg 0] [msg 1] .... [msg 10]
//                          ^
//                          oldestLoadedId
// <-newest messages------------------------------------------------------older
export default {
  namespaced: true,
  state: {
    dialogs: [],
    unreadedMessages: 0, // total unreaded
    messages: [], // sorted oldest->newest 0 is oldest
    totalMessages: null,
    dialogsLoaded: false,
    activeId: null,
    oldLastKnownMessageId: null,
    isHistoryEndReached: false,
    editMessage: null,
    selectedMessages: [],
  },
  getters: {
    oldestKnownMessageId: s => (s.messages.length > 0 ? s.messages[0]['id'] : null),
    dialogs: s => s.dialogs,
    activeDialog: s => s.dialogs.find(el => el.id == s.activeId),
    activeDialogId: s => s.activeId,
    dialogsLoaded: s => s.dialogsLoaded,
    unreadedMessages: s => s.unreadedMessages,
    hasOpenedDialog: s => dialogId => !!s.dialogs.find(el => el.id == dialogId),
    isHistoryEndReached: s => s.isHistoryEndReached,
    messages: s => s.messages,
    selectedMessages: s => s.selectedMessages,
    getEditMessage: s => s.editMessage,
  },
  mutations: {
    setReaded: (s, dialogId) => {
      s.dialogs.find(dialog => dialog.id === dialogId).unread_count = 0
    },
    setUnreadedMessages: (s, unread) => (s.unreadedMessages = unread),
    setDialogs: (s, dialogs) => (s.dialogs = dialogs),
    dialogsLoaded: s => (s.dialogsLoaded = true),
    addMessage: (s, message) => {
      s.messages = [...s.messages, message]
    },
    addMessages: (s, { messages, total }) => {
      s.messages = [...s.messages, ...messages]
      s.messages.sort((a, b) => a.time - b.time)
      s.total = total
    },
    changeMessage: (s, { message_id, message }) => {
      const currentMessage = s.messages.find(el => el.id === message_id)
      currentMessage.isSentByMe ? (currentMessage.message_text = message) : null
    },
    selectDialog: (state, dialogId) => {
      state.activeId = dialogId
      state.messages = []
      state.isHistoryEndReached = false
    },
    setSelectedMessages: (s, value) => { s.selectedMessages = value },
    setEditMessage: (s, value) => { s.editMessage = value },
    updateMessage: (s, value) => {
      s.messages = [...s.messages].map(msg => msg.id !== value.message_id ? msg : { ...msg, message_text: value.message_text });
    },
    recoveryMessageById: (s, id) => {
      s.messages = [...s.messages].map(msg => id === msg.id ? { ...msg, isDeleted: false } : msg);
    },
    removeMessagesByIds: (s, ids) => {
      s.messages = [...s.messages].map(msg => ids.includes(msg.id) ? { ...msg, isDeleted: true } : msg)
    }
  },
  actions: {
    changeSelectedMessages({ commit, getters }, source) {
      let copySelectedMessages = [...getters.selectedMessages];
      if (copySelectedMessages.find(msg => msg.id === source.id)) {
        copySelectedMessages = copySelectedMessages.length > 1
          ? [...copySelectedMessages].filter(msg => msg.id !== source.id)
          : [];
      } else {
        copySelectedMessages.push(source);
      }
      commit("setSelectedMessages", copySelectedMessages);
    },
    closeDialog({ commit }) {
      commit('selectDialog', null)
    },
    async switchDialog({ state, getters, commit, dispatch }, dialogId) {
      if (!state.dialogsLoaded) {
        await dispatch('apiLoadAllDialogs')
      }
      if (getters.hasOpenedDialog(dialogId)) {
        commit('selectDialog', dialogId)
        await dispatch('loadFreshMessages', dialogId)
      } else {
        console.log('what to do with this dialog???? ' + dialogId)
      }
    },

    async apiLoadAllDialogs({ commit, dispatch }, payload) {
      let query = enrichQueryParams(payload);
      await axios({
        url: `dialogs?${query.join('&')}`,
        method: 'GET'
      })
        .then(response => {
          commit('setDialogs', response.data.data)
          commit('dialogsLoaded')
        })
        .catch(error => dispatchError(dispatch, error));
    },
    async createDialogWithUser({ dispatch }, userId) {
      await axios({
        url: 'dialogs',
        method: 'POST',
        data: {
          user_ids: [userId]
        }
      })
        .then(async response => {
          const dialogId = response.data.data.id
          await dispatch('apiLoadAllDialogs', dialogId)
          await dispatch('switchDialog', dialogId)
        })
        .catch(error => dispatchError(dispatch, error));
    },
    async loadFreshMessages({ commit, state, dispatch }, id) {
      await axios({
        url: `dialogs/${id}/messages`,
        method: 'GET',
        params: {
          itemPerPage: 10
        }
      })
        .then(response => {
          mergeIncomingMessages({ commit, state }, response)
          if (state.chaseHistoryUnitilMessageId !== null) {
            // dispatch('')
          }
        })
        .catch(error => dispatchError(dispatch, error));
    },
    async loadOlderMessages({ commit, dispatch, getters, state }) {
      await axios({
        url: `dialogs/${getters.activeDialogId}/messages`,
        params: {
          fromMessageId: getters.oldestKnownMessageId,
          offset: 1,
          itemPerPage: 2
        },
        method: 'GET'
      })
        .then(response => {
          mergeIncomingMessages({ commit, state }, response)
          if (response.data.data.length == 0) {
            commit('markEndOfHistory')
          }
        })
        .catch(error => dispatchError(dispatch, error));
    },

    async markReadedDialog({ commit }, dialogId) {
      await axios({
        url: `dialogs/${dialogId}/read`,
        method: 'PUT',
        data: { dialog_id: dialogId }
      })
        .then(response => {
          commit('setReaded', dialogId)
          commit('setUnreadedMessages', response.data.data.count)
        })
        .catch(_error => {})
    },
    async apiUnreadedMessages({ commit }) {
      await axios({
        url: 'dialogs/unreaded',
        method: 'GET'
      })
        .then(response => {
          commit('setUnreadedMessages', response.data.data.count)
        })
        .catch(error => {
          console.error(error)
        })
    },
    async apiChangeMessage({ commit, dispatch, state }, { dialog_id, message_id, message }) {
      await axios({
        url: `/dialogs/${dialog_id}/messages/${message_id}`,
        method: 'PUT',
        data: { message_text: message }
      })
        .then(_response => {})
        .catch(_error => {})
    },
    editMessage({ commit }, payload) {
      commit('updateMessage', payload);
      commit('setEditMessage', null);
    },
    recoveryMessage({ commit }, payload) {
      commit('recoveryMessageById', payload);
    },
    deleteMessages({ commit }, payload) {
      commit('removeMessagesByIds', payload);
      commit('setSelectedMessages', []);
    },
  }
}
