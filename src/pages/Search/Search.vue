<template>
  <div class="search">
    <div class="search-header">
      <h1>찾아보기</h1>
      <div class="search-bar">
        <div class="search-input-container">
          <input 
            type="text" 
            v-model="searchQuery" 
            @input="handleSearch"
            @focus="handleFocus"
            placeholder="영화 제목을 입력하세요..."
          >
          <!-- 최근 검색어 드롭다운 -->
          <div v-if="showRecentSearches && recentSearches.length > 0" class="recent-searches">
            <div class="recent-header">
              <h4>최근 검색어</h4>
              <button class="clear-all" @click="clearSearches">
                전체 삭제
              </button>
            </div>
            <ul>
              <li v-for="(search, index) in recentSearches" :key="index">
                <span class="search-item" @click="selectSearch(search)">
                  <i class="fas fa-history"></i>
                  {{ search }}
                </span>
                <button class="remove-search" @click.stop="removeSearch(search)">
                  <i class="fas fa-times"></i>
                </button>
              </li>
            </ul>
          </div>
        </div>
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
        <h3>언어</h3>
        <div class="language-options">
          <button
            class="language-btn"
            :class="{ active: selectedLanguage === 'all' }"
            @click="selectedLanguage = 'all'"
          >
            전체
          </button>
          <button
            class="language-btn"
            :class="{ active: selectedLanguage === 'ko' }"
            @click="selectedLanguage = 'ko'"
          >
            한국어
          </button>
          <button
            class="language-btn"
            :class="{ active: selectedLanguage === 'en' }"
            @click="selectedLanguage = 'en'"
          >
            영어
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
        <button class="reset-btn" @click="() => resetFilters()">
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
  import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
  import { tmdbApi } from '../../services/tmdb'
  import type { Movie, Genre } from '../../types/tmdb'
  import { debounce } from 'lodash'
  
  // 상태 관리
  const searchQuery = ref('')
  const movies = ref<Movie[]>([])
  const filteredMoviesCache = ref<Movie[]>([])
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
  const recentSearches = ref<string[]>(JSON.parse(localStorage.getItem('recentSearches') || '[]'))
  const showRecentSearches = ref(false)
  const selectedLanguage = ref<string>('all')
  
  // 이미지 URL 생성
  const getImageUrl = (path: string | null) => {
    return tmdbApi.getImageUrl(path, 'w500')
  }
  
  // 날짜 포맷
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR')
  }
  
  // 필터 조건 확인 함수
  const moviePassesFilters = (movie: Movie) => {
    // 장르 필터
    if (selectedGenres.value.length && 
        !selectedGenres.value.every(genreId => movie.genre_ids.includes(genreId))) {
      return false
    }
    // 평점 필터
    if (movie.vote_average < minRating.value) {
      return false
    }
    // 언어 필터
    if (selectedLanguage.value !== 'all' && 
        movie.original_language !== selectedLanguage.value) {
      return false
    }
    return true
  }
  
  // 필터링된 영화 목록
  const filteredMovies = computed(() => {
    return movies.value.filter(moviePassesFilters)
  })
  
  // 검색어 저장
  const saveSearch = (query: string) => {
    if (!query.trim()) return
    
    const searches = recentSearches.value
    const index = searches.indexOf(query)
    if (index > -1) {
      searches.splice(index, 1)
    }
    
    searches.unshift(query)
    
    if (searches.length > 10) {
      searches.pop()
    }
    
    localStorage.setItem('recentSearches', JSON.stringify(searches))
  }
  
  // 검색어 삭제
  const removeSearch = (query: string) => {
    const searches = recentSearches.value
    const index = searches.indexOf(query)
    if (index > -1) {
      searches.splice(index, 1)
      localStorage.setItem('recentSearches', JSON.stringify(searches))
    }
  }
  
  // 검색어 전체 삭제
  const clearSearches = () => {
    recentSearches.value = []
    localStorage.setItem('recentSearches', JSON.stringify([]))
  }
  
  // 검색어 클릭시 검색 실행
  const selectSearch = (query: string) => {
    searchQuery.value = query
    showRecentSearches.value = false
    handleSearch()
  }
  
  // 검색 함수
  const handleSearch = debounce(async () => {
    currentPage.value = 1
    movies.value = []
    filteredMoviesCache.value = []
    await searchMovies()
  
    if (searchQuery.value.trim()) {
      saveSearch(searchQuery.value.trim())
    }
    showRecentSearches.value = false
  }, 500)
  
  // 입력창 포커스시 최근 검색어 표시
  const handleFocus = () => {
    if (recentSearches.value.length > 0) {
      showRecentSearches.value = true
    }
  }
  
  // 입력창 외부 클릭시 최근 검색어 숨기기
  const handleClickOutside = (event: MouseEvent) => {
    const searchBar = document.querySelector('.search-bar')
    if (searchBar && !searchBar.contains(event.target as Node)) {
      showRecentSearches.value = false
    }
  }
  
  // 영화 검색 API 호출
  const searchMovies = async (loadMore = false) => {
    if (loading.value) return
    
    loading.value = true
    try {
      let response
      if (searchQuery.value.trim()) {
        response = await tmdbApi.searchMovies(searchQuery.value, currentPage.value)
      } else {
        response = await tmdbApi.getPopularMovies(currentPage.value)
      }
  
      const newMovies = response.data.results.filter(moviePassesFilters)
      
      if (currentPage.value === 1) {
        movies.value = response.data.results
        filteredMoviesCache.value = newMovies
      } else {
        movies.value = [...movies.value, ...response.data.results]
        filteredMoviesCache.value = [...filteredMoviesCache.value, ...newMovies]
      }
      
      totalPages.value = response.data.total_pages
  
      // 필터링된 결과가 20개 미만일 경우 계속 로드
      if (!loadMore) {  // 초기 로드나 필터 적용시에만
        while (
          filteredMoviesCache.value.length < 20 && // 20개 미만이고
          currentPage.value < totalPages.value // 더 로드할 페이지가 있을 때
        ) {
          currentPage.value++
          if (searchQuery.value.trim()) {
            response = await tmdbApi.searchMovies(searchQuery.value, currentPage.value)
          } else {
            response = await tmdbApi.getPopularMovies(currentPage.value)
          }
          const additionalMovies = response.data.results.filter(moviePassesFilters)
          movies.value = [...movies.value, ...response.data.results]
          filteredMoviesCache.value = [...filteredMoviesCache.value, ...additionalMovies]
        }
      }
    } catch (error) {
      console.error('Failed to search movies:', error)
    } finally {
      loading.value = false
    }
  }
  
  // 검색어 watch
  watch(searchQuery, (newVal, oldVal) => {
    if (newVal !== oldVal) {  // 검색어가 변경되었을 때
      currentPage.value = 1
      movies.value = []
      filteredMoviesCache.value = []
      
      if (!newVal) {
        handleSearch()
      }
    }
  })
  
  // 필터 관련 watch
  watch(
    [selectedGenres, minRating, selectedLanguage],
    () => {
      currentPage.value = 1
      movies.value = []
      filteredMoviesCache.value = []
      searchMovies()
    }
  )
  
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
    selectedLanguage.value = 'all'
    
    // 필터 초기화 후 첫 페이지부터 다시 로드
    currentPage.value = 1
    movies.value = []
    filteredMoviesCache.value = []
    searchMovies()
  }
  
  // 필터 적용
  const applyFilters = () => {
    isFilterOpen.value = false
    // 필터 적용 시 첫 페이지부터 다시 로드
    currentPage.value = 1
    movies.value = []
    filteredMoviesCache.value = []
    searchMovies()
  }
  
  // 무한 스크롤
  const handleScroll = async () => {
    if (loading.value || currentPage.value >= totalPages.value) return
    
    const container = resultsContainer.value
    if (!container) return
  
    const { scrollTop, clientHeight, scrollHeight } = container
    const threshold = 100 // 스크롤 임계값
    
    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      currentPage.value++
      await searchMovies(true) // 스크롤로 인한 로드는 loadMore를 true로 설정
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
  
  // 장르 목록 로드
  const loadGenres = async () => {
    try {
      const response = await tmdbApi.getGenres()
      genres.value = response.data.genres
    } catch (error) {
      console.error('Failed to load genres:', error)
    }
  }
  
  // 컴포넌트 마운트/언마운트
  onMounted(() => {
    loadGenres()
    searchMovies()
    document.addEventListener('click', handleClickOutside)
  })
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
  
  // sortBy 변경 감지
  watch(sortBy, () => {
    currentPage.value = 1
    movies.value = []
    filteredMoviesCache.value = []
    searchMovies()
  })
  </script>
  
  <style scoped>
  .search {
    min-height: 100vh;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    margin-right: calc(-50vw + 50%);
    padding: 20px max(4%, calc((100vw - 1920px) / 2));
    background: rgba(255, 255, 255, 0.98);
    color: #333;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .dark-mode .search {
    background: #141414;
    color: #fff;
  }
  
  /* Header Styles */
  .search-header {
    position: relative;
    z-index: 2000;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2.5rem;
    padding: 1.5rem 2rem;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  }
  
  .search-header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(to right, #e50914, #ff758c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  /* Search Bar */
  .search-bar {
    display: flex;
    gap: 1rem;
    width: 100%;
  }
  
  .search-input-container {
    flex: 1;
    position: relative;
  }
  
  .search-bar input {
    width: 100%;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: #333;
    font-size: 1rem;
    transition: all 0.3s ease;
  }
  
  .dark-mode .search-bar input {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
  }
  
  .search-bar input:focus {
    outline: none;
    border-color: #e50914;
    box-shadow: 0 0 0 2px rgba(229, 9, 20, 0.2);
  }
  
  /* Filter Toggle Button */
  .filter-toggle {
    padding: 0 1.5rem;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 12px;
    color: #333;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
  }
  
  .dark-mode .filter-toggle {
    color: #fff;
  }
  
  .filter-toggle:hover {
    background: #e50914;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(229, 9, 20, 0.3);
  }
  
  /* Filter Panel */
.filter-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  display: none;
}
  
.filter-panel.is-open {
  display: block;
  animation: fadeIn 0.3s ease;
}

.filter-section {
  margin-bottom: 2rem;
}

.filter-section h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: #333;
  font-weight: 600;
}

