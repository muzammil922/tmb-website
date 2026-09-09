'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWatchlistStore } from '@/store/watchlist';
import {
  FilmIcon,
  SearchIcon,
  BookmarkIcon,
  FlameIcon,
} from './icons';

export function Navbar() {
  const pathname = usePathname();
  const watchlist = useWatchlistStore((s) => s.watchlist);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/movies', label: 'Movies' },
    { href: '/search', label: 'Search' },
    {
      href: '/my-list',
      label: 'My List',
      badge: mounted && watchlist.length > 0 ? watchlist.length : null,
    },
  ];

  return (
    <>
      {/* Desktop & Tablet Top Navigation */}
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled ? 'glass-nav py-3.5 shadow-2xl' : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent py-5'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 md:px-12">
          <div className="flex items-center gap-8">
            <Link href="/" className="group flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-lg shadow-red-600/30 transition duration-300 group-hover:scale-105 group-hover:shadow-red-600/50">
                <FilmIcon size={20} />
              </span>
              <span className="text-2xl font-black tracking-wider text-white">
                TMB<span className="text-red-500 font-semibold text-xl ml-1">CINEMA</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition duration-200 ${
                      isActive
                        ? 'bg-white/10 text-white shadow-inner'
                        : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge !== null && link.badge !== undefined && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold text-white shadow-sm">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-zinc-400 backdrop-blur-md transition hover:border-white/25 hover:bg-white/10 hover:text-white"
            >
              <SearchIcon size={15} />
              <span className="hidden sm:inline">Search movies, cast...</span>
              <span className="hidden rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-300 sm:inline">
                /
              </span>
            </Link>

            <Link
              href="/my-list"
              className="relative hidden items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700 hover:shadow-red-600/40 md:flex"
            >
              <BookmarkIcon size={14} filled={mounted && watchlist.length > 0} />
              <span>Saved Movies</span>
              {mounted && watchlist.length > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-black text-red-600">
                  {watchlist.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Maximum Usability on Phones) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#08080c]/95 px-6 py-2.5 backdrop-blur-2xl md:hidden">
        <div className="flex items-center justify-around">
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${
              pathname === '/' ? 'text-red-500' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FlameIcon size={20} />
            <span>Home</span>
          </Link>
          <Link
            href="/movies"
            className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${
              pathname === '/movies' ? 'text-red-500' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FilmIcon size={20} />
            <span>Movies</span>
          </Link>
          <Link
            href="/search"
            className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${
              pathname === '/search' ? 'text-red-500' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <SearchIcon size={20} />
            <span>Search</span>
          </Link>
          <Link
            href="/my-list"
            className={`relative flex flex-col items-center gap-1 text-[11px] font-medium transition ${
              pathname === '/my-list' ? 'text-red-500' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <BookmarkIcon size={20} filled={mounted && watchlist.length > 0} />
            <span>My List</span>
            {mounted && watchlist.length > 0 && (
              <span className="absolute -right-2 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">
                {watchlist.length}
              </span>
            )}
          </Link>
        </div>
      </div>
    </>
  );
}
