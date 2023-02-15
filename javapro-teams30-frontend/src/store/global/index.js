import search from './search'
import menu from './menu'
import likes from './likes'
import alert from './alert'
import storage from './storage'
import pagination from './pagination'

export default {
  namespaced: true,
  modules: {
    pagination,
    search,
    menu,
    likes,
    alert,
    storage
  }
}
