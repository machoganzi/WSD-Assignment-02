<template>
  <div :class="['app', { 'dark-mode': themeStore.isDarkMode }]">
    <!-- 로그인 페이지가 아닐 때만 헤더/푸터 표시 -->
    <Header v-if="!isSignInPage" />
    <main :class="{ 'no-margin': isSignInPage }">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from './stores/themeStore'
import Header from './components/layout/Header.vue'


const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()

// 현재 경로가 /signin 인지 여부
const isSignInPage = computed(() => route.path === '/signin')

onMounted(() => {
  // 1) 테마 초기화
  themeStore.initTheme()

  // 2) 카카오 로그인 토큰 체크
  const token = localStorage.getItem('kakao_token')

  // 예시) 로그인 토큰이 없는데 현재 페이지가 '/signin'이 아니라면 /signin 으로 이동
  if (!token && route.path !== '/signin') {
    router.push('/signin')
  }

  // 반대로, 로그인 토큰이 있는데도 불구하고 굳이 '/signin' 페이지에 온다면
  // 이미 로그인 된 상태이므로 '/'로 보낼 수도 있음
  // if (token && route.path === '/signin') {
  //   router.push('/')
  // }
})
</script>

<style>
:root {
  /* Theme Colors */
  --background-light: #ffffff;
  --background-dark: #141414;
  --surface-light: #f8f9fa;
  --surface-dark: #1a1a1a;
  --text-light: #333333;
  --text-dark: #ffffff;
  --background-dark-rgb: 20, 20, 20;
  
  /* Brand Colors */
  --primary-color: #e50914;
  --primary-hover: #ff0f1a;
  --secondary-color: #ff4b2b;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Layout */
  --header-height: 70px;
  --header-height-mobile: 60px;
  --border-radius: 8px;
}

/* Reset & Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html {
  font-size: 16px;
  text-size-adjust: 100%;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
    'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.5;
  overflow-x: hidden;
  min-height: 100vh;
  background-color: var(--background-light);
  color: var(--text-light);
  transition: background-color 0.3s ease, color 0.3s ease;
}

body.dark-mode {
  background-color: var(--background-dark);
  color: var(--text-dark);
}

/* App Layout */
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: var(--background-light);
  color: var(--text-light);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.app.dark-mode {
  background-color: var(--background-dark);
  color: var(--text-dark);
}

/* Main Content */
main {
  flex: 1;
  margin-top: var(--header-height);
  width: 100%;
  transition: margin-top 0.3s ease;
  position: relative;
  z-index: 1;
}

main.no-margin {
  margin-top: 0;
}

/* Page Transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(var(--spacing-lg));
}

.page-leave-to {
  opacity: 0;
  transform: translateY(calc(-1 * var(--spacing-lg)));
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius);
}

::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: var(--border-radius);
  transition: background 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary-hover);
}

/* Selection */
::selection {
  background: var(--primary-color);
  color: var(--text-dark);
}

/* Focus Styles */
:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* Media Queries */
@media (max-width: 768px) {
  :root {
    --header-height: var(--header-height-mobile);
  }
  
  html {
    font-size: 14px;
  }
  
  ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    background-attachment: initial !important;
    scroll-behavior: auto !important;
    transition-duration: 0s !important;
  }
}
</style>