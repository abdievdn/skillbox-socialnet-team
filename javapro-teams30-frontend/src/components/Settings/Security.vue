<template lang="pug">
  .settings-security
    .settings-security__block
      h3.settings-security__title E-mail:
      span.settings-security__value {{getInfo.email}}
      button-hover(@click.native="sentToEmail('email')") Сменить почту
    .settings-security__block
      form.settings-security__form(action="#" @submit.prevent="onChangePassword")
        div.settings-security__wrapper
          password-field.setting-security__password(id="change-password" v-model="passwd1" :v="$v.passwd1" :class="{checked: $v.passwd1.required && $v.passwd2.sameAsPassword && $v.passwd1.minLength}")
          password-repeat-field.setting-security__password(id="change-repeat-password" v-model="passwd2" :v="$v.passwd2" :class="{checked: $v.passwd1.required && $v.passwd2.sameAsPassword && $v.passwd2.minLength}")
        button-hover.change-btn(tag="button" type="submit") Изменить
        button-hover(@click.native="sentToEmail('password')") Отправить на почту
    modal(v-model="modalState")
      p(v-if="getModalText") {{getModalText}}
      template(slot="actions")
        button-hover(@click.native="closeModal") Ок
</template>

<script>
import Modal from '@/components/Modal'
import PasswordField from '@/components/FormElements/PasswordField'
import PasswordRepeatField from '@/components/FormElements/PasswordRepeatField'
import { required, minLength, sameAs } from 'vuelidate/lib/validators'
import { mapGetters, mapMutations, mapActions } from 'vuex'
export default {
  name: 'SettingsSecurity',
  components: { Modal, PasswordField, PasswordRepeatField },
  data: () => ({
    passwd1: '',
    passwd2: ''
  }),
  computed: {
    ...mapGetters('profile/account', ['getNewEmail', 'getNewPassword', 'getModalText', 'getModalShow']),
    ...mapGetters('profile/info', ['getInfo']),
    modalState: {
      get() {
        return this.getModalShow
      },
      set(value) {
        this.setModalShow(value)
      }
    }
  },
  methods: {
    ...mapMutations('profile/account', ['setNewEmail', 'setNewPassword', 'setModalText', 'setModalShow']),
    ...mapActions('profile/account', ['emailRecovery', 'passwordChange', 'passwordRecovery']),

    sentToEmail(type) {
      type === 'email' ? this.emailRecovery(this.getInfo.email) : this.passwordRecovery(this.getInfo.email)
    },
    closeModal() {
      this.setModalShow(false)
    },
    onChangePassword() {
      if (this.$v.$invalid) {
        this.$v.$touch()
        return
      }
      this.passwordChange({ password: this.passwd1, authorized: true });
    }
  },
  validations: {
    passwd1: { required, minLength: minLength(8) },
    passwd2: { required, minLength: minLength(8), sameAsPassword: sameAs('passwd1') }
  }
}
</script>

<style lang="stylus">
@import '../../assets/stylus/base/vars.styl';

.settings-security__form {
  display: flex;
  align-items: center;
  width: 100%;
}

.settings-security__input {
  margin-right: auto;
}

.settings-security__block {
  background: #fff;
  box-shadow: standart-boxshadow;
  display: flex;
  align-items: center;
  height: auto;
  min-height: 95px;
  padding: 0 33px 0 50px;
  font-size: 15px;

  &+& {
    margin-top: 20px;
  }
}

.setting-security__password
  & input,
  & input:focus, {
    border-bottom: 1px solid #414141;
  };
  & input,
  & label {
    color: #414141;
  }

.settings-security__wrapper {
    margin-top: 30px;
    margin-bottom: 30px;
    margin-right: auto;
  }

.settings-security__value {
  color: #414141;
  display: block;
  min-width: 150px;
  margin-right: auto;
}

.change-btn {
  margin-right: 10px;
  }
</style>
