import Link from 'next/link';
import { getTmdbImageUrl, type Movie } from '@/lib/shared';

interface MovieCardProps {
  movie: Movie;
  size?: 'sm' | 'md';
}

export function MovieCard({ movie, size = 'md' }: MovieCardProps) {
  const poster = getTmdbImageUrl(movie.posterPath, size === 'sm' ? 'w185' : 'w342');
  const href = `/movies/${movie.id}`;

  return (
    <Link href={href} className="group flex-shrink-0">
      <div className={`relative overflow-hidden rounded-md bg-zinc-800 transition duration-300 group-hover:scale-105 group-hover:ring-2 group-hover:ring-red-600 ${size === 'sm' ? 'w-32' : 'w-44'}`}>
        {poster ? (
          <img src={poster} alt={movie.title} className={`aspect-[2/3] w-full object-cover ${size === 'sm' ? 'h-48' : 'h-64'}`} />
        ) : (
          <div className={`flex aspect-[2/3] items-center justify-center bg-zinc-700 text-xs text-gray-400 ${size === 'sm' ? 'h-48' : 'h-64'}`}>
            No Image
          </div>
        )}
        {movie.rating != null && (
          <span className="absolute right-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-xs font-semibold text-yellow-400">
            {movie.rating.toFixed(1)}
          </span>
        )}
      </div>
      <p className="mt-2 truncate text-sm text-gray-300 group-hover:text-white">{movie.title}</p>
    </Link>
  );
}
