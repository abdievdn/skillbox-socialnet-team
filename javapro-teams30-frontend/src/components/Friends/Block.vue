<template lang="pug">
  .friends-block
    .friends-block__img
      img(:src='info.photo', :alt='info.first_name')
    .friends-block__info
      router-link.friends-block__name(:to="{name: 'ProfileId', params: {id: info.id}}") {{info.first_name}} {{info.last_name}}
      span.friends-block__age-city(v-if='moderator') &mcy;&ocy;&dcy;&iecy;&rcy;&acy;&tcy;&ocy;&rcy;
      span.friends-block__age-city(v-else-if='info.birth_date && info.city') {{info.birth_date | moment(&apos;from&apos;, true)}}, {{info.city}}
      span.friends-block__age-city(v-else='v-else') &pcy;&rcy;&ocy;&fcy;&icy;&lcy;&softcy; &ncy;&iecy; &zcy;&acy;&pcy;&ocy;&lcy;&ncy;&iecy;&ncy;
    .friends-block__actions
      template(v-if='moderator')
        button.friends-block__actions-block(v-tooltip.bottom="'Редактировать'")
          simple-svg(:filepath="'/static/img/edit.svg'")
        .friends-block__actions-block(v-tooltip.bottom="'Удалить из списка'", @click="openModal('deleteModerator')")
          simple-svg(:filepath="'/static/img/delete.svg'")
      template(v-else-if='admin')
        button.friends-block__actions-block(v-tooltip.bottom="'Разблокировать'", v-if='info.is_blocked')
          simple-svg(:filepath="'/static/img/unblocked.svg'")
        button.friends-block__actions-block(v-tooltip.bottom="'Заблокировать'", v-else='v-else')
          simple-svg(:filepath="'/static/img/blocked.svg'")
      template(v-else='v-else')
        button.friends-block__actions-block.message(v-tooltip.bottom="'Написать сообщение'", @click='sendMessage(info.id)')
          simple-svg(:filepath="'/static/img/sidebar/im.svg'")
        button.friends-block__actions-block.add(v-tooltip.bottom="'Добавить в друзья'", v-if="info.friend_status === 'UNKNOWN'", @click='addFriend(info.id)')
          simple-svg(:filepath="'/static/img/friend-add.svg'")
        button.friends-block__actions-block.delete(v-tooltip.bottom="'Удалить из друзей'", v-else-if="info.friend_status === 'FRIEND'", @click="openModal('delete')")
          simple-svg(:filepath="'/static/img/delete.svg'")
        button.friends-block__actions-block.delete(v-tooltip.bottom="'Отменить заявку'", v-else-if="info.friend_status === 'REQUEST'", @click="rejectFriend(info.id, text='Заявка отменена')")
          simple-svg(:filepath="'/static/img/delete.svg'")
        .friends-block__buttons-wrapper(v-else-if="info.friend_status === 'RECEIVED_REQUEST'")
          button.friends-block__actions-block.delete(v-tooltip.bottom="'Отклонить заявку'", @click="rejectFriend(info.id, text='Заявка отклонена')")
            simple-svg(:filepath="'/static/img/delete.svg'")
          button.friends-block__actions-block.add(v-tooltip.bottom="'Подтвердить заявку'", @click='addRequestFriend(info.id)')
            simple-svg(:filepath="'/static/img/friend-add.svg'")
    modal(v-model='modalShow')
      p(v-if='modalText') {{modalText}}
      template(slot='actions')
        button-hover(:loading='loadingInProgress', @click.native='onConfrimClick(info.id)') &Dcy;&acy;
        button-hover(variant='red', bordered='bordered', @click.native='closeModal') &Ocy;&tcy;&mcy;&iecy;&ncy;&acy;
</template>