/* Genre Tags */
.genre-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.genre-tag {
  padding: 0.6rem 1.2rem;
  border: 2px solid rgba(229, 9, 20, 0.2);
  border-radius: 20px;
  background: transparent;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

.dark-mode .genre-tag {
  color: #fff;
  border-color: rgba(229, 9, 20, 0.4);
}

.genre-tag::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #e50914;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: -1;
}

.genre-tag:hover::before {
  opacity: 0.1;
}

.dark-mode .genre-tag:hover::before {
  opacity: 0.2;
}

.genre-tag.active {
  background: #e50914;
  border-color: #e50914;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(229, 9, 20, 0.3);
}

.genre-tag.active:hover {
  background: #f40612;
  transform: translateY(-1px);
}


.dark-mode .filter-section h3 {
  color: #fff;
}

/* Language Buttons */
.language-options {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.language-btn {
  padding: 0.6rem 1.2rem;
  border: 2px solid rgba(229, 9, 20, 0.2);
  border-radius: 20px;
  background: transparent;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

.dark-mode .language-btn {
  color: #fff;
  border-color: rgba(229, 9, 20, 0.4);
}

.language-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #e50914;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: -1;
}

.language-btn:hover::before {
  opacity: 0.1;
}

.dark-mode .language-btn:hover::before {
  opacity: 0.2;
}

.language-btn.active {
  background: #e50914;
  border-color: #e50914;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(229, 9, 20, 0.3);
}

/* Filter Actions */
.filter-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.reset-btn, .apply-btn {
  flex: 1;
  padding: 0.8rem;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.reset-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #333;
  border: 2px solid rgba(0, 0, 0, 0.1);
}

.dark-mode .reset-btn {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.1);
}

