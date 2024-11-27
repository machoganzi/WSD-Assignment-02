import { defineStore } from 'pinia';
import { tmdbApi } from '../services/tmdb';
import type { Movie, Genre } from '../types/tmdb';

interface MovieState {
  popularMovies: Movie[];
  nowPlayingMovies: Movie[];
  topRatedMovies: Movie[];
  upcomingMovies: Movie[];
  additionalMovies: Movie[]; // 추가
  featuredMovie: Movie | null;
  wishlisted: number[];
  genres: Genre[];
  loading: boolean;
}

export const useMovieStore = defineStore('movie', {
  state: (): MovieState => ({
    popularMovies: [],
    nowPlayingMovies: [],
    topRatedMovies: [],
    upcomingMovies: [],
    additionalMovies: [], // 추가
    featuredMovie: null,
    wishlisted: JSON.parse(localStorage.getItem('wishlisted') || '[]'),
    genres: [],
    loading: false
  }),

  getters: {
    isWishlisted: (state) => (movieId: number) => {
      return state.wishlisted.includes(movieId);
    },
    // 찜한 영화 목록을 가져오는 getter 추가
    getWishedMovies(): Movie[] {
      const allMovies = [
        ...this.popularMovies,
        ...this.nowPlayingMovies,
        ...this.topRatedMovies,
        ...this.upcomingMovies,
        ...this.additionalMovies
      ]
      
      const uniqueMovies = Array.from(
        new Map(allMovies.map(movie => [movie.id, movie])).values()
      )
      
      return uniqueMovies.filter(movie => this.wishlisted.includes(movie.id))
    }
  },
  actions: {
    async loadMovies() {
      this.loading = true;
      try {
        const [popularRes, nowPlayingRes, topRatedRes, upcomingRes] = await Promise.all([
          tmdbApi.getPopularMovies(),
          tmdbApi.getNowPlaying(),
          tmdbApi.getTopRated(),
          tmdbApi.getUpcoming()
        ]);

        this.popularMovies = popularRes.data.results;
        this.nowPlayingMovies = nowPlayingRes.data.results;
        this.topRatedMovies = topRatedRes.data.results;
        this.upcomingMovies = upcomingRes.data.results;

        const randomIndex = Math.floor(Math.random() * this.popularMovies.length);
        this.featuredMovie = this.popularMovies[randomIndex];

      } catch (error) {
        console.error('Failed to load movies:', error);
      } finally {
        this.loading = false;
      }
    },

    async loadGenres() {
      try {
        const response = await tmdbApi.getGenres();
        this.genres = response.data.genres;
      } catch (error) {
        console.error('Failed to load genres:', error);
      }
    },

    toggleWishlist(movieId: number) {
      const index = this.wishlisted.indexOf(movieId);
      if (index === -1) {
        this.wishlisted.push(movieId);
      } else {
        this.wishlisted.splice(index, 1);
      }
      localStorage.setItem('wishlisted', JSON.stringify(this.wishlisted));
    },

    getImageUrl(path: string | null) {
      if (!path) return '/default-movie-poster.jpg'
      return `https://image.tmdb.org/t/p/w500${path}`
    },
    
    addMovies(newMovies: Movie[]) {
      // 중복 제거를 위해 Map 사용
      const existingMovies = new Map(this.additionalMovies.map(movie => [movie.id, movie]));
      newMovies.forEach(movie => {
        if (!existingMovies.has(movie.id)) {
          existingMovies.set(movie.id, movie);
        }
      });
      this.additionalMovies = Array.from(existingMovies.values());
    }
  }
});