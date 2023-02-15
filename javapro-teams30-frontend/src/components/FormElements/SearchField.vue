<template lang="pug">
  .search-field(:class="{ '_disabled': disabled }", @click.prevent='itemsVisible = true')
    input.search-field__input(ref='searchInput', :placeholder='placeholder', :value='searchText', @input.prevent='search($event.target.value)', @blur.prevent='onBlur()')
    img.search-field__img(src='/static/img/arrow-bottom.png', @click.prevent.stop='onArrowClick()')
    .search-field__menu(ref='menu', v-if='itemsVisible')
      simple-svg.search-field__menu-item._unselectable._loader(v-if='loading', width='45px', fill='#21a45d', :filepath="'/static/img/loading.svg'")
      template(v-else-if='searchedItems.length')
        .search-field__menu-item(:class="{ '_selected': value && value.title === item.title }", v-for='item in searchedItems', :key='item.title', @click.prevent.stop='selectItem(item)') {{ item.title }}
      .search-field__menu-item._unselectable(v-else='') Ничего не найдено
</template>

<script>
export default {
  name: 'SearchField',
  props: {
    id: String,
    placeholder: String,
    value: Object,
    items: {
      type: Array,
      default: [],
    },
    disabled: Boolean,
    loading: Boolean,
    loadingTimeout: {
      type: Number,
      default: 0,
    },
  },
  watch: {
    value(v) {
      this.searchText = v
        ? (v.title || '')
        : '';
    }
  },
  methods: {
    onArrowClick() {
      this.itemsVisible = !this.itemsVisible;
      this.itemsVisible ? this.$refs.searchInput.focus() : this.$refs.searchInput.blur();
    },
    onBlur() {
      setTimeout(() => {
        if (this.itemsVisible) {
          this.itemsVisible = false;

          if (this.searchText === '') {
            this.$emit("input", null);
          }
          this.searchText = this.value
            ? this.value.title
            : '';

          clearTimeout(this.searchTimer);
        }
      }, 100);
    },
    search(value) {
      this.searchText = value;
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.$emit("search-text-changed", value);
      }, this.loadingTimeout);
    },
    selectItem(item) {
      this.searchText = item.title;
      if (!this.value || this.value.title !== item.title) {
        this.$emit("input", item);
        this.itemsVisible = false;
      }
    }
  },
  computed: {
    searchedItems() {
      return !this.searchText.length
        ? this.items
        : this.items.filter((item) => item.title.toLowerCase().includes(this.searchText.toLowerCase()));
    }
  },
  data() {
    return {
      itemsVisible: false,
      searchText: "",
      searchTimer: null,
    }
  }
}
</script>

<style lang="stylus">
@import '../../assets/stylus/base/vars.styl';

.search-field {
  width: 100%;
  display: block;
  position: relative;
  border: 1px solid grey-3;

  &._disabled {
    pointer-events: none;
    opacity: .5;
  }

  &__img {
    position: absolute;
    right: 0;
    cursor: pointer;
    padding: 17px 12px;
  }

  &__menu {
    display: block;
    position: absolute;
    width: 100%;
    border: 1px solid grey-3;
    background: white;
    z-index: 2;
    max-height: 260px;
    overflow: auto;

    &-item {
      padding: 10px 20px;
      border-bottom: 1px solid #fafafa;

      &._selected {
        background grey-2;
      }

      &._loader {
        display: flex;
        justify-content: center;
        padding: 0;
      }

      &:not(._unselectable):hover {
        background grey-2;
        cursor: pointer;
      }
    }
  }

  &__input {
    width: calc(100% - 32px);
    height: 100%;
    padding-left: 20px;
    font-size: 15px;

    &::placeholder {
      color: grey-1;
    }
  }
}
</style>

