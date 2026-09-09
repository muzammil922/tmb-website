'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { MovieCard } from '@/components/MovieCard';
import type { Movie, PaginatedResponse } from '@/lib/shared';
import { SearchIcon, CloseIcon, FlameIcon } from '@/components/icons';

const POPULAR_SEARCHES = [
  'Dune',
  'Oppenheimer',
  'Deadpool',
  'Batman',
  'Spider-Man',
  'Sci-Fi',
  'Action',
  'Interstellar',
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  const handleSearch = (value: string) => {
    setQuery(value);
    const win = window as Window & { _searchTimeout?: ReturnType<typeof setTimeout> };
    if (win._searchTimeout) clearTimeout(win._searchTimeout);
    win._searchTimeout = setTimeout(() => setDebounced(value.trim()), 250);
  };

  const handleClear = () => {
    setQuery('');
    setDebounced('');
  };

  // Live search query to real backend API
  const { data: searchResultsData, isLoading } = useQuery({
    queryKey: ['search', debounced],
    queryFn: async () => {
      if (!debounced) return { data: [] as Movie[] };
      const res = await api.get<{ data: Movie[] }>(`/search?q=${encodeURIComponent(debounced)}`);
      return res.data;
    },
    enabled: debounced.length > 0,
  });

  // Trending recommendations when search is empty (from real database)
  const { data: trendingData } = useQuery({
    queryKey: ['movies', 'trending-suggestions'],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Movie>>('/movies/trending');
      return res.data;
    },
    enabled: debounced.length === 0,
    staleTime: 1000 * 60 * 5,
  });

  const searchResults = searchResultsData?.data ?? [];
  const trendingRecommendations = trendingData?.data?.slice(0, 5) ?? [];

  return (
    <div className="min-h-screen px-6 pb-20 pt-28 md:px-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          Search Movies &amp; Actors
        </h1>
        <p className="mb-8 text-sm text-zinc-400">
          Find your favorite blockbusters, franchises, actors, or genres instantly from the database.
        </p>

        {/* Big Search Input Field */}
        <div className="relative mb-6">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-zinc-400">
            <SearchIcon size={22} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by title, genre, or cast (e.g. Dune, Action, Cillian Murphy)..."
            autoFocus
            className="w-full rounded-2xl border border-white/10 bg-zinc-900/90 py-4 pl-14 pr-12 text-base text-white placeholder-zinc-500 shadow-2xl backdrop-blur-xl outline-none transition focus:border-red-500/80 focus:ring-2 focus:ring-red-600/30"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400 hover:text-white"
            >
              <CloseIcon size={20} />
            </button>
          )}
        </div>

        {/* Quick Search Suggestion Chips */}
        <div className="mb-10 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
            <FlameIcon size={14} className="text-red-500" />
            <span>Popular Searches:</span>
          </span>
          {POPULAR_SEARCHES.map((item) => (
            <button
              key={item}
              onClick={() => handleSearch(item)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Skeleton Loading Grid */}
        {isLoading && debounced && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[2/3] w-full rounded-xl skeleton-shimmer" />
                <div className="mt-2 h-3.5 w-3/4 rounded skeleton-shimmer" />
                <div className="mt-1 h-2.5 w-1/2 rounded skeleton-shimmer" />
              </div>
            ))}
          </div>
        )}

        {/* Search Results */}
        {debounced && !isLoading && (
          <div>
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-white">
                Results for &quot;<span className="text-red-400">{debounced}</span>&quot;
              </h2>
              <span className="text-xs font-semibold text-zinc-400">
                {searchResults.length} movie{searchResults.length === 1 ? '' : 's'} found
              </span>
            </div>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {searchResults.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-4xl">🔍</span>
                <h3 className="mt-4 text-lg font-bold text-white">No movies found</h3>
                <p className="mt-1 text-xs text-zinc-400">
                  We couldn&apos;t find any results for &quot;{debounced}&quot; in the database.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Real Trending recommendations from database when search is empty */}
        {!debounced && trendingRecommendations.length > 0 && (
          <div>
            <h2 className="mb-6 text-lg font-bold text-white">
              Trending From The Library
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {trendingRecommendations.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
