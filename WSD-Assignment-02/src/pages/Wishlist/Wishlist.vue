<template>
  <div class="wishlist">
    <div class="wishlist-header">
      <h1>찜한 목록</h1>
      <div class="sort-controls">
        <select v-model="sortBy">
          <option value="date">찜한 날짜순</option>
          <option value="title">제목순</option>
          <option value="rating">평점순</option>
        </select>
      </div>
    </div>

    <div v-if="!wishedMovies.length" class="empty-state">
      <i class="fas fa-heart-broken"></i>
      <p>아직 찜한 영화가 없습니다</p>
      <router-link to="/popular" class="browse-link">
        <i class="fas fa-film"></i> 영화 둘러보기
      </router-link>
    </div>

    <div v-else class="movie-grid">
      <div 
        v-for="movie in sortedMovies" 
        :key="movie.id" 
        class="movie-card"
      >
        <div class="poster-wrapper">
          <img :src="getImageUrl(movie.poster_path)" :alt="movie.title">
          <div class="movie-info">
            <h3>{{ movie.title }}</h3>
            <p class="rating">⭐ {{ movie.vote_average.toFixed(1) }}</p>
            <p class="date">{{ formatDate(movie.release_date) }}</p>
            <button class="remove-btn" @click="removeFromWishlist(movie.id)">
              <i class="fas fa-trash"></i> 삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Movie } from '../../types/tmdb'

const wishedMovies = ref<Movie[]>([])
const sortBy = ref('date')

// 이미지 URL 생성
const getImageUrl = (path: string | null) => {
  if (!path) return '/default-movie-poster.jpg'
  return `https://image.tmdb.org/t/p/w500${path}`
}

// 날짜 포맷
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ko-KR')
}

// 정렬된 영화 목록
const sortedMovies = computed(() => {
  const movies = [...wishedMovies.value]
  switch (sortBy.value) {
    case 'title':
      return movies.sort((a, b) => a.title.localeCompare(b.title))
    case 'rating':
      return movies.sort((a, b) => b.vote_average - a.vote_average)
    default:
      return movies // 찜한 순서 유지
  }
})

// 찜한 영화 삭제
const removeFromWishlist = (movieId: number) => {
  const wishlistedMovies = JSON.parse(localStorage.getItem('wishlistedMovies') || '[]')
  const newWishlistedMovies = wishlistedMovies.filter((movie: Movie) => movie.id !== movieId)
  localStorage.setItem('wishlistedMovies', JSON.stringify(newWishlistedMovies))
  wishedMovies.value = wishedMovies.value.filter(movie => movie.id !== movieId)
}

// 찜한 영화 데이터 로드
const loadWishedMovies = () => {
  const wishlistedMovies = JSON.parse(localStorage.getItem('wishlistedMovies') || '[]')
  wishedMovies.value = wishlistedMovies
}

onMounted(() => {
  loadWishedMovies()
})
</script>

<style scoped>
/* Base Styles */
.wishlist {
  min-height: 100vh;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
  padding: 20px max(4%, calc((100vw - 1920px) / 2));
  background: rgba(255, 255, 255, 0.98);
  color: #333;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dark-mode .wishlist {
  background: #141414;
  color: #fff;
}

/* Header Styles */
.wishlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

.wishlist-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(to right, #e50914, #ff758c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

/* Sort Controls */
.sort-controls {
  position: relative;
  min-width: 200px;
}

.sort-controls select {
  width: 100%;
  padding: 0.8rem 1.2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #333;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  appearance: none;
  -webkit-appearance: none;
}

.dark-mode .sort-controls select {
  background: rgba(32, 31, 31, 0.826);
  color: #ffffff;
}

.sort-controls::after {
  content: '\f0d7';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  position: absolute;
  right: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #333;
}

.dark-mode .sort-controls::after {
  color: #fff;
}

.sort-controls select:focus {
  outline: none;
  border-color: #e50914;
  box-shadow: 0 0 0 2px rgba(229, 9, 20, 0.2);
}

/* Empty State */
.empty-state {
  height: calc(100vh - 250px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 3rem;
  text-align: center;
}

.empty-state i {
  font-size: 4rem;
  background: linear-gradient(45deg, #e50914, #ff758c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.2));
}

.empty-state p {
  font-size: 1.2rem;
  color: #666;
}

.dark-mode .empty-state p {
  color: #999;
}

.browse-link {
  padding: 1rem 2rem;
  background: linear-gradient(45deg, #e50914, #ff758c);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(229, 9, 20, 0.3);
}

.browse-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(229, 9, 20, 0.4);
}

/* Movie Grid */
.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 200px));
  gap: 2rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  min-height: calc(100vh - 250px);
}

/* Movie Card */
.movie-card {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.movie-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.poster-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.poster-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.movie-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.7) 50%,
    transparent 100%
  );
  color: white;
  transform: translateY(0);
  transition: transform 0.3s ease;
}

.movie-info h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.rating, .date {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  opacity: 0.9;
}

.remove-btn {
  width: 100%;
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  background: rgba(229, 9, 20, 0.9);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background: #e50914;
  transform: translateY(-2px);
}

/* Media Queries */
@media (max-width: 768px) {
  .wishlist {
    padding: 1rem;
  }

  .wishlist-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .wishlist-header h1 {
    font-size: 2rem;
  }

  .sort-controls {
    width: 100%;
  }

  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
    padding: 1rem;
  }

  .empty-state {
    padding: 2rem 1rem;
  }
}

@media (max-width: 480px) {
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .browse-link {
    padding: 0.8rem 1.5rem;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.movie-card {
  animation: fadeIn 0.3s ease;
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