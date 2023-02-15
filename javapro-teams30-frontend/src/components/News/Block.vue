<template lang="pug">
  .news-block(ref='newsBlock', :class="{ deffered, 'news-block--admin': admin}")
    add-form(v-if='isEditNews', :info='info', edit='edit', :deffered='deffered', @submit-complete='toggleEditNews')
    template(v-else='v-else')
      template(v-if='!admin')
        .edit
          button.edit__icon.edit__icon--recover(v-if="info.type === 'DELETED' && info.author.id === getInfo.id", @click='recoverNews')
            simple-svg(:filepath="'/static/img/recover.svg'")
          button.edit__icon.edit__icon--remove(v-else-if='deleted', @click='deleteNews')
            simple-svg(:filepath="'/static/img/delete-news.svg'")
          button.edit__icon.edit__icon--edit(v-if='edit', @click='toggleEditNews')
            simple-svg(:filepath="'/static/img/edit.svg'")
      template(v-else='v-else')
        .edit(v-tooltip.bottom="'Разблокировать'", v-if='blocked')
          simple-svg(:filepath="'/static/img/unblocked.svg'")
        .edit(v-tooltip.bottom="'Заблокировать'", v-else='v-else')
          simple-svg(:filepath="'/static/img/blocked.svg'")
      .news-block__deffered(v-if='deffered')
        span.news-block__deffered-text
          | Дата и время публикации: {{info.time | moment(&apos;DD.MM.YYYY, HH:mm&apos;)}} ({{diffTime(info.time)}})
      .news-block__author(v-if='!deffered')
        router-link.news-block__author-pic(:to="{name: 'ProfileId', params: {id: info.author.id}}")
          img(:src='info.author.photo', :alt='info.author.first_name')
        .news-block__author-info
          router-link.news-block__author-name(:to="{name: 'ProfileId', params: {id: info.author.id}}") {{info.author.first_name + &apos; &apos; + info.author.last_name}}
          span.news-block__author-time {{info.time | moment(&quot;from&quot;)}}
      .news-block__content
        .news-block__content-main
          h3.news-block__content-title {{info.title}}
          p.news-block__content-text(ref='text', :class='{lotText: isLotText, open: openText}', v-html='info.post_text')
          a.news-block__content-more(href='#', v-if='isLotText', @click.prevent='toggleText')
            template(v-if="openText") Скрыть
            template(v-else) Читать весь пост
        ul.news-block__content-tags(v-if='info.tags.length > 0')
          li.news-block__content-tag(v-for='(tag,index) in info.tags', :key='index') {{&apos;#&apos;+tag}}
        .news-block__content-tags(v-else='v-else')
          span.news-block__content-tag #
      .news-block__actions(v-if='!deffered && !admin')
        .news-block__actions-block
          like-comment(:quantity='info.likes', width='16px', height='16px', font-size='15px', @liked='likeAction', :active='info.my_like', :id='info.id')
        .news-block__actions-block
          like-comment(:quantity='commentsLength', width='16px', height='16px', font-size='15px', comment='comment')
      .news-block__comments(v-if='!deffered')
        comments(:admin='admin', :info='info.comments', :id='info.id', :edit='edit', :deleted='deleted')
</template>

<script>
import AddForm from '@/components/News/AddForm'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import moment from 'moment'
import Comments from '@/components/Comments'
import LikeComment from '@/components/LikeComment'

export default {
  name: 'NewsBlock',
  components: { Comments, LikeComment, AddForm },
  props: {
    info: {
      type: Object
      // default: () => ({
      //   title: 'Дизайн привычных вещей',
      //   post_text:
      //     'А вот и «Книга недели от Skillbox и МИФ». Сегодня делимся с вами книгой «Дизайн привычных вещей» автора Дональда Нормана. В ней Дональд рассказывает об основополагающих принципах, которым нужно следовать, чтобы избежать проблем и превратить привычные вещи в приятные товары, доставляющие нам удовольствие А вот и «Книга недели от Skillbox и МИФ». Сегодня делимся с вами книгой «Дизайн привычных вещей» автора Дональда Нормана. В ней Дональд рассказывает об основополагающих принципах, которым нужно следовать, чтобы избежать проблем и превратить привычные вещи в приятные товары, доставляющие нам удовольствие',
      //   time: 1559751301818,
      //   likes: 44,
      //   id: 2,
      //   tags: []
      // })
    },
    edit: Boolean,
    deffered: Boolean,
    admin: Boolean,
    blocked: Boolean,
    deleted: Boolean
  },
  data: () => ({
    isLotText: false,
    openText: false,
    isEditNews: false
  }),
  computed: {
    ...mapGetters('profile/info', ['getInfo']),
    commentsLength() {
      let result = 0
      this.info.comments.map(el => {
        !el.is_deleted && result++
        el.sub_comments &&
          el.sub_comments.map(subEl => {
            !subEl.is_deleted && result++
          })
      })
      return result
    }
  },
  methods: {
    ...mapActions('global/likes', ['putLike', 'deleteLike']),
    ...mapActions('profile/feeds', ['deleteFeeds', 'changeTypeFeed', 'recoverFeed']),
    // ...mapMutations('profile/feeds', ['removeFeedById']),
    toggleText() {
      this.openText = !this.openText
    },
    diffTime(time) {
      let now = moment()
      let timePost = moment(time)
      return timePost.calendar(null, {
        sameElse: `[через ${timePost.diff(now, 'days')} дней, ${timePost.diff(now, 'hours') % 24} часа]`
      })
    },
    likeAction(active) {
      active
        ? this.deleteLike({ item_id: this.info.id, type: 'Post' })
        : this.putLike({ item_id: this.info.id, type: 'Post' })
    },
    toggleEditNews() {
      this.isEditNews = !this.isEditNews;
      this.isEditNews
        ? this.$refs.newsBlock.classList.add("_edit")
        : this.$refs.newsBlock.classList.remove("_edit");
    },
    deleteNews() {
      this.deleteFeeds({
        id: this.getInfo.id,
        post_id: this.info.id,
        route: this.$route.name
      })
    },
    recoverNews() {
      this.recoverFeed({
        id: this.getInfo.id,
        post_id: this.info.id,
        route: this.$route.name
      })
    },
    changeTypeNews() {
      this.changeTypeFeed({
        id: this.getInfo.id,
        post_id: this.info.id,
        type: 'DELETED',
        route: this.$route.name
      })
    }
  }
  // mounted() {
  //   this.$refs.text.offsetHeight > 100 ? (this.isLotText = true) : (this.isLotText = false)
  // }
}
</script>

<style lang="stylus">
@import '../../assets/stylus/base/vars.styl';


.news-block {
  background: #FFFFFF;
  box-shadow: standart-boxshadow;
  padding: 30px 40px 0;
  position: relative;
  overflow: hidden;

  &._edit {
    padding: 0;
  }

  &.deffered {
    padding-bottom: 20px;

    .edit {
      top: 30px;
    }
  }

  &--admin {
    .news-block__comments {
      margin-top: 20px;
    }
  }

  &+& {
    margin-top: 30px;
  }

  @media (max-width: breakpoint-xxl) {
    padding: 20px 30px 0;
  }
}

.news-block__deffered {
  position: relative;
  height: 45px;
  margin-bottom: 20px;
  display: flex;

  &:after {
    content: '';
    display: block;
    position: absolute;
    left: -40px;
    right: -40px;
    bottom: 0;
    width: calc(100% + 80px);
    height: 2px;
    background-color: #e7e7e7;
  }

  @media (max-width: breakpoint-xxl) {
    &:after {
      left: -30px;
      width: calc(100% + 60px);
    }
  }
}

.news-block__deffered-text {
  color: #5F5E7A;
  font-size: 16px;
}

.news-block__author {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.news-block__author-pic {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 15px;

  img {
    display: block;
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
}

.news-block__author-name {
  font-weight: 600;
  font-size: 15px;
  color: #000;
  display: block;
  margin-bottom: 5px;
}

.news-block__author-time {
  font-size: 13px;
  color: santas-gray;
}

.news-block__content {
  display: flex;
}

.news-block__content-main {
  padding-bottom: 20px;
  border-bottom: 1px solid #E7E7E7;
  width: 100%;
}

.news-block__content-title {
  font-family: font-exo;
  font-weight: bold;
  font-size: 24px;
  color: #000;
  margin-bottom: 10px;
}

.news-block__content-text {
  font-size: 15px;
  line-height: 25px;
  color: storm-gray;
  overflow: hidden;
  text-align: justify;
  padding-right: 1em;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    right: 0;
    width: 1em;
    height: 1em;
    margin-top: 0.2em;
    background: white;
  }

  &.lotText {
    max-height: 100px;
  }

  &.open {
    max-height: 100%;
    padding-right: 0;
  }
}

.news-block__content-more {
  display: inline-block;
  margin-top: 10px;
  font-size: 13px;
  color: eucalypt;
  transition: color 0.3s;
    &:hover,
    &:focus-visible {
      color: rgb(6, 199, 6);
    }
}

.news-block__content-tags {
  background-color: #F5F7FB;
  padding: 10px;
  max-width: 230px;
  flex: none;
  align-self: flex-start;
  margin-left: 40px;

  @media (max-width: breakpoint-xxl) {
    margin-left: 20px;
  }
}

.news-block__content-tag {
  color: eucalypt;
  font-size: 13px;
  line-height: 22px;
  display: inline-block;
  margin: 0 7px;
}

.news-block__actions {
  display: flex;
  align-items: center;
  margin: 25px 0;
}

.news-block__actions-block {
  &+& {
    margin-left: 30px;
  }
}
</style>
