<template lang="pug">
  .shift-email
    form.shift-email__form(@submit.prevent="submitHandler")
      .form__block
        h4.form__subtitle Смена почтового ящика
        email-field(id="shift-email" v-model="email" :v="$v.email" :class="{checked: $v.email.required && $v.email.email}" placeholder="Новый почтовый ящик")
      .shift-email__action
        button-hover(tag="button" type="submit" variant="white") Сменить
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { email, required } from 'vuelidate/lib/validators'
import NumberField from '@/components/FormElements/NumberField'
import EmailField from '@/components/FormElements/EmailField'
import { disconnect } from '@/utils/notifications_ws.utils.js'

export default {
  name: 'ShiftEmail',
  components: {
    NumberField,
    EmailField
  },
  data: () => ({
    email: '',
    number: ''
  }),
  computed: {
    ...mapGetters('auth/api', ['apiToken']),
  },
  methods: {
    ...mapActions('profile/account', ['changeEmail']),
    ...mapActions('auth/api', ['logout']),
    submitHandler() {
      if (this.$v.$invalid) {
        this.$v.$touch()
        return
      }
      this.changeEmail({ email: this.email }).then(() => {
        this.$router.push({ name: 'ShiftEmailSuccess' })
      })
    }
  },
  created() {
    if (this.apiToken) {
      this.logout().then(() => {
        disconnect();
        this.$store.dispatch("resetStore");
      });
    }
  },
  validations: {
    email: { required, email }
  }
}
</script>

<style lang="stylus">
.shift-email {
  display: flex;
  justify-content: center;
  flex-direction: column;
  height: 100%;
}

.shift-email__title {
  margin-bottom: 20px;
}

.shift-email__action {
  margin-top: 40px;
}
</style>
