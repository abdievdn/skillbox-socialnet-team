<template lang="pug">
  .friends__main.inner-page
    .inner-page__main
      .friends__list(v-if='items.length')
        friends-block.pagination-block(friend='friend', v-for='item in items', :selected-tab='selectedTab', :key='item.id', :info='item')
      empty-state.pagination-block(:class="{ 'list-block_active': !loading }", v-if='!loading && !items.length', type='people', :text='emptyMessage')
      list-loader(v-if='loading')
    .inner-page__aside
      friends-possible
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import FriendsPossible from '@/components/Friends/Possible'
import FriendsBlock from '@/components/Friends/Block'
import EmptyState from '@/components/EmptyState'
import ListLoader from "@/components/ListLoader";

export default {
  name: 'FriendsWrapper',
  props: { selectedTab: String },
  components: { FriendsPossible, FriendsBlock, ListLoader, EmptyState },
  computed: {
    ...mapGetters('profile/friends', { getFriends: 'getFriends', friendsLoading: 'getLoading' }),
    ...mapGetters('profile/requestsAndRecommendations', { getRequests: 'getRequests', requestsLoading: "getLoading" }),
    ...mapGetters('profile/info', ['getInfo']),
    items() {
      return this.selectedTab === 'MyFriends'
        ? this.getFriends
        : this.getRequests(this.selectedTab === "IncomingRequests" ? 'incoming' : 'outgoing');
    },
    loading() {
      return this.selectedTab === 'MyFriends'
        ? this.friendsLoading
        : this.requestsLoading(this.selectedTab === "IncomingRequests" ? 'incoming' : 'outgoing');
    },
    emptyMessage() {
      return this.selectedTab === 'MyFriends'
        ? 'Список друзей пуст'
        : `${this.selectedTab === "IncomingRequests" ? 'Входящих' : 'Исходящих'} заявок в друзья нет`;
    }
  },
  methods: {
    ...mapActions('profile/requestsAndRecommendations', ['apiRequests']),
    ...mapActions('global/pagination', ['setLoadingObserver', 'setPaginationBlocksObserver', 'setPaginationBlocksVisible']),
    loadData() {
      if (this.getInfo) {
        this.setLoadingObserver({ id: this.getInfo.id });
      }
      this.setPaginationBlocksVisible();
    },
  },
  watch: {
    getInfo() {
      this.loadData();
    }
  },
  mounted() {
    this.loadData();
  },
  updated() {
    this.setPaginationBlocksObserver();
  },
  created() {
    window.onbeforeunload = function () {
      window.scrollTo(0, 0);
    }
  },
}
</script>

<style lang="stylus">
.friends__main {
  padding-top: 70px;
}
</style>
