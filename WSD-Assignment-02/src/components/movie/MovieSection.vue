<template>
    <section class="movie-section">
      <h2>{{ title }}</h2>
      <div class="movie-slider">
        <!-- Prev Button -->
        <button 
          class="slider-btn prev" 
          @click="$emit('slide', 'prev')"
          v-show="sliderState.currentSlide > 0"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
  
        <!-- Movie List -->
        <div class="movie-list">
          <div 
            class="movie-track"
            :style="{
              transform: `translateX(-${sliderState.currentSlide * getSlideOffset()}px)`,
              transition: 'transform 0.5s ease'
            }"
          >
            <div 
              v-for="movie in movies" 
              :key="movie.id" 
              class="movie-card"
              @mouseover="hoveredMovie = movie.id"
              @mouseleave="hoveredMovie = null"
            >
              <!-- Card Content -->
              <div class="movie-poster">
                <img 
                  :src="getImageUrl(movie.poster_path)" 
                  :alt="movie.title"
                  loading="lazy"
                >
                <!-- Card Overlay -->
                <div class="movie-overlay" :class="{ active: hoveredMovie === movie.id }">
                  <div class="overlay-content">
                    <div class="movie-info">
                      <h3>{{ movie.title }}</h3>
                      <div class="meta">
                        <span class="year">{{ new Date(movie.release_date).getFullYear() }}</span>
                        <span class="rating">⭐ {{ movie.vote_average.toFixed(1) }}</span>
                      </div>
                      <div class="genres">
                        {{ getGenres(movie.genre_ids).join(' • ') }}
                      </div>
                    </div>
                    <p class="overview">{{ truncateText(movie.overview, 100) }}</p>
                    <div class="action-buttons">
                      <button class="details-btn" @click.stop="$emit('showDetails', movie)">
                        <i class="fas fa-info-circle"></i>
                        상세정보
                      </button>
                      <button 
                        class="wishlist-btn"
                        :class="{ active: isWishlisted(movie.id) }"
                        @click.stop="toggleWishlist(movie.id)"
                      >
                        <i class="fas" :class="isWishlisted(movie.id) ? 'fa-heart' : 'fa-heart-o'"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Next Button -->
        <button 
          class="slider-btn next" 
          @click="$emit('slide', 'next')"
          v-show="canSlideNext"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </section>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useMovieStore } from '@/stores/movieStore';
  
  const props = defineProps({
    title: String,
    movies: Array,
    sliderState: Object
  });
  
  const emit = defineEmits(['slide', 'showDetails']);
  
  const movieStore = useMovieStore();
  const hoveredMovie = ref(null);
  
  // Computed
  const canSlideNext = computed(() => {
    return props.sliderState.currentSlide < props.sliderState.maxSlide;
  });
  
  // Methods
  const getImageUrl = (path: string) => {
    return path ? `https://image.tmdb.org/t/p/w500${path}` : '/placeholder.jpg';
  };
  
  const getGenres = (genreIds: number[]) => {
    return genreIds
      .map(id => movieStore.genres.find(g => g.id === id)?.name)
      .filter(Boolean)
      .slice(0, 3);
  };
  
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };
  
  const getSlideOffset = () => {
    const cardWidth = 280; // Card width + gap
    return cardWidth * props.sliderState.itemsPerSlide;
  };
  
  const isWishlisted = (movieId: number) => {
    return movieStore.isWishlisted(movieId);
  };
  
  const toggleWishlist = (movieId: number) => {
    movieStore.toggleWishlist(movieId);
  };
  </script>
  
  <style scoped>
  .movie-section {
    margin: 4rem 0;
    padding: 0 4%;
  }
  
  .movie-section h2 {
    font-size: 1.8rem;
    color: var(--text-light);
    margin-bottom: 1.5rem;
    font-weight: 600;
  }
  
  .dark-mode .movie-section h2 {
    color: var(--text-dark);
  }
  
  .movie-slider {
    position: relative;
  }
  
  .movie-list {
    overflow: hidden;
    margin: 0 -8px;
  }
  
  .movie-track {
    display: flex;
    gap: 1rem;
  }
  
  /* Movie Card Styles */
  .movie-card {
    flex: 0 0 260px;
    padding: 8px;
    transition: transform 0.3s ease;
  }
  
  .movie-poster {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    aspect-ratio: 2/3;
    background: var(--glass-dark);
  }
  
  .movie-poster img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  .movie-card:hover img {
    transform: scale(1.1);
  }
  
  /* Overlay Styles */
  .movie-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(42, 8, 69, 0.95),
      rgba(100, 65, 165, 0.85)
    );
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .movie-overlay.active {
    opacity: 1;
  }
  
  .overlay-content {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .movie-info {
    margin-bottom: auto;
  }
  
  .movie-info h3 {
    color: var(--text-dark);
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    line-height: 1.4;
  }
  
  .meta {
    display: flex;
    gap: 1rem;
    color: var(--text-dark);
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  
  .genres {
    color: var(--primary-light);
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
  
  .overview {
    color: var(--text-dark);
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 1rem;
    opacity: 0.9;
  }
  
  /* Action Buttons */
  .action-buttons {
    display: flex;
    gap: 0.5rem;
    margin-top: auto;
  }
  
  .details-btn, .wishlist-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .details-btn {
    background: var(--glass-light);
    color: var(--text-dark);
    flex: 1;
  }
  
  .details-btn:hover {
    background: var(--primary-light);
  }
  
  .wishlist-btn {
    width: 40px;
    height: 40px;
    padding: 0;
    background: var(--glass-light);
    color: var(--accent-color);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .wishlist-btn.active {
    background: var(--accent-color);
    color: var(--text-dark);
  }
  
  /* Slider Buttons */
  .slider-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 100px;
    background: var(--glass-light);
    border: none;
    color: var(--text-dark);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    z-index: 2;
  }
  
  .slider-btn:hover {
    background: var(--primary-color);
    width: 50px;
  }
  
  .slider-btn.prev {
    left: -20px;
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
  }
  
  .slider-btn.next {
    right: -20px;
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .movie-card {
      flex: 0 0 200px;
    }
  
    .movie-info h3 {
      font-size: 1rem;
    }
  
    .overview {
      font-size: 0.8rem;
    }
  }
  </style>