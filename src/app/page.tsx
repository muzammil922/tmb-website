'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { HeroBanner } from '@/components/HeroBanner';
import { MovieRow } from '@/components/MovieRow';
import { MovieCard } from '@/components/MovieCard';
import { useWatchlistStore } from '@/store/watchlist';
import type { HomepageSection, Movie } from '@/lib/shared';
import { ClockIcon, SparklesIcon } from '@/components/icons';

const GENRE_FILTERS = [
  'All',
  'Action',
  'Sci-Fi',
  'Drama',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
];

export default function HomePage() {
  const [selectedGenre, setSelectedGenre] = useState('All');
  const history = useWatchlistStore((s) => s.history);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['homepage'],
    queryFn: async () => {
      const res = await api.get<{ hero: Movie | null; sections: HomepageSection[] }>('/homepage');
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  const heroMovie = data?.hero;
  const sections = data?.sections ?? [];

  // Extract all distinct real movies from hero and sections
  const allMovies: Movie[] = [
    ...(heroMovie ? [heroMovie] : []),
    ...sections.flatMap((s) => s.movies ?? []),
  ].filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);

  const filteredMovies =
    selectedGenre === 'All'
      ? []
      : allMovies.filter((m) =>
          m.genres?.some((g) => g.name.toLowerCase() === selectedGenre.toLowerCase())
        );

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="h-[75vh] w-full skeleton-shimmer" />
        <div className="space-y-8 px-6 pt-12 md:px-12">
          <div className="h-6 w-48 rounded skeleton-shimmer" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 w-44 flex-shrink-0 rounded-xl skeleton-shimmer" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || (!heroMovie && sections.length === 0)) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center pt-24">
        <span className="text-5xl">🎬</span>
        <h2 className="mt-4 text-2xl font-bold text-white">No Movies Available Yet</h2>
        <p className="mt-2 max-w-md text-sm text-zinc-400">
          Movies added in the Admin Portal will appear here in real-time. Make sure backend is running and active movies are published.
        </p>
        <button
          onClick={() => refetch()}
          className="mt-6 rounded-xl bg-red-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-700 transition"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Cinematic Hero Spotlight from Database */}
      {heroMovie && <HeroBanner movie={heroMovie} />}

      {/* Genre Quick Filter Bar */}
      <div className="relative z-10 -mt-8 mb-8 px-6 md:px-12">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <span className="mr-2 hidden items-center gap-1 text-xs font-bold uppercase tracking-wider text-zinc-400 sm:flex">
            <SparklesIcon size={14} className="text-red-500" />
            <span>Quick Filter:</span>
          </span>
          {GENRE_FILTERS.map((genre) => {
            const isActive = selectedGenre === genre;
            return (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 ring-2 ring-red-500/50 scale-105'
                    : 'glass-panel text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>

      {/* If specific genre is selected, display filtered real movies */}
      {selectedGenre !== 'All' && (
        <section className="mb-12 px-6 md:px-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>{selectedGenre} Movies</span>
              <span className="rounded-full bg-red-600/20 px-2.5 py-0.5 text-xs text-red-400 font-bold">
                {filteredMovies.length} Available
              </span>
            </h2>
            <button
              onClick={() => setSelectedGenre('All')}
              className="text-xs font-semibold text-zinc-400 hover:text-white transition"
            >
              Reset Filter &times;
            </button>
          </div>
          {filteredMovies.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-8 text-center">
              <p className="text-sm text-zinc-400">No real movies found in this genre from the admin database.</p>
            </div>
          )}
        </section>
      )}

      {/* Continue Watching Section (Local Storage Progress) */}
      {history.length > 0 && selectedGenre === 'All' && (
        <section className="mb-12 px-6 md:px-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 md:text-2xl">
              <ClockIcon size={20} className="text-red-500" />
              <span>Continue Watching</span>
            </h2>
            <span className="text-xs text-zinc-400 font-medium">Pick up where you left off</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {history.map((item) => (
              <MovieCard
                key={item.movie.id}
                movie={item.movie}
                progress={item.progress}
              />
            ))}
          </div>
        </section>
      )}

      {/* Real CMS Sections configured by Admin */}
      {selectedGenre === 'All' && (
        <div className="space-y-4">
          {sections.map((section) => (
            <MovieRow
              key={section.id}
              title={section.title}
              movies={section.movies ?? []}
              viewAllHref={`/movies?category=${section.type.toLowerCase()}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
