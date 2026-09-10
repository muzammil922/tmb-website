'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWatchlistStore } from '@/store/watchlist';
import { useUiStore } from '@/store/ui';
import {
  FilmIcon,
  FlameIcon,
  TvIcon,
  BookmarkIcon,
  SparklesIcon,
  CloseIcon,
  ShieldIcon,
  FileTextIcon,
  InfoIcon,
} from './icons';

export function Sidebar() {
  const pathname = usePathname();
  const watchlist = useWatchlistStore((s) => s.watchlist);
  const { isSidebarOpen, closeSidebar } = useUiStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  const navLinks = [
    { href: '/', label: 'Home', icon: FlameIcon },
    { href: '/movies', label: 'Movies', icon: FilmIcon },
    { href: '/series', label: 'Web Series', icon: TvIcon },
    { href: '/anime', label: 'Anime', icon: SparklesIcon },
    {
      href: '/my-list',
      label: 'My List',
      icon: BookmarkIcon,
      badge: mounted && watchlist.length > 0 ? watchlist.length : null,
    },
  ];

  const bottomLinks = [
    { href: '/privacy', label: 'Privacy Policy', icon: ShieldIcon },
    { href: '/terms', label: 'Terms of Use', icon: FileTextIcon },
    { href: '/about', label: 'About', icon: InfoIcon },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4 md:p-5">
      {/* Top Brand & Navigation */}
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className="flex items-center justify-between px-2 pt-1">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 text-white shadow-lg shadow-red-600/30 transition duration-300 group-hover:scale-105 group-hover:shadow-red-600/50">
              <svg
                className="h-5 w-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12c3-4 6-4 9 0s6 4 9 0" />
                <path d="M2 7c3-4 6-4 9 0s6 4 9 0" opacity="0.6" />
                <path d="M2 17c3-4 6-4 9 0s6 4 9 0" opacity="0.4" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-black tracking-wider text-white">
                FLOW<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-400">LAB</span>
              </span>
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Streaming Index</p>
            </div>
          </Link>

          {/* Close button for mobile drawer */}
          <button
            onClick={closeSidebar}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Close sidebar"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Primary Navigation Links */}
        <div className="space-y-1">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Menu
          </p>
          <nav className="space-y-1">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600/20 to-rose-600/10 text-white font-semibold border border-red-500/30 shadow-sm shadow-red-950/30'
                      : 'text-zinc-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={isActive ? 'text-red-500' : 'text-zinc-400 group-hover:text-zinc-200 transition'}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== null && item.badge !== undefined && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Section: Legal & Information Links */}
      <div className="space-y-3 pt-4 border-t border-white/[0.06]">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          Legal &amp; Info
        </p>

        <nav className="space-y-0.5">
          {bottomLinks.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition ${
                  isActive
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-zinc-300 hover:bg-white/[0.05] hover:text-zinc-100'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-red-400' : 'text-zinc-400'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pt-2">
          <p className="text-[10px] text-zinc-400 font-medium tracking-tight">
            Flowlab &bull; NetMirror Index
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/[0.06] bg-[#09090f]/95 backdrop-blur-2xl md:flex md:flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-out Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 md:hidden ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop Overlay */}
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={closeSidebar}
        />

        {/* Drawer Panel */}
        <aside
          className={`absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-white/10 bg-[#09090f] shadow-2xl transition-transform duration-300 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </aside>
      </div>
    </>
  );
}
