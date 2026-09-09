'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getTmdbImageUrl, type Movie } from '@/lib/shared';
import { useWatchlistStore } from '@/store/watchlist';
import {
  PlayIcon,
  StarIcon,
  BookmarkIcon,
  InfoIcon,
  CloseIcon,
  SparklesIcon,
} from './icons';

interface HeroBannerProps {
  movie: Movie;
}

export function HeroBanner({ movie }: HeroBannerProps) {
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const backdrop = getTmdbImageUrl(movie.backdropPath, 'original');
  const isInWatchlist = useWatchlistStore((s) => s.isInWatchlist(movie.id));
  const toggleWatchlist = useWatchlistStore((s) => s.toggleWatchlist);

  const year = movie.releaseDate ? movie.releaseDate.split('-')[0] : null;
  const runtimeFormatted = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null;

  return (
    <>
      <section className="relative min-h-[580px] w-full lg:h-[82vh] lg:min-h-[640px]">
        {/* Backdrop Image */}
        {backdrop && (
          <img
            src={backdrop}
            alt={movie.title}
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="eager"
          />
        )}

        {/* Multi-directional Cinema Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-[#08080c]/50 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08080c] via-[#08080c]/85 to-transparent md:w-3/4" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#08080c] to-transparent" />

        {/* Content Container */}
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-20 pt-32 md:px-12 lg:pb-28">
          {/* Spotlight Tag */}
          <div className="mb-3 flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-600/20 px-3 py-1 text-xs font-semibold text-red-400 backdrop-blur-md">
              <SparklesIcon size={13} className="text-red-400" />
              <span>FEATURED PREMIERE</span>
            </span>
            <span className="rounded-md border border-white/10 bg-white/10 px-2 py-0.5 text-xs font-bold text-zinc-300 backdrop-blur-md">
              4K ULTRA HD
            </span>
          </div>

          {/* Title */}
          <h1 className="mb-3 max-w-3xl text-3xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-5xl lg:text-6xl">
            {movie.title}
          </h1>

          {/* Metadata Badges */}
          <div className="mb-4 flex flex-wrap items-center gap-2.5 text-xs font-medium text-zinc-300 md:text-sm">
            {movie.rating != null && (
              <span className="flex items-center gap-1 rounded-md bg-amber-400/15 px-2.5 py-1 font-bold text-amber-400 border border-amber-400/30">
                <StarIcon size={14} className="fill-amber-400" />
                <span>{movie.rating.toFixed(1)} / 10</span>
              </span>
            )}
            {year && (
              <span className="rounded-md bg-white/10 px-2 py-1 text-zinc-200">
                {year}
              </span>
            )}
            {runtimeFormatted && (
              <span className="rounded-md bg-white/10 px-2 py-1 text-zinc-200">
                {runtimeFormatted}
              </span>
            )}
            {movie.genres?.slice(0, 3).map((genre) => (
              <span
                key={genre.id}
                className="rounded-md border border-white/10 bg-black/40 px-2.5 py-1 text-zinc-300"
              >
                {genre.name}
              </span>
            ))}
          </div>

          {/* Overview */}
          {movie.overview && (
            <p className="mb-7 max-w-2xl text-sm leading-relaxed text-zinc-300 line-clamp-3 md:text-base drop-shadow">
              {movie.overview}
            </p>
          )}

          {/* Action Buttons (Ease of use: Watch Now, Trailer, My List, Info) */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/movies/${movie.id}?play=1`}
              className="flex items-center gap-2.5 rounded-xl bg-red-600 px-7 py-3 text-sm font-bold text-white shadow-xl shadow-red-600/40 transition duration-200 hover:scale-105 hover:bg-red-700 hover:shadow-red-600/60"
            >
              <PlayIcon size={18} />
              <span>Watch Now</span>
            </Link>

            {movie.trailerKey && (
              <button
                onClick={() => setShowTrailerModal(true)}
                className="flex items-center gap-2 rounded-xl glass-button px-5 py-3 text-sm font-semibold text-white shadow-md transition"
              >
                <PlayIcon size={16} className="text-red-400" />
                <span>Trailer</span>
              </button>
            )}

            <button
              onClick={() => toggleWatchlist(movie)}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
                isInWatchlist
                  ? 'bg-white text-zinc-900 shadow-lg'
                  : 'glass-button text-white'
              }`}
            >
              <BookmarkIcon size={16} filled={isInWatchlist} />
              <span>{isInWatchlist ? 'In My List' : '+ My List'}</span>
            </button>

            <Link
              href={`/movies/${movie.id}`}
              className="flex items-center gap-1.5 rounded-xl border border-transparent px-4 py-3 text-sm font-semibold text-zinc-400 hover:text-white transition"
            >
              <InfoIcon size={16} />
              <span>Details</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Trailer Modal (Direct In-Page Playback) */}
      {showTrailerModal && movie.trailerKey && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
              <span className="font-semibold text-white truncate">{movie.title} - Official Trailer</span>
              <button
                onClick={() => setShowTrailerModal(false)}
                className="rounded-full bg-white/10 p-1.5 text-zinc-300 hover:bg-white/20 hover:text-white"
              >
                <CloseIcon size={18} />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${movie.trailerKey}?autoplay=1`}
                title={`${movie.title} Trailer`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
