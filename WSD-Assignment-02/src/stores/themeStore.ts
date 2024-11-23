// src/stores/themeStore.ts
import { defineStore } from 'pinia';

interface ThemeState {
  isDarkMode: boolean;
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    isDarkMode: localStorage.getItem('darkMode') === 'true'
  }),

  actions: {
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem('darkMode', String(this.isDarkMode));
      
      // HTML 요소에 dark-mode 클래스 추가/제거
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
      }
    },

    initTheme() {
      // 초기 상태 설정
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
      }
    }
  }
});