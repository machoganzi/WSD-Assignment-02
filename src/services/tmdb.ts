import axios from 'axios'
import type { Movie, MovieResponse, GenreResponse } from '../types/tmdb'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_TMDB_BASE_URL,
  params: {
    api_key: import.meta.env.VITE_TMDB_API_KEY,
    language: 'ko-KR'
  }
})

export const tmdbApi = {
  // API 키 검증
  validateApiKey: async (apiKey: string): Promise<boolean> => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_TMDB_BASE_URL}/movie/popular`, {
        params: {
          api_key: apiKey,
          language: 'ko-KR',
          page: 1
        }
      });
      
      // 요청이 성공했다면 유효한 API 키
      if (response.status === 200) {
        return true;  // 유효한 API 키
      }

      // 성공적인 응답이 아니면 실패
      throw new Error('API 키가 유효하지 않습니다.');
    } catch (error) {
      // 요청이 실패한 경우 (유효하지 않은 API 키)
      console.error('API 키 검증 실패:', error);
      throw new Error('유효하지 않은 API 키입니다.');
    }
  },

  // 인기 영화 목록
  getPopularMovies: (page = 1) => 
    apiClient.get<MovieResponse>('/movie/popular', { params: { page } }),

  // 현재 상영작 목록
  getNowPlaying: (page = 1) =>
    apiClient.get<MovieResponse>('/movie/now_playing', { params: { page } }),

  // 평점 높은 영화 목록  
  getTopRated: (page = 1) =>
    apiClient.get<MovieResponse>('/movie/top_rated', { params: { page } }),

  // 개봉 예정작 목록
  getUpcoming: (page = 1) =>
    apiClient.get<MovieResponse>('/movie/upcoming', { params: { page } }),

  // 영화 검색
  searchMovies: (query: string, page = 1) =>
    apiClient.get<MovieResponse>('/search/movie', { params: { query, page } }),

  // 장르 목록 
  getGenres: () =>
    apiClient.get<GenreResponse>('/genre/movie/list'),

  // 영화 상세 정보
  getMovieDetails: (movieId: number) =>
    apiClient.get<Movie>(`/movie/${movieId}`),

  // 영화 비디오 정보  
  getMovieVideos: (movieId: number) =>
    apiClient.get(`/movie/${movieId}/videos`),

  // 이미지 URL 생성
  getImageUrl: (path: string | null, size: string = 'original'): string => {
    if (!path) return '/default-movie-poster.jpg'
    return `${import.meta.env.VITE_TMDB_IMAGE_BASE_URL}/${size}${path}`
  }
}

// 이미지 사이즈 상수
export const IMAGE_SIZES = {
  poster: {
    w342: 'w342',
    w500: 'w500',
    w780: 'w780',
    original: 'original'
  },
  backdrop: {
    w780: 'w780',
    w1280: 'w1280',
    original: 'original'
  }
}