import { defineStore } from 'pinia';
import { tmdbApi } from '../services/tmdb';
import type { Movie, Genre } from '../types/tmdb';

interface MovieState {
 popularMovies: Movie[];
 nowPlayingMovies: Movie[];
 topRatedMovies: Movie[];
 upcomingMovies: Movie[];
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
    featuredMovie: null,
    wishlisted: JSON.parse(localStorage.getItem('wishlisted') || '[]'),
    genres: [],
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
    }
  }
});