.reset-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.apply-btn {
  background: #e50914;
  color: white;
}

.apply-btn:hover {
  background: #f40612;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(229, 9, 20, 0.3);
}

.language-btn.active:hover {
  background: #f40612;
  transform: translateY(-1px);
}


  /* Results Container */
  .results-container {
    height: calc(100vh - 160px);
    padding: 2rem;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #e50914 rgba(255, 255, 255, 0.1);
  }
  
  .results-container::-webkit-scrollbar {
    width: 8px;
  }
  
  .results-container::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  
  .results-container::-webkit-scrollbar-thumb {
    background: #e50914;
    border-radius: 4px;
  }
  
  /* Movie Grid */
  .movie-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 2rem;
    padding: 1rem;
  }
  
  .movie-card {
  width: 100%;
  height: 240px;
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
  opacity: 0;
  transform: translateY(100%);
  transition: all 0.3s ease;
}
  
  .movie-info h3 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
    line-height: 1.2;
  }
  
  .heart-icon {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(4px);
  color: #e50914;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(-20px);
  z-index: 10;
}

/* 호버 시 효과 */
.movie-card:hover .movie-info {
  opacity: 1;
  transform: translateY(0);
}

.movie-card:hover .heart-icon {
  opacity: 1;
  transform: translateY(0);
}

.heart-icon:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.heart-icon.active {
  color: #e50914;
  animation: heartPop 0.3s ease;
}

@keyframes heartPop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
  
  /* Loading States */
  .loading-state, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    gap: 1.5rem;
    color: #666;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top: 3px solid #e50914;
    border-radius: 50%;
    animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }
  
  /* Scroll Top Button */
  .scroll-top {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #e50914;
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    transition: all 0.3s ease;
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
  
  /* Recent Searches Dropdown */
.recent-searches {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  background: rgba(255, 255, 255, 0.98); /* 라이트모드 배경 */
  border-radius: 12px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  z-index: 3000;
  padding: 0.5rem 0;
}

  
  .dark-mode .recent-searches {
    background: rgba(20, 20, 20, 0.98);
  }
  
  .recent-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .dark-mode .recent-header {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
  
  /* Animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Media Queries */
  @media (max-width: 768px) {
    .search-header {
      padding: 1rem;
    }
  
    .search-header h1 {
      font-size: 2rem;
    }
  
    .search-bar {
      flex-direction: column;
    }
  
    .movie-grid {
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 1rem;
    }
  
    .results-container {
      padding: 1rem;
    }
  }
  
  @media (max-width: 480px) {
    .movie-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }
  }
  </style>