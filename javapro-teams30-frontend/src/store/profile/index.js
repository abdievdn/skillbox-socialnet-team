import info from './info'
import account from './account'
import friends from './friends'
import requestsAndRecommendations from './requests-and-recommendations'
import feeds from './feeds'
import dialogs from './dialogs'
import comments from './comments'
import notifications from './notifications'

export default {
  namespaced: true,
  modules: {
    info,
    account,
    friends,
    requestsAndRecommendations,
    feeds,
    dialogs,
    comments,
    notifications,
  },
}
