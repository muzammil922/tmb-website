export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'BLOCKED';
export type MovieStatus = 'ACTIVE' | 'DRAFT';
export type MovieSource = 'TMDB' | 'MANUAL';
export type SectionMode = 'AUTO' | 'MANUAL';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Genre {
  id: string;
  tmdbId?: number | null;
  name: string;
}

export interface MovieCast {
  id: string;
  name: string;
  character?: string | null;
  profilePath?: string | null;
}

export interface MoviePlayback {
  mode: 'HOSTED' | 'EMBED' | null;
  available: boolean;
  source: string | null;
  playerUrl: string | null;
  sourcesUrl?: string | null;
}

export interface Movie {
  id: string;
  tmdbId?: number | null;
  title: string;
  originalTitle?: string | null;
  overview?: string | null;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
  runtime?: number | null;
  rating?: number | null;
  voteCount?: number | null;
  language?: string | null;
  status: MovieStatus;
  source: MovieSource;
  featured: boolean;
  videoUrl?: string | null;
  videoProvider?: string | null;
  videoDuration?: number | null;
  trailerKey?: string | null;
  playback?: MoviePlayback;
  genres?: Genre[];
  cast?: MovieCast[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Episode {
  id: string;
  seriesId: string;
  seasonId: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  overview?: string | null;
  stillPath?: string | null;
  airDate?: string | null;
  runtime?: number | null;
  videoUrl?: string | null;
  videoProvider?: string | null;
}

export interface Season {
  id: string;
  seriesId: string;
  seasonNumber: number;
  name?: string | null;
  overview?: string | null;
  posterPath?: string | null;
  episodeCount: number;
  episodes?: Episode[];
}

export interface Series {
  id: string;
  tmdbId?: number | null;
  upstreamId?: string | null;
  title: string;
  originalTitle?: string | null;
  overview?: string | null;
  posterPath?: string | null;
  backdropPath?: string | null;
  firstAirDate?: string | null;
  lastAirDate?: string | null;
  numberOfSeasons?: number | null;
  numberOfEpisodes?: number | null;
  rating?: number | null;
  voteCount?: number | null;
  language?: string | null;
  status: MovieStatus;
  contentType: 'SERIES' | 'ANIME';
  contentSource?: string | null;
  playbackMode?: string | null;
  seasons?: Season[];
  episodes?: Episode[];
  categorySeries?: { category: { id: string; name: string; slug: string } }[];
  genres?: { genre: Genre }[];
  cast?: MovieCast[];
  createdAt?: string;
  updatedAt?: string;
}


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function getApiOrigin() {
  return API_URL.replace(/\/api\/?$/, '');
}

export function resolvePlaybackUrl(playerUrl: string) {
  if (playerUrl.startsWith('http')) return playerUrl;
  return `${getApiOrigin()}${playerUrl}`;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  totalPages: number;
  totalResults: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface HomepageSection {
  id: string;
  title: string;
  type: string;
  order: number;
  isActive: boolean;
  mode: SectionMode;
  config?: Record<string, unknown> | null;
  movies?: Movie[];
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  buttonText?: string | null;
  buttonUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  movies?: Movie[];
}

export interface DashboardStats {
  totalUsers: number;
  totalMovies: number;
  activeUsers: number;
  totalWatchHistory: number;
}

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export type TmdbImageSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'w1280' | 'original';

export function getTmdbImageUrl(path: string | null | undefined, size: TmdbImageSize = 'w500'): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export const API_ROUTES = {
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
    refresh: '/api/auth/refresh',
    me: '/api/auth/me',
  },
  movies: {
    trending: '/api/movies/trending',
    popular: '/api/movies/popular',
    topRated: '/api/movies/top-rated',
    upcoming: '/api/movies/upcoming',
    nowPlaying: '/api/movies/now-playing',
    detail: (id: string) => `/api/movies/${id}`,
    cast: (id: string) => `/api/movies/${id}/cast`,
    videos: (id: string) => `/api/movies/${id}/videos`,
    similar: (id: string) => `/api/movies/${id}/similar`,
    recommendations: (id: string) => `/api/movies/${id}/recommendations`,
    byGenre: (genreId: string) => `/api/movies/genre/${genreId}`,
  },
  genres: '/api/genres',
  search: '/api/search',
  homepage: '/api/homepage',
  watchlist: '/api/watchlist',
  favorites: '/api/favorites',
  history: '/api/history',
  admin: {
    dashboard: '/api/admin/dashboard/stats',
    movies: '/api/admin/movies',
    importTmdb: '/api/admin/movies/import-tmdb',
    tmdbSearch: '/api/admin/tmdb/search',
    homepage: '/api/admin/homepage',
    banners: '/api/admin/banners',
    categories: '/api/admin/categories',
    users: '/api/admin/users',
    mediaUpload: '/api/admin/media/upload-signature',
  },
} as const;
