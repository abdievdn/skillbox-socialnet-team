<template lang="pug">
  .main-layout
    main-layout-sidebar
    .main-layout__main
      main-layout-header
      main.main-layout__page
        router-view
    real-time-updater
</template>

<script>
import RealTimeUpdater from '@/components/RealTimeUpdater'
import { mapGetters, mapMutations } from 'vuex'
import { connect, disconnect } from '@/utils/notifications_ws.utils.js'
import MainLayoutHeader from '@/components/MainLayout/Header'
import MainLayoutSidebar from '@/components/MainLayout/Sidebar'
export default {
  components: {
    MainLayoutHeader,
    MainLayoutSidebar,
    RealTimeUpdater
  },
  computed: {
    ...mapGetters('profile/info', ['getInfo']),
    ...mapGetters('auth/api', ['apiToken'])
  },
  data: () => ({
    token: localStorage.getItem('user-token') ? localStorage.getItem('user-token') : this.apiToken
  }),
  methods: {
    ...mapMutations('profile/notifications', ['setNotifications', 'addNotification']),
    setNotificationsConnect() {
      if (this.getInfo) {
        connect({
          addNotification: this.addNotification,
          token: this.token,
          userId: this.getInfo.id,
        })
      }
    }
  },
  watch: {
    getInfo() {
      this.setNotificationsConnect();
    }
  },
  mounted() {
    this.setNotificationsConnect();
  },
  beforeDestroy() {
    disconnect();
  }
}
</script>

<style lang="stylus">
@import '../assets/stylus/base/vars.styl';

.main-layout {
  display: flex;
  height: 100%;
}

.main-layout__main {
  width: 100%;
  margin-left: sidebar-width;
  height: 100%;

  @media (max-width: breakpoint-xxl) {
    margin-left: sidebar-width-xl;
  }
}

.main-layout__page {
  padding-top: header-height;
  background-color: white-lilac;
  min-height: 100%;
  position: relative;
  z-index: 1;
}
</style>
