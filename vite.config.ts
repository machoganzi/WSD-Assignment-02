import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
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
      'import.meta.env': JSON.stringify({
        ...env,
        VITE_KAKAO_API_KEY: env.VITE_KAKAO_API_KEY,
        VITE_TMDB_API_KEY: env.VITE_TMDB_API_KEY,
        VITE_TMDB_BASE_URL: env.VITE_TMDB_BASE_URL,
        VITE_TMDB_IMAGE_BASE_URL: env.VITE_TMDB_IMAGE_BASE_URL,
        MODE: mode
      })
    }
  }
})