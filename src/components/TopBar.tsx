'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useUiStore } from '@/store/ui';
import { useWatchlistStore } from '@/store/watchlist';
import { SearchIcon, CloseIcon, MenuIcon, BookmarkIcon } from './icons';

function TopBarInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { toggleSidebar } = useUiStore();
  const watchlist = useWatchlistStore((s) => s.watchlist);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync input with url query if changed
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 md:pl-64 ${
        scrolled
          ? 'bg-[#08080c]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/40'
          : 'bg-gradient-to-b from-[#08080c]/85 via-[#08080c]/40 to-transparent'
      }`}
    >
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
        {/* Left Side: Mobile Menu Button + Search Input */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          {/* Mobile hamburger button */}
          <button
            onClick={toggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition md:hidden"
            aria-label="Open navigation menu"
          >
            <MenuIcon size={19} />
          </button>

          {/* Search Box on Left */}
          <form onSubmit={handleSubmit} className="relative flex-1">
            <SearchIcon
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, web series, anime, cast..."
              className="w-full rounded-full border border-white/10 bg-white/[0.06] py-2 pl-9 pr-9 text-xs text-white placeholder-zinc-400 backdrop-blur-md transition duration-200 focus:border-red-500/50 focus:bg-white/[0.1] focus:outline-none focus:ring-1 focus:ring-red-500/40"
            />
            {query ? (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition"
              >
                <CloseIcon size={14} />
              </button>
            ) : (
              <span className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-400">
                ↵
              </span>
            )}
          </form>
        </div>

        {/* Right Side: Quick Watchlist link (Compact) */}
        <div className="flex items-center gap-2 pl-3">
          <Link
            href="/my-list"
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-white/20 hover:bg-white/10 hover:text-white transition"
            title="View saved movies"
          >
            <BookmarkIcon size={14} filled={mounted && watchlist.length > 0} className={mounted && watchlist.length > 0 ? 'text-red-500' : ''} />
            <span className="hidden sm:inline">Saved</span>
            {mounted && watchlist.length > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                {watchlist.length}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function TopBar() {
  return (
    <Suspense fallback={<header className="fixed top-0 left-0 right-0 z-30 h-16 md:pl-64 bg-transparent" />}>
      <TopBarInner />
    </Suspense>
  );
}

