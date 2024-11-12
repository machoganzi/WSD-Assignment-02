<template>
  <div class="signin-container">
    <div class="wrapper" :class="{ active: isSignUpMode }">
      <div class="bg-animate"></div>
      <div class="bg-animate2"></div>

      <!-- 로그인 폼 -->
      <div class="form-box login">
        <h2 class="animation" style="--data:0;">Login</h2>
        <form @submit.prevent="handleSignIn">
          <div class="input-box animation" style="--data:1;">
            <input type="text" v-model="loginForm.username" required placeholder=" ">
            <label>Username</label>
            <i class="fas fa-user"></i>
          </div>
          <div class="input-box animation" style="--data:2;">
            <input type="password" v-model="loginForm.password" required placeholder=" ">
            <label>Password</label>
            <i class="fas fa-lock"></i>
          </div>
          <button type="submit" class="btn animation" style="--data:3;">Login</button>
          <div class="reg-link animation" style="--data:4;">
            <p>Don't have an account? <a href="#" @click.prevent="toggleMode">Sign Up</a></p>
          </div>
        </form>
      </div>

      <!-- 회원가입 폼 -->
      <div class="form-box signup">
        <h2 class="animation">Sign Up</h2>
        <form @submit.prevent="handleSignUp">
          <div class="input-box animation" style="--data:17;">
            <input type="text" v-model="signupForm.username" required placeholder=" ">
            <label>Username</label>
            <i class="fas fa-user"></i>
          </div>
          <div class="input-box animation" style="--data:18;">
            <input type="email" v-model="signupForm.email" required placeholder=" ">
            <label>Email</label>
            <i class="fas fa-envelope"></i>
          </div>
          <div class="input-box animation" style="--data:19;">
            <input type="password" v-model="signupForm.password" required placeholder=" ">
            <label>Password</label>
            <i class="fas fa-lock"></i>
          </div>
          <button type="submit" class="btn animation" style="--data:20;">Sign Up</button>
          <div class="reg-link animation" style="--data:21;">
            <p>Already have an account? <a href="#" @click.prevent="toggleMode">Login</a></p>
          </div>
        </form>
      </div>

      <!-- 로그인 정보 텍스트 -->
      <div class="info-text login">
        <h2 class="animation" style="--data:0;">Welcome Back!</h2>
        <p class="animation" style="--data:1;">Continue your journey with us</p>
      </div>

      <!-- 회원가입 정보 텍스트 -->
      <div class="info-text signup">
        <h2 class="animation" style="--data:22;">Hello, Friend!</h2>
        <p class="animation" style="--data:23;">Join us for an amazing experience</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isSignUpMode = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const signupForm = reactive({
  username: '',
  email: '',
  password: ''
})

const toggleMode = () => {
  isSignUpMode.value = !isSignUpMode.value
}

const handleSignIn = () => {
  // 실제 로그인 로직 구현
  localStorage.setItem('userId', loginForm.username)
  localStorage.setItem('isAuthenticated', 'true')
  router.push('/')
}

const handleSignUp = () => {
  // 실제 회원가입 로직 구현
  localStorage.setItem('userId', signupForm.username)
  localStorage.setItem('isAuthenticated', 'true')
  router.push('/')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.signin-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  position: relative;
}

.wrapper {
  position: relative;
  width: 750px;
  height: 450px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 0 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.wrapper .form-box {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.wrapper .form-box.login {
  left: 0;
  padding: 0 60px 0 40px;
}

.wrapper .form-box.signup {
  right: 0;
  padding: 0 40px 0 60px;
}

.form-box h2 {
  font-size: 32px;
  color: #000;
  text-align: center;
}

.form-box .input-box {
  position: relative;
  width: 100%;
  height: 45px;
  margin: 25px 0;
}

.input-box input {
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  border-bottom: 2px solid #000;
  padding: 0 25px 0 5px;
}

.input-box label {
  position: absolute;
  top: 50%;
  left: 5px;
  transform: translateY(-50%);
  color: #555;
  pointer-events: none;
  transition: 0.5s;
}

.input-box input:focus ~ label,
.input-box input:not(:placeholder-shown) ~ label {
  top: -5px;
  color: #000;
}

.input-box i {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  color: #555;
  font-size: 18px;
}

.btn {
  position: relative;
  width: 100%;
  height: 45px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: 0.3s;
}

.btn:hover {
  background: #333;
}

.reg-link {
  font-size: 14.5px;
  color: #555;
  text-align: center;
  margin: 20px 0 10px;
}

.reg-link a {
  color: #000;
  text-decoration: none;
  font-weight: 600;
}

.reg-link a:hover {
  text-decoration: underline;
}

.info-text {
  position: absolute;
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #fff;
  text-align: center;
  padding: 0 40px;
  background: #000;
  transition: 0.7s ease-in-out;
}

.info-text.login {
  right: 0;
}

.info-text.signup {
  left: 0;
  opacity: 0;
  transform: translateX(-100%);
}

.info-text h2 {
  font-size: 36px;
  line-height: 1.4;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.info-text p {
  font-size: 16px;
  opacity: 0.8;
}

/* 애니메이션 클래스 */
.animation {
  transition: 0.7s ease;
  transition-delay: calc(0.1s * var(--data));
}

.wrapper.active .form-box.login .animation {
  transform: translateX(-120%);
  opacity: 0;
}

.wrapper.active .form-box.signup .animation {
  transform: translateX(0);
  opacity: 1;
}

.wrapper:not(.active) .form-box.signup .animation {
  transform: translateX(120%);
  opacity: 0;
}

.wrapper.active .info-text.login {
  transform: translateX(100%);
  opacity: 0;
}

.wrapper.active .info-text.signup {
  transform: translateX(0);
  opacity: 1;
}

.bg-animate {
  position: absolute;
  top: -4px;
  right: 0;
  width: 850px;
  height: 600px;
  background: #000;
  transform: rotate(10deg) skewY(40deg);
  transform-origin: bottom right;
  transition: 1.5s ease;
}

.wrapper.active .bg-animate {
  transform: rotate(0deg) skewY(0deg);
  transition-delay: 0.5s;
}

.bg-animate2 {
  position: absolute;
  top: 100%;
  left: 250px;
  width: 850px;
  height: 700px;
  background: #fff;
  transform: rotate(0deg) skewY(0deg);
  transform-origin: bottom left;
  transition: 1.5s ease;
}

.wrapper.active .bg-animate2 {
  transform: rotate(-11deg) skewY(-41deg);
  transition-delay: 1.2s;
}

@media (max-width: 768px) {
  .wrapper {
    width: 100%;
    height: 100vh;
    border-radius: 0;
  }

  .wrapper .form-box {
    width: 100%;
    padding: 0 20px;
  }

  .info-text {
    display: none;
  }

  .bg-animate,
  .bg-animate2 {
    display: none;
  }
}
</style>