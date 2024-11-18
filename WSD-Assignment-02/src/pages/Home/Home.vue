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
}

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

.movie-section {
  padding: 20px 4%;
  position: relative;
}

.movie-section h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.movie-slider {
  position: relative;
}

.movie-list {
  display: flex;
  gap: 1rem;
  overflow-x: hidden;
  padding: 20px 40px;
  scroll-behavior: smooth;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.movie-list::-webkit-scrollbar {
  display: none;
}

.movie-card {
  flex: 0 0 200px;
  transition: transform 0.3s ease;
}

.movie-card:hover {
  transform: scale(1.05);
  cursor: pointer;
}

.poster-wrapper {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
}

.poster-wrapper img {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.movie-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
  transform: translateY(100%);
  transition: transform 0.3s;
}

.poster-wrapper:hover .movie-info {
  transform: translateY(0);
}

.movie-info h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.slider-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: calc(100% - 40px);
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  cursor: pointer;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.slider-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.slider-btn.prev {
  left: 0;
}

.slider-btn.next {
  right: 0;
}

@media (max-width: 768px) {
  .hero {
    height: 60vh;
  }

  .hero h1 {
    font-size: 2rem;
  }

  .overview {
    font-size: 1rem;
  }

  .btn {
    padding: 0.6rem 1.5rem;
    font-size: 1rem;
  }

  .movie-card {
    flex: 0 0 150px;
  }

  .poster-wrapper img {
    height: 225px;
  }
}
</style>