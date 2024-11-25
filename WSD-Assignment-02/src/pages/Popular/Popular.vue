<template>
  <div :class="['popular', { 'dark-mode': themeStore.isDarkMode }]">
    <!-- 헤더 -->
    <div class="header">
      <h1>대세 콘텐츠</h1>
      <div class="view-toggle">
        <button 
          :class="{ active: viewMode === 'table' }"
          @click="viewMode = 'table'"
        >
          <i class="fas fa-th"></i> Grid View
        </button>
        <button 
          :class="{ active: viewMode === 'grid' }"
          @click="viewMode = 'grid'"
        >
          <i class="fas fa-table"></i> Table View
        </button>
      </div>
    </div>

    <!-- 테이블 뷰 (카드 레이아웃) -->
    <div v-if="viewMode === 'table'" class="table-view">
      <div class="movie-grid">
        <div 
          v-for="movie in paginatedMovies" 
          :key="movie.id" 
          class="movie-card"
        >
          <div class="poster-wrapper">
            <img :src="getImageUrl(movie.poster_path)" :alt="movie.title">
            <div class="movie-info">
              <h3>{{ movie.title }}</h3>
              <p>⭐ {{ movie.vote_average.toFixed(1) }}</p>
              <p class="release-date">{{ formatDate(movie.release_date) }}</p>
            </div>
            <button 
              class="heart-icon-btn"
              @click.stop="toggleWishlist(movie)"
              :class="{ active: isWishlisted(movie.id) }"
            >
              <i class="fas"
                :class="isWishlisted(movie.id) ? 'fa-heart' : 'fa-heart-o'"
              ></i>
            </button>
          </div>
        </div>
      </div>
      <!-- 페이지네이션 -->
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">
          <i class="fas fa-chevron-left"></i>
        </button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- 그리드 뷰 (1열 테이블 + 무한 스크롤) -->
    <div v-else class="grid-view" @scroll="handleScroll" ref="gridContainer">
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
      <!-- 로딩 인디케이터 -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>로딩 중...</p>
      </div>
    </div>

    <!-- 맨 위로 가기 버튼 (그리드 뷰에서만 표시) -->
    <button 
      v-if="viewMode === 'grid'"
      class="scroll-top" 
      @click="scrollToTop"
      :class="{ visible: showScrollTop }"
    >
      <i class="fas fa-arrow-up"></i>
    </button>
  </div>
</template>
  
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
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
const showScrollTop = ref(false)

// 반응형 페이지 사이즈 관리
const getPageSize = () => {
  const width = window.innerWidth
  if (width >= 1920) return 3
  if (width >= 1280) return 3
  if (width >= 768) return 3
  return 3
}

const pageSize = ref(getPageSize())

// 윈도우 리사이즈 이벤트 핸들러
const handleResize = () => {
  const newPageSize = getPageSize()
  if (pageSize.value !== newPageSize) {
    pageSize.value = newPageSize
    if (viewMode.value === 'table') {
      loadMovies(1)
    }
  }
}

// 테이블 뷰용 페이지네이션된 데이터
const paginatedMovies = computed(() => {
  if (viewMode.value === 'table') {
    const start = (currentPage.value - 1) * pageSize.value
    return movies.value.slice(start, start + pageSize.value)
  }
  return movies.value
})

