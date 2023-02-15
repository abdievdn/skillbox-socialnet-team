<template lang="pug">
  .friends.friends-find.inner-page
    .inner-page__main
      .friends__header
        h2.friends__title
          template(v-if="searchUsers.length === 0") Возможные друзья
          template(v-else) Найдено {{searchUsers.length}} человек
      list-loader(v-if='loading')
      template(v-else='')
        .friends__list(v-if='defaultFilter')
          friends-block(v-for='user in possibleFriends', recomendationlist='recomendationlist', :key='user.id', :info='user')
        .friends__list(v-else='')
          template(v-if='searchUsers.length > 0')
            friends-block(v-for='user in searchUsers', :key='user.id', :info='user')
          empty-state(v-else='', text='Нет друзей с текущим фильтром', type='people')
    .inner-page__aside
      friends-search(@search-click='defaultFilter = $event')
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import FriendsBlock from '@/components/Friends/Block'
import FriendsSearch from '@/components/Friends/Search'
import EmptyState from "@/components/EmptyState";
import ListLoader from "@/components/ListLoader";

export default {
  name: 'FriendsFind',
  components: { ListLoader, EmptyState, FriendsBlock, FriendsSearch },
  data: () => ({
    defaultFilter: true,
  }),
  computed: {
    ...mapGetters('profile/requestsAndRecommendations', { getRecommendations: 'getRecommendations', recommendationsLoading: "getRecommendationsLoading" }),
    ...mapGetters('global/search', { getResultById: 'getResultById', searchLoading: "getLoading" }),
    possibleFriends() {
      return this.getRecommendations;
    },
    searchUsers() {
      return this.getResultById('users');
    },
    loading() {
      return this.defaultFilter ? this.recommendationsLoading : this.searchLoading;
    }
  },
  methods: {
    ...mapActions('profile/friends', ['apiAddFriends']),
    ...mapActions('profile/requestsAndRecommendations', ['apiRecommendations'])
  },
  mounted() {
    if (this.possibleFriends.length === 0) {
      this.apiRecommendations();
    }
  }
}
</script>

<style lang="stylus">
@import '../../assets/stylus/base/vars.styl';

.friends-find {
  @media (max-width: breakpoint-xl) {
    &.inner-page {
      flex-direction: column;
    }

    .inner-page__aside {
      display: block;
      max-width: 100%;
      order: 0;
      margin-bottom: 20px;
    }

    .inner-page__main {
      margin-right: 0;
      order: 1;
    }
  }
}
</style>
