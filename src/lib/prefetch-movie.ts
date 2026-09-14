import type { QueryClient } from '@tanstack/react-query';
import api from './api';
import { resolvePlaybackUrl, type Movie } from './shared';

export function prefetchMovieDetail(queryClient: QueryClient, movieId: string, tmdbId?: number | null) {
  // 1. Pre-warm movie details
  queryClient.prefetchQuery({
    queryKey: ['movie', movieId],
    queryFn: async () => {
      const { data } = await api.get<Movie>(`/movies/${movieId}`);
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  // 2. Pre-warm stream sources so playback is instant
  const targetTmdbId = tmdbId ?? (!Number.isNaN(Number(movieId)) ? Number(movieId) : null);
  if (targetTmdbId) {
    const sourcesUrl = `/api/player/sources/movie/${targetTmdbId}`;
    queryClient.prefetchQuery({
      queryKey: ['movie-sources', targetTmdbId, sourcesUrl],
      queryFn: async () => {
        const res = await fetch(resolvePlaybackUrl(sourcesUrl));
        return res.json();
      },
      staleTime: 1000 * 60 * 10,
    });
  }
}

export function prefetchTopMovies(queryClient: QueryClient, movies: Movie[]) {
  if (!movies || movies.length === 0) return;
  // Preload top 6 movies on initial site load
  movies.slice(0, 6).forEach((m) => {
    prefetchMovieDetail(queryClient, m.id, m.tmdbId);
  });
}
