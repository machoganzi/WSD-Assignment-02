import axios from 'axios';
import type { MovieResponse, GenreResponse } from '../types/tmdb';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_TMDB_BASE_URL,
  params: {
    api_key: import.meta.env.VITE_TMDB_API_KEY,
    language: 'ko-KR'
  }
});

export const tmdbApi = {
  // 인기 영화 목록
  getPopularMovies: (page = 1) => 
    apiClient.get<MovieResponse>('/movie/popular', { params: { page } }),

  // 현재 상영작 목록
  getNowPlaying: (page = 1) =>
    apiClient.get<MovieResponse>('/movie/now_playing', { params: { page } }),

  // 영화 검색
  searchMovies: (query: string, page = 1) =>
    apiClient.get<MovieResponse>('/search/movie', { params: { query, page } }),

  // 장르 목록
  getGenres: () =>
    apiClient.get<GenreResponse>('/genre/movie/list'),

  // 이미지 URL 생성
  getImageUrl: (path: string, size: string = 'original') =>
    path ? `${import.meta.env.VITE_TMDB_IMAGE_BASE_URL}/${size}${path}` : null
};

export const IMAGE_SIZES = {
  poster: {
    small: 'w342',
    medium: 'w500',
    large: 'w780',
    original: 'original'
  },
  backdrop: {
    small: 'w780',
    medium: 'w1280',
    large: 'original'
  }
};