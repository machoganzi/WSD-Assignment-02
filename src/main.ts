import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'


const kakaoKey = import.meta.env.VITE_KAKAO_API_KEY
if (kakaoKey && (window as any).Kakao) {
  (window as any).Kakao.init(kakaoKey)
  console.log('Kakao SDK init 완료:', kakaoKey)
} else {
  console.warn('Kakao SDK 또는 KAKAO_API_KEY가 설정되지 않았습니다.')
}

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')