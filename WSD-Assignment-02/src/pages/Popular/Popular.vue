<template>
    <div class="popular">
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
  import { ref, onMounted, onUnmounted } from 'vue'
  import { tmdbApi } from '../../services/tmdb'
  import type { Movie } from '../../types/tmdb'
  
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
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .view-toggle {
    display: flex;
    gap: 1rem;
  }
  
  .view-toggle button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background: #333;
    color: white;
    cursor: pointer;
    transition: background 0.3s;
  }
  
  .view-toggle button.active {
    background: #e50914;
  }
  
  /* Table View 스타일 */
  .table-view {
    background: #1a1a1a;
    border-radius: 8px;
    overflow: hidden;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #333;
  }
  
  th {
    background: #2a2a2a;
    font-weight: bold;
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
    color: #777;
    cursor: pointer;
    font-size: 1.2rem;
  }
  
  .wishlist-btn.active {
    color: #e50914;
  }
  
  /* Grid View 스타일 */
  .grid-view {
    height: calc(100vh - 200px);
    overflow-y: auto;
  }
  
  .movie-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 2rem;
    padding: 1rem;
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
  
  /* 페이지네이션 */
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #2a2a2a;
  }
  
  .pagination button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background: #333;
    color: white;
    cursor: pointer;
  }
  
  .pagination button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* 로딩 스피너 */
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    gap: 1rem;
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
  
  /* 스크롤 탑 버튼 */
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