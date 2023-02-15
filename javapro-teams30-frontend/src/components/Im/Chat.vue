<template lang="pug">
  .im-chat
    .im-chat__user
      .im-chat-wrapper
        router-link.im-chat__user-pic(:to="{name: 'ProfileId', params: {id: info.last_message.recipient.id}}")
          img(:src='info.last_message.recipient.photo', :alt='info.last_message.recipient.first_name')
        router-link.im-chat__user-name(:to="{name: 'ProfileId', params: {id: info.last_message.recipient.id}}")
          | {{info.last_message.recipient.first_name + &apos; &apos; + info.last_message.recipient.last_name}}
        img.im-chat__user-typing(v-if='isTyping', src='https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=15&duration=3000&color=21A45D&width=150&lines=%D0%9F%D0%B5%D1%87%D0%B0%D1%82%D0%B0%D0%B5%D1%82...', alt='Typing SVG')
      .im-chat__selected-messages(v-if='selectedMessages.length')
        | Выбрано {{selectedMessages.length}}
        button.im-chat__button._delete(@click='setSelectedMessages([])')
          simple-svg(filepath='../static/img/delete-grey.svg', height='14px', width='14px')
      .user-status-wrapper
        button.im-chat__button._delete(v-if='selectedMessages.length', @click='deleteClick')
          simple-svg(filepath='../static/img/bin.svg', height='18px', width='18px')
        span.user-status(:class='{online}') {{statusText}}
    .im-chat__infitite_list_wrapper
      virtual-list.im-chat__infitite_list.scroll-touch(:size='60', :keeps='120', :data-key="'sid'", :data-sources='messagesGrouped', :data-component='itemComponent', :wrap-class="'im-chat__message'", :root-tag="'section'", @totop='onScrollToTop', @scroll.passive='onScroll', @tobottom='onScrollToBottom', ref='vsl')
        .im-chat__loader(slot='header', v-show='fetching')
          .spinner(v-show='!isHistoryEndReached()')
          .finished(v-show='isHistoryEndReached()') Больше сообщений нет
    form.im-chat__enter(action='#', @submit.prevent='onSubmitMessage')
      input.im-chat__enter-input(@focus='focusOnChat', @blur='stopedTyping', type='text', placeholder='Ваше сообщение...', v-model='mes')
      button.im-chat__button._input(type='button', v-if='getEditMessage', @click='abortEdit()')
        simple-svg(filepath='../static/img/delete.svg', height='25px', width='25px')
      button.im-chat__button._input(type='submit')
        simple-svg(filepath='../static/img/enter.svg', height='25px', width='25px')
</template>

<script>
import { sendMessage, startTyping, stopTyping, editMessage, deleteMessages } from '@/utils/chat_ws.utils'
import moment from 'moment'
import {mapActions, mapGetters, mapMutations} from 'vuex'
import ChatMessage from '@/components/Im/ChatMessage'
import VirtualList from 'vue-virtual-scroll-list'
import Json from 'archiver/lib/plugins/json'

