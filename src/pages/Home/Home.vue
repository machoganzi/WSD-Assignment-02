<template>
  <div :class="['home', { 'dark-mode': themeStore.isDarkMode }]">
    <!-- Loading Overlay -->
    <div v-if="movieStore.loading" class="loading-overlay">
      <div class="loader"></div>
    </div>

    <!-- Hero Section -->
    <section v-if="movieStore.featuredMovie" class="hero" :style="heroStyle">
      <div class="hero-content">
        <h1>{{ movieStore.featuredMovie.title }}</h1>
        <p class="overview">{{ movieStore.featuredMovie.overview }}</p>
        <div class="hero-buttons">
          <button class="btn play-btn">
            <i class="fas fa-play"></i> 재생
          </button>
          <button class="btn more-btn">
            <i class="fas fa-info-circle"></i> 상세 정보
          </button>
        </div>
      </div>
      <div class="hero-shadow"></div>
    </section>

    <!-- Popular Movies Section -->
    <section class="movie-section">
      <h2>인기 영화</h2>
      <div class="movie-slider">
        <button 
          class="slider-btn prev" 
          @click="() => handleSlide('popular', 'prev')"
          v-show="shouldShowNavButton('popular', 'prev')"
          aria-label="이전 영화"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <div class="movie-list" ref="popularSlider">
          <div 
            class="movie-track"
            :style="getSliderPosition('popular')"
          >
            <div 
              v-for="movie in movieStore.popularMovies" 
              :key="movie.id" 
              class="movie-card"
              @click="movieStore.toggleWishlist(movie.id)"
            >
              <div class="poster-wrapper">
                <img 
                  :src="getImageUrl(movie.poster_path)" 
                  :alt="movie.title"
                  loading="lazy"
                >
                <div class="movie-info">
                  <h3>{{ movie.title }}</h3>
                  <p>⭐ {{ movie.vote_average.toFixed(1) }}</p>
                  <i class="fas heart-icon"
                     :class="movieStore.isWishlisted(movie.id) ? 'fa-heart' : 'fa-heart-o'"
                     :aria-label="movieStore.isWishlisted(movie.id) ? '찜하기 취소' : '찜하기'"
                  ></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button 
          class="slider-btn next" 
          @click="() => handleSlide('popular', 'next')"
          v-show="shouldShowNavButton('popular', 'next')"
          aria-label="다음 영화"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </section>

    <!-- Now Playing Section -->
    <section class="movie-section">
      <h2>현재 상영작</h2>
      <div class="movie-slider">
        <button 
          class="slider-btn prev" 
          @click="() => handleSlide('nowPlaying', 'prev')"
          v-show="shouldShowNavButton('nowPlaying', 'prev')"
          aria-label="이전 영화"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <div class="movie-list" ref="nowPlayingSlider">
          <div 
            class="movie-track"
            :style="getSliderPosition('nowPlaying')"
          >
            <div 
              v-for="movie in movieStore.nowPlayingMovies" 
              :key="movie.id" 
              class="movie-card"
              @click="movieStore.toggleWishlist(movie.id)"
            >
              <div class="poster-wrapper">
                <img 
                  :src="getImageUrl(movie.poster_path)" 
                  :alt="movie.title"
                  loading="lazy"
                >
                <div class="movie-info">
                  <h3>{{ movie.title }}</h3>
                  <p>⭐ {{ movie.vote_average.toFixed(1) }}</p>
                  <i class="fas heart-icon"
                     :class="movieStore.isWishlisted(movie.id) ? 'fa-heart' : 'fa-heart-o'"
                     :aria-label="movieStore.isWishlisted(movie.id) ? '찜하기 취소' : '찜하기'"
                  ></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button 
          class="slider-btn next" 
          @click="() => handleSlide('nowPlaying', 'next')"
          v-show="shouldShowNavButton('nowPlaying', 'next')"
          aria-label="다음 영화"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue';
import { useThemeStore } from '@/stores/themeStore';
import { useMovieStore } from '@/stores/movieStore';
import { tmdbApi } from '@/services/tmdb';
import { debounce } from 'lodash';

const themeStore = useThemeStore();
const movieStore = useMovieStore();

interface SliderState {
  currentSlide: number;
  slideWidth: number;
  maxSlide: number;
  itemsPerSlide: number;
}

const sliderStates = reactive({
  popular: {
    currentSlide: 0,
    slideWidth: 0,
    maxSlide: 0,
    itemsPerSlide: 0
  } as SliderState,
  nowPlaying: {
    currentSlide: 0,
    slideWidth: 0,
    maxSlide: 0,
    itemsPerSlide: 0
  } as SliderState
});

const popularSlider = ref<HTMLElement | null>(null);
const nowPlayingSlider = ref<HTMLElement | null>(null);

