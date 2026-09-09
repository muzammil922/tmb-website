'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { MovieCard } from '@/components/MovieCard';
import type { Movie, PaginatedResponse } from '@/lib/shared';
import { FilmIcon, FlameIcon, StarIcon, SparklesIcon } from '@/components/icons';

const categories = [
  { key: 'trending', label: 'Trending', icon: FlameIcon },
  { key: 'popular', label: 'Popular', icon: SparklesIcon },
  { key: 'top-rated', label: 'Top Rated', icon: StarIcon },
  { key: 'now-playing', label: 'Now Playing', icon: FilmIcon },
  { key: 'upcoming', label: 'Upcoming', icon: SparklesIcon },
];

const genreTags = ['All Genres', 'Action', 'Sci-Fi', 'Drama', 'Adventure', 'Animation', 'Comedy', 'Crime'];

export default function MoviesPage() {
  const [category, setCategory] = useState('trending');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['movies', category],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Movie>>(`/movies/${category}`);
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  const rawList = data?.data ?? [];
  const displayMovies =
    selectedGenre === 'All Genres'
      ? rawList
      : rawList.filter((m) =>
        m.genres?.some((g) => g.name.toLowerCase() === selectedGenre.toLowerCase())
      );

  return (
    <div className="min-h-screen px-6 pb-20 pt-28 md:px-12">
      {/* Header section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-500">
          <FilmIcon size={16} />
          <span>Live Catalog</span>
        </div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white md:text-5xl">
          Browse Movies
        </h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-400">
          Stream movies directly from the library with zero subscription and instant HD playback.
        </p>
      </div>

      {/* Primary Category Tabs */}
      <div className="mb-6 flex flex-wrap gap-2.5">
        {categories.map((cat) => {
          const isActive = category === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-200 ${isActive
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105'
                : 'glass-panel text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Secondary Genre Filter Pills */}
      <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-white/5 pt-2">
        <span className="text-xs text-zinc-400 font-medium mr-1 whitespace-nowrap">Filter:</span>
        {genreTags.map((g) => {
          const isSelected = selectedGenre === g;
          return (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition ${isSelected
                ? 'bg-white text-zinc-950 font-bold'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
            >
              {g}
            </button>
          );
        })}
      </div>

      {/* Movies Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] w-full rounded-xl skeleton-shimmer" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-4xl">⚠️</span>
          <h3 className="mt-4 text-lg font-bold text-white">Could not load movies from server</h3>
          <p className="mt-1 text-xs text-zinc-400">Please verify backend API connection.</p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-xl bg-red-600 px-5 py-2 text-xs font-semibold text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : displayMovies.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {displayMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-4xl">🎬</span>
          <h3 className="mt-4 text-lg font-bold text-white">No movies found in this category</h3>
          <p className="mt-1 text-xs text-zinc-400">
            {selectedGenre !== 'All Genres'
              ? 'Try selecting a different genre or category.'
              : 'Add movies in the Admin Panel to display them here.'}
          </p>
          {selectedGenre !== 'All Genres' && (
            <button
              onClick={() => setSelectedGenre('All Genres')}
              className="mt-4 rounded-xl bg-red-600 px-5 py-2 text-xs font-semibold text-white hover:bg-red-700"
            >
              Clear Genre Filter
            </button>
          )}
        </div>
      )}
    </div>
  );
}
