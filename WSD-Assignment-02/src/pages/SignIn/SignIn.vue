<template>
    <div class="signin-container">
      <div class="form-container" :class="{ 'show-signup': isSignUp }">
        <!-- 로그인 폼 -->
        <div class="form signin" :class="{ 'form-hidden': isSignUp }">
          <h2>로그인</h2>
          <form @submit.prevent="handleSignIn">
            <div class="input-group">
              <input 
                type="email" 
                v-model="signInForm.email" 
                required
                placeholder="이메일"
              >
            </div>
            <div class="input-group">
              <input 
                type="password" 
                v-model="signInForm.password" 
                required
                placeholder="API Key"
              >
            </div>
            <div class="remember-me">
              <input 
                type="checkbox" 
                id="remember" 
                v-model="signInForm.remember"
              >
              <label for="remember">로그인 상태 유지</label>
            </div>
            <button type="submit" class="submit-btn">로그인</button>
          </form>
          <p class="switch-text">
            계정이 없으신가요? 
            <a href="#" @click.prevent="toggleForm">회원가입</a>
          </p>
        </div>
  
        <!-- 회원가입 폼 -->
        <div class="form signup" :class="{ 'form-hidden': !isSignUp }">
          <h2>회원가입</h2>
          <form @submit.prevent="handleSignUp">
            <div class="input-group">
              <input 
                type="email" 
                v-model="signUpForm.email" 
                required
                placeholder="이메일"
              >
            </div>
            <div class="input-group">
              <input 
                type="password" 
                v-model="signUpForm.password" 
                required
                placeholder="API Key"
              >
            </div>
            <div class="input-group">
              <input 
                type="password" 
                v-model="signUpForm.confirmPassword" 
                required
                placeholder="API Key 확인"
              >
            </div>
            <div class="terms">
              <input 
                type="checkbox" 
                id="terms" 
                v-model="signUpForm.terms"
                required
              >
              <label for="terms">이용약관에 동의합니다</label>
            </div>
            <button type="submit" class="submit-btn">회원가입</button>
          </form>
          <p class="switch-text">
            이미 계정이 있으신가요? 
            <a href="#" @click.prevent="toggleForm">로그인</a>
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive } from 'vue'
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  const isSignUp = ref(false)
  
  const signInForm = reactive({
    email: '',
    password: '',
    remember: false
  })
  
  const signUpForm = reactive({
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  })
  
  const toggleForm = () => {
    isSignUp.value = !isSignUp.value
  }
  
  const handleSignIn = async () => {
    try {
      // API 키를 localStorage에 저장
      localStorage.setItem('TMDb-Key', signInForm.password)
      localStorage.setItem('userId', signInForm.email)
      
      if (signInForm.remember) {
        localStorage.setItem('remember', 'true')
      }
      
      router.push('/')
    } catch (error) {
      alert('로그인에 실패했습니다.')
    }
  }
  
  const handleSignUp = async () => {
    if (signUpForm.password !== signUpForm.confirmPassword) {
      alert('API Key가 일치하지 않습니다.')
      return
    }
    
    try {
      localStorage.setItem('TMDb-Key', signUpForm.password)
      localStorage.setItem('userId', signUpForm.email)
      router.push('/')
    } catch (error) {
      alert('회원가입에 실패했습니다.')
    }
  }
  </script>
  
  <style scoped>
  .signin-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7));
    padding: 20px;
  }
  
  .form-container {
    background: #1a1a1a;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    width: 100%;
    max-width: 400px;
    position: relative;
    transition: transform 0.3s ease;
  }
  
  .form {
    padding: 40px;
    transition: all 0.3s ease;
  }
  
  .form-hidden {
    display: none;
  }
  
  h2 {
    color: #fff;
    text-align: center;
    margin-bottom: 30px;
    font-size: 1.8em;
  }
  
  .input-group {
    margin-bottom: 20px;
  }
  
  input[type="email"],
  input[type="password"] {
    width: 100%;
    padding: 12px;
    background: #333;
    border: none;
    border-radius: 5px;
    color: #fff;
    font-size: 1em;
  }
  
  input[type="email"]::placeholder,
  input[type="password"]::placeholder {
    color: #888;
  }
  
  .remember-me,
  .terms {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    color: #888;
  }
  
  .submit-btn {
    width: 100%;
    padding: 12px;
    background: #e50914;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 1em;
    cursor: pointer;
    transition: background 0.3s ease;
  }
  
  .submit-btn:hover {
    background: #f40612;
  }
  
  .switch-text {
    text-align: center;
    margin-top: 20px;
    color: #888;
  }
  
  .switch-text a {
    color: #e50914;
    text-decoration: none;
  }
  
  .switch-text a:hover {
    text-decoration: underline;
  }
  </style>