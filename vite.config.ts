import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  // 환경변수 로드
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    base: '/WSD-Assignment-02/',
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    define: {
      // 환경변수를 전역적으로 정의
      'import.meta.env.VITE_KAKAO_API_KEY': JSON.stringify(env.VITE_KAKAO_API_KEY)
    }
  }
})