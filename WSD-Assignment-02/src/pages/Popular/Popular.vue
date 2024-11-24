<template>
    <div :class="['popular', { 'dark-mode': themeStore.isDarkMode }]">
      <div class="header">
        <h1>대세 콘텐츠</h1>
        <div class="view-toggle">
          <button 
            :class="{ active: viewMode === 'table' }"
            @click="viewMode = 'table'"
          >
            <i class="fas fa-table"></i> Table View
          </button>
          <button 
            :class="{ active: viewMode === 'grid' }"
            @click="viewMode = 'grid'"
          >
            <i class="fas fa-th"></i> Grid View
          </button>
        </div>
      </div>
  
      <!-- Table View -->
      <div v-if="viewMode === 'table'" class="table-view">
        <table>
          <thead>
            <tr>
              <th>포스터</th>
              <th>제목</th>
              <th>개봉일</th>
              <th>평점</th>
              <th>찜하기</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="movie in movies" :key="movie.id">
              <td class="poster-cell">
                <img :src="getImageUrl(movie.poster_path)" :alt="movie.title">
              </td>
              <td>{{ movie.title }}</td>
              <td>{{ formatDate(movie.release_date) }}</td>
              <td>⭐ {{ movie.vote_average.toFixed(1) }}</td>
              <td>
                <button 
                  class="wishlist-btn"
                  @click="toggleWishlist(movie)"
                  :class="{ active: isWishlisted(movie.id) }"
                >
                  <i class="fas" :class="isWishlisted(movie.id) ? 'fa-heart' : 'fa-heart-o'"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- 페이지네이션 -->
        <div class="pagination">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <span>{{ currentPage }} / {{ totalPages }}</span>
          <button 
            @click="nextPage"
            :disabled="currentPage === totalPages"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
  
      <!-- Grid View (무한 스크롤) -->
      <div v-else class="grid-view" @scroll="handleScroll" ref="gridContainer">
        <div class="movie-grid">
          <div 
            v-for="movie in movies" 
            :key="movie.id" 
            class="movie-card"
            @click="toggleWishlist(movie)"
          >
            <div class="poster-wrapper">
              <img :src="getImageUrl(movie.poster_path)" :alt="movie.title">
              <div class="movie-info">
                <h3>{{ movie.title }}</h3>
                <p>⭐ {{ movie.vote_average.toFixed(1) }}</p>
                <p class="release-date">{{ formatDate(movie.release_date) }}</p>
                <i 
                  class="fas heart-icon"
                  :class="isWishlisted(movie.id) ? 'fa-heart' : 'fa-heart-o'"
                ></i>
              </div>
            </div>
          </div>
        </div>
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>로딩 중...</p>
        </div>
        <button v-if="viewMode === 'grid'" class="scroll-top" @click="scrollToTop">
          <i class="fas fa-arrow-up"></i>
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { watch } from 'vue'
  import { ref, onMounted, onUnmounted } from 'vue'
  import { tmdbApi } from '../../services/tmdb'
  import { useThemeStore } from '@/stores/themeStore'
  import type { Movie } from '../../types/tmdb'

  const themeStore = useThemeStore()
  
  const viewMode = ref<'table' | 'grid'>('table')
  const movies = ref<Movie[]>([])
  const currentPage = ref(1)
  const totalPages = ref(1)
  const loading = ref(false)
  const gridContainer = ref<HTMLElement | null>(null)
  const wishlisted = ref<number[]>(JSON.parse(localStorage.getItem('wishlisted') || '[]'))
  
  // 이미지 URL 생성
  const getImageUrl = (path: string | null) => {
    return tmdbApi.getImageUrl(path, 'w500')
  }
  
  // 날짜 포맷
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR')
  }
  
  // 영화 데이터 로드
  const loadMovies = async (page: number, append = false) => {
    if (loading.value) return
    
    loading.value = true
    try {
      const response = await tmdbApi.getPopularMovies(page)
      if (append) {
        movies.value = [...movies.value, ...response.data.results]
      } else {
        movies.value = response.data.results
      }
      totalPages.value = response.data.total_pages
      currentPage.value = page
    } catch (error) {
      console.error('Failed to load movies:', error)
    } finally {
      loading.value = false
    }
  }
  
  // 페이지네이션 (Table View)
  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      loadMovies(currentPage.value + 1)
    }
  }
  
  const prevPage = () => {
    if (currentPage.value > 1) {
      loadMovies(currentPage.value - 1)
    }
  }
  
  // 무한 스크롤 (Grid View)
  const handleScroll = async () => {
    if (viewMode.value !== 'grid' || loading.value) return
    
    const container = gridContainer.value
    if (!container) return
  
    const { scrollTop, clientHeight, scrollHeight } = container
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      if (currentPage.value < totalPages.value) {
        await loadMovies(currentPage.value + 1, true)
      }
    }
  }
  
  // 위시리스트 관련
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
  
  // 맨 위로 스크롤
  const scrollToTop = () => {
    if (gridContainer.value) {
      gridContainer.value.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }
  
  onMounted(() => {
    loadMovies(1)
  })
  
  // 뷰 모드가 변경될 때마다 첫 페이지로 리셋
  watch(viewMode, () => {
    movies.value = []
    currentPage.value = 1
    loadMovies(1)
  })
  </script>
  
  <style scoped>
  .popular {
    min-height: 100vh;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    margin-right: calc(-50vw + 50%);
    padding: 20px max(4%, calc((100vw - 1920px) / 2));
    background: var(--background-light);
    color: var(--text-light);
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  
  .dark-mode.popular {
    background: var(--background-dark);
    color: var(--text-dark);
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .header h1 {
    color: var(--text-light);
    transition: color 0.3s ease;
  }
  
  .dark-mode .header h1 {
    color: var(--text-dark);
  }
  
  .view-toggle {
    display: flex;
    gap: 1rem;
  }
  
  .view-toggle button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background: var(--surface-light);
    color: var(--text-light);
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .dark-mode .view-toggle button {
    background: var(--surface-dark);
    color: var(--text-dark);
  }
  
  .view-toggle button.active {
    background: var(--primary-color);
    color: white;
  }
  
  /* Table View Styles */
  .table-view {
    width: 100%;
    background: var(--surface-light);
    border-radius: 8px;
    overflow: hidden;
    transition: background-color 0.3s ease;
  }
  
  .dark-mode .table-view {
    background: var(--surface-dark);
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid var(--border-light);
    color: var(--text-light);
    transition: all 0.3s ease;
  }
  
  .dark-mode th,
  .dark-mode td {
    border-bottom-color: var(--border-dark);
    color: var(--text-dark);
  }
  
  th {
    background: var(--surface-light);
    font-weight: bold;
  }
  
  .dark-mode th {
    background: var(--surface-dark);
  }
  
  .poster-cell img {
    width: 50px;
    height: 75px;
    object-fit: cover;
    border-radius: 4px;
  }
  
  .wishlist-btn {
    background: none;
    border: none;
    color: var(--text-light);
    opacity: 0.7;
    cursor: pointer;
    font-size: 1.2rem;
    transition: all 0.3s ease;
  }
  
  .dark-mode .wishlist-btn {
    color: var(--text-dark);
  }
  
  .wishlist-btn.active {
    color: var(--primary-color);
    opacity: 1;
  }
  
  /* Grid View Styles */
  .grid-view {
    height: calc(100vh - 200px);
    overflow-y: auto;
    width: 100%;
    padding: 1rem;
    background: var(--background-light);
    transition: background-color 0.3s ease;
  }
  
  .dark-mode .grid-view {
    background: var(--background-dark);
  }
  
  .movie-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 2rem;
    width: 100%;
  }
  
  .movie-card {
    position: relative;
    transition: transform 0.3s ease;
    cursor: pointer;
  }
  
  .movie-card:hover {
    transform: scale(1.05);
  }
  
  .poster-wrapper {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.3s ease;
  }
  
  .dark-mode .poster-wrapper {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
    transition: transform 0.3s ease;
  }
  
  .movie-info h3,
  .movie-info p {
    color: white;
    margin: 0;
    margin-bottom: 0.5rem;
  }
  
  .heart-icon {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 1.5rem;
    color: var(--primary-color);
    filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
    transition: all 0.3s ease;
  }
  
  /* Pagination */
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--surface-light);
    transition: background-color 0.3s ease;
  }
  
  .dark-mode .pagination {
    background: var(--surface-dark);
  }
  
  .pagination button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background: var(--surface-light);
    color: var(--text-light);
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .dark-mode .pagination button {
    background: var(--surface-dark);
    color: var(--text-dark);
  }
  
  .pagination button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* Loading Spinner */
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    gap: 1rem;
    color: var(--text-light);
    transition: color 0.3s ease;
  }
  
  .dark-mode .loading {
    color: var(--text-dark);
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--surface-light);
    border-top: 4px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  .dark-mode .spinner {
    border-color: var(--surface-dark);
    border-top-color: var(--primary-color);
  }
  
  /* Scroll Top Button */
  .scroll-top {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--primary-color);
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }
  
  .scroll-top:hover {
    transform: translateY(-5px);
    background: var(--primary-hover);
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    .movie-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
    }
  
    .header {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }
  
    th, td {
      padding: 0.5rem;
      font-size: 0.9rem;
    }
  
    .poster-cell img {
      width: 40px;
      height: 60px;
    }
  }
  </style>