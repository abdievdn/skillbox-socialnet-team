export function getErrorMessage(error) {
  if (error.response && error.response.data && error.response.data.error_description) {
    return error.response.data.error_description;
  }
  return "Что-то пошло не так";
}

export function dispatchError(dispatch, error) {
  dispatch(
    'global/alert/setAlert',
    { status: 'error', text: getErrorMessage(error) },
    { root: true },
  );
}
