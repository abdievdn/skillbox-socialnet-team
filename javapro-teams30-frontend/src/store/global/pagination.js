import router from '@/router'

export default {
  namespaced: true,
  actions: {
    setLoadingObserver({ dispatch, commit }, { id }) {
      const loadingObserver = new IntersectionObserver(entries => {
        entries.forEach(async entry => {
          if (entry.isIntersecting) {
            switch (router.history.current.name) {
              case 'News': {
                await dispatch(
                  'profile/feeds/apiFeeds',
                  {
                    offset: this.getters['profile/feeds/getOffset'],
                    perPage: this.getters['profile/feeds/getPerPage'],
                  },
                  { root: true }
                );
                commit(
                  'profile/feeds/setOffset',
                  this.getters['profile/feeds/getOffset'],
                  { root: true },
                );
                break;
              }
              case "ProfileId": {
                commit(
                  'users/info/setOffset',
                  this.getters['users/info/getOffset'],
                  { root: true }
                );
                await dispatch(
                  'users/info/userInfoId',
                  {
                    id: id,
                    offset: this.getters['users/info/getOffset'],
                    perPage: this.getters['users/info/getPerPage']
                  },
                  { root: true }
                );
                break;
              }
              case "MyFriends": {
                await dispatch(
                  'profile/friends/apiFriends',
                  {
                    offset: this.getters['profile/friends/getOffset'],
                    perPage: this.getters['profile/friends/getPerPage']
                  },
                  { root: true }
                );
                commit(
                  'profile/friends/addOffset',
                  this.getters['profile/friends/getOffset'],
                  { root: true },
                );
                break;
              }
              case "IncomingRequests": {
                await dispatch(
                  'profile/requestsAndRecommendations/apiRequests',
                  {
                    params: {
                      offset: this.getters['profile/requestsAndRecommendations/getOffset']('incoming'),
                      perPage: this.getters['profile/requestsAndRecommendations/getPerPage']('incoming'),
                    },
                    type: 'incoming',
                  },
                  { root: true }
                );
                commit(
                  'profile/requestsAndRecommendations/addOffset',
                  'incoming',
                  { root: true },
                );
                break;
              }
              case "OutgoingRequests": {
                await dispatch(
                  'profile/requestsAndRecommendations/apiRequests',
                  {
                    params: {
                      offset: this.getters['profile/requestsAndRecommendations/getOffset']('outgoing'),
                      perPage: this.getters['profile/requestsAndRecommendations/getPerPage']('outgoing'),
                    },
                    type: 'outgoing',
                  },
                  { root: true }
                );
                commit(
                  'profile/requestsAndRecommendations/addOffset',
                  'outgoing',
                  { root: true },
                );
                break;
              }
              default: {
                commit(
                  'users/info/setOffset',
                  this.getters['users/info/getOffset'],
                  { root: true }
                );
                await dispatch(
                  'users/info/apiWall',
                  {
                    id: id,
                    offset: this.getters['users/info/getOffset'],
                    perPage: this.getters['users/info/getPerPage']
                  },
                  { root: true },
                );
                break;
              }
            }
          }
        })
      })
      const LIST_LOADING = document.querySelector('.list__loading')
      if (LIST_LOADING) loadingObserver.observe(LIST_LOADING);
    },
    setPaginationBlocksObserver() {
      const blockObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('pagination-block_active')
            observer.unobserve(entry.target)
          }
        })
      })
      document.querySelectorAll('.pagination-block:not(.pagination-block_active)').forEach(block => {
        blockObserver.observe(block)
      })
    },
    setPaginationBlocksVisible() {
      document.querySelectorAll('.pagination-block').forEach(post => {
        post.classList.add('pagination-block_active')
      })
    }
  }
}
