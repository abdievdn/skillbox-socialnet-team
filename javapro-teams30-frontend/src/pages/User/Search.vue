<template lang="pug">
  .search
    .header__tabs
      search-tabs
      component(:is='`search-filter-${tabSelect}`', v-if="tabSelect !== 'all'")
    .search__main(:class="{high: tabSelect !== 'all'}")
      component(:is='`search-${tabSelect}`', v-if='hasSearchText')
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import SearchTabs from '@/components/Search/Tabs'
import SearchAll from '@/components/Search/All'
import SearchUsers from '@/components/Search/Users'
import SearchNews from '@/components/Search/News'
import SearchFilterUsers from '@/components/Search/Filter/Users'
import SearchFilterNews from '@/components/Search/Filter/News'
export default {
  name: 'Search',
  components: { SearchTabs, SearchAll, SearchUsers, SearchNews, SearchFilterUsers, SearchFilterNews },
  data: () => ({
    hasSearchText: true
  }),
  computed: {
    ...mapGetters('global/search', ['searchText', 'tabSelect'])
  },
  watch: {
    searchText() {
      this.routePushWithQuery(this.tabSelect)
    },
    tabSelect() {
      setTimeout(() => {
        this.setPaginationBlocksVisible()
      }, 100)
    }
  },
  methods: {
    ...mapMutations('global/search', ['setTabSelect', 'routePushWithQuery']),
    ...mapActions('global/search', ['searchAll', 'clearSearch']),
    ...mapActions('global/pagination', ['setPaginationBlocksVisible'])
  },
  mounted() {
    if (this.$route.query.tab) this.setTabSelect(this.$route.query.tab)
    this.$route.query.text ? this.searchAll(this.$route.query.text) : (this.hasSearchText = false)
    document.body.onkeydown = e => {
      if (e.which === 13) this.hasSearchText = true
    }
    this.setPaginationBlocksVisible()
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.setPaginationBlocksVisible()
    })
  },
  beforeDestroy() {
    this.clearSearch()
  }
}
</script>

<style lang="stylus">
@import '../../assets/stylus/base/vars.styl';

.search__main {
  padding: 100px 40px 50px;
  overflow-y: auto;

  &.high {
    padding-top: 250px;
  }
}
</style>
