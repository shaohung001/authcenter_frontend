import Vue from 'vue'
import { Message } from 'element-ui'
import { USER_INFO, RBAC_INFO } from '@/store/mutation-types'
import Router from 'vue-router'
import Store from '@/store'
Vue.use(Router)

import { otherRoutes } from "./otherRoutes"
import { authRoutes } from "./authRoutes"
import { adminRoutes } from "./adminRoutes"
const indexRoutes = [
  {
    path: '/',
    redirect: {
      name: 'home'
    }
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/pages/user/home.vue'),
    meta: {
      access: 'user',
      title: '首页'
    }
  },
]

const routes = [
  ...adminRoutes,
  ...authRoutes,
  ...indexRoutes,
  ...otherRoutes
]

const router = new Router({
  mode: 'history',
  routes
  // strict: process.env.NODE_ENV !== 'production'
})
router.beforeEach((to, from, next) => {
  (async () => {
    try {
      let { meta } = to
      let isCheck = Store.getters['user/isCheck']
      if (!isCheck) {
        await Store.dispatch(`user/${USER_INFO}`).catch(() => { })
        await Store.dispatch(`user/${RBAC_INFO}`).catch(() => { })
      }
      let isLoggedIn = Store.getters['user/isLoggedIn']
      if (to.name === 'login') {
        if (isLoggedIn) return next({ name: 'home' })
      } else if (meta.access && !Store.getters['user/authorize'](meta.access)) {
        if (!isLoggedIn) {
          // if (to.name === "authorize") return next()
          return next({ name: 'login', query: { redirect: to.fullPath } })
        } else {
          Message('没有权限访问此页面')
          return
        }
      }
      document.title = meta.title
      next()
    } catch (error) {
      console.log(error)
      next()
    }
  })()
})

export default router
