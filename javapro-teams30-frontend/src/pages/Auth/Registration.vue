<template lang="pug">
  .registration
    form.registration__form(@submit.prevent="submitHandler")
      .form__block
        h4.form__subtitle Аккаунт
        email-field(id="register-email" v-model="email" :v="$v.email" :class="{checked: $v.email.required && $v.email.email}")
        password-field(id="register-password" v-model="passwd1" :v="$v.passwd1" info registration :class="{checked: $v.passwd1.required && $v.passwd2.sameAsPassword && $v.passwd1.minLength}")
        password-repeat-field(id="register-repeat-password" v-model="passwd2" :v="$v.passwd2" :class="{checked: $v.passwd1.required && $v.passwd2.sameAsPassword && $v.passwd2.minLength}")
      .form__block
        h4.form__subtitle Личные данные
        name-field(id="register-firstName" v-model="firstName" :v="$v.firstName")
        name-field(id="register-lastName" v-model="lastName" :v="$v.lastName" label="Фамилия")
      .form__block
        h4.form__subtitle Введите код
        .form__captcha-wrapper
         img.form__img.form__code(:src="getCaptcha.image" alt='Капча')
         button.form__newCaptcha-btn(type="button" @click="apiCaptcha")
          simple-svg.form__newCaptcha-svg(:filepath="'/static/img/recaptcha.svg'")
        number-field(id="register-number" v-model="number" :v="$v.number" :class="{checked: $v.number.required}")
        confirm-field(id="register-confirm" v-model="confirm" :v="$v.confirm")
      .registration__action
        button-hover(tag="button" type="submit" variant="white") Зарегистрироваться
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { required, email, minLength, sameAs } from 'vuelidate/lib/validators'
import PasswordField from '@/components/FormElements/PasswordField'
import PasswordRepeatField from '@/components/FormElements/PasswordRepeatField'
import EmailField from '@/components/FormElements/EmailField'
import NameField from '@/components/FormElements/NameField'
import NumberField from '@/components/FormElements/NumberField'
import ConfirmField from '@/components/FormElements/ConfirmField'

export default {
  name: 'Registration',
  components: {
    PasswordField,
    EmailField,
    NameField,
    NumberField,
    ConfirmField,
    PasswordRepeatField
  },
  data: () => ({
    srcImg: '',
    email: '',
    passwd1: '',
    passwd2: '',
    firstName: '',
    lastName: '',
    codeSecret: '',
    code: Number,
    number: '',
    confirm: false
  }),
  computed: {
    ...mapGetters('auth/api', ['getCaptcha'])
  },
  methods: {
    ...mapActions('auth/api', ['apiCaptcha', 'register']),
    submitHandler() {
      if (this.$v.$invalid) {
        this.$v.$touch()
        return
      }
      const { email, passwd1, passwd2, firstName, lastName } = this
      this.register({
        email,
        passwd1,
        passwd2,
        firstName,
        lastName,
        code: this.number,
        codeSecret: this.getCaptcha.code
      })
    }
  },

  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.apiCaptcha()
    })
  },

  validations: {
    confirm: { sameAs: sameAs(() => true) },
    email: { required, email },
    passwd1: { required, minLength: minLength(8) },
    passwd2: { required, minLength: minLength(8), sameAsPassword: sameAs('passwd1') },
    firstName: { required, minLength: minLength(3) },
    lastName: { required, minLength: minLength(3) },
    number: {
      required
    }
  }
}
</script>

<style lang="stylus">
@import '../../assets/stylus/base/vars.styl';

.registration {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form__captcha-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 30px
}

.form__newCaptcha-btn {
  cursor: pointer;
  background-color: transparent;
  width: 30px;
  height: 30px;
}

.form__newCaptcha-svg {
  transition: transform 0.5s ease;
}

.form__newCaptcha-btn:hover > .form__newCaptcha-svg {
  transform: rotate(360deg);
}


.registration__action {
  margin-top: 40px;

  @media (max-width: breakpoint-xxl) {
    margin-top: 20px;
  }
}
</style>
