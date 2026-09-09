'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { MovieCard } from './MovieCard';
import type { Movie } from '@/lib/shared';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  subtitle?: string;
  viewAllHref?: string;
}

export function MovieRow({ title, movies, subtitle, viewAllHref = '/movies' }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeftArrow(scrollLeft > 20);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
  };

  useEffect(() => {
    checkScroll();
  }, [movies]);

  const scroll = (direction: 'left' | 'right') => {
    if (!rowRef.current) return;
    const { clientWidth } = rowRef.current;
    const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
    rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  };

  if (!movies?.length) return null;

  return (
    <section className="group/row relative mb-12 px-6 md:px-12">
      {/* Row Header */}
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">{title}</h2>
          {subtitle && <p className="mt-1 text-xs text-zinc-400">{subtitle}</p>}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-xs font-semibold text-zinc-400 transition hover:text-red-500 hover:underline"
          >
            Explore All &rarr;
          </Link>
        )}
      </div>

      {/* Row Container with arrows */}
      <div className="relative">
        {/* Left Scroll Button */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll Left"
            className="absolute -left-4 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/80 p-2.5 text-white shadow-xl backdrop-blur-md transition duration-200 hover:scale-110 hover:bg-red-600 md:flex"
          >
            <ChevronLeftIcon size={20} />
          </button>
        )}

        {/* Right Scroll Button */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll Right"
            className="absolute -right-4 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/80 p-2.5 text-white shadow-xl backdrop-blur-md transition duration-200 hover:scale-110 hover:bg-red-600 md:flex"
          >
            <ChevronRightIcon size={20} />
          </button>
        )}

        {/* Scrollable Track */}
        <div
          ref={rowRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-hide scroll-smooth"
        >
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </section>
  );
}
