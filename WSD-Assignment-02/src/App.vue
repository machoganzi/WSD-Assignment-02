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
  /* Theme Colors */
  --background-light: #ffffff;
  --background-dark: #141414;
  --surface-light: #f8f9fa;
  --surface-dark: #1a1a1a;
  --text-light: #333333;
  --text-dark: #ffffff;
  
  /* Brand Colors */
  --primary-color: #e50914;
  --primary-hover: #ff0f1a;
  --secondary-color: #ff4b2b;
  
  /* UI Colors */
  --success-color: #2ecc71;
  --warning-color: #f1c40f;
  --error-color: #e74c3c;
  --info-color: #3498db;
  
  /* Animation Timing */
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
  --transition-slow: 500ms ease;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Layout */
  --header-height: 70px;
  --header-height-mobile: 60px;
  --max-width: 1200px;
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
  background-color: var(--background-dark);
  color: var(--text-dark);
  overflow-x: hidden;
  min-height: 100vh;
}

/* App Layout */
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: var(--background-dark);
  color: var(--text-dark);
  transition: background-color var(--transition-normal),
              color var(--transition-normal);
}

/* Main Content */
main {
  flex: 1;
  margin-top: var(--header-height);
  width: 100%;
  transition: margin-top var(--transition-normal);
  position: relative;
  z-index: 1;
}

main.no-margin {
  margin-top: 0;
}

/* Page Transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity var(--transition-normal),
              transform var(--transition-normal);
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
  transition: background var(--transition-fast);
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

/* Utility Classes */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

/* Responsive Design */
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
    animation-delay: -1ms !important;
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    background-attachment: initial !important;
    scroll-behavior: auto !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
  }
}

/* Print Styles */
@media print {
  .app {
    background: white;
  }

  main {
    margin: 0;
  }
}
</style>