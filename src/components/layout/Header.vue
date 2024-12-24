<template>
  <header :class="['header', { 'dark-mode': themeStore.isDarkMode }]">
    <div class="header-content">
      <!-- Logo Section -->
      <router-link to="/" class="logo" @click="themeStore.closeMenu">
        <div class="logo-animation">
          <span class="movie-app">MovieVerse</span>
        </div>
      </router-link>

      <!-- Navigation Links -->
      <nav 
        class="nav-links" 
        :class="{ 'mobile-nav': themeStore.isMenuOpen }"
      >
        <router-link 
          v-for="link in navLinks" 
          :key="link.path" 
          :to="link.path" 
          class="nav-link"
          @click="themeStore.closeMenu"
        >
          <i :class="link.icon"></i>
          <span>{{ link.text }}</span>
          <span class="nav-link-bg"></span>
        </router-link>
      </nav>

      <!-- Right Section -->
      <div class="right-section">
        <!-- User Menu -->
        <div v-if="authStore.isAuthenticated" class="user-menu">
          <div 
            class="user-icon" 
            @click.stop="toggleUserMenu" 
            :class="{ 'active': showUserMenu }"
          >
            <div class="avatar">
              <i class="fas fa-user"></i>
            </div>
          </div>
          
          <transition 
            name="dropdown"
            @before-enter="onBeforeEnter"
            @after-enter="onAfterEnter"
            @before-leave="onBeforeLeave"
            @after-leave="onAfterLeave"
          >
            <div v-if="showUserMenu" class="dropdown-menu">
              <div class="menu-item user-info">
                <i class="fas fa-user-circle"></i>
                <span>{{ authStore.userId }}</span>
              </div>
              <div class="menu-divider"></div>
              <router-link to="/profile" class="menu-item" @click="closeUserMenu">
                <i class="fas fa-cog"></i>
                <span>프로필 설정</span>
              </router-link>
              <button class="menu-item" @click="handleLogout">
                <i class="fas fa-sign-out-alt"></i>
                <span>로그아웃</span>
              </button>
            </div>
          </transition>
        </div>

        <!-- Login Button -->
        <router-link 
          v-else 
          to="/signin" 
          class="login-btn"
        >
          로그인
        </router-link>

        <!-- Dark Mode Toggle -->
        <button 
          class="theme-toggle" 
          @click="themeStore.toggleDarkMode" 
          aria-label="테마 변경"
        >
          <i :class="themeStore.isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
        </button>

        <!-- Mobile Menu Toggle -->
        <button 
          class="mobile-menu-toggle" 
          @click="themeStore.toggleMenu" 
          aria-label="메뉴"
        >
          <span :class="['hamburger', { 'active': themeStore.isMenuOpen }]"></span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';

const themeStore = useThemeStore();
const authStore = useAuthStore();

const showUserMenu = ref(false);

const navLinks = [
  { path: '/', text: '홈', icon: 'fas fa-home' },
  { path: '/popular', text: '대세 콘텐츠', icon: 'fas fa-fire' },
  { path: '/search', text: '찾아보기', icon: 'fas fa-search' },
  { path: '/wishlist', text: '찜한 목록', icon: 'fas fa-heart' }
];

// User Menu Functions
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const closeUserMenu = () => {
  showUserMenu.value = false;
};

const handleLogout = () => {
  closeUserMenu();
  authStore.logout();
};

// Animation Hooks
const onBeforeEnter = (el: Element) => {
  (el as HTMLElement).style.opacity = '0';
  (el as HTMLElement).style.transform = 'translateY(-10px)';
};

const onAfterEnter = (el: Element) => {
  (el as HTMLElement).style.opacity = '1';
  (el as HTMLElement).style.transform = 'translateY(0)';
};

const onBeforeLeave = (el: Element) => {
  (el as HTMLElement).style.opacity = '0';
  (el as HTMLElement).style.transform = 'translateY(-10px)';
};

const onAfterLeave = (el: Element) => {
  (el as HTMLElement).style.opacity = '';
  (el as HTMLElement).style.transform = '';
};

