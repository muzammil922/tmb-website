'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { MovieCard } from '@/components/MovieCard';
import type { Movie } from '@/lib/shared';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  const handleSearch = (value: string) => {
    setQuery(value);
    const win = window as Window & { _searchTimeout?: ReturnType<typeof setTimeout> };
    if (win._searchTimeout) clearTimeout(win._searchTimeout);
    win._searchTimeout = setTimeout(() => setDebounced(value), 300);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['search', debounced],
    queryFn: async () => {
      if (!debounced.trim()) return { data: [] as Movie[] };
      const { data } = await api.get<{ data: Movie[] }>(`/search?q=${encodeURIComponent(debounced)}`);
      return data;
    },
    enabled: debounced.length > 1,
  });

  return (
    <div className="min-h-screen px-6 pt-24 md:px-12">
      <h1 className="mb-6 text-3xl font-bold">Search</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search movies, actors..."
        className="mb-8 w-full max-w-xl rounded bg-zinc-800 px-4 py-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-red-600"
      />
      {isLoading && debounced && (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
        </div>
      )}
      {data?.data && data.data.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {data.data.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : debounced.length > 1 && !isLoading ? (
        <p className="text-gray-400">No results found for &quot;{debounced}&quot;</p>
      ) : null}
      {!debounced && (
        <p className="text-gray-500">Start typing to search movies...</p>
      )}
      <Link href="/movies" className="mt-8 inline-block text-red-500 hover:underline">Browse all movies →</Link>
    </div>
  );
}
