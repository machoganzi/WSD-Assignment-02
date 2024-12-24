import { createRouter, createWebHashHistory } from 'vue-router'
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
  // Hash 기반 라우팅 사용
  history: createWebHashHistory(),
  routes
})

// 로그인 체크 미들웨어
router.beforeEach((to, _from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const kakaoToken = localStorage.getItem('kakao_token');
  const tmdbKey = localStorage.getItem('TMDb-Key');

  // SignIn 페이지가 아니고, 인증되지 않은 경우 로그인 페이지로
  if (to.name !== 'SignIn' && (!isAuthenticated || (!kakaoToken && !tmdbKey))) {
    next({ name: 'SignIn' });
  } else {
    next();
  }
})

export default router