<script>
import Modal from '@/components/Modal'
import { mapActions, mapGetters, mapMutations } from 'vuex'
export default {
  name: 'FriendsBlock',
  props: {
    selectedTab: "",
    request: Boolean,
    admin: Boolean,
    blocked: Boolean,
    moderator: Boolean,
    info: {
      type: Object,
      default: () => ({
        first_name: 'Артем',
        last_name: 'Иващенко',
        birth_date: 1559751301818,
        town_id: 1,
        photo: '/static/img/user/1.jpg',
        id: 124
      })
    }
  },
  components: { Modal },
  data: () => ({
    modalShow: false,
    modalType: 'delete',
    loadingInProgress: false,
  }),
  computed: {
    ...mapGetters('global/search', ['getResult']),
    ...mapGetters('profile/dialogs', ['dialogs']),
    modalText() {
      return this.modalType === 'delete'
        ? `Вы уверены, что хотите удалить пользователя ${this.info.first_name + ' ' + this.info.last_name} из друзей?`
        : this.modalType === 'deleteModerator'
        ? `Вы уверены, что хотите удалить ${this.info.first_name + ' ' + this.info.last_name} из списка модераторов?`
        : `Вы уверены, что хотите заблокировать пользователя ${this.info.first_name + ' ' + this.info.last_name}?`
    }
  },

  methods: {
    ...mapMutations('global/search', ['setUserStatus']),
    ...mapMutations('profile/friends', ['setFriendsStatus']),
    ...mapMutations('profile/requestsAndRecommendations', ['setRequestStatus', 'setRecommendationsStatus']),
    ...mapActions('profile/friends', ['apiAddFriends', 'apiDeleteFriends', 'apiAddFriends', 'apiFriends']),
    ...mapActions('profile/requestsAndRecommendations', ['apiRejectFriend', 'apiAddRequestFriend']),
    ...mapActions('users/actions', ['apiBlockUser', 'apiUnblockUser']),

    setUserState({ status, id }) {
      switch (this.selectedTab) {
        case 'MyFriends': {
          this.setFriendsStatus({ id, status: status });
          break;
        }
        case 'IncomingRequests': {
          this.setRequestStatus({ id, status: status, type: 'incoming' });
          break;
        }
        case 'OutgoingRequests': {
          this.setRequestStatus({ id, status: status, type: 'outgoing' });
          break;
        }
        case 'Recommendations': {
          this.setRecommendationsStatus({ id, status: status });
          break;
        }
        default: {
          this.setUserStatus({ id, status: status });
        }
      }
    },

    async addFriend(id) {
      await this.apiAddFriends({id})
      this.setUserState({ status: 'REQUEST', id })
    },

    async addRequestFriend(id) {
      await this.apiAddRequestFriend(id);
      await this.setRequestStatus({ id, status: "FRIEND", type: 'incoming' });
      this.setUserState({ status: 'FRIEND', id });
    },

    async rejectFriend(id, text) {
      await this.apiRejectFriend({ id, text });
      this.setRequestStatus({ id, status: 'UNKNOWN', type: this.selectedTab === 'IncomingRequests' ? 'incoming' : 'outgoing' });
      this.setUserState({ status: 'UNKNOWN', id });
    },

    closeModal() {
      this.modalShow = false
    },

    openModal(id) {
      this.modalType = id
      this.modalShow = true
    },

    sendMessage(userId) {
      this.$router.push({ name: 'Im', query: { userId: userId } })
    },

    onConfrimClick(id) {
      this.loadingInProgress = true;
      switch (this.modalType) {
        case 'delete': {
          this.apiDeleteFriends({ id, text: 'Пользователь удален из друзей' })
            .then(() => {
              this.setUserState({ status: 'UNKNOWN', id });
              this.setFriendsStatus({ status: 'UNKNOWN', id });
              this.closeModal();
              this.loadingInProgress = false;
            });
          break;
        }
        case 'deleteModerator': {
          console.log('delete moderator');
          this.loadingInProgress = false;
          break;
        }
        default: {
          this.apiBlockUser(id).then(() => {
            this.closeModal();
            this.loadingInProgress = false;
          });
        }
      }
    }
  }
}
</script>

<style lang="stylus">
@import '../../assets/stylus/base/vars.styl';

.friends-block {
  align-items: center;
  background: #fff;
  box-shadow: standart-boxshadow;
  padding: 20px;
  width: 100%;
  max-width: calc(50% - 20px);
  display: inline-flex;
  margin: 0 10px 20px;
}

.friends-block__img {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 30px;
  flex: none;

  @media (max-width: breakpoint-xxl) {
    margin-right: 10px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.friends-block__info {
  margin-right: auto;
}

.friends-block__name {
  font-weight: 600;
  font-size: 18px;
  line-height: 27px;
  color: steel-gray;
  display: block;

  @media (max-width: breakpoint-xxl) {
    font-size: 14px;
  }
}

.friends-block__age-city {
  font-size: 15px;
  line-height: 22px;
  color: #5A5A5A;

  @media (max-width: breakpoint-xxl) {
    font-size: 13px;
  }
}

.friends-block__actions {
  display: flex;
  align-items: center;
}

.friends-block__actions-block {
  display:inline-flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  cursor: pointer;
  width: 30px;
  height:30px;

  @media (max-width: breakpoint-xxl) {
    &+& {
      // margin-left: 5px;
    }
  }

  &+& {
    // margin-left: 10px;
  }

  &.message {
    margin-top: 5px;
    // margin-right: 15px;

    .simple-svg {
      fill: eucalypt;
    }
  }

  &.delete {
    margin-top: 3px;
  }

  &.add {
    margin-top: 2px;
    // margin-left: 15px;
  }

  .simple-svg-wrapper {
    width: 20px;
    height: 20px;
  }
}
</style>
