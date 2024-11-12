<template>
  <header class="header">
    <div class="header-content">
      <router-link to="/" class="logo">
        <span class="movie-app">Movie App</span>
      </router-link>
      <nav class="nav-links">
        <router-link to="/" class="nav-link">홈</router-link>
        <router-link to="/popular" class="nav-link">대세 콘텐츠</router-link>
        <router-link to="/search" class="nav-link">찾아보기</router-link>
        <router-link to="/wishlist" class="nav-link">찜한 목록</router-link>
      </nav>
      <!-- 사용자 메뉴 -->
      <div class="user-menu" v-if="isAuthenticated">
        <div class="user-icon" @click="toggleUserMenu">
          <i class="fas fa-user"></i>
        </div>
        <!-- 드롭다운 메뉴 -->
        <div class="dropdown-menu" v-if="showUserMenu">
          <div class="menu-item user-info">
            <i class="fas fa-user"></i>
            <span>{{ userId }}</span>
          </div>
          <div class="menu-divider"></div>
          <button class="menu-item" @click="handleLogout">
            <i class="fas fa-sign-out-alt"></i>
            <span>로그아웃</span>
          </button>
        </div>
      </div>
      <router-link v-else to="/signin" class="login-btn">로그인</router-link>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const showUserMenu = ref(false);
const isAuthenticated = computed(() => localStorage.getItem('isAuthenticated') === 'true');
const userId = computed(() => localStorage.getItem('userId'));

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const handleLogout = () => {
  localStorage.removeItem('TMDb-Key');
  localStorage.removeItem('userId');
  localStorage.removeItem('isAuthenticated');
  showUserMenu.value = false;
  router.push('/signin');
};

// 외부 클릭 시 메뉴 닫기
const handleClickOutside = (event: MouseEvent) => {
  const userMenu = document.querySelector('.user-menu');
  if (userMenu && !userMenu.contains(event.target as Node)) {
    showUserMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: rgba(20, 20, 20, 0.9);
  z-index: 1000;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
}

.logo {
  text-decoration: none;
}

.movie-app {
  color: #e50914;
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 2rem;
  margin-left: 2rem;
  margin-right: auto;
}

.nav-link {
  color: #fff;
  text-decoration: none;
  font-size: 0.9rem;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  opacity: 1;
}

/* 사용자 메뉴 스타일 */
.user-menu {
  position: relative;
  margin-left: 1rem;
}

.user-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.user-icon i {
  font-size: 1.5rem;
  color: #fff;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: #2a2a2a;
  border-radius: 4px;
  min-width: 200px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.3s;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.user-info {
  opacity: 0.7;
  cursor: default;
}

.user-info:hover {
  background: none;
}

.menu-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 4px 0;
}

.login-btn {
  color: #fff;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  background: #e50914;
  transition: background-color 0.3s;
}

.login-btn:hover {
  background: #f40612;
}

@media (max-width: 768px) {
  .nav-links {
    gap: 1rem;
  }

  .nav-link {
    font-size: 0.8rem;
  }

  .movie-app {
    font-size: 1.2rem;
  }
}
</style>