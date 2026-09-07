'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { getTmdbImageUrl, resolvePlaybackUrl, type Movie } from '@/lib/shared';
import { MovieRow } from '@/components/MovieRow';
import { VideoPlayer } from '@/components/VideoPlayer';
import { EmbedPlayer } from '@/components/EmbedPlayer';
import { HlsPlayer } from '@/components/HlsPlayer';
import { useAuthStore } from '@/store/auth';

export default function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: movie, isLoading } = useQuery({
    queryKey: ['movie', id],
    queryFn: async () => {
      const { data } = await api.get<Movie>(`/movies/${id}`);
      return data;
    },
  });

  const { data: similar } = useQuery({
    queryKey: ['similar', id],
    queryFn: async () => {
      const { data } = await api.get<{ data: Movie[] }>(`/movies/${id}/similar`);
      return data.data;
    },
  });

  const { data: videos } = useQuery({
    queryKey: ['videos', id],
    queryFn: async () => {
      const { data } = await api.get<{ key: string; site: string; type: string }[]>(`/movies/${id}/videos`);
      return data;
    },
  });

  const watchlistMutation = useMutation({
    mutationFn: () => api.post('/watchlist', { movieId: id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchlist'] }),
  });

  const historyMutation = useMutation({
    mutationFn: (progress: number) => api.post('/history', { movieId: id, progress }),
  });

  const trailer = videos?.find((v) => v.site === 'YouTube' && v.type === 'Trailer')?.key
    || movie?.trailerKey;

  const playback = movie?.playback;
  const canPlayFull = Boolean(
    playback?.available && playback.playerUrl
    || movie?.videoUrl,
  );

  if (isLoading || !movie) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  const backdrop = getTmdbImageUrl(movie.backdropPath, 'original');
  const hostedUrl = movie.videoUrl || (playback?.mode === 'HOSTED' ? playback.playerUrl : null);
  const embedUrl = playback?.mode === 'EMBED' && playback.playerUrl
    ? resolvePlaybackUrl(playback.playerUrl)
    : null;
  const hlsUrl = playback?.hlsUrl || playback?.playerUrl;
  const streamUrl = playback?.mode === 'URDBOX' && hlsUrl
    ? resolvePlaybackUrl(hlsUrl)
    : null;

  return (
    <div className="min-h-screen pt-16">
      <section className="relative h-[60vh] min-h-[400px]">
        {backdrop && <img src={backdrop} alt={movie.title} className="absolute inset-0 h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
        <div className="relative flex h-full flex-col justify-end px-6 pb-12 md:px-12">
          <h1 className="mb-2 text-4xl font-bold text-white md:text-5xl">{movie.title}</h1>
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-300">
            {movie.rating != null && <span className="text-yellow-400">⭐ {movie.rating.toFixed(1)}/10</span>}
            {movie.releaseDate && <span>{movie.releaseDate.split('-')[0]}</span>}
            {movie.runtime && <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>}
            {movie.genres?.map((g) => (
              <span key={g.id} className="rounded bg-zinc-800 px-2 py-0.5">{g.name}</span>
            ))}
          </div>
          {movie.overview && <p className="mb-6 max-w-2xl text-gray-300">{movie.overview}</p>}
          <div className="flex flex-wrap gap-3">
            {canPlayFull && (
              <button
                onClick={() => setShowPlayer(true)}
                className="rounded bg-white px-6 py-2.5 font-semibold text-black hover:bg-gray-200"
              >
                ▶ Play Now
              </button>
            )}
            {trailer && (
              <button
                onClick={() => setShowTrailer(true)}
                className="rounded bg-zinc-700 px-6 py-2.5 font-semibold text-white hover:bg-zinc-600"
              >
                ▶ Play Trailer
              </button>
            )}
            {user && (
              <button
                onClick={() => watchlistMutation.mutate()}
                className="rounded border border-gray-500 px-6 py-2.5 font-semibold text-white hover:bg-zinc-800"
              >
                + Watchlist
              </button>
            )}
          </div>
        </div>
      </section>

      {movie.cast && movie.cast.length > 0 && (
        <section className="px-6 py-10 md:px-12">
          <h2 className="mb-4 text-xl font-semibold">Cast</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {movie.cast.map((actor) => (
              <div key={actor.id} className="flex-shrink-0 text-center">
                {actor.profilePath ? (
                  <img
                    src={getTmdbImageUrl(actor.profilePath, 'w185')!}
                    alt={actor.name}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-700 text-xs">?</div>
                )}
                <p className="mt-2 max-w-24 truncate text-sm">{actor.name}</p>
                {actor.character && <p className="max-w-24 truncate text-xs text-gray-500">{actor.character}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {similar && similar.length > 0 && (
        <div className="pb-12">
          <MovieRow title="Similar Movies" movies={similar} />
        </div>
      )}

      {showPlayer && embedUrl && (
        <EmbedPlayer src={embedUrl} onClose={() => setShowPlayer(false)} />
      )}

      {showPlayer && streamUrl && !embedUrl && (
        <HlsPlayer
          src={streamUrl}
          poster={getTmdbImageUrl(movie.backdropPath, 'w780') ?? undefined}
          onClose={() => setShowPlayer(false)}
        />
      )}

      {showPlayer && hostedUrl && !embedUrl && !streamUrl && (
        <VideoPlayer
          src={hostedUrl}
          poster={getTmdbImageUrl(movie.backdropPath, 'w780') ?? undefined}
          onProgress={(p) => user && historyMutation.mutate(p)}
          onClose={() => setShowPlayer(false)}
        />
      )}

      {showTrailer && trailer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
          <button onClick={() => setShowTrailer(false)} className="absolute right-6 top-6 text-white">✕ Close</button>
          <iframe
            src={`https://www.youtube.com/embed/${trailer}?autoplay=1`}
            className="aspect-video w-full max-w-4xl"
            allowFullScreen
            allow="autoplay"
          />
        </div>
      )}
    </div>
  );
}
