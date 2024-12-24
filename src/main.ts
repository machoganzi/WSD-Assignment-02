import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

// Kakao SDK 초기화 함수
function initKakao() {
  const kakaoKey = import.meta.env.VITE_KAKAO_API_KEY
  if (!kakaoKey) {
    console.warn('KAKAO_API_KEY가 설정되지 않았습니다.')
    return
  }

  // Kakao SDK 로드 확인 및 초기화
  if (window.Kakao && !window.Kakao.isInitialized()) {
    window.Kakao.init(kakaoKey)
    console.log('Kakao SDK init 완료')
  }
}

// DOM이 로드된 후 Kakao SDK 초기화
window.addEventListener('load', initKakao)

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')