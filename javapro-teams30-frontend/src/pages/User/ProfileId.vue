<template lang="pug">
  .profile.inner-page(v-if='getUsersInfo')
    .inner-page__main
      .profile__info
        profile-info(:me='getUsersInfo.id === getInfo.id', :info='getUsersInfo', :blocked='getUsersInfo.is_blocked', :friend="getUsersInfo.friend_status === 'FRIEND'", :online='getUsersInfo.is_onlined')
      .profile__news
        .profile__tabs
          span.profile__tab.active(v-if="!getUsersInfo.is_blocked_by_current_user") Публикации {{getUsersInfo.first_name}}
        .profile__news-list
          news-block(v-for='news in getWall', :key='news.id', :info='news')
        list-loader(v-if='getLoading')
        .list__loading(v-if='getLoading')
          simple-svg(:filepath="'/static/img/loading.svg'" fill="white")
        p.posts__finished-text(v-if='!getLoading && getWall.length > 5') Постов больше нет
    .inner-page__aside
      friends-possible
</template>

<script>
import FriendsPossible from '@/components/Friends/Possible'
import ProfileInfo from '@/components/Profile/Info'
import NewsBlock from '@/components/News/Block'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import ListLoader from "../../components/ListLoader";

export default {
  name: 'ProfileId',
  components: { ListLoader, FriendsPossible, ProfileInfo, NewsBlock },
  computed: {
    ...mapGetters('users/info', ['getUsersInfo', 'getWall', 'getLoading']),
    ...mapGetters('profile/info', ['getInfo'])
  },
  methods: {
    ...mapMutations('users/info', ['removeOffset', 'setLoading', 'setWall']),
    ...mapActions('users/info', ['userInfoId']),
    ...mapActions('global/pagination', ['setLoadingObserver', 'setPaginationBlocksObserver', 'setPaginationBlocksVisible'])
  },
  updated() {
    this.setPaginationBlocksObserver();
    if (this.getLoading) this.setLoadingObserver({ id: this.$route.params.id })
  },
  mounted() {
    this.setPaginationBlocksVisible();
  },
  watch: {
    '$route.params.id'(value) {
      if (value) {
        window.scrollTo(0, 0);
        this.setWall([]);
        this.userInfoId({id: value})
          .then(() => {
            this.removeOffset();
            this.setLoading(true);
          });
      }
    }
  },
  beforeRouteEnter(to, from, next) {
    next(async vm => {
      if (vm.$route.params.id) {
        window.scrollTo(0, 0);
        await vm.setWall([]);
        await vm.userInfoId({ id: vm.$route.params.id });
        vm.removeOffset();
        vm.setLoading(true);
      }
    })
  }
}
</script>
