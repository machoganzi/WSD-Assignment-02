<template>
    <div class="search">
      <div class="search-header">
        <h1>찾아보기</h1>
        <div class="search-bar">
          <input 
            type="text" 
            v-model="searchQuery" 
            @input="handleSearch"
            placeholder="영화 제목을 입력하세요..."
          >
          <button class="filter-toggle" @click="isFilterOpen = !isFilterOpen">
            <i class="fas fa-filter"></i>
            필터
          </button>
        </div>
      </div>
  
      <!-- 필터 패널 -->
      <div class="filter-panel" :class="{ 'is-open': isFilterOpen }">
        <div class="filter-section">
          <h3>장르</h3>
          <div class="genre-tags">
            <button
              v-for="genre in genres"
              :key="genre.id"
              class="genre-tag"
              :class="{ active: selectedGenres.includes(genre.id) }"
              @click="toggleGenre(genre.id)"
            >
              {{ genre.name }}
            </button>
          </div>
        </div>
  
        <div class="filter-section">
          <h3>평점</h3>
          <div class="rating-range">
            <input 
              type="range" 
              v-model="minRating" 
              min="0" 
              max="10" 
              step="0.5"
            >
            <span>{{ minRating }}점 이상</span>
          </div>
        </div>
  
        <div class="filter-section">
          <h3>정렬</h3>
          <select v-model="sortBy">
            <option value="popularity.desc">인기도 높은순</option>
            <option value="popularity.asc">인기도 낮은순</option>
            <option value="vote_average.desc">평점 높은순</option>
            <option value="vote_average.asc">평점 낮은순</option>
            <option value="release_date.desc">최신순</option>
            <option value="release_date.asc">오래된순</option>
          </select>
        </div>
  
        <div class="filter-actions">
          <button class="reset-btn" @click="resetFilters">
            <i class="fas fa-undo"></i> 초기화
          </button>
          <button class="apply-btn" @click="applyFilters">
            <i class="fas fa-check"></i> 적용
          </button>
        </div>
      </div>
  
      <!-- 결과 목록 -->
      <div class="results-container" ref="resultsContainer" @scroll="handleScroll">
        <div v-if="loading && !movies.length" class="loading-state">
          <div class="spinner"></div>
          <p>검색 중...</p>
        </div>
  
        <div v-else-if="!movies.length && searchQuery" class="empty-state">
          <i class="fas fa-search"></i>
          <p>검색 결과가 없습니다</p>
        </div>
  
        <div v-else class="movie-grid">
          <div 
            v-for="movie in filteredMovies" 
            :key="movie.id" 
            class="movie-card"
            @click="toggleWishlist(movie)"
          >
            <div class="poster-wrapper">
              <img :src="getImageUrl(movie.poster_path)" :alt="movie.title">
              <div class="movie-info">
                <h3>{{ movie.title }}</h3>
                <p class="rating">⭐ {{ movie.vote_average.toFixed(1) }}</p>
                <p class="date">{{ formatDate(movie.release_date) }}</p>
                <i 
                  class="fas heart-icon"
                  :class="isWishlisted(movie.id) ? 'fa-heart' : 'fa-heart-o'"
                ></i>
              </div>
            </div>
          </div>
        </div>
  
        <div v-if="loading && movies.length" class="loading-more">
          <div class="spinner"></div>
          <p>더 불러오는 중...</p>
        </div>
      </div>
  
      <button v-show="showScrollTop" class="scroll-top" @click="scrollToTop">
        <i class="fas fa-arrow-up"></i>
      </button>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { tmdbApi } from '../../services/tmdb'
  import type { Movie, Genre } from '../../types/tmdb'
  import { debounce } from 'lodash'
  
  // 상태 관리
  const searchQuery = ref('')
  const movies = ref<Movie[]>([])
  const genres = ref<Genre[]>([])
  const selectedGenres = ref<number[]>([])
  const minRating = ref(0)
  const sortBy = ref('popularity.desc')
  const currentPage = ref(1)
  const totalPages = ref(1)
  const loading = ref(false)
  const isFilterOpen = ref(false)
  const showScrollTop = ref(false)
  const resultsContainer = ref<HTMLElement | null>(null)
  const wishlisted = ref<number[]>(JSON.parse(localStorage.getItem('wishlisted') || '[]'))
  
  // 이미지 URL 생성
  const getImageUrl = (path: string | null) => {
    return tmdbApi.getImageUrl(path, 'w500')
  }
  
  // 날짜 포맷
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR')
  }
  
  // 필터링된 영화 목록
  const filteredMovies = computed(() => {
    return movies.value.filter(movie => {
      // 장르 필터
      if (selectedGenres.value.length && 
          !selectedGenres.value.some(genreId => movie.genre_ids.includes(genreId))) {
        return false
      }
      // 평점 필터
      if (movie.vote_average < minRating.value) {
        return false
      }
      return true
    })
  })
  
  // 검색 함수
  const handleSearch = debounce(async () => {
    if (!searchQuery.value.trim()) return
    
    currentPage.value = 1
    movies.value = []
    await searchMovies()
  }, 500)
  
  // 영화 검색 API 호출
  const searchMovies = async () => {
    loading.value = true
    try {
      const response = await tmdbApi.searchMovies(searchQuery.value, currentPage.value)
      if (currentPage.value === 1) {
        movies.value = response.data.results
      } else {
        movies.value = [...movies.value, ...response.data.results]
      }
      totalPages.value = response.data.total_pages
    } catch (error) {
      console.error('Failed to search movies:', error)
    } finally {
      loading.value = false
    }
  }
  
  // 장르 토글
  const toggleGenre = (genreId: number) => {
    const index = selectedGenres.value.indexOf(genreId)
    if (index === -1) {
      selectedGenres.value.push(genreId)
    } else {
      selectedGenres.value.splice(index, 1)
    }
  }
  
  // 필터 리셋
  const resetFilters = () => {
    selectedGenres.value = []
    minRating.value = 0
    sortBy.value = 'popularity.desc'
  }
  
  // 필터 적용
  const applyFilters = () => {
    isFilterOpen.value = false
    searchMovies()
  }
  
  // 무한 스크롤
  const handleScroll = async () => {
    if (loading.value || currentPage.value >= totalPages.value) return
    
    const container = resultsContainer.value
    if (!container) return
  
    const { scrollTop, clientHeight, scrollHeight } = container
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      currentPage.value++
      await searchMovies()
    }
  
    showScrollTop.value = scrollTop > 500
  }
  
  // 맨 위로 스크롤
  const scrollToTop = () => {
    resultsContainer.value?.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
  
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
  
  // 장르 목록 로드
  const loadGenres = async () => {
    try {
      const response = await tmdbApi.getGenres()
      genres.value = response.data.genres
    } catch (error) {
      console.error('Failed to load genres:', error)
    }
  }
  
  onMounted(() => {
    loadGenres()
  })
  
  // sortBy 변경 감지
  watch(sortBy, () => {
    currentPage.value = 1
    searchMovies()
  })
  </script>
  
  <style scoped>
  .search {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    height: calc(100vh - 70px);
    display: flex;
    flex-direction: column;
  }
  
  .search-header {
    margin-bottom: 2rem;
  }
  
  .search-bar {
    margin-top: 1rem;
    display: flex;
    gap: 1rem;
  }
  
  .search-bar input {
    flex: 1;
    padding: 0.8rem;
    border: none;
    border-radius: 4px;
    background: #333;
    color: white;
    font-size: 1rem;
  }
  
  .filter-toggle {
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 4px;
    background: #e50914;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .filter-panel {
    background: #1a1a1a;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    display: none;
  }
  
  .filter-panel.is-open {
    display: block;
  }
  
  .filter-section {
    margin-bottom: 1.5rem;
  }
  
  .filter-section h3 {
    margin-bottom: 1rem;
    color: #fff;
  }
  
  .genre-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .genre-tag {
    padding: 0.5rem 1rem;
    border: 1px solid #333;
    border-radius: 20px;
    background: none;
    color: white;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  .genre-tag.active {
    background: #e50914;
    border-color: #e50914;
  }
  
  .rating-range {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .rating-range input {
    flex: 1;
  }
  
  select {
    width: 100%;
    padding: 0.8rem;
    background: #333;
    border: none;
    border-radius: 4px;
    color: white;
  }
  
  .filter-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
  }
  
  .reset-btn, .apply-btn {
    flex: 1;
    padding: 0.8rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .reset-btn {
    background: #333;
    color: white;
  }
  
  .apply-btn {
    background: #e50914;
    color: white;
  }
  
  .results-container {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }
  
  .movie-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 2rem;
  }
  
  .movie-card {
    position: relative;
    transition: transform 0.3s;
    cursor: pointer;
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
  
  .heart-icon {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 1.5rem;
    color: #e50914;
    filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
  }
  
  .loading-state, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    gap: 1rem;
    color: #666;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #e50914;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .scroll-top {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #e50914;
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s;
  }
  
  .scroll-top:hover {
    transform: translateY(-5px);
  }
  
  @media (max-width: 768px) {
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .search-bar {
    flex-direction: column;
  }

  .filter-toggle {
    width: 100%;
  }

  .genre-tags {
    gap: 0.25rem;
  }

  .genre-tag {
    font-size: 0.9rem;
    padding: 0.4rem 0.8rem;
  }
}
</style>