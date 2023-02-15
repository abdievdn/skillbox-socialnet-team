<template lang="pug">
  .profile-info(v-if="info")
    .profile-info__pic
      .profile-info__img(v-if="!info.is_blocked_by_current_user" :class="{offline: !online && !me}")
        img.profile-info__deleted-img(v-if="info.user_deleted" :src="'/static/img/user/user-deleted.png'" :alt="'user-deleted'")
        img.profile-info__real-img(v-else :src="info.photo" :alt="info.fullName")
      .profile-info__actions(v-if="!me && !info.user_deleted")
        button-hover(:disable="info.is_blocked_by_current_user || friendState === 'BLOCKED'" @click.native="onSentMessage") Написать сообщение
        button-hover.profile-info__add(v-if="friendState === 'UNKNOWN' && !info.is_blocked_by_current_user" :variant="'white'" bordered  @click.native="addFriendFnc") Добавить в друзья
        button-hover.profile-info__add(v-else-if="friendState === 'FRIEND'" :variant="'red'" bordered  @click.native="deleteFriendFnc") Удалить из друзей
        button-hover.profile-info__add(v-else-if="friendState === 'REQUEST'" :variant="'red'" bordered  @click.native="cancelRequest('Заявка отменена')") Отменить заявку
        .profile-info__add-wrapper(v-else-if="friendState === 'RECEIVED_REQUEST'")
          button-hover.profile-info__add(:variant="'white'" bordered  @click.native="resolveRequestFriend") Подтвердить заявку
          button-hover.profile-info__add(:variant="'red'" bordered  @click.native="cancelRequest('Заявка отклонена')") Отклонить заявку
        button-hover.profile-info__add(v-else-if="friendState === 'BLOCKED'" :variant="'white'" bordered  @click.native="blockedUser") Разблокировать
        button-hover.profile-info__add(v-if="friendState != 'BLOCKED'" :variant="'red'" bordered  @click.native="blockedUser") Заблокировать
    .profile-info__main
      router-link.edit(v-if="me" :to="{name: 'Settings'}")
        simple-svg(:filepath="'/static/img/edit.svg'")
      //- span.profile-info__blocked(:class="{blocked}" v-else @click="blockedUser") {{blockedText}}
      .profile-info__header
        h1.profile-info__name {{info.fullName}}
        span.user-status(v-if="!info.is_blocked_by_current_user" :class="{online, offline: !online}") {{statusText}}
      span.profile-info__block-by-user(v-if="info.is_blocked_by_current_user") Данный пользователь заблокировал вас
      .user-deleted(v-if="info.user_deleted")
        strong.user-delete__text Аккаунт удален
        button.user-delete__button(v-if="me" @click="apiAccountRecover") Восстановить
      .profile-info__deleted(v-else-if="!info.is_blocked_by_current_user")
        .profile-info__block
          span.profile-info__title Дата рождения:
          span.profile-info__val(v-if="info.birth_date") &#x20; {{info.birth_date | moment("D MMMM YYYY") }} ({{info.ages}} лет)
          span.profile-info__val(v-else) не заполнено
        .profile-info__block
          span.profile-info__title Телефон:
          a.profile-info__val(v-if="info.phone" :href="`tel:${info.phone}`") {{info.phone | phone}}
          a.profile-info__val(v-else) не заполнено
        .profile-info__block
          span.profile-info__title Страна, город:
          span.profile-info__val(v-if="info.country") {{info.country}}, {{info.city}}
          span.profile-info__val(v-else) не заполнено
        .profile-info__block
          span.profile-info__title Погода:
          span.profile-info__val(v-if="info.country && info.city && info.weather") {{info.weather.clouds}}, {{info.weather.temp}}&#xb0;
          span.profile-info__val(v-else) не определена
        .profile-info__block(v-if="me")
          .profile-info__title Курс валют:
          .profile-info__val.currency-wrapper(v-if="info.currency")
            span Доллар:&#x20;{{info.currency.usd}} RUB
            span Евро:&#x20;{{info.currency.euro}} RUB
          .profile-info__val(v-else) не определен
        .profile-info__block
          span.profile-info__title О себе:
          span.profile-info__val(v-if="info.about") {{info.about}}
          span.profile-info__val(v-else) не заполнено
    modal(v-model="modalShow")
      p(v-if="modalText") {{modalText}}
      template(slot="actions")
        button-hover(@click.native.prevent="onConfirm") Да
        button-hover(variant="red" bordered @click.native="closeModal") Отмена
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import Modal from '@/components/Modal'
import moment from 'moment'

