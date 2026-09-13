'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { getTmdbImageUrl, type Movie } from '@/lib/shared';
import { prefetchMovieDetail } from '@/lib/prefetch-movie';
import { useWatchlistStore } from '@/store/watchlist';
import { PlayIcon, StarIcon, BookmarkIcon } from './icons';

interface MovieCardProps {
  movie: Movie;
  size?: 'sm' | 'md' | 'lg';
  progress?: number;
}

export function MovieCard({ movie, size = 'md', progress }: MovieCardProps) {
  const queryClient = useQueryClient();
  const poster = getTmdbImageUrl(movie.posterPath, size === 'sm' ? 'w185' : 'w342');
  const href = `/movies/${movie.id}`;
  const [imgError, setImgError] = useState(false);

  const isInWatchlist = useWatchlistStore((s) => s.isInWatchlist(movie.id));
  const toggleWatchlist = useWatchlistStore((s) => s.toggleWatchlist);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist(movie);
  };

  const widthClass =
    size === 'sm' ? 'w-36 md:w-40' : size === 'lg' ? 'w-48 md:w-56' : 'w-40 md:w-48';
  const heightClass =
    size === 'sm' ? 'h-52 md:h-56' : size === 'lg' ? 'h-72 md:h-80' : 'h-60 md:h-72';

  const year = movie.releaseDate ? movie.releaseDate.split('-')[0] : null;
  const primaryGenre = movie.genres?.[0]?.name;

  return (
    <div
      className={`group relative flex-shrink-0 ${widthClass}`}
      onMouseEnter={() => prefetchMovieDetail(queryClient, movie.id)}
      onFocus={() => prefetchMovieDetail(queryClient, movie.id)}
    >
      <Link href={href} className="block" prefetch>
        <div
          className={`relative overflow-hidden rounded-xl bg-zinc-900 shadow-md transition-all duration-300 ease-out group-hover:scale-[1.04] group-hover:shadow-2xl group-hover:shadow-red-600/20 group-hover:ring-2 group-hover:ring-red-600/70 ${heightClass}`}
        >
          {poster && !imgError ? (
            <img
              src={poster}
              alt={movie.title}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-800/80 p-4 text-center">
              <span className="text-2xl">🎬</span>
              <p className="mt-2 text-xs font-medium text-zinc-400">{movie.title}</p>
            </div>
          )}

          {/* Dark gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Rating Badge */}
          {movie.rating != null && movie.rating > 0 && (
            <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/80 px-2 py-0.5 text-[11px] font-bold text-amber-400 backdrop-blur-md shadow-md border border-amber-400/20">
              <StarIcon size={12} className="text-amber-400 fill-amber-400" />
              <span>{movie.rating.toFixed(1)}</span>
            </div>
          )}

          {/* 4K Badge */}
          <div className="absolute left-2 top-2 rounded bg-zinc-900/80 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-zinc-300 backdrop-blur-md border border-white/10">
            4K UHD
          </div>

          {/* Hover Center Play Action Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 scale-75">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-xl shadow-red-600/50 transition-transform duration-200 hover:scale-110">
              <PlayIcon size={20} className="ml-0.5" />
            </div>
          </div>

          {/* Quick Bookmark Toggle on Card */}
          <button
            onClick={handleBookmarkClick}
            aria-label="Save to My List"
            className={`absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full transition duration-200 ${
              isInWatchlist
                ? 'bg-red-600 text-white opacity-100 shadow-md'
                : 'bg-black/60 text-zinc-300 opacity-0 group-hover:opacity-100 hover:bg-black/90 hover:text-white'
            }`}
          >
            <BookmarkIcon size={15} filled={isInWatchlist} />
          </button>

          {/* Progress Bar for Continue Watching */}
          {progress !== undefined && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-800">
              <div
                className="h-full bg-red-600 rounded-r shadow-[0_0_8px_#e50914]"
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
          )}
        </div>

        {/* Title & Metadata below poster */}
        <div className="mt-2.5 px-0.5">
          <h3 className="truncate text-sm font-semibold text-zinc-200 transition-colors duration-200 group-hover:text-white">
            {movie.title}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
            {year && <span>{year}</span>}
            {year && primaryGenre && <span>&bull;</span>}
            {primaryGenre && <span className="truncate">{primaryGenre}</span>}
          </div>
        </div>
      </Link>
    </div>
  );
}
