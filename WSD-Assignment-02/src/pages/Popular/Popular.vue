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
              <img :src="getImageUrl(movie.poster_path)" :alt="movie.title">
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

      <!-- 맨 위로 가기 버튼 -->
      <button 
        v-show="showScrollTop"
        class="scroll-top" 
        @click="scrollToTop"
      >
        <i class="fas fa-arrow-up"></i>
      </button>
    </div>
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
const showScrollTop = ref(false)
const wishlisted = ref<number[]>(JSON.parse(localStorage.getItem('wishlisted') || '[]'))

// 그리드 뷰의 페이지당 아이템 수 (3행 x 4열 = 12)
const PAGE_SIZE = 12

// 페이지네이션된 영화 목록
const paginatedMovies = computed(() => {
  if (viewMode.value === 'grid') {
   const start = (currentPage.value - 1) * PAGE_SIZE
    return movies.value.slice(start, start + PAGE_SIZE)
  }
  return movies.value
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
    const response = await tmdbApi.getPopularMovies(page)
    if (append) {
     // 테이블 뷰의 무한 스크롤
      movies.value = [...movies.value, ...response.data.results]
    } else {
     // 그리드 뷰의 페이지네이션
      movies.value = response.data.results
      totalPages.value = Math.ceil(response.data.total_results / PAGE_SIZE)
    }
    currentPage.value = page
  } catch (error) {
    console.error('Failed to load movies:', error)
  } finally {
    loading.value = false
  }
}

// 그리드 뷰 페이지네이션
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

// 테이블 뷰 무한 스크롤
const handleScroll = async () => {
  if (viewMode.value !== 'table' || loading.value) return
 
  const container = tableContainer.value
  if (!container) return

 // 스크롤 위치에 따른 Top 버튼 표시/숨김
  showScrollTop.value = container.scrollTop > 200

 // 무한 스크롤 트리거
  const { scrollTop, clientHeight, scrollHeight } = container
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    if (currentPage.value < totalPages.value) {
      await loadMovies(currentPage.value + 1, true)
    }
  }
}

// 맨 위로 스크롤
const scrollToTop = () => {
  if (tableContainer.value) {
    tableContainer.value.scrollTo({
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

// 스크롤 이벤트 처리
const setupScrollListener = () => {
  if (tableContainer.value) {
    tableContainer.value.addEventListener('scroll', handleScroll)
  }
}

const cleanupScrollListener = () => {
  if (tableContainer.value) {
    tableContainer.value.removeEventListener('scroll', handleScroll)
  }
}

// 라이프사이클 훅
onMounted(() => {
  loadMovies(1)
  setupScrollListener()
})

onUnmounted(() => {
  cleanupScrollListener()
})

// 뷰 모드 변경 시 데이터 초기화
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
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
  padding: 20px max(4%, calc((100vw - 1920px) / 2));
  background: var(--background-light);
  color: var(--text-light);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dark-mode.popular {
  background: var(--background-dark);
  color: var(--text-dark);
  --text-dark: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
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
  display: flex;
  flex-direction: column;
  height: calc(100vh - 160px);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  overflow: hidden;
  gap: 2rem;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  padding: 2rem;
  height: 100%;
  overflow: hidden;
}

/* Movie Card Styles */
.movie-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeIn 0.5s ease forwards;
}

.movie-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.poster-wrapper {
  position: relative;
  aspect-ratio: 2/3;
  width: 100%;
  border-radius: 16px;
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
  padding: 2rem 1.5rem;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.7) 50%,
    transparent 100%
  );
  opacity: 0;
  transition: all 0.4s ease;
}

.movie-card:hover .movie-info {
  opacity: 1;
}

/* Table View Styles */
.table-view {
  height: calc(100vh - 160px);
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  scrollbar-width: thin;
  scrollbar-color: var(--primary-color) rgba(255, 255, 255, 0.1);
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
  padding: 1.2rem 1.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.9rem;
  color: var(--text-dark);
  z-index: 10;
}

td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

/* Column widths */
.poster-col { width: 100px; }
.date-col { width: 120px; }
.rating-col { width: 100px; }
.wishlist-col { width: 100px; }

/* Buttons & Icons */
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

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  margin-top: auto;
}

.pagination button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.3s ease;
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
  animation: spin 1s infinite linear;
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
  .grid-view {
    height: calc(100vh - 180px);
  }

  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
    padding: 1rem;
  }

  .movie-info h3 {
    font-size: 1.2rem;
  }

  table {
    min-width: 700px;
  }

  .heart-icon-btn,
  .wishlist-btn {
    width: 36px;
    height: 36px;
  }
}
</style>