// Click Outside Handler
const handleClickOutside = (event: MouseEvent) => {
  const userMenu = document.querySelector('.user-menu');
  if (userMenu && !userMenu.contains(event.target as Node)) {
    showUserMenu.value = false;
  }
};

// Screen Rotation Handler
const handleOrientation = () => {
  if (window.innerWidth > 768) {
    themeStore.closeMenu();
  }
};

// Lifecycle Hooks
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('resize', handleOrientation);
  window.addEventListener('orientationchange', handleOrientation);
  themeStore.initTheme();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', handleOrientation);
  window.removeEventListener('orientationchange', handleOrientation);
});
</script>

<style scoped>
/* Base Styles */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
}

.dark-mode .header {
  background: rgba(18, 18, 18, 0.98);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo Styles */
.logo {
  text-decoration: none;
  overflow: hidden;
  position: relative;
  z-index: 2;
}

.logo-animation {
  transform-origin: left center;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo:hover .logo-animation {
  transform: scale(1.05);
}

.movie-app {
  background: linear-gradient(45deg, #e50914, #ff4b2b);
  -webkit-background-clip: text;
  color: transparent;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

/* Navigation Styles */
.nav-links {
  display: flex;
  gap: 2rem;
  margin-left: 2rem;
  margin-right: auto;
  position: relative;
  z-index: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #333;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  opacity: 0.7;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.dark-mode .nav-link {
  color: #fff;
}

.nav-link-bg {
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(45deg, #e50914, #ff4b2b);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-link:hover .nav-link-bg,
.router-link-active .nav-link-bg {
  width: 100%;
}

.nav-link:hover,
.nav-link.router-link-active {
  opacity: 1;
  transform: translateY(-1px);
}

.nav-link i {
  font-size: 1rem;
}

/* Right Section Styles */
.right-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Theme Toggle */
.theme-toggle {
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.dark-mode .theme-toggle {
  color: #fff;
}

.theme-toggle:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}

.dark-mode .theme-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}

.theme-toggle i {
  font-size: 1.2rem;
}

/* User Menu Styles */
.user-menu {
  position: relative;
  z-index: 2;
}

.user-icon {
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-icon:hover {
  transform: scale(1.05);
}

.avatar {
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #e50914, #ff4b2b);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s ease;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: white;
  border-radius: 12px;
  min-width: 220px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.dark-mode .dropdown-menu {
  background: #1f1f1f;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  color: #333;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.9rem;
  text-decoration: none;
}

.dark-mode .menu-item {
  color: #fff;
}

.menu-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.dark-mode .menu-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.user-info {
  opacity: 0.7;
  cursor: default;
}

.menu-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
  margin: 4px 0;
}

.dark-mode .menu-divider {
  background: rgba(255, 255, 255, 0.1);
}

/* Login Button */
.login-btn {
  color: white;
  text-decoration: none;
  padding: 8px 20px;
  border-radius: 8px;
  background: linear-gradient(45deg, #e50914, #ff4b2b);
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(229, 9, 20, 0.3);
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  z-index: 2;
}

.hamburger {
  display: block;
  width: 24px;
  height: 2px;
  background: #333;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dark-mode .hamburger {
  background: #fff;
}

.hamburger::before,
.hamburger::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 2px;
  background: #333;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dark-mode .hamburger::before,
.dark-mode .hamburger::after {
  background: #fff;
}

.hamburger::before {
  top: -6px;
}

.hamburger::after {
  bottom: -6px;
}

.hamburger.active {
  background: transparent;
}

.hamburger.active::before {
  transform: rotate(45deg);
  top: 0;
}

.hamburger.active::after {
  transform: rotate(-45deg);
  bottom: 0;
}

/* Transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Media Queries */
@media (max-width: 768px) {
  .nav-links {
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    background: white;
    flex-direction: column;
    gap: 0;
    margin: 0;
    padding: 1rem 0;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

 .dark-mode .nav-links {
   background: #1f1f1f;
 }

 .nav-links.mobile-nav {
   transform: translateY(0);
   opacity: 1;
   visibility: visible;
   box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
 }

 .nav-link {
   padding: 1rem 2rem;
   width: 100%;
 }

 .nav-link-bg {
   display: none;
 }

 .mobile-menu-toggle {
   display: block;
 }
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
</style>