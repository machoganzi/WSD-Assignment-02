<template>
  <div class="home">
    <!-- 메인 배너 섹션 -->
    <section v-if="featuredMovie" class="hero" :style="heroStyle">
      <div class="hero-content">
        <h1>{{ featuredMovie.title }}</h1>
        <p class="overview">{{ featuredMovie.overview }}</p>
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

    <!-- 인기 영화 섹션 -->
    <section class="movie-section">
      <h2>인기 영화</h2>
      <div class="movie-slider">
        <button class="slider-btn prev" @click="slidePopular('prev')" v-show="canSlidePrev.popular">
          <i class="fas fa-chevron-left"></i>
        </button>
        <div class="movie-list" ref="popularSlider">
          <div v-for="movie in popularMovies" 
               :key="movie.id" 
               class="movie-card"
               @click="toggleWishlist(movie)">
            <div class="poster-wrapper">
              <img :src="getImageUrl(movie.poster_path)" :alt="movie.title">
              <div class="movie-info">
                <h3>{{ movie.title }}</h3>
                <p>⭐ {{ movie.vote_average.toFixed(1) }}</p>
                <i class="fas" 
                   :class="isWishlisted(movie.id) ? 'fa-heart' : 'fa-heart-o'"
                ></i>
              </div>
            </div>
          </div>
        </div>
        <button class="slider-btn next" @click="slidePopular('next')" v-show="canSlideNext.popular">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </section>

    <!-- 현재 상영작 섹션 -->
    <section class="movie-section">
      <h2>현재 상영작</h2>
      <div class="movie-slider">
        <button class="slider-btn prev" @click="slideNowPlaying('prev')" v-show="canSlidePrev.nowPlaying">
          <i class="fas fa-chevron-left"></i>
        </button>
        <div class="movie-list" ref="nowPlayingSlider">
          <div v-for="movie in nowPlayingMovies" 
               :key="movie.id" 
               class="movie-card"
               @click="toggleWishlist(movie)">
            <div class="poster-wrapper">
              <img :src="getImageUrl(movie.poster_path)" :alt="movie.title">
              <div class="movie-info">
                <h3>{{ movie.title }}</h3>
                <p>⭐ {{ movie.vote_average.toFixed(1) }}</p>
                <i class="fas" 
                   :class="isWishlisted(movie.id) ? 'fa-heart' : 'fa-heart-o'"
                ></i>
              </div>
            </div>
          </div>
        </div>
        <button class="slider-btn next" @click="slideNowPlaying('next')" v-show="canSlideNext.nowPlaying">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { tmdbApi } from '../../services/tmdb'
import type { Movie } from '../../types/tmdb'

const popularMovies = ref<Movie[]>([])
const nowPlayingMovies = ref<Movie[]>([])
const featuredMovie = ref<Movie | null>(null)
const popularSlider = ref<HTMLElement | null>(null)
const nowPlayingSlider = ref<HTMLElement | null>(null)
const wishlisted = ref<number[]>(JSON.parse(localStorage.getItem('wishlisted') || '[]'))

// 슬라이드 상태
const canSlideNext = ref({ popular: true, nowPlaying: true })
const canSlidePrev = ref({ popular: false, nowPlaying: false })

// 배경 이미지 스타일
const heroStyle = computed(() => {
  if (featuredMovie.value?.backdrop_path) {
    return {
      backgroundImage: `url(${tmdbApi.getImageUrl(featuredMovie.value.backdrop_path, 'original')})`
    }
  }
  return {}
})

// 이미지 URL 생성
const getImageUrl = (path: string | null) => {
  return tmdbApi.getImageUrl(path, 'w500')
}

// 마우스 휠 이벤트 핸들러
const handleWheel = (event: WheelEvent, type: 'popular' | 'nowPlaying') => {
  event.preventDefault();
  const slider = type === 'popular' ? popularSlider.value : nowPlayingSlider.value;
  if (!slider) return;

  const scrollAmount = event.deltaY > 0 ? 200 : -200;
  slider.scrollBy({
    left: scrollAmount,
    behavior: 'smooth'
  });

  setTimeout(() => {
    checkScroll(slider, type);
  }, 100);
};

// 슬라이더 이동 로직
const slidePopular = (direction: 'prev' | 'next') => {
  if (!popularSlider.value) return;
  
  const cardWidth = 216; // 카드 너비(200px) + gap(16px)
  const containerWidth = popularSlider.value.clientWidth;
  const scrollAmount = Math.floor(containerWidth / cardWidth) * cardWidth;

  popularSlider.value.scrollBy({
    left: direction === 'next' ? scrollAmount : -scrollAmount,
    behavior: 'smooth'
  });

  setTimeout(() => {
    if (popularSlider.value) {
      checkScroll(popularSlider.value, 'popular');
    }
  }, 100);
};

const slideNowPlaying = (direction: 'prev' | 'next') => {
  if (!nowPlayingSlider.value) return;
  
  const cardWidth = 216; // 카드 너비(200px) + gap(16px)
  const containerWidth = nowPlayingSlider.value.clientWidth;
  const scrollAmount = Math.floor(containerWidth / cardWidth) * cardWidth;

  nowPlayingSlider.value.scrollBy({
    left: direction === 'next' ? scrollAmount : -scrollAmount,
    behavior: 'smooth'
  });

  setTimeout(() => {
    if (nowPlayingSlider.value) {
      checkScroll(nowPlayingSlider.value, 'nowPlaying');
    }
  }, 100);
};

// 스크롤 상태 체크
const checkScroll = (element: HTMLElement, type: 'popular' | 'nowPlaying') => {
  const { scrollLeft, scrollWidth, clientWidth } = element;
  const maxScroll = scrollWidth - clientWidth;

  canSlidePrev.value[type] = scrollLeft > 1;
  canSlideNext.value[type] = Math.ceil(scrollLeft) < maxScroll - 1;
};

