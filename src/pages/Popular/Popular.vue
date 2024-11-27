<template>
  <div :class="['popular', { 'dark-mode': themeStore.isDarkMode }]">
    <!-- 헤더 영역 -->
    <div class="header">
      <h1>대세 콘텐츠</h1>
      <div class="view-toggle">
        <button 
          :class="{ active: viewMode === 'grid' }"
          @click="viewMode = 'grid'"
        >
          <i class="fas fa-th"></i> Card View
        </button>
        <button 
          :class="{ active: viewMode === 'table' }"
          @click="viewMode = 'table'"
        >
          <i class="fas fa-table"></i> Table View
        </button>
      </div>
    </div>

    <!-- 카드 뷰 (그리드 형태 + 페이지네이션) -->
    <div v-if="viewMode === 'grid'" class="grid-view">
      <div class="movie-grid" ref="movieGrid">
        <div 
          v-for="movie in paginatedMovies" 
          :key="movie.id" 
          class="movie-card"
        >
          <div class="poster-wrapper">
            <img :src="getImageUrl(movie.poster_path ?? null)" :alt="movie.title">
            <div class="movie-info">
              <h3>{{ movie.title }}</h3>
              <div class="movie-details">
                <p class="rating">⭐ {{ movie.vote_average.toFixed(1) }}</p>
                <p class="release-date">{{ formatDate(movie.release_date) }}</p>
              </div>
            </div>
            <button 
              class="heart-icon-btn"
              @click.stop="toggleWishlist(movie)"
              :class="{ active: isWishlisted(movie.id) }"
            >
              <i class="fas" :class="isWishlisted(movie.id) ? 'fa-heart' : 'fa-heart-o'"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- 페이지네이션 -->
      <div class="pagination">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="page-btn"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- 테이블 뷰 (무한 스크롤) -->
    <div 
      v-else 
      class="table-view" 
      @scroll="handleScroll" 
      ref="tableContainer"
    >
      <table>
        <thead>
          <tr>
            <th class="poster-col">포스터</th>
            <th class="title-col">제목</th>
            <th class="date-col">개봉일</th>
            <th class="rating-col">평점</th>
            <th class="wishlist-col">찜하기</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="movie in movies" :key="movie.id">
            <td class="poster-cell">
              <img :src="getImageUrl(movie.poster_path ?? null)" :alt="movie.title">
            </td>
            <td class="title-cell">{{ movie.title }}</td>
            <td>{{ formatDate(movie.release_date) }}</td>
            <td class="rating-cell">⭐ {{ movie.vote_average.toFixed(1) }}</td>
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

      <!-- 무한 스크롤 로딩 인디케이터 -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>로딩 중...</p>
      </div>
    </div>

    <!-- 맨 위로 가기 버튼 -->
    <button 
      :class="['scroll-top', { visible: showScrollTop }]"
      @click="scrollToTop"
    >
      <i class="fas fa-arrow-up"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { tmdbApi } from '@/services/tmdb'
import { useThemeStore } from '@/stores/themeStore'
import type { Movie } from '@/types/tmdb'

const themeStore = useThemeStore()
const viewMode = ref<'grid' | 'table'>('grid')
const movies = ref<Movie[]>([])
const currentPage = ref(1)
const totalPages = ref(1)
const loading = ref(false)
const tableContainer = ref<HTMLElement | null>(null)
const movieGrid = ref<HTMLElement | null>(null)
const showScrollTop = ref(false)
const wishlisted = ref<number[]>(JSON.parse(localStorage.getItem('wishlisted') || '[]'))

// 화면 크기에 따른 동적 페이지 사이즈 계산
const calculatePageSize = () => {
 const gridElement = movieGrid.value;
 if (!gridElement) return 30;

 const gridWidth = gridElement.offsetWidth;
 const gridGap = 32; // gap: 2rem = 32px
 const minCardWidth = 130;

 // 한 행에 들어갈 수 있는 최대 카드 수 계산
 const columnsPerRow = Math.floor((gridWidth + gridGap) / (minCardWidth + gridGap));
 
 // 3행으로 고정하고 열 수에 따라 총 카드 수 계산
 return columnsPerRow * 3;
}

const pageSize = ref(calculatePageSize())

