<template lang="pug">
  .search-filter
    .search-filter__block.name
      label.search__label(for='search-people-name') Имя:
      input#search-people-name.search__input(type='text', v-model='first_name')
    .search-filter__block.lastname
      label.search__label(for='search-people-lastname') Фамилия:
      input#search-people-lastname.search__input(type='text', v-model='last_name')
    .search-filter__block.age
      label.search__label Возраст:
      .search__row
        select.select.search-filter__select(v-model.number='age_from')
          option(:value='null') От
          option(value='5') От 5
          option(value='15') От 15
          option(value='30') От 30
          option(value='45') От 45
        span.search-defis &mdash;
        select.select.search-filter__select(v-model.number='age_to')
          option(:value='null') До
          option(value='30') До 30
          option(value='45') До 45
          option(value='60') До 60
          option(value='80') До 80
    .search-filter__block.region
      label.search__label Регион:
      .search__row
        search-field.search(placeholder='Страна', :items='getCountries', :value='countryChange', :loadingtimeout='loadingTimeout', @input='countryChange = $event')
        span.search-defis
        search-field.search(placeholder='Город', :items='getCities', :value='city', :disabled='!countryChange', :loadingtimeout='loadingTimeout', :loading='getCitiesLoading', @input='city = $event', @search-text-changed='searchCities($event)')
    .search-filter__block.btn-news(@click.prevent='onSearchUsers')
      button-hover Применить
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import SearchField from '@/components/FormElements/SearchField'

export default {
  name: 'SearchFilterUsers',
  components: { SearchField },
  data: () => ({
    first_name: null,
    last_name: null,
    age_from: null,
    age_to: null,
    country: null,
    city: null,
    offset: 0,
    itemPerPage: 20,
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
    onSearchUsers() {
      const searchParams = {
        first_name: this.first_name,
        last_name: this.last_name,
        age_from: this.age_from,
        age_to: this.age_to,
        country: this.country ? this.country.title : null,
        city: this.city ? this.city.title : null,
      };
      this.searchUsers(searchParams);
    }
  },
  created() {
    if (this.getCountries.length === 0) {
      this.apiCountries();
    }
  }
}
</script>

<style lang="stylus">
.search {
  height: 45px;

  .search-field__input {
    &::placeholder {
      color: black;
    }
  }
}
</style>
