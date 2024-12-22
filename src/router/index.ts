import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/Home/Home.vue')
  },
  {
    path: '/popular',
    name: 'Popular',
    component: () => import('../pages/Popular/Popular.vue')
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../pages/Search/Search.vue')
  },
  {
    path: '/signin',
    name: 'SignIn',
    component: () => import('../pages/SignIn/SignIn.vue')
  },
  {
    path: '/wishlist',
    name: 'Wishlist',
    component: () => import('../pages/Wishlist/Wishlist.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 로그인 체크 미들웨어
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('TMDb-Key')
  if (to.name !== 'SignIn' && !isAuthenticated) {
    next({ name: 'SignIn' })
  } else {
    next()
  }
})

export default router