export default {
  name: 'ProfileInfo',
  components: { Modal },
  props: {
    me: Boolean,
    online: Boolean,
    blocked: Boolean,
    friend: Boolean,
    info: Object
  },
  data: () => ({
    friendState: '',
    modalShow: false,
    modalText: '',
    modalType: 'deleteFriend'
  }),
  computed: {
    ...mapGetters('profile/dialogs', ['dialogs']),
    ...mapGetters('users/info', ['getUsersInfo', 'getInfo']),
    statusText() {
      return this.online ? 'онлайн' : 'был в сети ' + moment(this.info.last_online_time).fromNow()
    },
    blockedText() {
      return this.blocked ? 'Пользователь заблокирован' : 'Заблокировать'
    }
  },
  watch: {
    getUsersInfo() {
      this.friendState = this.getUsersInfo.friend_status
    }
  },
  mounted() {
    if (this.getUsersInfo) {
      this.friendState = this.getUsersInfo.friend_status
    }
  },

  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.friendState = vm.getUsersInfo.friend_status
    })
  },
  methods: {
    ...mapActions('profile/info', ['apiAccountRecover']),
    ...mapActions('users/actions', ['apiBlockUser', 'apiUnblockUser']),
    ...mapActions('profile/friends', ['apiAddFriends', 'apiDeleteFriends']),
    ...mapActions('profile/requestsAndRecommendations', ['apiRejectFriend', 'apiAddRequestFriend']),
    ...mapActions('profile/dialogs', ['createDialogWithUser', 'apiLoadAllDialogs']),
    ...mapActions('users/info', ['apiInfo', 'userInfoId']),
    ...mapMutations('profile/requestsAndRecommendations', ['resetRequests']),
    ...mapMutations('profile/friends', ['resetFriends']),
    blockedUser() {
      if (this.friendState === 'BLOCKED') {
        this.modalText = `Вы уверены, что хотите разблокировать пользователя ${this.info.fullName}`
        this.modalShow = true
        this.modalType = 'unblock'
      } else if (this.friendState !== 'BLOCKED') {
        this.modalText = `Вы уверены, что хотите заблокировать пользователя ${this.info.fullName}`
        this.modalShow = true
        this.modalType = 'block'
      }
    },

    async deleteFriendFnc() {
      this.modalText = `Вы уверены, что хотите удалить пользователя ${this.info.fullName} из друзей?`
      this.modalShow = true
      this.modalType = 'deleteFriend'
    },

    async rejectRequest() {
      await this.apiRejectFriend(this.$route.params.id);
      await this.apiInfo(this.$route.params.id);
      this.friendState = 'SUBSCRIBED';
    },

    async cancelRequest(text) {
      await this.apiDeleteFriends({ id: this.$route.params.id, text });
      await this.apiInfo(this.$route.params.id);
      this.resetRequests('outgoing');
      this.friendState = 'UNKNOWN';
    },
    async unBlockFnc() {
      await this.apiUnblockUser(this.$route.params.id).then(async () => {
        await this.apiInfo(this.$route.params.id)
        this.friendState = 'UNKNOWN'
      })
    },
    async addFriendFnc() {
      await this.apiAddFriends({ id: this.info.id, }).then(async () => {
        await this.apiInfo(this.$route.params.id);
        this.resetRequests('outgoing');
        this.friendState = 'REQUEST';
      })
    },

    async resolveRequestFriend() {
      await this.apiAddRequestFriend(this.info.id);
      await this.apiInfo(this.$route.params.id);
      this.resetRequests('incoming');
      this.friendState = 'FRIEND';
    },

    closeModal() {
      this.modalShow = false
    },
    onConfirm() {
      if (this.modalType === 'block') {
        this.apiBlockUser(this.$route.params.id).then(() => {
          this.apiInfo(this.$route.params.id)
        })
        this.modalShow = false
        this.friendState = 'BLOCKED'
      }
      if (this.modalType === 'unblock') {
        this.apiUnblockUser(this.$route.params.id).then(() => {
          this.apiInfo(this.$route.params.id)
        })
        this.modalShow = false
        this.friendState = 'UNKNOWN'
      }
      if (this.modalType === 'deleteFriend') {
        this.apiDeleteFriends({id: this.$route.params.id, text: 'Пользователь удален из друзей'}).then(() => {
          this.resetFriends();
          this.apiInfo(this.$route.params.id);
          this.modalShow = false
          this.friendState = 'UNKNOWN'
        })
      }
    },
    onSentMessage() {
      if (this.friendState === 'BLOCKED' || this.info.is_blocked_by_current_user) return false
      this.$router.push({ name: 'Im', query: { userId: this.info.id } })
    }
  }
}
</script>

