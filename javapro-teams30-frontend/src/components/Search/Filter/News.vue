<template lang="pug">
  .search-filter
    .search-filter__block
      label.search__label(for='search-news-author') &Acy;&vcy;&tcy;&ocy;&rcy;:
      input#search-news-author.search__input(type='text' v-model='author')
    .search-filter__block.time
      label.search__label &Vcy;&rcy;&iecy;&mcy;&yacy; &pcy;&ucy;&bcy;&lcy;&icy;&kcy;&acy;&tscy;&icy;&icy;:
      select.select.search-filter__select(v-model='date_from')
        option(value='year') &Zcy;&acy; &pcy;&ocy;&scy;&lcy;&iecy;&dcy;&ncy;&icy;&jcy; &gcy;&ocy;&dcy;
        option(value='month') &Zcy;&acy; &pcy;&ocy;&scy;&lcy;&iecy;&dcy;&ncy;&icy;&jcy; &mcy;&iecy;&scy;&yacy;&tscy;
        option(value='week') &Zcy;&acy; &pcy;&ocy;&scy;&lcy;&iecy;&dcy;&ncy;&yucy;&yucy; &ncy;&iecy;&dcy;&iecy;&lcy;&yucy;
    .search-filter__block.tags
      add-tags(:tags='tags' @change-tags='onChangeTags')
    .search-filter__block.btn-news
      button-hover(@click.native='onSearchNews') &Pcy;&rcy;&icy;&mcy;&iecy;&ncy;&icy;&tcy;&softcy;
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import moment from 'moment'
import AddTags from '@/components/News/AddTags'
export default {
  name: 'SearchFilterNews',
  components: { AddTags },
  data: () => ({
    tags: [],
    date_from: 'year',
    date_to: 0,
    offset: 0,
    itemPerPage: 20,
    author: ''
  }),
  computed: {
    ...mapGetters('global/search', ['searchText'])
  },
  methods: {
    ...mapActions('global/pagination', ['setPaginationBlocksVisible']),
    ...mapActions('global/search', ['searchNews']),
    onChangeTags(tags) {
      this.tags = tags;
    },
    async onSearchNews() {
      await this.searchNews({
        tags: this.tags.join(','),
        text: this.searchText,
        date_from: moment()
          .subtract(1, this.date_from)
          .valueOf(),
        date_to: this.date_to,
        author: this.author,
      });
      await this.setPaginationBlocksVisible();
    }
  },
  mounted() {
    this.date_to = moment().valueOf();
  }
}
</script>
