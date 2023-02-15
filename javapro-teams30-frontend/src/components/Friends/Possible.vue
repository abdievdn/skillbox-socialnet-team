<template lang="pug">
  .friends-possible(v-if='possibleFriends.length > 0')
    h4.friends-possible__title Возможно вы их знаете
    ul.friends-possible__list
      li.friends-possible__item(v-for='user in possibleFriends', :key='user.id')
        img.friends-possible__pic(:src='user.photo', :alt='user.first_name')
        router-link.friends-possible__name(:to="{name: 'ProfileId', params: {id: user.id}}") {{user.first_name + &apos; &apos; + user.last_name}}
        a.friends-possible__link(href='#', :class="{ 'possible__disable-link': user.requestSended }", @click.prevent='handleAction(user.id)') {{ user.requestSended ? 'Запрос отправлен' : 'Добавить' }}
      router-link.friends-possible__btn(href='#', :to="{name: 'FriendsFind'}")
        simple-svg(:filepath="'/static/img/search.svg'")
        span.friends-possible__link Искать друзей
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
export default {
  name: 'FriendsPossible',
  computed: {
    ...mapGetters('profile/requestsAndRecommendations', ['getRecommendations']),
    possibleFriends() {
      return this.getRecommendations;
    }
  },
  methods: {
    ...mapActions('profile/friends', ['apiAddFriends']),
    ...mapActions('profile/requestsAndRecommendations', ['apiRecommendations']),
    ...mapMutations('profile/requestsAndRecommendations', ['setRecommendationsRequestStatus']),
    async handleAction(id, requestSended) {
      if (requestSended) {
        // add reject request
      } else {
        await this.apiAddFriends({ id });
        await this.apiRecommendations();
      }
      this.setRecommendationsRequestStatus({ id });
    }
  },
  mounted() {
    if (this.possibleFriends.length === 0) {
      this.apiRecommendations();
    }
  }
}
</script>

<style>
.possible__disable-link {
  pointer-events: none;
}
</style>
