import axios from 'axios'
import store from '@/store'

const NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'development'
// export const serverURL = "http://194.87.244.66:8086/api/v1/";
 export const serverURL = "http://localhost:8086/api/v1/";

axios.defaults.headers['content-type'] = 'application/json'
axios.defaults.withCredentials = true
switch (NODE_ENV) {
  case 'development':
    axios.defaults.baseURL = serverURL
    break
  case 'production':
    axios.defaults.baseURL = serverURL
    break
  default:
    axios.defaults.baseURL = 'https://virtserver.swaggerhub.com/andrewleykin/social/1.0.4/api/v1/'
}

// Add a 401 response interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (401 === error.response.status) {
      // handle error: inform user, go to login, etc
      localStorage.clear();
      store.dispatch("resetStore");
      window.location.href = '/';
    } else {
      return Promise.reject(error);
    }
  });

const token = localStorage.getItem('user-token')
if (token) axios.defaults.headers.common['Authorization'] = token

// axios.interceptors.response.use(null, error => {
//   // добавить проверку на законченный токен и сделать выход из приложения
//   // store.dispatch('auth/api/logout')
//   store.dispatch('global/alert/setAlert', {
//     status: 'error',
//     //Заменил  text: error.response.statusText
//     text: error
//   })
//   console.error(error)
//   return Promise.reject(error)
// })
