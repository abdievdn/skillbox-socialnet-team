<template lang="pug">
  .news.inner-page
    .inner-page__main
      .news__add
        news-add(user='user')
      .news__list(v-if='getInfo')
        news-block.pagination-block(v-for='feed in getFeeds' :key='feed.id' :info='feed' :edit='getInfo.id === feed.author.id' :deleted='getInfo.id === feed.author.id')
      list-loader(v-if='getLoading')
      p.posts__finished-text(v-else='v-else') Постов больше нет
    .inner-page__aside
      friends-possible
 </template>

<script>
import { mapGetters, mapActions } from 'vuex'
import FriendsPossible from '@/components/Friends/Possible'
import NewsBlock from '@/components/News/Block'
import NewsAdd from '@/components/News/Add'
import ListLoader from '@/components/ListLoader'

export default {
  name: 'News',
  components: { FriendsPossible, NewsBlock, NewsAdd, ListLoader },
  computed: {
    ...mapGetters('profile/feeds', ['getFeeds', 'getLoading']),
    ...mapGetters('profile/info', ['getInfo'])
  },
  methods: {
    ...mapActions('global/pagination', ['setLoadingObserver', 'setPaginationBlocksObserver', 'setPaginationBlocksVisible'])
  },
  created() {
    window.scrollTo(0, 0);
  },
  watch: {
    getInfo() {
      if (this.getInfo) {
        this.setLoadingObserver({ id: this.getInfo.id });
      }
    }
  },
  mounted() {
    if (this.getInfo) {
      this.setLoadingObserver({ id: this.getInfo.id })
    }
    this.setPaginationBlocksVisible();
  },
  updated() {
    this.setPaginationBlocksObserver();
  }
}
</script>

<style lang="stylus">
@import '../../assets/stylus/base/vars.styl';
</style>
