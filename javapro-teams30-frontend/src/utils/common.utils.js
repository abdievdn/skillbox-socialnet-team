export function enrichQueryParams(payload, setNullValue = false) {
  let query = [];

  payload && Object.keys(payload).map(el => {
    if (setNullValue) {
      query.push(`${el}=${payload[el]}`);
    } else {
      payload[el] && query.push(`${el}=${payload[el]}`);
    }
  });

  return query;
}
