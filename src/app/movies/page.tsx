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

const genreTags = ['All Genres', 'Action', 'Sci-Fi', 'Drama', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Horror', 'Romance', 'Thriller', 'Documentary'];

export default function MoviesPage() {
  const [category, setCategory] = useState('trending');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [page, setPage] = useState(1);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const { isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['movies', category, page],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Movie>>(`/movies/${category}?page=${page}&limit=48`);
      const result = res.data;
      if (page === 1) {
        setAllMovies(result.data ?? []);
      } else {
        setAllMovies((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newMovies = (result.data ?? []).filter((m) => !existingIds.has(m.id));
          return [...prev, ...newMovies];
        });
      }
      setTotalPages(result.totalPages ?? 1);
      setTotalResults(result.totalResults ?? 0);
      return result;
    },
    staleTime: 1000 * 60 * 2,
  });

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(1);
    setAllMovies([]);
    setSelectedGenre('All Genres');
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const displayMovies =
    selectedGenre === 'All Genres'
      ? allMovies
      : allMovies.filter((m) =>
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
          {totalResults > 0
            ? `${totalResults.toLocaleString()} movies in the library — stream instantly with zero subscription.`
            : 'Stream movies directly from the library with zero subscription and instant HD playback.'}
        </p>
      </div>

      {/* Primary Category Tabs */}
      <div className="mb-6 flex flex-wrap gap-2.5">
        {categories.map((cat) => {
          const isActive = category === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => handleCategoryChange(cat.key)}
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
      {isLoading && page === 1 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 24 }).map((_, i) => (
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
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {displayMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {/* Load More Button */}
          {selectedGenre === 'All Genres' && page < totalPages && (
            <div className="mt-12 flex flex-col items-center gap-3">
              <p className="text-xs text-zinc-500">
                Showing {allMovies.length.toLocaleString()} of {totalResults.toLocaleString()} movies
              </p>
              <button
                onClick={handleLoadMore}
                disabled={isFetching}
                className="flex items-center gap-2 rounded-xl bg-zinc-800 px-8 py-3 text-sm font-bold text-white transition hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
              >
                {isFetching ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Loading more...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon size={15} className="text-red-400" />
                    <span>Load More Movies</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Loading more overlay at bottom */}
          {isFetching && page > 1 && (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] w-full rounded-xl skeleton-shimmer" />
              ))}
            </div>
          )}
        </>
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
