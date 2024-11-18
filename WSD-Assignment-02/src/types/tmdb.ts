export interface Movie {
    id: number
    title: string
    overview: string
    poster_path: string | null
    backdrop_path: string | null
    vote_average: number
    release_date: string
    genre_ids: number[]
    original_language: string;  
  }
  
  export interface MovieResponse {
    page: number
    results: Movie[]
    total_pages: number
    total_results: number
  }
  
  export interface Genre {
    id: number
    name: string
  }
  
  export interface GenreResponse {
    genres: Genre[]
  }