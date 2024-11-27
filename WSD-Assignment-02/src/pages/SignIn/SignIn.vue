<template>
  <div class="signin-container">
    <!-- Toast Notifications -->
    <div class="toast-container" v-show="toast.show">
      <div class="toast" :class="toast.type">
        <i :class="toast.icon"></i>
        {{ toast.message }}
      </div>
    </div>

    <div class="wrapper" :class="{ active: isSignUpMode }">
      <div class="bg-animate"></div>
      <div class="bg-animate2"></div>

      <!-- 로그인 폼 -->
      <div class="form-box login">
        <h2 class="animation" style="--data:0;">Login</h2>
        <form @submit.prevent="handleSignIn">
          <div class="input-box animation" style="--data:1;">
            <input 
              type="email" 
              v-model="loginForm.email" 
              :class="{ 'error-input': loginErrors.email }"
              required 
              placeholder=" "
            >
            <label>Email</label>
            <i class="fas fa-envelope"></i>
            <span class="error-message" v-if="loginErrors.email">{{ loginErrors.email }}</span>
          </div>
          <div class="input-box animation password-box" style="--data:2;">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              v-model="loginForm.password" 
              required 
              placeholder=" "
            >
            <label>API Key</label>
            <i class="fas fa-lock"></i>
            <i 
              :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
              class="toggle-password"
              @click="togglePassword"
            ></i>
          </div>
          <div class="options-box animation" style="--data:3;">
            <label class="remember-me">
              <input type="checkbox" v-model="loginForm.rememberMe">
              <span class="checkmark"></span>
              Remember me
            </label>
          </div>
          <button 
            type="submit" 
            class="btn animation" 
            :class="{ 'loading': isLoading }" 
            style="--data:4;"
          >
            <span v-if="!isLoading">Login</span>
            <i v-else class="fas fa-spinner fa-spin"></i>
          </button>
          <div class="reg-link animation" style="--data:5;">
            <p>Don't have an account? <a href="#" @click.prevent="toggleMode">Sign Up</a></p>
          </div>
        </form>
      </div>

      <!-- 회원가입 폼 -->
      <div class="form-box signup">
        <h2 class="animation" style="--data:16;">Sign Up</h2>
        <form @submit.prevent="handleSignUp">
          <div class="input-box animation" style="--data:17;">
            <input 
              type="email" 
              v-model="signupForm.email" 
              :class="{ 'error-input': signupErrors.email }"
              required 
              placeholder=" "
            >
            <label>Email</label>
            <i class="fas fa-envelope"></i>
            <span class="error-message" v-if="signupErrors.email">{{ signupErrors.email }}</span>
          </div>
          <div class="input-box animation password-box" style="--data:18;">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              v-model="signupForm.password" 
              required 
              placeholder=" "
            >
            <label>API Key</label>
            <i class="fas fa-lock"></i>
            <i 
              :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
              class="toggle-password"
              @click="togglePassword"
            ></i>
          </div>
          <div class="input-box animation password-box" style="--data:19;">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              v-model="signupForm.confirmPassword" 
              required 
              placeholder=" "
              :class="{ 'error-input': signupErrors.confirmPassword }"
            >
            <label>Confirm API Key</label>
            <i class="fas fa-lock"></i>
            <span class="error-message" v-if="signupErrors.confirmPassword">
              {{ signupErrors.confirmPassword }}
            </span>
          </div>
          <div class="terms-box animation" style="--data:20;">
            <label class="remember-me">
              <input type="checkbox" v-model="signupForm.terms">
              <span class="checkmark"></span>
              I agree to the <a href="#" @click.prevent="showTerms" class="terms-link">Terms & Conditions</a>
            </label>
          </div>
          <button 
            type="submit" 
            class="btn animation" 
            :class="{ 'loading': isLoading }" 
            :disabled="!signupForm.terms || isLoading"
            style="--data:21;"
          >
            <span v-if="!isLoading">Sign Up</span>
            <i v-else class="fas fa-spinner fa-spin"></i>
          </button>
          <div class="reg-link animation" style="--data:22;">
            <p>Already have an account? <a href="#" @click.prevent="toggleMode">Login</a></p>
          </div>
        </form>
      </div>

      <!-- 로그인 정보 텍스트 -->
      <div class="info-text login">
        <h2 class="animation" style="--data:0;">Welcome Back!</h2>
        <p class="animation" style="--data:1;">Enter your TMDB API key to continue</p>
      </div>

      <!-- 회원가입 정보 텍스트 -->
      <div class="info-text signup">
        <h2 class="animation" style="--data:22;">Hello, Friend!</h2>
        <p class="animation" style="--data:23;">Start your journey with your TMDB API key</p>
      </div>
    </div>

    <!-- Terms Modal -->
    <div v-if="showTermsModal" class="modal-overlay" @click.self="closeTerms">
      <div class="modal">
        <div class="modal-header">
          <h3>Terms & Conditions</h3>
          <button class="close-btn" @click="closeTerms">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-content">
          <p>By creating an account, you agree to:</p>
          <ul>
            <li>Provide your own valid TMDB API key</li>
            <li>Use the service responsibly</li>
            <li>Keep your API key secure</li>
            <li>Respect API rate limits</li>
          </ul>
        </div>
        <button @click="acceptTerms" class="btn modal-btn">
          Accept & Continue
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { tmdbApi } from '../../services/tmdb'

