import axios from 'axios'
import type { MovieResponse, GenreResponse } from '../types/tmdb'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_TMDB_BASE_URL,
  params: {
    api_key: import.meta.env.VITE_TMDB_API_KEY,
    language: 'ko-KR'
  }
})

export const tmdbApi = {
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
  getImageUrl: (path: string | null, size: string = 'original'): string | null => {
    if (!path) return null
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