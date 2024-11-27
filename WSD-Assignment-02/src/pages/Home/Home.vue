<template>
  <div :class="['home', { 'dark-mode': themeStore.isDarkMode }]">
    <!-- Loading Overlay with improved animation -->
    <div v-if="movieStore.loading" class="loading-overlay">
      <div class="loader-container">
        <div class="loader"></div>
        <p>Loading amazing movies...</p>
      </div>
    </div>

    <!-- Enhanced Hero Section -->
    <section v-if="movieStore.featuredMovie" class="hero" :style="heroStyle">
      <div class="hero-content animation-slide-up">
        <div class="tags">
          <span v-for="genre in getFeaturedMovieGenres" :key="genre" class="tag">
            {{ genre }}
          </span>
        </div>
        <h1>{{ movieStore.featuredMovie.title }}</h1>
        <div class="meta">
          <span class="release-date">
            <i class="fas fa-calendar"></i>
            {{ formatDate(movieStore.featuredMovie.release_date) }}
          </span>
          <span class="rating">
            <i class="fas fa-star"></i>
            {{ movieStore.featuredMovie.vote_average.toFixed(1) }}
          </span>
        </div>
        <p class="overview">{{ movieStore.featuredMovie.overview }}</p>
        <div class="hero-buttons">
          <button class="btn play-btn" @click="openTrailer(movieStore.featuredMovie.id)">
            <i class="fas fa-play"></i> 예고편
          </button>
          <button class="btn more-btn" @click="openMovieDetail(movieStore.featuredMovie)">
            <i class="fas fa-info-circle"></i> 상세 정보
          </button>
        </div>
      </div>
      <div class="hero-shadow"></div>
    </section>

    <!-- Movie Sections -->
    <div class="movie-sections">
      <!-- Popular Movies -->
      <MovieSection
        title="인기 영화"
        :movies="movieStore.popularMovies"
        @slide="handleSlide('popular', $event)"
        :sliderState="sliderStates.popular"
        ref="popularSlider"
      />

      <!-- Top Rated Movies -->
      <MovieSection
        title="최고 평점"
        :movies="movieStore.topRatedMovies"
        @slide="handleSlide('topRated', $event)"
        :sliderState="sliderStates.topRated"
        ref="topRatedSlider"
      />

      <!-- Upcoming Movies -->
      <MovieSection
        title="개봉 예정"
        :movies="movieStore.upcomingMovies"
        @slide="handleSlide('upcoming', $event)"
        :sliderState="sliderStates.upcoming"
        ref="upcomingSlider"
      />

      <!-- Now Playing -->
      <MovieSection
        title="현재 상영작"
        :movies="movieStore.nowPlayingMovies"
        @slide="handleSlide('nowPlaying', $event)"
        :sliderState="sliderStates.nowPlaying"
        ref="nowPlayingSlider"
      />
    </div>

    <!-- Movie Detail Modal -->
    <Teleport to="body">
      <div v-if="selectedMovie" class="modal-overlay" @click="closeMovieDetail">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="closeMovieDetail">
            <i class="fas fa-times"></i>
          </button>
          <div class="modal-grid">
            <div class="modal-poster">
              <img :src="getImageUrl(selectedMovie.poster_path, 'w500')" :alt="selectedMovie.title">
            </div>
            <div class="modal-info">
              <h2>{{ selectedMovie.title }}</h2>
              <div class="modal-meta">
                <span class="modal-release">
                  <i class="fas fa-calendar"></i>
                  {{ formatDate(selectedMovie.release_date) }}
                </span>
                <span class="modal-rating">
                  <i class="fas fa-star"></i>
                  {{ selectedMovie.vote_average.toFixed(1) }}
                </span>
                <span class="modal-genres">
                  <i class="fas fa-film"></i>
                  {{ getMovieGenres(selectedMovie).join(', ') }}
                </span>
              </div>
              <p class="modal-overview">{{ selectedMovie.overview }}</p>
              <div class="modal-actions">
                <button 
                  class="wishlist-btn"
                  :class="{ 'active': movieStore.isWishlisted(selectedMovie.id) }"
                  @click="movieStore.toggleWishlist(selectedMovie.id)"
                >
                  <i class="fas" :class="movieStore.isWishlisted(selectedMovie.id) ? 'fa-heart' : 'fa-heart-o'"></i>
                  {{ movieStore.isWishlisted(selectedMovie.id) ? '찜 취소' : '찜하기' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Trailer Modal -->
    <Teleport to="body">
      <div v-if="trailerUrl" class="modal-overlay" @click="closeTrailer">
        <div class="trailer-modal" @click.stop>
          <button class="modal-close" @click="closeTrailer">
            <i class="fas fa-times"></i>
          </button>
          <iframe
            :src="trailerUrl"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue';
import { useThemeStore } from '@/stores/themeStore';
import { useMovieStore } from '@/stores/movieStore';
import { tmdbApi } from '@/services/tmdb';
import { debounce } from 'lodash';
import MovieSection from '@/components/movie/MovieSection.vue';

const themeStore = useThemeStore();
const movieStore = useMovieStore();

// State
const selectedMovie = ref(null);
const trailerUrl = ref('');

// Slider States
interface SliderState {
  currentSlide: number;
  slideWidth: number;
  maxSlide: number;
  itemsPerSlide: number;
}

const sliderStates = reactive({
  popular: { currentSlide: 0, slideWidth: 0, maxSlide: 0, itemsPerSlide: 0 } as SliderState,
  topRated: { currentSlide: 0, slideWidth: 0, maxSlide: 0, itemsPerSlide: 0 } as SliderState,
  upcoming: { currentSlide: 0, slideWidth: 0, maxSlide: 0, itemsPerSlide: 0 } as SliderState,
  nowPlaying: { currentSlide: 0, slideWidth: 0, maxSlide: 0, itemsPerSlide: 0 } as SliderState
});

// Refs for slider components
const sliderRefs = {
  popularSlider: ref(null),
  topRatedSlider: ref(null),
  upcomingSlider: ref(null),
  nowPlayingSlider: ref(null)
};

// Computed
const heroStyle = computed(() => {
  if (movieStore.featuredMovie?.backdrop_path) {
    return {
      backgroundImage: `url(${getImageUrl(movieStore.featuredMovie.backdrop_path, 'original')})`
    };
  }
  return {};
});

const getFeaturedMovieGenres = computed(() => {
  if (!movieStore.featuredMovie) return [];
  return getMovieGenres(movieStore.featuredMovie);
});

// Methods
const getImageUrl = (path: string, size: string = 'w500') => {
  return tmdbApi.getImageUrl(path, size);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getMovieGenres = (movie: any) => {
  return movie.genre_ids.map((id: number) => 
    movieStore.genres.find(g => g.id === id)?.name || ''
  ).filter(Boolean);
};

const openMovieDetail = async (movie: any) => {
  selectedMovie.value = movie;
  document.body.style.overflow = 'hidden';
  
  // Load additional movie details if needed
  try {
    const details = await tmdbApi.getMovieDetails(movie.id);
    selectedMovie.value = { ...movie, ...details };
  } catch (error) {
    console.error('Error loading movie details:', error);
  }
};

const closeMovieDetail = () => {
  selectedMovie.value = null;
  document.body.style.overflow = '';
};

const openTrailer = async (movieId: number) => {
  try {
    const videos = await tmdbApi.getMovieVideos(movieId);
    const trailer = videos.results.find(
      (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
    );
    
    if (trailer) {
      trailerUrl.value = `https://www.youtube.com/embed/${trailer.key}?autoplay=1`;
      document.body.style.overflow = 'hidden';
    }
  } catch (error) {
    console.error('Error loading trailer:', error);
  }
};

const closeTrailer = () => {
  trailerUrl.value = '';
  document.body.style.overflow = '';
};

// Slider Logic
const calculateSliderMetrics = (type: keyof typeof sliderStates) => {
  const slider = sliderRefs[`${type}Slider`].value;
  if (!slider) return;

  const containerWidth = slider.$el.clientWidth;
  const cardWidth = 280; // Card width + gap
  const itemsPerSlide = Math.floor(containerWidth / cardWidth);
  const movies = movieStore[`${type}Movies`];
  const maxSlide = Math.ceil(movies.length / itemsPerSlide) - 1;

  sliderStates[type] = {
    ...sliderStates[type],
    slideWidth: containerWidth,
    maxSlide,
    itemsPerSlide
  };
};

const handleSlide = (type: keyof typeof sliderStates, direction: 'prev' | 'next') => {
  const state = sliderStates[type];
  
  if (direction === 'next' && state.currentSlide < state.maxSlide) {
    state.currentSlide++;
  } else if (direction === 'prev' && state.currentSlide > 0) {
    state.currentSlide--;
  }
};

// Resize handler
const handleResize = debounce(() => {
  Object.keys(sliderStates).forEach((type) => {
    calculateSliderMetrics(type as keyof typeof sliderStates);
  });
}, 250);

// Lifecycle hooks
onMounted(async () => {
  await movieStore.loadMovies();
  await movieStore.loadGenres();
  
  // Initialize sliders after movies are loaded
  setTimeout(() => {
    Object.keys(sliderStates).forEach((type) => {
      calculateSliderMetrics(type as keyof typeof sliderStates);
    });
    window.addEventListener('resize', handleResize);
  }, 100);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
:root {
  --primary-color: #6441A5;
  --primary-dark: #2a0845;
  --primary-light: #9B6DFF;
  --accent-color: #FF3B7C;
  --accent-hover: #FF6B9C;
  --background-light: #F8F7FF;
  --background-dark: #13111C;
  --glass-light: rgba(255, 255, 255, 0.1);
  --glass-dark: rgba(0, 0, 0, 0.2);
  --text-light: #2C2C2C;
  --text-dark: #FFFFFF;
}

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

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(19, 17, 28, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loader-container {
  text-align: center;
}

.loader {
  width: 60px;
  height: 60px;
  border: 3px solid var(--glass-light);
  border-radius: 50%;
  display: inline-block;
  position: relative;
  animation: rotation 1.5s linear infinite;
}

.loader::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid transparent;
  border-bottom-color: var(--primary-light);
}

.loader-container p {
  color: var(--text-dark);
  margin-top: 1rem;
  font-size: 1.1rem;
  animation: pulse 1.5s infinite;
}

/* Hero Section */
.hero {
  height: 90vh;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 4%;
}

.hero-content {
  max-width: 800px;
  z-index: 1;
  opacity: 0;
  transform: translateY(20px);
  animation: slideUp 0.8s ease forwards;
}

.hero-shadow {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(19, 17, 28, 0) 0%,
    rgba(19, 17, 28, 0.8) 60%,
    var(--background-dark) 100%
  );
}

.tags {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
}

.tag {
  background: rgba(100, 65, 165, 0.3);
  backdrop-filter: blur(4px);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  color: var(--text-dark);
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.tag:hover {
  background: rgba(100, 65, 165, 0.5);
  transform: translateY(-2px);
}

.hero h1 {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  color: var(--text-dark);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  font-weight: 700;
  line-height: 1.2;
}

.meta {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  color: var(--text-dark);
}

.meta span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta i {
  color: var(--primary-light);
}

.overview {
  font-size: 1.2rem;
  line-height: 1.6;
  color: var(--text-dark);
  margin-bottom: 2rem;
  opacity: 0.9;
  max-width: 700px;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 1rem 2.5rem;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  position: relative;
  overflow: hidden;
}

.play-btn {
  background: var(--primary-color);
  color: var(--text-dark);
}

.play-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

.more-btn {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: var(--text-dark);
}

.more-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Movie Sections */
.movie-sections {
  padding: 2rem 0;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(19, 17, 28, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: var(--background-light);
  border-radius: 20px;
  width: 100%;
  max-width: 1000px;
  position: relative;
  overflow: hidden;
  animation: scaleIn 0.3s ease;
}

.modal-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
}

.modal-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-info {
  padding: 2rem;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--text-dark);
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 1;
  transition: all 0.3s ease;
}

.modal-close:hover {
  transform: rotate(90deg);
  color: var(--accent-color);
}

/* Animations */
@keyframes rotation {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  50% { opacity: 0.5; }
}

@keyframes slideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .hero h1 {
    font-size: 3.5rem;
  }
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2.5rem;
  }

  .hero-content {
    text-align: center;
  }

  .hero-buttons {
    justify-content: center;
  }

  .modal-grid {
    grid-template-columns: 1fr;
  }

  .modal-poster {
    height: 400px;
  }
}

@media (max-width: 480px) {
  .hero h1 {
    font-size: 2rem;
  }

  .btn {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
  }
}
</style>
