<template lang="pug">
  form.friends-possible(@submit.prevent='onSearchUsers', action='#')
    h4.friends-possible__title Параметры поиска
    .friends-search
      .friends-search__row
        .friends-search__block
          label.search__label(for='friends-search-name') Имя:
          input#friends-search-name.search__input(type='text', v-model='first_name')
        span.search-defis
        .friends-search__block
          label.search__label(for='friends-search-lastname') Фамилия:
          input#friends-search-lastname.search__input(type='text', v-model='last_name')
      .friends-search__block
        label.search__label Возраст:
        .search__row
          select.select.friends-search__select(v-model.number='age_from')
            option(:value='null') От
            option(value='5') От 5
            option(value='15') От 15
            option(value='30') От 30
            option(value='45') От 45
          span.search-defis &mdash;
          select.select.friends-search__select(v-model.number='age_to')
            option(:value='null') До
            option(value='30') До 30
            option(value='45') До 45
            option(value='60') До 60
            option(value='80') До 80
      .friends-search__block
        label.search__label Регион:
        .search__row
          search-field.search(placeholder='Страна', :items='getCountries', :value='countryChange', :loadingtimeout='loadingTimeout', @input='countryChange = $event')
          span.search-defis
          search-field.search(placeholder='Город', :items='getCities', :value='city', :disabled='!countryChange', :loadingtimeout='loadingTimeout', :loading='getCitiesLoading', @input='city = $event', @search-text-changed='searchCities($event)')
    button.friends-possible__btn.reset(type='button', @click.prevent='resetFilter()')
      span.friends-possible__link.reset Сбросить
    button.friends-possible__btn(type='submit')
      simple-svg(:filepath="'/static/img/search.svg'")
      span.friends-possible__link Искать друзей
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import SearchField from '@/components/FormElements/SearchField'

export default {
  name: 'FriendsSearch',
  components: { SearchField },
  data: () => ({
    country: null,
    city: null,
    first_name: null,
    last_name: null,
    age_from: null,
    age_to: null,
    loadingTimeout: 2000,
    citySearchText: '',
  }),
  computed: {
    ...mapGetters('global/search', ['getCountries', 'getCities', 'getCitiesLoading']),
    countryChange: {
      get() {
        return this.country;
      },
      set(value) {
        value
          ? this.apiCities({ country: value.title })
          : this.$store.commit('global/search/setCities', [], { root: true });
        this.city = null;
        this.country = value;
      }
    },
  },
  methods: {
    ...mapActions('global/search', ['searchUsers', 'clearSearch', 'apiCountries', 'apiCities']),
    searchCities(value) {
      this.citySearchText = value;
      this.apiCities(this.citySearchText.length
        ? { country: this.country.title, starts: this.citySearchText }
        : { country: this.country.title }
      );
    },
    isDefaultFilter() {
      return (this.first_name === "" || this.first_name === null)
        && (this.last_name === "" || this.last_name === null)
        && this.age_from === null
        && this.age_to === null
        && this.country === null
        && this.city === null
    },
    resetFilter() {
      this.country = null;
      this.city = null;
      this.first_name = null;
      this.last_name = null;
      this.age_from = null;
      this.age_to = null;
      this.onSearchUsers();
    },
    onSearchUsers() {
      const searchParams = this.isDefaultFilter() ? null : {
        first_name: this.first_name,
        last_name: this.last_name,
        age_from: this.age_from,
        age_to: this.age_to,
        country: this.country ? this.country.title : null,
        city: this.city ? this.city.title : null,
      };
      this.searchUsers(searchParams);
      this.$emit("search-click", this.isDefaultFilter());
    }
  },
  beforeDestroy() {
    this.clearSearch()
  },
  created() {
    if (this.getCountries.length === 0) {
      this.apiCountries();
    }
  }
}
</script>

<style lang="stylus">
@import '../../assets/stylus/base/vars.styl';

.search {
  height: 45px;

  .search-field__input {
    &::placeholder {
      color: black;
    }
  }
}

.friends-search {
  margin-top: 25px;
  padding-top: 20px;
  margin-bottom: 30px;
  border-top: 1px solid #E6E6E6;
}

.friends-search__row {
  @media (max-width: breakpoint-xl) {
    display: flex;

    .friends-search__block {
      flex: auto;
    }
  }
}

.friends-search__row + .friends-search__block {
  margin-top: 15px;
}

.friends-search__block {
  &+& {
    margin-top: 15px;
  }
}

.friends-search__select {
  display: block;
  width: 100%;

  &+& {
    margin-left: 12px;
  }
}
</style>
