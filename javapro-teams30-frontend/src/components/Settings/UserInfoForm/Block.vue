<template lang="pug">
  .user-info-form__block
    span.user-info-form__label(:class="{ '_required': required }") {{label}}
    .user-info-form__wrap
      textarea.user-info-form__input.user-info-form__input--textarea(v-if="type === 'textarea'", :value='value', @input="$emit('input', $event.target.value)")
      search-field(v-else-if="type === 'searchlist'", :placeholder='placeholder', :items='items', :value='value', :disabled='disabled', :loadingTimeout='loadingTimeout', :loading='loading', @input="$emit('input', $event)", @search-text-changed="$emit('search-text-changed', $event)")
      input.user-info-form__input(v-else='', :class="{ '_error': (required || phone) && error }", type='text', :value='value', :placeholder='placeholder', @input="$emit('input', $event.target.value)", :ref="phone && 'phone'")
</template>

<script>
import Inputmask from 'inputmask';
import { phoneValidator, requiredValidator } from "@/utils/validators.utils";
import SearchField from '@/components/FormElements/SearchField'

export default {
  name: 'UserInfoFormBlock',
  components: {
    SearchField,
  },
  props: {
    type: String,
    label: String,
    placeholder: String,
    value: String | Object,
    items: Array,
    disabled: Boolean,
    loadingTimeout: Number,
    loading: Boolean,
    phone: Boolean,
    about: Boolean,
    required: Boolean,
    touched: Boolean,
  },
  data() {
    return { error: false }
  },
  watch: {
    touched() {
      if ((this.required || this.phone) && this.touched) {
        this.setError();
      }
    },
    value() {
      if (this.error || this.touched) {
        this.setError();
      }
    }
  },
  methods: {
    setError() {
      this.error = this.phone ? !phoneValidator(this.value) : !requiredValidator(this.value);
    },
  },
  mounted() {
    if (this.phone) {
      new Inputmask('+7 (999) 999-99-99').mask(this.$refs.phone);
    }
  }
}
</script>
