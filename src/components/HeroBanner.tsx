'use client';

import Link from 'next/link';
import { getTmdbImageUrl, type Movie } from '@/lib/shared';

interface HeroBannerProps {
  movie: Movie;
}

export function HeroBanner({ movie }: HeroBannerProps) {
  const backdrop = getTmdbImageUrl(movie.backdropPath, 'original');

  return (
    <section className="relative h-[70vh] min-h-[500px] w-full">
      {backdrop && (
        <img src={backdrop} alt={movie.title} className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/30" />
      <div className="relative flex h-full max-w-7xl flex-col justify-end px-6 pb-24 md:px-12">
        <h1 className="mb-4 max-w-2xl text-4xl font-bold text-white md:text-6xl">{movie.title}</h1>
        {movie.overview && (
          <p className="mb-6 max-w-xl line-clamp-3 text-gray-300">{movie.overview}</p>
        )}
        <div className="flex gap-4">
          <Link
            href={`/movies/${movie.id}`}
            className="flex items-center gap-2 rounded bg-white px-6 py-2.5 font-semibold text-black hover:bg-gray-200"
          >
            ▶ Play Now
          </Link>
          <Link
            href={`/movies/${movie.id}`}
            className="flex items-center gap-2 rounded bg-gray-500/50 px-6 py-2.5 font-semibold text-white backdrop-blur hover:bg-gray-500/70"
          >
            ℹ More Info
          </Link>
        </div>
      </div>
    </section>
  );
}
