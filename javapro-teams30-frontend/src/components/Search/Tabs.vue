<template lang="pug">
  ul.tabs
    li.tabs__item(v-for='(item,index) in tabs', :key='index', :class='{active: item.id === tabSelect}', @click='changeTab(item.id)') {{item.text}}
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'SearchTabs',
  computed: {
    ...mapGetters('global/search', ['tabs', 'tabSelect'])
  },
  methods: {
    ...mapActions('global/search', ['changeTab'])
  }
}
</script>

<style lang="stylus">

</style>
