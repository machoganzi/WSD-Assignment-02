import { defineStore } from 'pinia';
import { useRouter } from 'vue-router';
interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
}

const router = useRouter()
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
      localStorage.removeItem('kakao_token');
      this.isAuthenticated = false;
      this.userId = null;
      router.push('/')
      window.location.reload();
    }
  }
});