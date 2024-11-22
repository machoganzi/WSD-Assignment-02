import { defineStore } from 'pinia';
import { tmdbApi } from '../services/tmdb';
import type { Movie } from '../types/tmdb';

interface MovieState {
  popularMovies: Movie[];
  nowPlayingMovies: Movie[];
  featuredMovie: Movie | null;
  wishlisted: number[];
  loading: boolean;
}

export const useMovieStore = defineStore('movie', {
  state: (): MovieState => ({
    popularMovies: [],
    nowPlayingMovies: [],
    featuredMovie: null,
    wishlisted: JSON.parse(localStorage.getItem('wishlisted') || '[]'),
    loading: false
  }),

  getters: {
    isWishlisted: (state) => (movieId: number) => {
      return state.wishlisted.includes(movieId);
    }
  },

  actions: {
    async loadMovies() {
      this.loading = true;
      try {
        const [popularResponse, nowPlayingResponse] = await Promise.all([
          tmdbApi.getPopularMovies(),
          tmdbApi.getNowPlaying()
        ]);
        
        this.popularMovies = popularResponse.data.results;
        this.nowPlayingMovies = nowPlayingResponse.data.results;
        this.featuredMovie = this.popularMovies[0];
      } catch (error) {
        console.error('Failed to load movies:', error);
      } finally {
        this.loading = false;
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
    }
  }
});