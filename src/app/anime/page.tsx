'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { SeriesCard } from '@/components/SeriesCard';
import type { Series } from '@/lib/shared';
import { SparklesIcon, FlameIcon, StarIcon } from '@/components/icons';

const categories = [
  { key: 'all', label: 'All Anime', icon: SparklesIcon },
  { key: 'anime', label: 'Top Anime', icon: FlameIcon },
  { key: 'trending', label: 'Trending Anime', icon: StarIcon },
];

export default function AnimePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['anime-catalog', selectedCategory, search, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', '36');
      params.append('type', 'ANIME');
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get(`/series?${params.toString()}`);
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  const animeList: Series[] = data?.data || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="min-h-screen px-6 pb-20 pt-28 md:px-12">
      {/* Header section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
          <SparklesIcon size={16} />
          <span>Japanese & Global Anime</span>
        </div>
        <h1 className="mt-1 text-3xl font-extrabold text-white md:text-4xl">
          Anime Series & Movies
        </h1>
        <p className="mt-1.5 max-w-xl text-sm text-zinc-400">
          Stream the most popular anime series with Japanese audio, English subs, and full seasons in crystal-clear HD.
        </p>
      </div>

      {/* Category tabs & Search bar */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const active = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.key);
                  setPage(1);
                }}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                  active
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-white/5'
                }`}
              >
                <Icon size={13} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search anime..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-full border border-white/10 bg-zinc-900 px-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Anime Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] w-full rounded-xl skeleton-shimmer" />
          ))}
        </div>
      ) : animeList.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <span className="text-4xl">⛩️</span>
          <h3 className="mt-3 text-lg font-bold text-white">No Anime Found</h3>
          <p className="mt-1 text-xs text-zinc-400">
            More anime releases are coming soon! You can also search for your favorite titles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {animeList.map((item) => (
            <SeriesCard key={item.id} series={item} size="md" />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-full border border-white/10 bg-zinc-900 px-5 py-2 text-xs font-semibold text-white disabled:opacity-40 hover:bg-zinc-800 transition"
          >
            Previous
          </button>
          <span className="text-xs text-zinc-400">
            Page <span className="font-bold text-white">{page}</span> of{' '}
            <span className="font-bold text-white">{totalPages}</span>
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full border border-white/10 bg-zinc-900 px-5 py-2 text-xs font-semibold text-white disabled:opacity-40 hover:bg-zinc-800 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
