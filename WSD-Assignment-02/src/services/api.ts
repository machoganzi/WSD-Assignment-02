import axios from 'axios'

// API 요청 인터셉터
axios.interceptors.request.use(
  (config) => {
    // 요청 전 처리
    return config
  },
  (error) => {
    // 요청 에러 처리
    return Promise.reject(error)
  }
)

// API 응답 인터셉터
axios.interceptors.response.use(
  (response) => {
    // 응답 데이터 처리
    return response
  },
  (error) => {
    // 에러 응답 처리
    if (error.response?.status === 401) {
      // 인증 에러 처리
      localStorage.removeItem('TMDb-Key')
      window.location.href = '/signin'
    }
    return Promise.reject(error)
  }
)