// Hero Background Style
const heroStyle = computed(() => {
  if (movieStore.featuredMovie?.backdrop_path) {
    return {
      backgroundImage: `url(${tmdbApi.getImageUrl(movieStore.featuredMovie.backdrop_path, 'original')})`
    };
  }
  return {};
});

// Image URL Helper
const getImageUrl = (path: string | null) => {
  return tmdbApi.getImageUrl(path, 'w500');
};

// 슬라이더 위치 계산
const getSliderPosition = (type: 'popular' | 'nowPlaying') => {
  const state = sliderStates[type];
  const movies = type === 'popular' ? movieStore.popularMovies : movieStore.nowPlayingMovies;
  const cardWidth = 260; // Fixed card width
  const gap = 16; // Gap between cards

  // 현재 보여지는 영화들의 시작 인덱스
  const startIndex = state.currentSlide * state.itemsPerSlide;
  
  // 이동할 거리 계산
  const moveDistance = startIndex * (cardWidth + gap);
  
  return {
    transform: `translateX(-${moveDistance}px)`,
    transition: 'transform 0.3s ease-in-out'
  };
};

// 네비게이션 버튼 표시 여부
const shouldShowNavButton = (type: 'popular' | 'nowPlaying', direction: 'prev' | 'next') => {
  const state = sliderStates[type];
  const movies = type === 'popular' ? movieStore.popularMovies : movieStore.nowPlayingMovies;
  
  if (direction === 'prev') {
    return state.currentSlide > 0;
  }
  
  // 현재 보여지는 영화들의 시작 인덱스
  const startIndex = state.currentSlide * state.itemsPerSlide;
  // 남은 영화 수
  const remainingMovies = movies.length - startIndex;
  
  return remainingMovies > state.itemsPerSlide;
};

// Slider Logic
const calculateSliderMetrics = (type: 'popular' | 'nowPlaying') => {
  const slider = type === 'popular' ? popularSlider.value : nowPlayingSlider.value;
  if (!slider) return;

  const containerWidth = slider.clientWidth;
  const cardWidth = 260; // Fixed card width from CSS
  const gap = 16; // Gap between cards from CSS
  const itemsPerSlide = Math.floor(containerWidth / (cardWidth + gap));
  
  const movies = type === 'popular' ? movieStore.popularMovies : movieStore.nowPlayingMovies;
  const maxSlide = Math.ceil(movies.length / itemsPerSlide);
  
  sliderStates[type] = {
    ...sliderStates[type],
    slideWidth: containerWidth,
    maxSlide,
    itemsPerSlide
  };
};

const handleSlide = (type: 'popular' | 'nowPlaying', direction: 'prev' | 'next') => {
  const state = sliderStates[type];
  const movies = type === 'popular' ? movieStore.popularMovies : movieStore.nowPlayingMovies;
  
  if (direction === 'next') {
    const startIndex = state.currentSlide * state.itemsPerSlide;
    const remainingMovies = movies.length - startIndex;
    
    if (remainingMovies > state.itemsPerSlide) {
      state.currentSlide++;
    }
  } else if (direction === 'prev' && state.currentSlide > 0) {
    state.currentSlide--;
  }
};

const handleWheel = (event: WheelEvent, type: 'popular' | 'nowPlaying') => {
  event.preventDefault();
  handleSlide(type, event.deltaY > 0 ? 'next' : 'prev');
};

// Resize handler
const handleResize = debounce(() => {
  calculateSliderMetrics('popular');
  calculateSliderMetrics('nowPlaying');
}, 250);

// Event Listeners
onMounted(() => {
  movieStore.loadMovies();
  
  // Initialize sliders after movies are loaded
  setTimeout(() => {
    calculateSliderMetrics('popular');
    calculateSliderMetrics('nowPlaying');
    
    if (popularSlider.value) {
      popularSlider.value.addEventListener('wheel', (e) => handleWheel(e, 'popular'));
    }
    if (nowPlayingSlider.value) {
      nowPlayingSlider.value.addEventListener('wheel', (e) => handleWheel(e, 'nowPlaying'));
    }
    window.addEventListener('resize', handleResize);
  }, 100);
});

