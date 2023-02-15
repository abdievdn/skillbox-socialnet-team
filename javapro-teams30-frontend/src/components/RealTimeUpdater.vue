<script>
import { mapActions } from 'vuex'

const INTERVAL_UNREADED_MS = 4000
const INTERVAL_DIALOG_MS = 3000

export default {
  methods: {
    ...mapActions('profile/dialogs', ['apiLoadAllDialogs', 'apiUnreadedMessages'])
  },

  mounted() {
    this.intervalForUnreaded = setInterval(() => {
      this.apiUnreadedMessages()
    }, INTERVAL_UNREADED_MS)
    this.intervalForDialogs = setInterval(() => {
      if (this.$route.name === 'Im') {
        this.apiLoadAllDialogs()
      }
    }, INTERVAL_DIALOG_MS)
  },

  beforeDestroy() {
    window.clearInterval(this.intervalForUnreaded)
    window.clearInterval(this.intervalForDialogs)
  },
  render: () => null
}
</script>
