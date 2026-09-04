'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { MovieCard } from '@/components/MovieCard';
import type { Movie } from '@/lib/shared';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  const { data: watchlist } = useQuery({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const { data } = await api.get<{ movie: Movie }[]>('/watchlist');
      return data;
    },
    enabled: !!user,
  });

  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const { data } = await api.get<{ movie: Movie }[]>('/favorites');
      return data;
    },
    enabled: !!user,
  });

  const { data: history } = useQuery({
    queryKey: ['history'],
    queryFn: async () => {
      const { data } = await api.get<{ movie: Movie; progress: number }[]>('/history');
      return data;
    },
    enabled: !!user,
  });

  if (!user) return null;

  return (
    <div className="min-h-screen px-6 pt-24 md:px-12">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-gray-400">{user.email}</p>
        </div>
        <button onClick={logout} className="rounded bg-zinc-800 px-4 py-2 hover:bg-zinc-700">Logout</button>
      </div>

      {history && history.filter((h) => h.progress > 0 && h.progress < 95).length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold">Continue Watching</h2>
          <div className="flex gap-4 overflow-x-auto">
            {history.filter((h) => h.progress > 0 && h.progress < 95).map((h) => (
              <div key={h.movie.id} className="relative flex-shrink-0">
                <MovieCard movie={h.movie} />
                <div className="absolute bottom-8 left-0 right-0 h-1 bg-zinc-700">
                  <div className="h-full bg-red-600" style={{ width: `${h.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Watchlist</h2>
        {watchlist?.length ? (
          <div className="flex gap-4 overflow-x-auto">
            {watchlist.map((w) => <MovieCard key={w.movie.id} movie={w.movie} />)}
          </div>
        ) : (
          <p className="text-gray-500">No movies in watchlist</p>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Favorites</h2>
        {favorites?.length ? (
          <div className="flex gap-4 overflow-x-auto">
            {favorites.map((f) => <MovieCard key={f.movie.id} movie={f.movie} />)}
          </div>
        ) : (
          <p className="text-gray-500">No favorites yet</p>
        )}
      </section>
    </div>
  );
}
