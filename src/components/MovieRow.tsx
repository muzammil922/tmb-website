import { MovieCard } from './MovieCard';
import type { Movie } from '@/lib/shared';

interface MovieRowProps {
  title: string;
  movies: Movie[];
}

export function MovieRow({ title, movies }: MovieRowProps) {
  if (!movies?.length) return null;

  return (
    <section className="mb-10 px-6 md:px-12">
      <h2 className="mb-4 text-xl font-semibold text-white">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}
