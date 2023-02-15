<template lang="pug">
  .profile.inner-page
    .inner-page__main
      .profile__info
        profile-info(me='me', online='online', :info='getInfo')
      .profile__news(v-if='getWall.length > 0')
        .profile__tabs
          span.profile__tab(@click="changeTab('POSTED')", :class="{active: activeTab === 'POSTED'}") Мои публикации
          span.profile__tab(@click="changeTab('QUEUED')", :class="{active: activeTab === 'QUEUED'}", v-if='getWallQueuedLength > 0') Отложенные публикации
          span.profile__tab(@click="changeTab('DELETED')", :class="{active: activeTab === 'DELETED'}", v-if='getWallDeletedLength > 0') Удаленные публикации
        .profile__add
          news-add
        .profile__news-list
          news-block.pagination-block(edit='edit', deleted='deleted', :deffered="activeTab === 'QUEUED'", v-for='news in activeWall', :key='news.id', :info='news')
        list-loader(v-if="getLoading && activeTab === 'POSTED'")
        p.posts__finished-text(v-if="!getLoading && activeTab === 'POSTED'") Постов больше нет
    .inner-page__aside
      friends-possible(v-if='!userIsDeleted')
</template>

<script>
import FriendsPossible from '@/components/Friends/Possible'
import ProfileInfo from '@/components/Profile/Info'
import NewsAdd from '@/components/News/Add'
import NewsBlock from '@/components/News/Block'
import ListLoader from '@/components/ListLoader'

import { mapGetters, mapActions, mapMutations } from 'vuex'
export default {
  name: 'Profile',
  components: { FriendsPossible, ProfileInfo, NewsAdd, NewsBlock, ListLoader },
  data: () => ({
    userIsDeleted: false,
    activeTab: 'POSTED'
  }),
  computed: {
    ...mapGetters('profile/info', ['getInfo']),
    ...mapGetters('users/info', [
      'getWall',
      'getWallPostedLength',
      'getWallQueuedLength',
      'getWallDeletedLength',
      'getLoading'
    ]),
    activeWall() {
      return this.getWall.filter(el => el.type === this.activeTab)
    }
  },
  methods: {
    ...mapMutations('users/info', ['setLoading', 'removeOffset', 'setWall']),
    ...mapActions('users/info', ['apiWall', 'apiInfo']),
    ...mapActions('global/pagination', ['setLoadingObserver', 'setPaginationBlocksObserver', 'setPaginationBlocksVisible']),
    changeTab(tab) {
      this.activeTab = tab
    }
  },
  watch: {
    getInfo() {
      if (this.getInfo) {
        this.setLoadingObserver({ id: this.getInfo.id });
        this.apiWall({ id: this.getInfo.id });
        this.userIsDeleted = this.getInfo.user_deleted;
      }
    }
  },
  mounted() {
    if (this.getInfo) this.userIsDeleted = this.getInfo.user_deleted
  },
  updated() {
    this.setPaginationBlocksObserver()
    if (this.getLoading) this.setLoadingObserver({ id: this.getInfo.id })
  },
  created() {
    window.scrollTo(0, 0)
    this.removeOffset()
    this.setLoading(true)
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (vm.getInfo) {
        vm.setWall([])
        vm.apiWall({ id: vm.getInfo.id })
        vm.setLoadingObserver({ id: vm.getInfo.id })
        vm.setPaginationBlocksVisible()
      }
    })
  }
}
</script>