const router = useRouter()
const isSignUpMode = ref(false)
const showPassword = ref(false)
const isLoading = ref(false)
const showTermsModal = ref(false)

// Toast notification
const toast = reactive({
  show: false,
  message: '',
  type: 'success',
  icon: 'fas fa-check'
})

// Form data
const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const signupForm = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  terms: false
})

// Form errors
const loginErrors = reactive({
  email: ''
})

const signupErrors = reactive({
  email: '',
  confirmPassword: ''
})

// Email validation
const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Toast notification handler
const showToast = (message: string, type: 'success' | 'error') => {
  toast.message = message
  toast.type = type
  toast.icon = type === 'success' ? 'fas fa-check' : 'fas fa-times'
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 3000)
}

// Remember me logic
onMounted(() => {
  const savedEmail = localStorage.getItem('remembered-email')
  if (savedEmail) {
    loginForm.email = savedEmail
    loginForm.rememberMe = true
  }
})

// Handle form submission
const handleSignIn = async () => {
  try {
    loginErrors.email = ''
    
    // Validate email
    if (!validateEmail(loginForm.email)) {
      loginErrors.email = 'Please enter a valid email address'
      return
    }

    isLoading.value = true

    // Validate API key
    await tmdbApi.getPopularMovies(1, loginForm.password)
    
    // Handle remember me
    if (loginForm.rememberMe) {
      localStorage.setItem('remembered-email', loginForm.email)
    } else {
      localStorage.removeItem('remembered-email')
    }

    // Save auth state
    localStorage.setItem('TMDb-Key', loginForm.password)
    localStorage.setItem('userId', loginForm.email)
    localStorage.setItem('isAuthenticated', 'true')

    showToast('Successfully logged in!', 'success')
    setTimeout(() => router.push('/'), 500)
  } catch (error) {
    showToast('Invalid API key', 'error')
  } finally {
    isLoading.value = false
  }
}

