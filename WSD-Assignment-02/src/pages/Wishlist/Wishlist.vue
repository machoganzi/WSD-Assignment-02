```vue
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
import { tmdbApi } from '../../services/tmdb'
import type { Movie } from '../../types/tmdb'

const wishedMovies = ref<Movie[]>([])
const sortBy = ref('date')

// 이미지 URL 생성
const getImageUrl = (path: string | null) => {
  return tmdbApi.getImageUrl(path, 'w500')
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
  const wishlisted = JSON.parse(localStorage.getItem('wishlisted') || '[]')
  const newWishlisted = wishlisted.filter((id: number) => id !== movieId)
  localStorage.setItem('wishlisted', JSON.stringify(newWishlisted))
  wishedMovies.value = wishedMovies.value.filter(movie => movie.id !== movieId)
}

// 찜한 영화 데이터 로드
const loadWishedMovies = async () => {
  const wishlisted = JSON.parse(localStorage.getItem('wishlisted') || '[]')
  const movies: Movie[] = []

  for (const movieId of wishlisted) {
    try {
      const response = await tmdbApi.getMovieDetails(movieId)
      movies.push(response.data)
    } catch (error) {
      console.error(`Failed to load movie ${movieId}:`, error)
    }
  }

  wishedMovies.value = movies
}

onMounted(() => {
  loadWishedMovies()
})
</script>

<style scoped>
.wishlist {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.wishlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.sort-controls select {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #333;
  color: white;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  gap: 1rem;
  color: #666;
}

.empty-state i {
  font-size: 3rem;
  color: #e50914;
}

.browse-link {
  padding: 0.8rem 1.5rem;
  background: #e50914;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.3s;
}

.browse-link:hover {
  background: #f40612;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
}

.movie-card {
  position: relative;
  transition: transform 0.3s;
}

.movie-card:hover {
  transform: scale(1.05);
}

.poster-wrapper {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.poster-wrapper img {
  width: 100%;
  aspect-ratio: 2/3;
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
  margin-bottom: 0.5rem;
}

.rating, .date {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  opacity: 0.8;
}

.remove-btn {
  width: 100%;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  background: #e50914;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background 0.3s;
}

.remove-btn:hover {
  background: #f40612;
}

@media (max-width: 768px) {
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .wishlist-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .sort-controls {
    width: 100%;
  }

  .sort-controls select {
    width: 100%;
  }
}
</style>
```