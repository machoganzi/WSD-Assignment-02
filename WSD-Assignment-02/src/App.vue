<template>
  <div :class="['app', { 'dark-mode': themeStore.isDarkMode }]">
    <Header v-if="!isSignInPage" />
    <main :class="{ 'no-margin': isSignInPage }">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <Footer v-if="!isSignInPage" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useThemeStore } from '@/stores/themeStore';
import Header from './components/layout/Header.vue';
import Footer from './components/layout/Footer.vue';

const route = useRoute();
const themeStore = useThemeStore();
const isSignInPage = computed(() => route.path === '/signin');
</script>

<style>
:root {
  /* Core Colors */
  --background-light: #ffffff;
  --background-dark: #141414;
  --text-light: #333333;
  --text-dark: #ffffff;
  --primary-color: #e50914;
  --primary-hover: #ff0f1a;
  --secondary-color: #ff4b2b;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
    'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.5;
  background-color: var(--background-dark); /* 기본 배경색을 어둡게 설정 */
  color: var(--text-light);
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: var(--background-dark);
  color: var(--text-dark);
  transition: background-color 0.3s ease, color 0.3s ease;
}

main {
  flex-grow: 1;
  margin-top: 70px;
  transition: margin-top 0.3s ease;
  width: 100%;
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
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Scrollbar Styles */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary-hover);
}

/* Selection Style */
::selection {
  background: var(--primary-color);
  color: white;
}

/* Focus Styles */
:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

:focus:not(:focus-visible) {
  outline: none;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Mobile Optimization */
@media (max-width: 768px) {
  main {
    margin-top: 60px;
  }
  
  ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
}
</style>