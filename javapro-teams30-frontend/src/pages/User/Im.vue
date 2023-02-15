<template lang="pug">
.im(:class="{ '_empty': !dialogs.length }")
  list-loader.pagination-block.list-block_active.pagination-block_active(v-if='loadingInProgress')
  empty-state(v-else-if='!dialogs.length', :text="'Список сообщений пуст'", :type="'messages'")
  .im__wrapper(v-else='')
    .im__dialogs
      im-dialog(v-for='dialog in dialogs', :key='dialog.id', :info='dialog', :push='countPush(dialog.unread_count)', :me='dialog.last_message.isSentByMe', :active='activeDialog && dialog.id === activeDialog.id', :online='dialog.last_message.recipient.online', @click.native='clickOnDialog(dialog.id)')
    .im__chat(v-if='activeDialog')
      im-chat(:info='activeDialog', :messages='messages', :isTyping='isTyping', :online='activeDialog.last_message.recipient.online')
</template>

<script>
import { chatConnect, chatDisconnect } from '@/utils/chat_ws.utils';
import { mapGetters, mapActions, mapMutations } from 'vuex';
import ImDialog from '@/components/Im/Dialog';
import ImChat from '@/components/Im/Chat';
import ListLoader from '@/components/ListLoader';
import EmptyState from '@/components/EmptyState';
import {closeCustomContextMenus} from "../../utils/event-listeners.utils";

export default {
  name: 'Im',
  data: () => ({
    timeout: null,
    loadingInProgress: true,
    isTyping: false,
    token: localStorage.getItem('user-token')
  }),
  components: { ImDialog, ImChat, ListLoader, EmptyState },
  computed: {
    ...mapGetters('profile/dialogs', ['messages', 'activeDialog', 'dialogs', 'activeDialogId']),
    ...mapGetters('profile/info', ['getInfo']),
  },
  methods: {
    ...mapActions('users/info', ['userInfoId']),
    ...mapMutations('profile/dialogs', [
      'addMessage',
      'setReaded',
      'setSelectedMessages',
      'setEditMessage',
      'setSelectedMessages',
    ]),
    ...mapActions('profile/dialogs', [
      'editMessage',
      'deleteMessages',
      'recoveryMessage',
      'switchDialog',
      'closeDialog',
      'createDialogWithUser',
      'apiLoadAllDialogs',
      'apiUnreadedMessages',
      'markReadedDialog'
    ]),
    getExistMessage(id) {
      return this.messages.find(msg => id === msg.id);
    },
    setTypingState(state) {
      this.isTyping = state
    },
    countPush(unread) {
      return unread > 0 ? unread : null
    },

    async clickOnDialog(dialogId) {
      if (event.target.tagName === 'A') return
      this.markReadedDialog(dialogId)
      this.$router.push({ name: 'Im', query: { activeDialog: dialogId } })
    },
    async selectDialogByRoute(route, vm) {
      this.setSelectedMessages([]);
      this.setEditMessage(null);

      if (route.query.activeDialog) {
        vm.switchDialog(route.query.activeDialog)
      } else if (route.query.userId) {
        vm.createDialogWithUser(route.query.userId)
      } else if (vm.dialogs.length > 0) {
        vm.$router.push({ name: 'Im', query: { activeDialog: vm.dialogs[0].id } })
      } else {
        await vm.apiLoadAllDialogs()
        if (vm.dialogs.length > 0) {
          vm.$router.push({ name: 'Im', query: { activeDialog: vm.dialogs[0].id } })
        }
      }
    },
  },
  watch: {
    async activeDialogId(newValue, oldValue) {
      const {
        token,
        activeDialog,
        setTypingState,
        editMessage,
        deleteMessages,
        recoveryMessage,
        addMessage,
        getInfo,
        getExistMessage,
      } = this;

      await chatDisconnect({
        user_id: this.getInfo ? this.getInfo.id : null,
        dialog_id: oldValue,
        token,
      });
      await chatConnect({
        dialogId: activeDialog.id,
        user_id: getInfo.id,
        isTyping: setTypingState,
        token,
        store: {
          editMessage,
          deleteMessages,
          recoveryMessage,
          addMessage,
          getExistMessage,
        }
      });
    }
  },
  beforeRouteEnter(to, from, next) {
    next(async vm => {
      await vm.apiLoadAllDialogs();
      vm.selectDialogByRoute(to, vm);
      vm.loadingInProgress = false;
    })
  },
  beforeRouteUpdate(to, from, next) {
    this.selectDialogByRoute(to, this)
    next()
  },
  beforeDestroy() {
    chatDisconnect({
      user_id: this.getInfo.id,
      dialog_id: this.activeDialogId,
      token: this.token,
    });
    this.closeDialog();
  },
  mounted() {
    document.body.addEventListener("click", () => closeCustomContextMenus());
    document.body.addEventListener("contextmenu", () => {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => closeCustomContextMenus(), 0);
      }
    );
    document.body.addEventListener('keydown', event => {
      if (event.key === 'Escape'|| event.key === 'Esc'|| event.keyCode === 27) {
        closeCustomContextMenus();
      }
    });
  },
  destroyed() {
    document.body.removeEventListener("click", () => {});
    document.body.removeEventListener("contextmenu", () => {});
    document.body.removeEventListener("keydown", () => {});
    this.setSelectedMessages([]);
    this.setEditMessage(null);
  }
}
</script>

<style lang="stylus">
@import '../../assets/stylus/base/vars.styl';

.im {
  width: 100%;

  &._empty {
    padding: 20px;
  }

  &__wrapper {
    display: flex;
    height: 'calc(100vh - %s)' % header-height;
  }

  &__dialogs {
    width: 100%;
    max-width: 39.13%;
    overflow-y: auto;
    max-height: 100%;
    height: 100%;
    background-color: #F2F5F9;
    border-right: 1px solid #dedede;

    @media (max-width: breakpoint-xl) {
      max-width: 120px;
    }
  }

  &__chat {
    width: 100%;
    flex: auto;
    height: 100%;
    background-color: #F8FAFD;
  }
}
</style>
