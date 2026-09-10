'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getTmdbImageUrl, type Series } from '@/lib/shared';
import { PlayIcon, StarIcon } from './icons';

interface SeriesCardProps {
  series: Series;
  size?: 'sm' | 'md' | 'lg';
}

export function SeriesCard({ series, size = 'md' }: SeriesCardProps) {
  const poster = getTmdbImageUrl(series.posterPath, size === 'sm' ? 'w185' : 'w500');
  const href = `/series/${series.id}`;
  const [imgError, setImgError] = useState(false);

  const widthClass =
    size === 'sm' ? 'w-36 md:w-40' : size === 'lg' ? 'w-48 md:w-56' : 'w-40 md:w-48';
  const heightClass =
    size === 'sm' ? 'h-52 md:h-56' : size === 'lg' ? 'h-72 md:h-80' : 'h-60 md:h-72';

  const year = series.firstAirDate ? new Date(series.firstAirDate).getFullYear() : null;
  const isAnime = series.contentType === 'ANIME';

  return (
    <div className={`group relative flex-shrink-0 ${widthClass}`}>
      <Link href={href} className="block">
        <div
          className={`relative overflow-hidden rounded-xl bg-zinc-900 shadow-md transition-all duration-300 ease-out group-hover:scale-[1.04] group-hover:shadow-2xl group-hover:shadow-red-600/20 group-hover:ring-2 group-hover:ring-red-600/70 ${heightClass}`}
        >
          {poster && !imgError ? (
            <img
              src={poster}
              alt={series.title}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-800/80 p-4 text-center">
              <span className="text-2xl">{isAnime ? '⛩️' : '📺'}</span>
              <p className="mt-2 text-xs font-medium text-zinc-400">{series.title}</p>
            </div>
          )}

          {/* Dark gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Top badges */}
          <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1">
            <span className="rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
              {isAnime ? '⛩️ ANIME' : '📺 SERIES'}
            </span>
          </div>

          {/* Rating */}
          {series.rating ? (
            <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 backdrop-blur-sm">
              <StarIcon size={10} />
              <span>{series.rating.toFixed(1)}</span>
            </div>
          ) : null}

          {/* Seasons count pill bottom right */}
          <div className="absolute bottom-2.5 right-2.5 rounded bg-red-600/90 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
            {series.numberOfSeasons || series.seasons?.length || 1}S • {series.numberOfEpisodes || series.episodes?.length || '—'}E
          </div>

          {/* Hover play icon in center */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-xl shadow-red-600/40 transition duration-300 group-hover:scale-110">
              <PlayIcon size={20} />
            </span>
          </div>
        </div>
      </Link>

      {/* Info below card */}
      <div className="mt-2 px-0.5">
        <Link href={href}>
          <h4 className="truncate text-xs font-semibold text-zinc-200 transition group-hover:text-white">
            {series.title}
          </h4>
        </Link>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-zinc-400">
          {year && <span>{year}</span>}
          {series.contentSource && (
            <>
              <span>•</span>
              <span className="text-red-400 font-medium">{series.contentSource}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
