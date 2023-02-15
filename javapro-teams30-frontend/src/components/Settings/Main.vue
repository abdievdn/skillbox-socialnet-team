<template lang="pug">
  .settings-main
    user-info-form-block(label='Имя:', placeholder='Введите имя', v-model='name', :required='true', :touched='formTouched')
    user-info-form-block(label='Фамилия:', placeholder='Введите фамилию', v-model='lastName', :required='true', :touched='formTouched')
    user-info-form-block(label='Телефон:', placeholder='Введите телефон', v-model='phone', phone='phone', :touched='formTouched')
    user-info-form-block(label='Страна:', placeholder='Введите страну', type='searchlist', v-model='countryChange', :items='getCountries')
    user-info-form-block(label='Город:', placeholder='Введите город', type='searchlist', v-model='city', @search-text-changed='searchCities($event)', :loadingtimeout='1500', :loading='getCitiesLoading', :disabled='!country', :items='getCities')
    .user-info-form__block
      span.user-info-form__label Дата рождения:
      .user-info-form__wrap
        select.select.user-info-form__select.day(v-model='day')
          option(v-for='d in days', :key='d') {{ d }}
        select.select.user-info-form__select.month(v-model='month')
          option(v-for='month in months', :key='month.val', :value='month') {{ month.text }}
        select.select.user-info-form__select.year(v-model='year')
          option.test test
          option(v-for='i in years', :key='i') {{ i }}
    .user-info-form__block.user-info-form__block--photo
      span.user-info-form__label Фотография:
      .user-info-form__wrap
        .user-info-form__photo-wrap
          input#photo.user-info-form__input-photo(type='file', ref='photo', @change='processFile($event)', accept='image/*')
          label.user-info-form__input.user-info-form__input--photo(for='photo')
            span.setting-main__photo-delete(v-if='photo')
              | {{ photo.name }}
              simple-svg(:filepath="'/static/img/delete.svg'", @click.native.prevent='deletePhoto')
          button-hover(variant='fill', bordered='bordered', @click.native='loadPhoto') Загрузить
        .user-info-form__photo-pic(v-if='photo && src')
          img(:src='src', :alt='photo.name')
    user-info-form-block(label='О себе:', v-model='about', type='textarea')
    .user-info-form__block.user-info-form__block--actions
      span.user-info-form__label
      .user-info-form__wrap
        button-hover(:loading='savingInProgress', @click.native.prevent='submitHandler') Сохранить
        router-link.settings-main__back(:to="{name: 'Profile'}")
          button-hover(variant='red', bordered='bordered') Отменить
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'
import UserInfoFormBlock from '@/components/Settings/UserInfoForm/Block.vue'
import { getNumbers, phoneValidator, requiredValidator, getPhoneWithMask } from "@/utils/validators.utils";

export default {
  name: 'SettingsMain',
  components: { UserInfoFormBlock },
  data: () => ({
    savingInProgress: false,
    formTouched: false,
    name: '',
    lastName: '',
    phone: '',
    about: '',
    day: 1,
    month: { val: 1, text: 'Января' },
    year: 2000,
    months: [
      { val: 1, text: 'Января' },
      { val: 2, text: 'Февраля' },
      { val: 3, text: 'Марта' },
      { val: 4, text: 'Апреля' },
      { val: 5, text: 'Мая' },
      { val: 6, text: 'Июня' },
      { val: 7, text: 'Июля' },
      { val: 8, text: 'Августа' },
      { val: 9, text: 'Сентября' },
      { val: 10, text: 'Октября' },
      { val: 11, text: 'Ноября' },
      { val: 12, text: 'Декабря' }
    ],
    photo: null,
    src: '',
    country: null,
    city: null,
    citySearchText: '',
    timer: null,
  }),
  computed: {
    ...mapGetters('global/storage', ['getStorage']),
    ...mapGetters('global/search', ['getCountries', 'getCities', 'getCitiesLoading']),
    ...mapGetters('profile/info', ['getInfo']),
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
    years() {
      return Array.from({ length: 60 }, (value, index) => 1970 + index);
    },
    days() {
      return this.month.val === 2
        ? this.year & 3 || (!(this.year % 25) && this.year & 15)
          ? 28
          : 29
        : 30 + ((this.month.val + (this.month.val >> 3)) & 1)
    },
  },
  methods: {
    ...mapActions('global/storage', ['apiStorage']),
    ...mapActions('global/search', ['apiCountries', 'apiCities']),
    ...mapActions('profile/info', ['apiChangeInfo', 'apiInfo']),
    searchCities(value) {
      this.citySearchText = value;
      this.apiCities(this.citySearchText.length
        ? { country: this.country.title, starts: this.citySearchText }
        : { country: this.country.title }
      );
    },
    isFormValid() {
      return requiredValidator(this.name)
        && requiredValidator(this.lastName)
        && phoneValidator(this.phone);
    },
    async submitHandler() {
      if (this.savingInProgress || !this.isFormValid()) {
        this.formTouched = true;
        return;
      }
      this.savingInProgress = true;
      if (this.src) this.apiStorage(this.photo);
      // this.apiStorage(this.photo).then(() => {
      await this.apiChangeInfo({
        photo_id: this.getStorage && this.getStorage.id,
        first_name: this.name,
        last_name: this.lastName,
        birth_date: moment([this.year, this.month.val - 1, this.day]).format(),
        phone: getNumbers(this.phone),
        about: this.about,
        country: this.country ? this.country.title : null,
        city: this.city ? this.city.title : null,
      });
      await this.apiInfo();
      // })
      this.savingInProgress = false;
      this.formTouched = false;
    },
    processFile(event) {
      this.photo = event.target.files[0];
      const reader = new window.FileReader();
      reader.onload = e => (this.src = e.target.result);
      reader.readAsDataURL(this.photo);
    },
    loadPhoto() {
      this.$refs.photo.click();
    },
    deletePhoto() {
      this.photo = null;
      this.src = '';
    },
    setInfo() {
      this.name = this.getInfo.first_name;
      this.lastName = this.getInfo.last_name;
      this.src = this.getInfo.photo;
      this.phone = getPhoneWithMask(this.getInfo.phone);
      if (this.getInfo.birth_date) {
        this.day = moment(this.getInfo.birth_date).date();
        this.month = this.months[moment(this.getInfo.birth_date).month()];
        this.year = moment(this.getInfo.birth_date).year();
      }
      this.about = this.getInfo.about;
      this.country = this.getInfo.country ? { title: this.getInfo.country } : null;
      this.city = this.getInfo ? { title: this.getInfo.city } : null;

      if (this.country) {
        this.apiCities({ country: this.country.title });
      }
    }
  },
  watch: {
    getInfo(value) {
      value && this.setInfo();
    }
  },
  mounted() {
    if (this.getInfo) {
      this.setInfo();
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
@import '../../assets/stylus/base/vars.styl';

.settings-main {
  background: #fff;
  box-shadow: standart-boxshadow;
  padding: 40px 10px 50px;

  .user-info-form__label {
    white-space: pre-wrap;
  }

  @media (max-width: breakpoint-xl) {
    padding: 40px 20px;
  }
}

.settings-main__back {
  margin-left: 20px;
}
</style>
