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
      localStorage.setItem('darkMode', this.isDarkMode.toString());
      document.documentElement.classList.toggle('dark-mode', this.isDarkMode);
    },

    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },

    closeMenu() {
      this.isMenuOpen = false;
    },

    initTheme() {
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark-mode');
      }
    }
  }
});