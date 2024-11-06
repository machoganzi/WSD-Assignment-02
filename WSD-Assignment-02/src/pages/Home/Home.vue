<template>
    <div class="home">
      <!-- 메인 배너 섹션 -->
      <section class="hero" v-if="featuredMovie" :style="heroStyle">
        <div class="hero-content">
          <h1>{{ featuredMovie.title }}</h1>
          <p class="overview">{{ featuredMovie.overview }}</p>
          <div class="hero-buttons">
            <button class="btn btn-play">
              <i class="fas fa-play"></i> 재생
            </button>
            <button class="btn btn-info">
              <i class="fas fa-info-circle"></i> 상세 정보
            </button>
          </div>
        </div>
      </section>
  
      <!-- 인기 영화 섹션 -->
      <section class="movie-section">
        <h2>인기 영화</h2>
        <div class="movie-slider" ref="popularSlider">
          <div class="movie-list">
            <div v-for="movie in popularMovies" 
                 :key="movie.id" 
                 class="movie-card"
                 @click="toggleWishlist(movie)">
              <div class="poster-wrapper">
                <img :src="getImageUrl(movie.poster_path)" :alt="movie.title">
                <div class="hover-info">
                  <h3>{{ movie.title }}</h3>
                  <p>⭐ {{ movie.vote_average.toFixed(1) }}</p>
                  <i class="fas"
                     :class="isWishlisted(movie.id) ? 'fa-heart' : 'fa-heart-o'"
                  ></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- 현재 상영작 섹션 -->
      <section class="movie-section">
        <h2>현재 상영작</h2>
        <div class="movie-slider" ref="nowPlayingSlider">
          <div class="movie-list">
            <div v-for="movie in nowPlayingMovies" 
                 :key="movie.id" 
                 class="movie-card"
                 @click="toggleWishlist(movie)">
              <div class="poster-wrapper">
                <img :src="getImageUrl(movie.poster_path)" :alt="movie.title">
                <div class="hover-info">
                  <h3>{{ movie.title }}</h3>
                  <p>⭐ {{ movie.vote_average.toFixed(1) }}</p>
                  <i class="fas"
                     :class="isWishlisted(movie.id) ? 'fa-heart' : 'fa-heart-o'"
                  ></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { tmdbApi } from '@/services/tmdb'
  import type { Movie } from '@/types/tmdb'
  
  const popularMovies = ref<Movie[]>([])
  const nowPlayingMovies = ref<Movie[]>([])
  const featuredMovie = ref<Movie | null>(null)
  const wishlisted = ref<number[]>(JSON.parse(localStorage.getItem('wishlisted') || '[]'))
  
  // 배경 이미지 스타일 계산
  const heroStyle = computed(() => {
    if (featuredMovie.value?.backdrop_path) {
      return {
        backgroundImage: `linear-gradient(to bottom, rgba(20, 20, 20, 0) 0%, rgba(20, 20, 20, 0.8) 60%, #141414 100%), 
                         url(${tmdbApi.getImageUrl(featuredMovie.value.backdrop_path, 'original')})`
      }
    }
    return {}
  })
  
  // 이미지 URL 생성
  const getImageUrl = (path: string | null) => {
    return tmdbApi.getImageUrl(path, 'w500')
  }
  
  // 찜하기 상태 확인
  const isWishlisted = (movieId: number) => {
    return wishlisted.value.includes(movieId)
  }
  
  // 찜하기 토글
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
      // 인기 영화 로드
      const popularResponse = await tmdbApi.getPopularMovies()
      popularMovies.value = popularResponse.data.results
  
      // 현재 상영작 로드
      const nowPlayingResponse = await tmdbApi.getNowPlaying()
      nowPlayingMovies.value = nowPlayingResponse.data.results
  
      // 메인 배너 영화 선택
      featuredMovie.value = popularMovies.value[0]
    } catch (error) {
      console.error('Failed to load movies:', error)
    }
  }
  
  onMounted(() => {
    loadMovies()
  })
  </script>
  
  <style scoped>
  .home {
    min-height: 100vh;
  }
  
  .hero {
    height: 80vh;
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    padding: 0 4%;
    margin-bottom: 20px;
  }
  
  .hero-content {
    max-width: 600px;
    z-index: 1;
  }
  
  .hero h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  .overview {
    font-size: 1.1rem;
    margin-bottom: 2rem;
    opacity: 0.8;
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
  
  .btn-play {
    background: white;
    color: black;
  }
  
  .btn-play:hover {
    background: rgba(255, 255, 255, 0.75);
  }
  
  .btn-info {
    background: rgba(109, 109, 110, 0.7);
    color: white;
  }
  
  .btn-info:hover {
    background: rgba(109, 109, 110, 0.4);
  }
  
  .movie-section {
    padding: 20px 4%;
  }
  
  .movie-section h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .movie-list {
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    padding: 20px 0;
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
    overflow: hidden;
    border-radius: 4px;
  }
  
  .poster-wrapper img {
    width: 100%;
    height: 300px;
    object-fit: cover;
  }
  
  .hover-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1rem;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
    transform: translateY(100%);
    transition: transform 0.3s ease;
  }
  
  .poster-wrapper:hover .hover-info {
    transform: translateY(0);
  }
  
  .hover-info h3 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }
  
  .hover-info p {
    font-size: 0.9rem;
    opacity: 0.8;
  }
  
  @media (max-width: 768px) {
    .hero {
      height: 60vh;
    }
  
    .hero h1 {
      font-size: 2rem;
    }
  
    .movie-card {
      flex: 0 0 150px;
    }
  
    .poster-wrapper img {
      height: 225px;
    }
  }
  </style>