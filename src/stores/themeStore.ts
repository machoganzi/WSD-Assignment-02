// src/stores/themeStore.ts
import { defineStore } from 'pinia';

interface ThemeState {
  isDarkMode: boolean;
  isMenuOpen: boolean;
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    isDarkMode: localStorage.getItem('darkMode') === 'true',
    isMenuOpen: false
  }),

  actions: {
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem('darkMode', String(this.isDarkMode));
      
      // HTML 요소와 body에 dark-mode 클래스 추가/제거
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark-mode');
        document.body.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
        document.body.classList.remove('dark-mode');
      }
    },

    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },

    closeMenu() {
      this.isMenuOpen = false;
    },

    initTheme() {
      // 초기 상태 설정
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark-mode');
        document.body.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
        document.body.classList.remove('dark-mode');
      }

      // 시스템 다크모드 변경 감지
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        const shouldBeDark = e.matches;
        if (shouldBeDark !== this.isDarkMode) {
          this.toggleDarkMode();
        }
      });
    }
  }
});