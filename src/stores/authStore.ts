import { defineStore } from 'pinia';

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
    userId: localStorage.getItem('userId')
  }),

  actions: {
    logout() {
      localStorage.removeItem('TMDb-Key');
      localStorage.removeItem('userId');
      localStorage.removeItem('isAuthenticated');
      this.isAuthenticated = false;
      this.userId = null;
      window.location.href = '/WSD-Assignment-02/'
    }
  }
});