// 총 페이지 수 계산
const calculateTotalPages = (totalItems: number) => {
  return Math.ceil(totalItems / pageSize.value)
}

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
    if (viewMode.value === 'table') {
      movies.value = response.data.results
      totalPages.value = calculateTotalPages(response.data.total_results)
    } else {
      if (append) {
        movies.value = [...movies.value, ...response.data.results]
      } else {
        movies.value = response.data.results
      }
      totalPages.value = response.data.total_pages
    }
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

  // 스크롤 위치에 따른 맨 위로 가기 버튼 표시/숨김
  showScrollTop.value = container.scrollTop > 200

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
  const container = viewMode.value === 'grid' ? gridContainer.value : window
  if (container) {
    container.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

// 라이프사이클 훅
onMounted(() => {
  loadMovies(1)
  window.addEventListener('resize', handleResize)
  if (gridContainer.value) {
    gridContainer.value.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (gridContainer.value) {
    gridContainer.value.removeEventListener('scroll', handleScroll)
  }
})

// 뷰 모드가 변경될 때마다 첫 페이지로 리셋
watch(viewMode, () => {
  movies.value = []
  currentPage.value = 1
  showScrollTop.value = false
  loadMovies(1)
})
</script>
  
<style scoped>
/* Base Styles */
.popular {
  min-height: 100vh;
  width: 100vw;  /* 변경 */
  margin-left: calc(-50vw + 50%);  /* 추가 */
  margin-right: calc(-50vw + 50%); /* 추가 */
  padding: 20px max(4%, calc((100vw - 1920px) / 2));
  background: var(--background-light);
  color: var(--text-light);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.dark-mode.popular {
  background: var(--background-dark);
  color: var(--text-dark);
  --text-dark: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
}

/* Modern Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

.header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(to right, var(--primary-color), #ff758c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.3rem;
  border-radius: 12px;
  backdrop-filter: blur(4px);
}

.view-toggle button {
  padding: 0.7rem 1.2rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-light);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-toggle button.active {
  background: var(--primary-color);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(229, 9, 20, 0.3);
}

/* Table View Styles */
.table-view {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 160px); /* 헤더 + 여백 고려 */
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  overflow: hidden;
}

.table-container {
  flex: 1;
  min-height: 0; /* 추가: flexbox 내에서 오버플로우 동작을 위해 필요 */
  padding: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* Table Styles */
table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed; /* 추가: 컬럼 너비 균등 분배 */
}

th {
  position: sticky;
  top: 0;
  background: rgba(0, 0, 0, 0.2);
  padding: 1.2rem 1.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.9rem;
  color: var(--text-dark);
  z-index: 10;
}

th:first-child { /* 포스터 열 너비 고정 */
  width: 100px;
}

th:last-child { /* 찜하기 열 너비 고정 */
  width: 100px;
}

td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

tr {
  transition: all 0.3s ease;
}

tr:hover td {
  background: rgba(255, 255, 255, 0.05);
}

.poster-cell {
  width: 80px;
}

.poster-cell img {
  width: 60px;
  height: 90px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

tr:hover .poster-cell img {
  transform: scale(1.05);
}

/* Grid View Styles */
.grid-view {
  height: calc(100vh - 120px);  /* 조정 */
  overflow-y: auto;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  scrollbar-width: thin;
  scrollbar-color: var(--primary-color) rgba(255, 255, 255, 0.1);
  margin: 0 -1rem;  /* 추가 */
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  padding-bottom: 2rem;
}

.movie-card {
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  overflow: hidden;
  animation: fadeIn 0.5s ease forwards;
}

.movie-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.poster-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  aspect-ratio: 2/3;
}

.poster-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.movie-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem 1.5rem 1.5rem;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.7) 50%,
    transparent 100%
  );
  transform: translateY(0);
  opacity: 0;
  transition: all 0.4s ease;
}

.movie-card:hover .movie-info {
  opacity: 1;
}

/* Button Styles */
.heart-icon-btn,
.wishlist-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
}

.heart-icon-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  opacity: 0;
}

.movie-card:hover .heart-icon-btn,
.heart-icon-btn.active {
  opacity: 1;
}

.heart-icon-btn:hover,
.wishlist-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.heart-icon-btn i,
.wishlist-btn i {
  color: #ff3b7c;
  font-size: 1.2rem;
  filter: drop-shadow(0 2px 4px rgba(255, 59, 124, 0.3));
  transition: transform 0.3s ease;
}

.heart-icon-btn:hover i,
.wishlist-btn:hover i {
  transform: scale(1.2);
}

.wishlist-btn.active,
.heart-icon-btn.active {
  background: rgba(255, 59, 124, 0.2);
}

/* Pagination */
.pagination {
  margin-top: 0; /* 수정 */
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 0 0 16px 16px;
  position: sticky; /* 추가 */
  bottom: 0; /* 추가 */
  z-index: 10; /* 추가 */
}

.pagination button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-light);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination button:not(:disabled):hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-2px);
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination span {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--text-light);
}

/* Scroll Top Button */
.scroll-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(229, 9, 20, 0.3);
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
  z-index: 1000;
}

.scroll-top.visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.scroll-top:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(229, 9, 20, 0.4);
}

/* Loading States */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  backdrop-filter: blur(4px);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Media Queries */
@media (max-width: 768px) {
  .table-view,
  .grid-view {
    height: calc(100vh - 180px); /* 모바일에서 헤더 높이 고려 */
    margin: 0;
  }

  table {
    width: 100%;
    min-width: auto;  /* 변경 */
  }

  .table-container {
    padding: 0;
  }
}

@media (max-width: 768px) {
  .popular {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    gap: 1.5rem;
    padding: 1rem;
  }

  .header h1 {
    font-size: 2rem;
  }

  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }

  .table-container {
  flex: 1;
  overflow-x: hidden;  /* 변경 */
  padding: 0 1rem;     /* 변경 */
  width: 100%;         /* 추가 */
}

  /* Table Styles */
table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 100%;  /* 추가 */
}


  th, td {
    padding: 0.8rem;
    font-size: 0.9rem;
  }

  .heart-icon-btn,
  .wishlist-btn {
    width: 36px;
    height: 36px;
  }

  .heart-icon-btn i,
  .wishlist-btn i {
    font-size: 1rem;
  }

  .scroll-top {
    bottom: 1rem;
    right: 1rem;
    width: 40px;
    height: 40px;
  }
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