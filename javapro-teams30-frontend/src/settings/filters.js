import Vue from 'vue'
import { getPhoneWithMask } from "../utils/validators.utils";

Vue.filter('phone', phone => {
  return getPhoneWithMask(phone);
})
