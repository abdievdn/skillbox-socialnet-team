export function requiredValidator(value) {
  return !!value.length;
}

export function phoneValidator(value) {
  return value.length === 0 || getNumbers(value).length === 11;
}

export function getNumbers(value) {
  return value.replace(/\D+/g, '');
}

export function getPhoneWithMask(value) {
  return !value ? '' : value.replace(/(\d{1,3})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 ($2) $3-$4-$5');
}