// 페이지네이션된 영화 목록
const paginatedMovies = computed(() => {
 if (viewMode.value === 'grid') {
   const start = (currentPage.value - 1) * pageSize.value;
   return movies.value.slice(start, start + pageSize.value);
 }
 return movies.value;
})

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
    if (append) {
      // 테이블 뷰의 무한 스크롤
      const response = await tmdbApi.getPopularMovies(page)
      movies.value = [...movies.value, ...response.data.results]
      totalPages.value = response.data.total_pages
    } else {
      // 그리드 뷰의 페이지네이션 - 200개 데이터 로드
      const totalMovies = 200
      const moviesPerPage = 20 // TMDB API가 페이지당 20개 영화를 반환
      const pagesToFetch = Math.ceil(totalMovies / moviesPerPage)
      
      // 여러 페이지의 데이터를 동시에 요청
      const promises = Array.from({ length: pagesToFetch }, (_, i) => 
        tmdbApi.getPopularMovies(i + 1)
      )
      
      const responses = await Promise.all(promises)
      
      // 모든 응답의 결과를 하나의 배열로 합침
      movies.value = responses.flatMap(response => response.data.results)
        .slice(0, totalMovies) // 정확히 200개만 유지
      
      totalPages.value = Math.ceil(totalMovies / pageSize.value)
    }
    currentPage.value = page
  } catch (error) {
    console.error('Failed to load movies:', error)
  } finally {
    loading.value = false
  }
}

// 페이지네이션 (그리드 뷰)
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

// 무한 스크롤 (테이블 뷰)
const handleScroll = async () => {
  if (viewMode.value !== 'table' || loading.value) return
  
  const container = tableContainer.value
  if (!container) return

  // 스크롤 위치에 따라 버튼 표시/숨김
  showScrollTop.value = container.scrollTop > 200

  // 무한 스크롤 로직
  const { scrollTop, clientHeight, scrollHeight } = container
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    if (currentPage.value < totalPages.value) {
      await loadMovies(currentPage.value + 1, true)
    }
  }
}

// 맨 위로 스크롤
const scrollToTop = () => {
 const container = viewMode.value === 'table' ? tableContainer.value : window
 if (container) {
   container.scrollTo({
     top: 0,
     behavior: 'smooth'
   })
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

// 윈도우 리사이즈 이벤트 핸들러
const handleResize = () => {
 const newPageSize = calculatePageSize()
 if (pageSize.value !== newPageSize) {
   pageSize.value = newPageSize
   if (viewMode.value === 'grid') {
     loadMovies(1)
   }
 }
}

// 라이프사이클 훅
onMounted(() => {
 loadMovies(1)
 window.addEventListener('resize', handleResize)
 if (viewMode.value === 'table') {
   tableContainer.value?.addEventListener('scroll', handleScroll)
 }
})

onUnmounted(() => {
 window.removeEventListener('resize', handleResize)
 if (tableContainer.value) {
   tableContainer.value.removeEventListener('scroll', handleScroll)
 }
})

// 뷰 모드 변경 시 데이터 초기화
watch(viewMode, () => {
 movies.value = []
 currentPage.value = 1
 showScrollTop.value = false
 pageSize.value = calculatePageSize()
 loadMovies(1)
})
</script>

<style scoped>
/* Base Variables */
:root {
 /* 라이트 모드 */
  --background-light: #ffffff;
  --text-light: #333333;
  --text-secondary-light: #666666;
  --page-text-light: #555555;
  --surface-light: rgba(255, 255, 255, 0.1);
  --border-light: rgba(0, 0, 0, 0.1);
  
 /* 다크 모드 */
  --background-dark: #141414;
  --text-dark: #ffffff;
  --text-secondary-dark: #cccccc;
  --page-text-dark: #e0e0e0;
  --surface-dark: rgba(255, 255, 255, 0.1);
  --border-dark: rgba(255, 255, 255, 0.2);
}

/* Base Styles */
.popular {
  min-height: 100vh;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
  padding: 20px max(4%, calc((100vw - 1920px) / 2));
  background: var(--background-light);
  color: var(--text-dark);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dark-mode.popular {
  background: var(--background-dark);
  color: var(--text-dark);
}

/* Header Styles */
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

/* View Toggle Button */
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

/* Grid View Styles */
.grid-view {
  height: calc(100vh - 160px);
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  grid-auto-rows: 160px; /* 카드 높이로 고정 */
  justify-content: center;
  gap: 1.5rem;
  padding: 1rem;
  overflow: hidden;
  height: calc(100% - 80px);
}

/* Movie Card Styles */
.movie-card {
  width: 130px;
  height: 160px;
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
  overflow: hidden;
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
  padding: 0.8rem;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.7) 50%,
    transparent 100%
  );
  opacity: 0;
  transform: translateY(100%);
  transition: all 0.3s ease;
}

.movie-card:hover .movie-info {
  opacity: 1;
}

.movie-info h3 {
  font-size: 0.9rem;
  line-height: 1.2;
  margin-bottom: 0.3rem;
}

.movie-details {
  font-size: 0.8rem;
}


.movie-info .movie-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
}

/* Table View Styles */
.table-view {
  height: calc(100vh - 160px);
  overflow-y: auto;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  scrollbar-width: thin;
  scrollbar-color: var(--primary-color) rgba(255, 255, 255, 0.1);
}

