import axios from 'axios'
import Cookies from 'js-cookie'
import { Message } from 'element-ui'
import Store from '@/store'
import { USER_SIGNOUT } from '@/store/mutation-types'
import router from '../router'

// development 本地转发
if (process.env.NODE_ENV === 'development') {
  axios.defaults.baseURL = '/api'
} else {
  axios.defaults.timeout = 5000
}

axios.defaults.headers['X-XSRF-TOKEN'] = Cookies['XSRF-TOKEN']
// http request 拦截器
axios.interceptors.request.use(
  config => {
    return config
  },
  error => {
    Message.error({ message: error.response.data || '加载失败' })
    return Promise.reject(error.response.data)
  })

// http response 拦截器
axios.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
        case 403:
          if (error.response.data === 'Login Required') {
            Store.commit('user/' + USER_SIGNOUT)
            const _router = router as any
            if (_router.history.current.path !== '/') router.push({ name: 'login' })
          }
      }
    }
    let isCheck = Store.getters['user/isCheck']
    if (isCheck) {
      Message.error({ message: (error.response && error.response.data) || '请求失败' })
    }
    return Promise.reject(error)
  })

export default axios
