'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWatchlistStore } from '@/store/watchlist';
import { MovieCard } from '@/components/MovieCard';
import {
  BookmarkIcon,
  HeartIcon,
  ClockIcon,
  TrashIcon,
  FilmIcon,
  PlayIcon,
} from '@/components/icons';

export default function MyListPage() {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'history' | 'favorites'>('watchlist');
  const [mounted, setMounted] = useState(false);

  const {
    watchlist,
    favorites,
    history,
    removeFromWatchlist,
    removeFromFavorites,
    removeFromHistory,
    clearHistory,
  } = useWatchlistStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 pb-20 pt-28 md:px-12">
      {/* Page Title & Stats */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-500">
            <BookmarkIcon size={16} filled />
            <span>Personal Library</span>
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white md:text-5xl">
            My Library &amp; Saved
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            All your saved titles and playback history are preserved locally in your browser. No login required.
          </p>
        </div>

        {activeTab === 'history' && history.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-red-600/20 hover:text-red-400"
          >
            <TrashIcon size={15} />
            <span>Clear Watch History</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-8 flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition ${
            activeTab === 'watchlist'
              ? 'border-red-600 text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BookmarkIcon size={16} filled={activeTab === 'watchlist'} />
          <span>Watchlist</span>
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300 font-semibold">
            {watchlist.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition ${
            activeTab === 'history'
              ? 'border-red-600 text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ClockIcon size={16} />
          <span>Continue Watching</span>
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300 font-semibold">
            {history.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition ${
            activeTab === 'favorites'
              ? 'border-red-600 text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <HeartIcon size={16} filled={activeTab === 'favorites'} />
          <span>Favorites</span>
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300 font-semibold">
            {favorites.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Watchlist */}
      {activeTab === 'watchlist' && (
        <div>
          {watchlist.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {watchlist.map((movie) => (
                <div key={movie.id} className="relative group">
                  <MovieCard movie={movie} />
                  <button
                    onClick={() => removeFromWatchlist(movie.id)}
                    title="Remove from My List"
                    className="absolute top-2 left-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/80 text-zinc-400 opacity-0 transition group-hover:opacity-100 hover:bg-red-600 hover:text-white"
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-400">
                <BookmarkIcon size={28} />
              </div>
              <h3 className="mt-4 text-xl font-bold text-white">Your Watchlist is empty</h3>
              <p className="mt-1 max-w-sm text-xs text-zinc-400">
                Tap &ldquo;+ My List&rdquo; on any movie card or detail page to bookmark movies you want to watch later.
              </p>
              <Link
                href="/movies"
                className="mt-6 flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-700 transition"
              >
                <FilmIcon size={15} />
                <span>Explore Movies</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: History (Continue Watching) */}
      {activeTab === 'history' && (
        <div>
          {history.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {history.map((item) => (
                <div
                  key={item.movie.id}
                  className="flex items-center gap-4 rounded-xl border border-white/5 bg-zinc-900/60 p-3 shadow-md backdrop-blur-md transition hover:border-white/20"
                >
                  <div className="w-24 flex-shrink-0">
                    <MovieCard movie={item.movie} size="sm" progress={item.progress} />
                  </div>
                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div>
                      <h4 className="font-bold text-white text-sm line-clamp-1">
                        {item.movie.title}
                      </h4>
                      <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
                        <span>{item.progress}% watched</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <Link
                        href={`/movies/${item.movie.id}?play=1`}
                        className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition"
                      >
                        <PlayIcon size={12} />
                        <span>Resume</span>
                      </Link>
                      <button
                        onClick={() => removeFromHistory(item.movie.id)}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition"
                        title="Remove"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-400">
                <ClockIcon size={28} />
              </div>
              <h3 className="mt-4 text-xl font-bold text-white">No watch history yet</h3>
              <p className="mt-1 max-w-sm text-xs text-zinc-400">
                When you stream movies on TMB, your playback progress will automatically appear here so you can resume anytime.
              </p>
              <Link
                href="/"
                className="mt-6 flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-700 transition"
              >
                <PlayIcon size={15} />
                <span>Start Watching Now</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Favorites */}
      {activeTab === 'favorites' && (
        <div>
          {favorites.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {favorites.map((movie) => (
                <div key={movie.id} className="relative group">
                  <MovieCard movie={movie} />
                  <button
                    onClick={() => removeFromFavorites(movie.id)}
                    title="Remove from Favorites"
                    className="absolute top-2 left-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/80 text-zinc-400 opacity-0 transition group-hover:opacity-100 hover:bg-rose-600 hover:text-white"
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800/80 text-rose-500">
                <HeartIcon size={28} filled />
              </div>
              <h3 className="mt-4 text-xl font-bold text-white">No favorites marked yet</h3>
              <p className="mt-1 max-w-sm text-xs text-zinc-400">
                Click the heart icon on any movie to bookmark your all-time favorite films.
              </p>
              <Link
                href="/movies"
                className="mt-6 flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-700 transition"
              >
                <FilmIcon size={15} />
                <span>Explore Movies</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
