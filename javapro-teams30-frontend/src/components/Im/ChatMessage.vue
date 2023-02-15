<template lang="pug">
  .im-chat__message-wrapper(:class="{ '_text': !source.stubDate, '_selected': selected, '_deleted': source.isDeleted }", @click='selectClick($event)', @contextmenu.prevent.stop='openMenu($event)')
    h5.im-chat__message-title(v-if='source.stubDate') {{source.date | moment(&apos;DD MMMM YYYY&apos;)}}
    .im-chat__message-block(ref='message', v-else='', :class='{me: source.isSentByMe}')
      .im-chat__message-deleted(v-if='source.isDeleted')
        span Сообщение удалено
        |  |
        a(href='#', @click.prevent='recoverClick') Восстановить
      .im-chat__message-text(v-else='') {{source.message_text}}
      span.im-chat__message-time {{source.time | moment(&apos;hh:mm&apos;)}}
      .im-chat__message__menu(ref='contextMenu')
        .im-chat__message__menu-item(v-for='action in menuActions', :key='action.title', @click.prevent.stop='actionClick(action.action)') {{ action.title }}
      simple-svg.im-chat__message-icon(:class="{ '_active': selected }", v-if='selected', filepath='../static/img/tick.svg', height='22px', width='22px')
      simple-svg.im-chat__message-icon(:class="{ '_active': inEdit }", v-if='inEdit', filepath='../static/img/edit.svg', height='22px', width='22px')
</template>

<script>
import Teleport from 'vue2-teleport';
import {mapActions, mapGetters, mapMutations} from "vuex";
import {closeCustomContextMenus} from "../../utils/event-listeners.utils";
import { deleteMessages, recoverMessage } from '@/utils/chat_ws.utils'

export default {
  name: 'infinite-loading-item',
  components: { Teleport },
  data() {
    return {
      token: localStorage.getItem('user-token'),

      editMode: false,
      deleteMode: false,

      inEdit: false,
      deleted: false,
      selected: false,
      menuActions: [
        { title: 'Редактировать', action: 'edit' },
        { title: 'Удалить', action: 'delete' },
      ]
    }
  },
  props: {
    source: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    ...mapGetters('profile/dialogs', ['selectedMessages', 'getEditMessage']),
    ...mapGetters('profile/info', ['getInfo']),
  },
  watch: {
    'selectedMessages'(value) {
      this.deleteMode = !!value.length;
      if (value.length === 0) {
        this.selected = false;
      }
    },
    'getEditMessage'(value) {
      this.inEdit = value && value.id === this.source.id;
      this.editMode = !!value;
    }
  },
  methods: {
    ...mapActions('profile/dialogs', ['changeSelectedMessages']),
    ...mapMutations('profile/dialogs', ['setEditMessage']),
    ...mapGetters('profile/dialogs', ['activeDialogId']),
    openMenu(event) {
      closeCustomContextMenus();
      if (this.source.isSentByMe && this.selectedMessages.length === 0) {
        this.$refs.contextMenu.classList.remove('_visible');
        this.$refs.contextMenu.style.top = `${event.clientY}px`;
        this.$refs.contextMenu.style.left = `${event.clientX}px`;
        this.$refs.contextMenu.classList.add("_visible");
        window.customContextMenuOpened = true;
      }
    },
    selectClick() {
      if (!this.source.date && !this.source.isDeleted && !this.getEditMessage && this.source.isSentByMe) {
        this.selected = !this.selected;
        this.changeSelectedMessages(this.source);
      }
    },
    recoverClick() {
      recoverMessage({
        message_id: this.source.id,
        token: this.token,
        user_id: this.getInfo.id,
        dialog_id: this.activeDialogId(),
      });
    },
    actionClick(type) {
      if (type === 'edit') {
        this.setEditMessage(this.source);
        this.inEdit = true;
      }
      if (type === 'delete') {
        this.selected = !this.selected;
        this.changeSelectedMessages(this.source);
        deleteMessages({
          message_ids: this.selectedMessages.map(msg => msg.id),
          token: this.token,
          user_id: this.getInfo.id,
          dialog_id: this.activeDialogId(),
        });
      }
      this.$refs.contextMenu.classList.remove('_visible');
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '../../assets/stylus/base/vars.styl';

.im-chat {
  &__popup {
    background-color: #e9f5ef;
    display: flex;
    flex-direction: column;
    position: absolute;
    top: -100%;
    right: -100%;
    padding: 10px;
  }

  &__message {
    &-deleted {
      font-size: 15px;
      line-height: 23px;
      padding: 15px 20px;

      & span {
        color: #bac3d0;
      }

      & a {
        color: eucalypt;
      }
    }

    &-text {
      position: relative;
      background-color: white;
      box-shadow: 0px 4px 15px #EFF1F6;
      border-radius: 20px;
      padding: 15px 20px;
      color: steel-gray;
      font-size: 15px;
      line-height: 23px;
    }

    &-icon {
      margin: 0 10px;
      visibility: hidden;
      transition: all 0.5s;

      &._active {
        transition: all 0.5s;
        visibility: inherit;
      }
    }

    &-block {
      display: flex;
      align-items: center;
      max-width: 460px;

      &+& {
        margin-top: 20px;
      }

      &.me + & {
        margin-top: 30px;
      }

      &.me {
        flex-direction: row-reverse;
        max-width: 450px;
        margin-left: auto;

        .im-chat__message-text {
          background-color: eucalypt;
          color: white;
          box-shadow: 0px 4px 15px #D4E8DD;
        }

        .im-chat__message-time {
          margin-right: 15px;
          margin-left: 0;
        }
      }
    }

    &-title {
      color: #8A94A4;
      font-size: 15px;
      text-align: center;
      display: block;
      width: 100%;
    }

    &-day {
      &+& {
        margin-top: 50px;
      }
    }

    &-time {
      font-size: 13px;
      color: #BAC3D0;
      margin-left: 15px;
    }

    &-wrapper {
      padding: 10px 20px;

      &._text {
        &._selected {
          background: grey-2;
        }

        &:not(._deleted) {
          &:hover {
            cursor: pointer;
            background: grey-2;
          }
        }
      }
    }

    &__menu {
      position: fixed;
      z-index: 2;
      background: #fff;
      border-radius: 4px;
      border: 1px solid eucalypt;
      display: none;
      padding: 2px;
      box-shadow: 1px 1px 2px grey;

      &._visible {
        display: block;
      }

      &-item {
        padding: 8px;
        cursor: pointer;
        border-radius: 2px;

        &:hover {
          background: #f2f5f9;
        }

        &:not(:last-child) {
          border-bottom: 1px solid grey;
        }
      }
    }
  }
}
</style>