const handleSignUp = async () => {
  try {
    signupErrors.email = ''
    signupErrors.confirmPassword = ''
    
    // Validate email
    if (!validateEmail(signupForm.email)) {
      signupErrors.email = 'Please enter a valid email address'
      return
    }

    // Validate password match
    if (signupForm.password !== signupForm.confirmPassword) {
      signupErrors.confirmPassword = 'API keys do not match'
      return
    }

    if (!signupForm.terms) {
      showToast('Please accept the terms and conditions', 'error')
      return
    }

    isLoading.value = true

    // Validate API key
    await tmdbApi.getPopularMovies(1, signupForm.password)
    
    // Save user data
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    users.push({
      email: signupForm.email,
      apiKey: signupForm.password
    })
    localStorage.setItem('users', JSON.stringify(users))

    showToast('Account created successfully!', 'success')
    
    // Auto login
    loginForm.email = signupForm.email
    loginForm.password = signupForm.password
    isSignUpMode.value = false
  } catch (error) {
    showToast('Invalid API key', 'error')
  } finally {
    isLoading.value = false
  }
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const toggleMode = () => {
  isSignUpMode.value = !isSignUpMode.value
  showPassword.value = false
  loginErrors.email = ''
  signupErrors.email = ''
  signupErrors.confirmPassword = ''
}

const showTerms = () => {
  showTermsModal.value = true
}

const closeTerms = () => {
  showTermsModal.value = false
}

const acceptTerms = () => {
  signupForm.terms = true
  showTermsModal.value = false
}

// Clear errors on input change
watch(() => loginForm.email, () => {
  loginErrors.email = ''
})

watch(() => signupForm.email, () => {
  signupErrors.email = ''
})

watch(() => signupForm.confirmPassword, () => {
  signupErrors.confirmPassword = ''
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.signin-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0);
  backdrop-filter: blur(10px);
  position: relative;
}

.signin-container::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 1200px;
  height: 1200px;
  background: radial-gradient(
    circle,
    rgba(100, 65, 165, 0.2) 0%,
    rgba(100, 65, 165, 0.1) 30%,
    rgba(100, 65, 165, 0) 70%
  );
  animation: pulse 4s infinite;
  pointer-events: none;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.5;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.3;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.5;
  }
}

.wrapper {
  position: relative;
  width: 1000px;
  height: 600px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 0 50px rgba(100, 65, 165, 0.3);
  overflow: hidden;
  z-index: 1;
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
  padding: 0 80px 0 60px;
}

.wrapper .form-box.signup {
  right: 0;
  padding: 0 60px 0 80px;
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
  font-size: 16px;
  color: #000000;
  z-index: 1;
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
  color: #6441A5;
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
  background: #6441A5;
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: 0.3s;
  overflow: hidden;
}

.btn:hover {
  background: #2a0845;
}

.btn.loading {
  pointer-events: none;
  opacity: 0.8;
}

.reg-link {
  font-size: 14.5px;
  color: #555;
  text-align: center;
  margin: 20px 0 10px;
}

.reg-link a {
  color: #6441A5;
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
  background: #6441A5;
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
  color: #fff;
}

.info-text p {
  font-size: 16px;
  opacity: 0.8;
}

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
  width: 1100px;
  height: 800px;
  background: #6441A5;
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
  width: 1100px;
  height: 900px;
  background: #fff;
  transform: rotate(0deg) skewY(0deg);
  transform-origin: bottom left;
  transition: 1.5s ease;
}

.wrapper.active .bg-animate2 {
  transform: rotate(-11deg) skewY(-41deg);
  transition-delay: 1.2s;
}

/* Toast & Modal Styles */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.toast {
  padding: 15px 25px;
  border-radius: 8px;
  color: white;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: slideIn 0.3s ease forwards;
}

.toast.success {
  background: linear-gradient(45deg, #6441A5, #2a0845);
}

.toast.error {
  background: linear-gradient(45deg, #ff416c, #ff4b2b);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal {
  background: white;
  border-radius: 15px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  animation: modalIn 0.3s ease;
}

/* Checkbox & Error Styles */
.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  cursor: pointer;
  margin: 15px 0;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #6441A5;
  border-radius: 4px;
  position: relative;
  transition: 0.3s ease;
}

.remember-me input:checked ~ .checkmark {
  background: #6441A5;
}

.remember-me input:checked ~ .checkmark::after {
  content: '\2714';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
}

.error-message {
  font-size: 12px;
  color: #ff416c;
  margin-top: 5px;
  animation: shake 0.5s ease;
}

/* Animations */
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes modalIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .wrapper {
    width: 90%;
    height: 600px;
  }
  
  .wrapper .form-box.login,
  .wrapper .form-box.signup {
    padding: 0 40px;
  }
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

  .signin-container::before {
    width: 100%;
    height: 100%;
    animation: none;
  }

  .modal {
    width: 95%;
    margin: 10px;
  }
}
</style>