onUnmounted(() => {
  if (popularSlider.value) {
    popularSlider.value.removeEventListener('wheel', (e) => handleWheel(e, 'popular'));
  }
  if (nowPlayingSlider.value) {
    nowPlayingSlider.value.removeEventListener('wheel', (e) => handleWheel(e, 'nowPlaying'));
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: var(--background-light);
  position: relative;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
  overflow-x: hidden;
  transition: background-color 0.3s ease;
}

.dark-mode .home {
  background: var(--background-dark);
}

.movie-track {
  display: flex;
  gap: 1rem;
  transition: transform 0.3s ease;
  width: fit-content;
}

.movie-list {
  overflow: hidden;
}

/* Loading Styles */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.loader {
  width: 48px;
  height: 48px;
  border: 3px solid #fff;
  border-radius: 50%;
  display: inline-block;
  position: relative;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

.loader::after {
  content: '';  
  box-sizing: border-box;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid transparent;
  border-bottom-color: var(--primary-color);
}

/* Hero Section */
.hero {
  height: 80vh;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  padding: 0;
  width: 100%;
}

.hero-shadow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(var(--background-dark-rgb), 0) 0%,
    rgba(var(--background-dark-rgb), 0.8) 60%,
    var(--background-dark) 100%
  );
}

.hero-content {
  max-width: 600px;
  z-index: 1;
  padding: 0 4%;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  color: var(--text-dark);
  transition: color 0.3s ease;
}

.dark-mode .hero h1 {
  color: var(--text-dark);
}

.overview {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  color: var(--text-dark);
  transition: color 0.3s ease;
}

.dark-mode .overview {
  color: #f1f1f1;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
}

/* Buttons */
.btn {
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.play-btn {
  background: #fff;
  color: var(--text-light);
  transition: all 0.3s ease;
}

.dark-mode .play-btn {
  color: var(--background-dark);
}

.play-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
}

.more-btn {
  background: rgba(109, 109, 110, 0.7);
  color: var(--text-dark);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.dark-mode .more-btn {
  color: var(--text-dark);
}

.more-btn:hover {
  background: rgba(109, 109, 110, 0.9);
  transform: translateY(-2px);
}

/* Movie Section */
.movie-section {
  padding: 60px 0;
  position: relative;
  width: 100%;
}

.movie-section h2 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: var(--text-light);
  transition: color 0.3s ease;
  padding: 0 4%;
}

.dark-mode .movie-section h2 {
  color: var(--text-dark);
}

.movie-slider {
  position: relative;
  width: 100%;
  padding: 0 4%;
}

.movie-list {
  display: flex;
  gap: 1rem;
  overflow-x: hidden;
  scroll-behavior: smooth;
  padding: 1rem 0;
  width: 100%;
}

.movie-card {
  flex: 0 0 260px;
  transition: transform 0.3s ease;
  cursor: pointer;
}

.movie-card:hover {
  transform: scale(1.05);
}

.poster-wrapper {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.dark-mode .poster-wrapper {
  background: rgba(0, 0, 0, 0.3);
}

.poster-wrapper img {
  width: 100%;
  height: 380px;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.movie-card:hover img {
  transform: scale(1.1);
}

.movie-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9),
    rgba(0, 0, 0, 0.7) 50%,
    transparent
  );
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.poster-wrapper:hover .movie-info {
  transform: translateY(0);
}

.movie-info h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-dark);
  transition: color 0.3s ease;
}

.dark-mode .movie-info h3 {
  color: var(--text-dark);
}

.movie-info p {
  color: var(--text-dark);
  margin-bottom: 0.5rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.dark-mode .movie-info p {
  color: #ffd700;
}

.heart-icon {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.5rem;
  color: #ff3b7c;
  filter: drop-shadow(0 0 8px rgba(255, 59, 124, 0.4));
  transition: all 0.3s ease;
}

.heart-icon:hover {
  transform: scale(1.2);
  filter: drop-shadow(0 0 12px rgba(255, 59, 124, 0.6));
}

/* Slider Buttons */
.slider-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 100px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-light);
  cursor: pointer;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.dark-mode .slider-btn {
  background: rgba(0, 0, 0, 0.3);
  color: var(--text-dark);
}

.slider-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  width: 60px;
}

.dark-mode .slider-btn:hover {
  background: rgba(0, 0, 0, 0.5);
}

.slider-btn.prev {
  left: 0;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

.slider-btn.next {
  right: 0;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}

.slider-btn i {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.slider-btn:hover i {
  transform: scale(1.2);
}

/* Animations */
@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Media Queries */
@media (max-width: 1024px) {
  .hero h1 {
    font-size: 2.5rem;
  }

  .movie-card {
    flex: 0 0 220px;
  }

  .poster-wrapper img {
    height: 330px;
  }
}

@media (max-width: 768px) {
  .hero {
    height: 70vh;
  }

  .hero-content {
    padding: 0 5%;
  }

  .hero h1 {
    font-size: 2rem;
  }

  .overview {
    font-size: 1rem;
  }

  .btn {
    padding: 0.7rem 1.5rem;
    font-size: 1rem;
  }

  .movie-section {
    padding: 40px 0;
  }

  .movie-section h2 {
    padding: 0 5%;
  }

  .movie-slider {
    padding: 0 5%;
  }

  .movie-card {
    flex: 0 0 180px;
  }

  .poster-wrapper img {
    height: 270px;
  }

  .slider-btn {
    width: 40px;
    height: 80px;
  }
}

@media (max-width: 480px) {
  .hero h1 {
    font-size: 1.8rem;
  }

  .movie-card {
    flex: 0 0 160px;
  }

  .poster-wrapper img {
    height: 240px;
  }

  .movie-info h3 {
    font-size: 1rem;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
</style>