.table-view::-webkit-scrollbar {
  width: 8px;
}

.table-view::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.table-view::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 4px;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
}

th {
  position: sticky;
  top: 0;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.8rem 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.9rem;
  color: var(--text-dark);
  z-index: 10;
}

td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

/* Column widths */
.poster-col { width: 60px; min-width: 60px; }
.title-col { width: auto; min-width: 200px; }
.date-col { width: 100px; min-width: 100px; }
.rating-col { width: 80px; min-width: 80px; }
.wishlist-col { width: 60px; min-width: 60px; }

.poster-cell img {
  width: 40px;
  height: 60px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

tr:hover .poster-cell img {
  transform: scale(1.1);
}

/* Heart Icons & Wishlist Buttons */
.heart-icon-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
  opacity: 0;
  transform: translateY(-20px);
  z-index: 10;
}

.movie-card:hover .movie-info {
  opacity: 1;
  transform: translateY(0);
}

/* Keep Heart Icon Visible if Active */
.heart-icon-btn.active {
  opacity: 1;
  transform: translateY(0);
}

/* Heart Icon Hover Effects */
.heart-icon-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.heart-icon-btn:hover i {
  transform: scale(1.2);
  filter: drop-shadow(0 2px 4px rgba(255, 59, 124, 0.3));
}

.movie-card:hover .heart-icon-btn {
  opacity: 1;
  transform: translateY(0);
}

.wishlist-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
}

/* Light mode heart icons */
.heart-icon-btn i,
.wishlist-btn i {
  color: #666666;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.heart-icon-btn.active i,
.wishlist-btn.active i {
  color: #ff3b7c;
}

/* Dark mode heart icons */
.dark-mode .heart-icon-btn i,
.dark-mode .wishlist-btn i {
  color: rgba(255, 255, 255, 0.7);
}

.dark-mode .heart-icon-btn.active i,
.dark-mode .wishlist-btn.active i {
  color: #ff3b7c;
}

.heart-icon-btn.active {
  opacity: 1;
}

.heart-icon-btn:hover,
.wishlist-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.heart-icon-btn:hover i,
.wishlist-btn:hover i {
  transform: scale(1.2);
  filter: drop-shadow(0 2px 4px rgba(255, 59, 124, 0.3));
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  margin-top: auto;
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
  box-shadow: 0 4px 12px rgba(229, 9, 20, 0.3);
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

.dark-mode .pagination span {
  color: var(--page-text-dark);
}

/* Scroll Top Button */
.scroll-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px; /* 크기 증가 */
  height: 56px; /* 크기 증가 */
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem; /* 아이콘 크기 증가 */
  transition: all 0.3s ease, transform 0.4s ease;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
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
  transform: translateY(-10px);
  box-shadow: 0 12px 24px rgba(229, 9, 20, 0.4);
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

.loading p {
  color: var(--text-dark);
  font-weight: 500;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top: 3px solid var(--primary-color);
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
@media (min-width: 1920px) {
  .movie-grid {
    grid-auto-columns: minmax(280px, 1fr);
  }

  .movie-info h3 {
    font-size: 1.4rem;
  }
}

@media (min-width: 1440px) and (max-width: 1919px) {
  .movie-grid {
    grid-auto-columns: minmax(240px, 1fr);
  }
}

@media (min-width: 1024px) and (max-width: 1439px) {
  .movie-grid {
    grid-auto-columns: minmax(220px, 1fr);
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .movie-grid {
    grid-auto-columns: minmax(200px, 1fr);
  }

  .header h1 {
    font-size: 2rem;
  }
  
  th, td {
    padding: 0.6rem 0.8rem;
  }
}

@media (max-width: 767px) {
  .popular {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .header h1 {
    font-size: 1.8rem;
  }

  .movie-grid {
    grid-auto-columns: minmax(160px, 1fr);
    gap: 1rem;
  }

  .movie-info h3 {
    font-size: 1rem;
  } 

  .table-view {
    padding: 0.5rem;
  }

  table {
    font-size: 0.9rem;
  }

  .poster-cell img {
    width: 35px;
    height: 52px;
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

/* Dark Mode Specific */
.dark-mode th {
  background: rgba(255, 255, 255, 0.1);
}

.dark-mode td {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .movie-card {
  background: rgba(255, 255, 255, 0.05);
}

.dark-mode .pagination button {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-dark);
}

.dark-mode .loading p {
  color: var(--text-light);
}

/* Print Styles */
@media print {
  .movie-grid {
    display: block;
  }

  .movie-card {
    page-break-inside: avoid;
    margin-bottom: 2rem;
  }

  .view-toggle,
  .pagination,
  .scroll-top,
  .heart-icon-btn,
  .wishlist-btn {
    display: none;
  }
}
</style>