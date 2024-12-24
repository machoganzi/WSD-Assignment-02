import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

// 카카오 SDK 초기화 코드
const kakaoKey = import.meta.env.VITE_KAKAO_API_KEY
console.log('Kakao Key:', kakaoKey) // API KEY 값 확인용

// SDK 초기화 시도
if (window.Kakao && !window.Kakao.isInitialized()) {
  try {
    window.Kakao.init(kakaoKey)
    console.log('Kakao SDK 초기화 성공')
  } catch (error) {
    console.error('Kakao SDK 초기화 실패:', error)
  }
} else {
  console.warn('Kakao SDK가 로드되지 않았거나 이미 초기화되었습니다.')
}

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')