const makeHeader = msgDate => {
  return { sid: `group-${msgDate}`, stubDate: true, date: msgDate }
}
export default {
  name: 'ImChat',
  props: {
    isTyping: Boolean,
    info: Object,
    messages: Array,
    online: Boolean
  },
  data: () => ({
    mes: '',
    itemComponent: ChatMessage,
    isUserViewHistory: false,
    fetching: false,
    token: localStorage.getItem('user-token')
  }),
  mounted() {
    this.follow = true;
  },
  watch: {
    messages() {
      if (this.follow) this.setVirtualListToBottom()
    },
    'getEditMessage'(value) {
      this.mes = value ? value.message_text : '';
    }
  },
  computed: {
    ...mapGetters('profile/info', ['getInfo']),
    ...mapGetters('profile/dialogs', ['selectedMessages', 'getEditMessage']),
    statusText() {
      return this.online
        ? 'Онлайн'
        : 'был в сети ' + moment(this.info.last_message.recipient.last_online_time).fromNow()
    },
    messagesGrouped() {
      let groups = []
      let headerDate = null

      for (const msg of this.messages) {
        if (!(!msg.isSentByMe && msg.isDeleted)) {
          let msgDate = moment(msg.time).format('YYYY-MM-DD')
          if (msgDate !== headerDate) {
            headerDate = msgDate
            groups.push(makeHeader(headerDate))
          }
          groups.push(msg)
        }
      }
      return groups
    }
  },
  methods: {
    ...mapActions('profile/dialogs', ['loadOlderMessages', 'apiLoadAllDialogs', 'markReadedDialog']),
    ...mapGetters('profile/dialogs', ['isHistoryEndReached', 'activeDialogId', 'dialogs']),
    ...mapMutations('profile/dialogs', ['setEditMessage', 'setSelectedMessages']),
    abortEdit() {
      this.mes = '';
      this.setEditMessage(null);
    },
    deleteClick() {
      deleteMessages({
        message_ids: this.selectedMessages.map(msg => msg.id),
        token: this.token,
        user_id: this.getInfo.id,
        dialog_id: this.activeDialogId(),
      });
    },
    stopedTyping() {
      stopTyping({
        token: this.token,
        dialog_id: this.activeDialogId(),
        userId: this.getInfo.id
      })
    },
    focusOnChat(event) {
      startTyping({
        token: this.token,
        dialog_id: this.activeDialogId(),
        userId: this.getInfo.id,
      })
      this.markReadedDialog(this.activeDialogId())
    },

    onSubmitMessage() {
      if (this.mes === '') return;
      if (this.getEditMessage) {
        editMessage({
          message_id: this.getEditMessage.id,
          message_text: this.mes,
          token: this.token,
          user_id: this.getInfo.id,
        });
      } else {
        const msg = document.querySelector('.im-chat__infitite_list')
        msg.scrollTop = msg.scrollHeight;
        this.apiLoadAllDialogs();
        sendMessage({
          author_id: this.getInfo.id,
          read_status: 'SENT',
          time: Date.now(),
          dialog_id: this.activeDialogId(),
          message_text: this.mes,
          token: this.token,
        });
      }
      this.mes = '';
    },
    async onScrollToTop() {
      if (this.$refs.vsl) {
        if (!this.isHistoryEndReached()) {
          let oldest = this.messagesGrouped[0]

          this.fetching = true
          await this.loadOlderMessages()
          this.setVirtualListToOffset(1)

          this.$nextTick(() => {
            let offset = 0
            for (const groupedMsg of this.messagesGrouped) {
              if (groupedMsg.sid === oldest.sid) break
              offset += this.$refs.vsl.getSize(groupedMsg.sid)
            }

            this.setVirtualListToOffset(offset)
            this.fetching = false
          })
        }
      }
    },
    onScroll() {
      this.follow = true
    },
    onScrollToBottom() {
      this.follow = true
    },
    setVirtualListToOffset(offset) {
      if (this.$refs.vsl) {
        this.$refs.vsl.scrollToOffset(offset)
      }
    },
    setVirtualListToBottom() {
      if (this.$refs.vsl) {
        this.$refs.vsl.scrollToBottom()
      }
    }
  }
}
</script>

<style lang="stylus">
@import '../../assets/stylus/base/vars.styl';

.im-chat {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;

  &__selected-messages {
    font-size: 13px;
    line-height: 19px;
    color: #9EA4AD;
  }

  &__button {
    cursor: pointer;

    &:hover {
      background: #f7f7f7 !important;
    }

    &._delete {
      background: none;
      padding: 5px;
      border-radius: 10px;
    }

    &._input {
      background: white;
      width: 50px;
      height: 50px;
    }
  }

  &__enter {
    display: flex;
    width: 100%;
  }

  &-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  &__user {
    border-bottom: 1px solid #E3E8EE;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    padding: 30px 20px;
    font-size: 13px;
    background-color: #F8FAFD;

    &-typing {
      position: absolute;
      left: 100%;
      margin-top: 10px;
    }

    &-name {
      font-weight: 600;
      color: steel-gray;
      margin-right: 20px;
    }

    &-status {
      color: #9EA4AD;

      &-wrapper {
        display: flex;
      }

      &.online {
        color: eucalypt;
      }
    }

    &-pic {
      min-width: 40px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      margin-right: 10px;
      & > img {
        width:100%;
        height:100%;
        object-fit:cover;
      }
    }
  }

  &__infitite_list {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    overflow-y: auto;

    &_wrapper {
      position: relative;
      flex: 1;
    }
  }

  &__enter-input {
    width: 100%;
    background-color: #fff;
    padding: 0 40px;
    font-size: 15px;
    color: steel-gray;
    height: 50px;

    &::placeholder {
      color: #B0B0BC;
    }
  }

  &__loader {
    padding: 1em;
    .finished {
      font-size: 14px;
      text-align: center;
      color: #bfbfbf;
    }
    .spinner {
      font-size: 10px;
      margin: 0px auto;
      text-indent: -9999em;
      width: 25px;
      height: 25px;
      border-radius: 50%;
      background: #ffffff;
      background: linear-gradient(to right, eucalypt 10%, rgba(255, 255, 255, 0) 42%);
      position: relative;
      animation: load3 1.4s infinite linear;
      transform: translateZ(0);
    }
    .spinner:before {
      width: 50%;
      height: 50%;
      background: eucalypt;
      border-radius: 100% 0 0 0;
      position: absolute;
      top: 0;
      left: 0;
      content: '';
    }
    .spinner:after {
      background: #f8fafd;
      width: 75%;
      height: 75%;
      border-radius: 50%;
      content: '';
      margin: auto;
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
    }
    @-webkit-keyframes load3 {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
    @keyframes load3 {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  }
}
</style>
