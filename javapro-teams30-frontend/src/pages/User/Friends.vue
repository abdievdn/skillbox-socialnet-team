<template lang="pug">
  .friends
    .header__tabs
      ul.tabs
        router-link.tabs__item(v-for='(tab,index) in tabs', :key='index', :class='{active: selectedTab === tab.link.name}', :to='tab.link', @click.native='selectedTab = tab.link.name') {{ tab.title }}
    component(:is='`friends-wrapper`', :key='selectedTab', :selected-tab='selectedTab')
</template>

<script>
import FriendsWrapper from "@/components/Friends/FriendsWrapper";

export default {
  name: 'Friends',
  components: { FriendsWrapper },
  data: () => ({
    searchValue: '',
    selectedTab: "Мои друзья",
    tabs: [
      {
        title: "Мои друзья",
        link: { name: 'MyFriends' }
      },
      {
        title: "Входящие заявки",
        link: { name: 'IncomingRequests' }
      },
      {
        title: "Исходящие заявки",
        link: { name: 'OutgoingRequests' }
      }
    ],
  }),
  beforeRouteEnter(to, from, next) {
    next(vm => {
      window.scrollTo(0, 0);
      vm.selectedTab = to.name
    })
  },
}
</script>

<style lang="stylus">
</style>
