<template>
  <div class="app">
    <!-- 로그인 페이지가 아닐 때만 Header와 Footer 표시 -->
    <Header v-if="!isSignInPage" />
    <main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <Footer v-if="!isSignInPage" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from './components/layout/Header.vue'
import Footer from './components/layout/Footer.vue'

// 현재 라우트가 로그인 페이지인지 확인
const route = useRoute()
const isSignInPage = computed(() => route.path === '/signin')
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background: #141414;
  color: white;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  /* 로그인 페이지일 때는 마진 제거 */
  margin-top: v-bind(isSignInPage ? '0' : '70px');
  flex-grow: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>