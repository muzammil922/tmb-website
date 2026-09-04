'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { MovieCard } from '@/components/MovieCard';
import type { Movie, PaginatedResponse } from '@/lib/shared';
import { useState } from 'react';

const categories = [
  { key: 'trending', label: 'Trending' },
  { key: 'popular', label: 'Popular' },
  { key: 'now-playing', label: 'Now Playing' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'top-rated', label: 'Top Rated' },
];

export default function MoviesPage() {
  const [category, setCategory] = useState('trending');

  const { data, isLoading } = useQuery({
    queryKey: ['movies', category],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Movie>>(`/movies/${category}`);
      return data;
    },
  });

  return (
    <div className="min-h-screen px-6 pb-12 pt-24 md:px-12">
      <h1 className="mb-8 text-3xl font-bold text-white">Movies</h1>
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`rounded-full px-4 py-2 text-sm transition ${
              category === cat.key ? 'bg-red-600 text-white' : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {data?.data?.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
