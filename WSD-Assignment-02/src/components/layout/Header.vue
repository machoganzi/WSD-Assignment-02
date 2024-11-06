<template>
    <header class="header" :class="{ 'header--scrolled': isScrolled }">
      <nav class="nav">
        <router-link to="/" class="logo">Movie App</router-link>
        
        <div class="nav-links">
          <router-link to="/" class="nav-link">홈</router-link>
          <router-link to="/popular" class="nav-link">대세 콘텐츠</router-link>
          <router-link to="/search" class="nav-link">찾아보기</router-link>
          <router-link to="/wishlist" class="nav-link">찜한 목록</router-link>
        </div>
  
        <div class="auth">
          <template v-if="isAuthenticated">
            <span class="user-email">{{ userEmail }}</span>
            <button @click="handleLogout" class="logout-btn">로그아웃</button>
          </template>
        </div>
      </nav>
    </header>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  const isScrolled = ref(false)
  const isAuthenticated = ref(!!localStorage.getItem('TMDb-Key'))
  const userEmail = ref(localStorage.getItem('userId'))
  
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 50
  }
  
  const handleLogout = () => {
    localStorage.removeItem('TMDb-Key')
    localStorage.removeItem('userId')
    localStorage.removeItem('remember')
    isAuthenticated.value = false
    router.push('/signin')
  }
  
  onMounted(() => {
    window.addEventListener('scroll', handleScroll)
  })
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
  </script>
  
  <style scoped>
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 70px;
    background: rgba(20, 20, 20, 0.8);
    backdrop-filter: blur(10px);
    transition: background-color 0.3s;
    z-index: 1000;
  }
  
  .header--scrolled {
    background: rgba(20, 20, 20, 0.95);
  }
  
  .nav {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: #e50914;
    text-decoration: none;
    transition: color 0.3s;
  }
  
  .logo:hover {
    color: #f40612;
  }
  
  .nav-links {
    display: flex;
    gap: 2rem;
  }
  
  .nav-link {
    color: #fff;
    text-decoration: none;
    transition: color 0.3s;
    font-size: 1rem;
  }
  
  .nav-link:hover {
    color: #e50914;
  }
  
  .auth {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .user-email {
    color: #fff;
    font-size: 0.9rem;
  }
  
  .logout-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background: #e50914;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .logout-btn:hover {
    background: #f40612;
  }
  
  @media (max-width: 768px) {
    .nav-links {
      gap: 1rem;
    }
  
    .nav-link {
      font-size: 0.9rem;
    }
  
    .user-email {
      display: none;
    }
  }
  
  @media (max-width: 576px) {
    .nav-links {
      gap: 0.5rem;
    }
  
    .nav-link {
      font-size: 0.8rem;
    }
  
    .logo {
      font-size: 1.2rem;
    }
  }
  </style>