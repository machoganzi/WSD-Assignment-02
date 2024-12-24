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
// router/index.ts
router.beforeEach((to, from, next) => {
  // 카카오 로그인 성공 시 localStorage에 저장했던 토큰
  const kakaoToken = localStorage.getItem('kakao_token')

  // 로그인 페이지(SingIn)로 가려는 게 아니라면 && 토큰이 없다면 → SignIn으로
  if (to.name !== 'SignIn' && !kakaoToken) {
    next({ name: 'SignIn' })
  } else {
    next()
  }
})


export default router