<style lang="stylus">
@import '../../assets/stylus/base/vars.styl';

.currency-wrapper {
  display:flex;
  flex-direction:column;
}

.profile-info {
  display: flex;
  padding: 25px 30px 25px 50px;
  background: #FFFFFF;
  box-shadow: standart-boxshadow;
  position: relative;

  @media (max-width: breakpoint-xxl) {
    padding: 25px;
  }
}

.profile-info__pic {
  max-width: max-content;
  border-right: 1px solid #E6E6E6;
  padding-right: 55px;
  margin-right: 60px;

  @media (max-width: breakpoint-xxl) {
    margin-right: 20px;
    padding-right: 20px;
  }
}

.profile-info__img {
  display:flex;
  align-items:center;
  justify-content:center;
  width: 215px;
  height: 215px;
  border-radius: 50%;
  overflow: hidden;
  border: 5px solid #21A45D;

  @media (max-width: breakpoint-xxl) {
    width: 150px;
    height: 150px;
    margin: 0 auto;
  }
  .profile-info__real-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &.offline {
    border-color: #747474;
  }
}

.profile-info__actions {
  margin-top: 25px;
  max-width: 215px;

  @media (max-width: breakpoint-xxl) {
    max-width: 180px;
  }

  .btn {
    width: 100%;
  }
}

.profile-info__add {
  margin-top: 10px;
}

.profile-info__main {
  max-width: 75%;
  min-width: 50%;
  padding: 20px 0;
}

.profile-info__blocked {
  position: absolute;
  top: 30px;
  right: 45px;
  color: eucalypt;
  font-size: 15px;
  letter-spacing: 0.01em;
  cursor: pointer;

  &.blocked {
    color: #47474C;
    cursor: default;
  }
}

.profile-info__header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.profile-info__name {
  font-family: font-exo;
  font-weight: 200;
  font-size: 30px;
  line-height: 24px;
  color: #000000;
  margin-right: 15px;
}

.profile-info__block {
  display: flex;
  align-items: baseline;
  font-size: 15px;

  &+& {
    margin-top: 5px;
  }

  &:last-child {
    margin-top: 30px;
  }
}

.profile-info__title {
  width: 100%;
  max-width: 200px;
  flex: none;
  color: #47474C;

  @media (max-width: breakpoint-xxl) {
    max-width: 150px;
  }
}

.profile-info__val {
  color: #747487;
  line-height: 25px;
}
.user-delete__button {
  cursor: pointer;
  background-color: transparent;
  color: #21a45d;
}

.user-delete__text {
  margin-right: 15px;
}

.profile-info__deleted-img {
  width: 80%;
  height: 80%;
  margin-left: 10px;
  margin-bottom: 10px;
}

.profile-info__block-by-user {
  color: red;
}
</style>
