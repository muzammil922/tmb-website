import type { QueryClient } from '@tanstack/react-query';
import api from './api';
import type { Movie } from './shared';

export function prefetchMovieDetail(queryClient: QueryClient, movieId: string) {
  return queryClient.prefetchQuery({
    queryKey: ['movie', movieId],
    queryFn: async () => {
      const { data } = await api.get<Movie>(`/movies/${movieId}`);
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