// 찜하기 관련
const isWishlisted = (movieId: number) => {
  return wishlisted.value.includes(movieId)
}

const toggleWishlist = (movie: Movie) => {
  const index = wishlisted.value.indexOf(movie.id)
  if (index === -1) {
    wishlisted.value.push(movie.id)
  } else {
    wishlisted.value.splice(index, 1)
  }
  localStorage.setItem('wishlisted', JSON.stringify(wishlisted.value))
}

// 데이터 로드
const loadMovies = async () => {
  try {
    const popularResponse = await tmdbApi.getPopularMovies()
    popularMovies.value = popularResponse.data.results
    
    featuredMovie.value = popularMovies.value[0]

    const nowPlayingResponse = await tmdbApi.getNowPlaying()
    nowPlayingMovies.value = nowPlayingResponse.data.results
  } catch (error) {
    console.error('Failed to load movies:', error)
  }
}

// 이벤트 리스너 설정
const setupScrollListeners = () => {
  if (popularSlider.value) {
    popularSlider.value.addEventListener('wheel', (e) => handleWheel(e, 'popular'));
    popularSlider.value.addEventListener('scroll', () => {
      checkScroll(popularSlider.value!, 'popular');
    });
  }
  
  if (nowPlayingSlider.value) {
    nowPlayingSlider.value.addEventListener('wheel', (e) => handleWheel(e, 'nowPlaying'));
    nowPlayingSlider.value.addEventListener('scroll', () => {
      checkScroll(nowPlayingSlider.value!, 'nowPlaying');
    });
  }
};

// 컴포넌트 마운트/언마운트
onMounted(() => {
  loadMovies();
  setupScrollListeners();
});

onUnmounted(() => {
  if (popularSlider.value) {
    popularSlider.value.removeEventListener('wheel', (e) => handleWheel(e, 'popular'));
  }
  if (nowPlayingSlider.value) {
    nowPlayingSlider.value.removeEventListener('wheel', (e) => handleWheel(e, 'nowPlaying'));
  }
});
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #12141d, #1f2937);
  position: relative;
  overflow: hidden;
}

/* 배경 효과 */
.home::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100vh;
  background: 
    radial-gradient(circle at 20% 50%, rgba(76, 29, 149, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 30%, rgba(219, 39, 119, 0.15) 0%, transparent 50%);
  pointer-events: none;
}

/* 히어로 섹션 */
.hero {
  height: 80vh;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 4%;
}

.hero-shadow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, 
    rgba(20, 20, 20, 0) 0%,
    rgba(20, 20, 20, 0.8) 60%, 
    #141414 100%
  );
}

.hero-content {
  max-width: 600px;
  z-index: 1;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.overview {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.8;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.hero-buttons {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.play-btn {
  background: white;
  color: black;
}

.play-btn:hover {
  background: rgba(255, 255, 255, 0.75);
}

.more-btn {
  background: rgba(109, 109, 110, 0.7);
  color: white;
}

.more-btn:hover {
  background: rgba(109, 109, 110, 0.4);
}

/* 영화 섹션 */
.movie-section {
  padding: 60px 8%;
  position: relative;
}

.movie-section h2 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #fff;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
}

.movie-slider {
  position: relative;
  margin: 0 -30px;
  perspective: 1000px;
}

.movie-list {
  display: flex;
  gap: 1.5rem;
  padding: 30px;
  overflow-x: hidden;
  scroll-behavior: smooth;
}

.movie-card {
  flex: 0 0 260px;
  transform-style: preserve-3d;
  transition: all 0.6s cubic-bezier(0.21, 0.67, 0.58, 1);
}

.movie-card:hover {
  transform: translateY(-10px) scale(1.05) rotateY(5deg);
}

.poster-wrapper {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 
    0 10px 30px -5px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
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
  padding: 2rem 1.5rem 1.5rem;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9),
    rgba(0, 0, 0, 0.7) 50%,
    transparent
  );
  transform: translateY(100%);
  transition: transform 0.5s cubic-bezier(0.21, 0.67, 0.58, 1);
}

.poster-wrapper:hover .movie-info {
  transform: translateY(0);
}

.movie-info h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.95);
}

.movie-info p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
}

/* 슬라이더 버튼 */
.slider-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 60px;
  height: 120px;
  background: rgba(255, 255, 255, 0.03);
  border: none;
  color: white;
  cursor: pointer;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.slider-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  width: 70px;
}

.slider-btn.prev {
  left: 0;
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}

.slider-btn.next {
  right: 0;
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}

.slider-btn i {
  font-size: 1.8rem;
  transition: transform 0.3s ease;
}

.slider-btn:hover i {
  transform: scale(1.2);
}

/* 찜하기 아이콘 */
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

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .hero h1 {
    font-size: 3.5rem;
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
    height: 80vh;
    padding: 0 5%;
  }

  .hero h1 {
    font-size: 2.8rem;
  }

  .overview {
    font-size: 1rem;
  }

  .btn {
    padding: 0.8rem 1.8rem;
    font-size: 1rem;
  }

  .movie-section {
    padding: 40px 5%;
  }

  .movie-card {
    flex: 0 0 180px;
  }

  .poster-wrapper img {
    height: 270px;
  }
}

/* 애니메이션 */
@keyframes glowPulse {
  0% { filter: drop-shadow(0 0 8px rgba(255, 59, 124, 0.4)); }
  50% { filter: drop-shadow(0 0 12px rgba(255, 59, 124, 0.6)); }
  100% { filter: drop-shadow(0 0 8px rgba(255, 59, 124, 0.4)); }
}
</style>