'use client';

import { use, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { getTmdbImageUrl, resolvePlaybackUrl, type Movie } from '@/lib/shared';
import { MovieRow } from '@/components/MovieRow';
import { VideoPlayer } from '@/components/VideoPlayer';
import { EmbedPlayer } from '@/components/EmbedPlayer';
import { HlsPlayer } from '@/components/HlsPlayer';
import { useWatchlistStore } from '@/store/watchlist';
import {
  PlayIcon,
  StarIcon,
  BookmarkIcon,
  HeartIcon,
  CloseIcon,
  ClockIcon,
} from '@/components/icons';

export default function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const autoPlay = searchParams.get('play') === '1';

  const [showPlayer, setShowPlayer] = useState(autoPlay);
  const [showTrailer, setShowTrailer] = useState(false);

  // Local watchlist and history store (No login required!)
  const isInWatchlist = useWatchlistStore((s) => s.isInWatchlist(id));
  const isInFavorites = useWatchlistStore((s) => s.isInFavorites(id));
  const toggleWatchlist = useWatchlistStore((s) => s.toggleWatchlist);
  const toggleFavorite = useWatchlistStore((s) => s.toggleFavorite);
  const updateProgress = useWatchlistStore((s) => s.updateProgress);

  const { data: movie, isLoading, isError } = useQuery({
    queryKey: ['movie', id],
    queryFn: async () => {
      const { data } = await api.get<Movie>(`/movies/${id}`);
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: similar } = useQuery({
    queryKey: ['similar', id],
    queryFn: async () => {
      try {
        const { data } = await api.get<{ data: Movie[] }>(`/movies/${id}/similar`);
        return data.data;
      } catch {
        return [];
      }
    },
    enabled: !!movie,
  });

  const { data: videos } = useQuery({
    queryKey: ['videos', id],
    queryFn: async () => {
      try {
        const { data } = await api.get<{ key: string; site: string; type: string }[]>(
          `/movies/${id}/videos`
        );
        return data;
      } catch {
        return [];
      }
    },
    enabled: !!movie,
  });

  useEffect(() => {
    if (autoPlay && movie) {
      setShowPlayer(true);
    }
  }, [autoPlay, movie]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  if (isError || !movie) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center pt-24">
        <span className="text-5xl">🎬</span>
        <h2 className="mt-4 text-2xl font-bold text-white">Movie Not Found</h2>
        <p className="mt-2 text-sm text-zinc-400">
          This movie could not be found in the database.
        </p>
        <Link
          href="/movies"
          className="mt-6 rounded-xl bg-red-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition"
        >
          Back to Movies
        </Link>
      </div>
    );
  }

  const trailer =
    videos?.find((v) => v.site === 'YouTube' && v.type === 'Trailer')?.key ||
    movie.trailerKey;

  const playback = movie.playback;
  const canPlayFull = Boolean(
    (playback?.available && playback.playerUrl) || movie.videoUrl
  );

  const backdrop = getTmdbImageUrl(movie.backdropPath, 'original');

  const hostedUrl =
    movie.videoUrl || (playback?.mode === 'HOSTED' ? playback.playerUrl : null);
  const embedUrl =
    playback?.mode === 'EMBED' && playback.playerUrl
      ? resolvePlaybackUrl(playback.playerUrl)
      : null;
  const hlsUrl = playback?.hlsUrl || playback?.playerUrl;
  const streamUrl =
    playback?.mode === 'URDBOX' && hlsUrl ? resolvePlaybackUrl(hlsUrl) : null;

  const year = movie.releaseDate ? movie.releaseDate.split('-')[0] : null;
  const runtimeHours = movie.runtime ? Math.floor(movie.runtime / 60) : null;
  const runtimeMins = movie.runtime ? movie.runtime % 60 : null;

  return (
    <div className="min-h-screen">
      {/* Hero Backdrop Showcase */}
      <section className="relative min-h-[580px] w-full lg:h-[78vh] lg:min-h-[600px]">
        {backdrop && (
          <img
            src={backdrop}
            alt={movie.title}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-[#08080c]/60 to-black/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08080c] via-[#08080c]/85 to-transparent md:w-3/4" />

        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-16 pt-32 md:px-12">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 text-xs font-medium text-zinc-400">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <span>&rsaquo;</span>
            <Link href="/movies" className="hover:text-white transition">Movies</Link>
            <span>&rsaquo;</span>
            <span className="text-zinc-200 truncate max-w-xs">{movie.title}</span>
          </div>

          <h1 className="mb-3 max-w-3xl text-3xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
            {movie.title}
          </h1>

          {/* Badges & Meta */}
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs md:text-sm">
            {movie.rating != null && (
              <span className="flex items-center gap-1.5 rounded-md bg-amber-400/20 px-3 py-1 font-bold text-amber-400 border border-amber-400/30">
                <StarIcon size={14} className="fill-amber-400" />
                <span>{movie.rating.toFixed(1)} / 10</span>
              </span>
            )}
            <span className="rounded-md border border-white/10 bg-white/10 px-2.5 py-1 font-bold text-zinc-200">
              4K ULTRA HD
            </span>
            {year && (
              <span className="rounded-md bg-white/10 px-2.5 py-1 text-zinc-300 font-medium">
                {year}
              </span>
            )}
            {runtimeHours != null && (
              <span className="flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1 text-zinc-300">
                <ClockIcon size={14} />
                <span>{runtimeHours}h {runtimeMins}m</span>
              </span>
            )}
            {movie.genres?.map((g) => (
              <span
                key={g.id}
                className="rounded-md border border-white/10 bg-black/40 px-2.5 py-1 text-zinc-300 font-medium"
              >
                {g.name}
              </span>
            ))}
          </div>

          {/* Overview */}
          {movie.overview && (
            <p className="mb-6 max-w-2xl text-sm leading-relaxed text-zinc-300 md:text-base">
              {movie.overview}
            </p>
          )}

          {/* Play & Personalize Actions (No login needed!) */}
          <div className="flex flex-wrap items-center gap-3">
            {canPlayFull && (
              <button
                onClick={() => setShowPlayer(true)}
                className="flex items-center gap-2.5 rounded-xl bg-red-600 px-7 py-3 text-sm font-bold text-white shadow-xl shadow-red-600/40 transition duration-200 hover:scale-105 hover:bg-red-700"
              >
                <PlayIcon size={18} />
                <span>Play Movie</span>
              </button>
            )}

            {trailer && (
              <button
                onClick={() => setShowTrailer(true)}
                className="flex items-center gap-2 rounded-xl glass-button px-5 py-3 text-sm font-semibold text-white shadow-md transition"
              >
                <PlayIcon size={16} className="text-red-400" />
                <span>Watch Trailer</span>
              </button>
            )}

            <button
              onClick={() => toggleWatchlist(movie)}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
                isInWatchlist
                  ? 'bg-white text-zinc-900 shadow-md'
                  : 'glass-button text-white'
              }`}
            >
              <BookmarkIcon size={16} filled={isInWatchlist} />
              <span>{isInWatchlist ? 'Saved in My List' : '+ Add to My List'}</span>
            </button>

            <button
              onClick={() => toggleFavorite(movie)}
              aria-label="Favorite"
              className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                isInFavorites
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'glass-button text-zinc-300 hover:text-rose-400'
              }`}
            >
              <HeartIcon size={18} filled={isInFavorites} />
            </button>
          </div>
        </div>
      </section>

      {/* Cast Showcase */}
      {movie.cast && movie.cast.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-12 md:px-12">
          <h2 className="mb-6 text-xl font-bold tracking-tight text-white md:text-2xl">
            Starring Cast
          </h2>
          <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
            {movie.cast.map((actor) => (
              <div key={actor.id} className="flex-shrink-0 text-center w-28 group">
                <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-2 border-white/10 bg-zinc-800 shadow-md transition duration-300 group-hover:border-red-600 group-hover:scale-105">
                  {actor.profilePath ? (
                    <img
                      src={getTmdbImageUrl(actor.profilePath, 'w185')!}
                      alt={actor.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-zinc-400">
                      {actor.name.charAt(0)}
                    </div>
                  )}
                </div>
                <p className="mt-2.5 truncate text-xs font-semibold text-zinc-200 group-hover:text-white">
                  {actor.name}
                </p>
                {actor.character && (
                  <p className="truncate text-[11px] text-zinc-400">{actor.character}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Similar Movies Recommendations */}
      {similar && similar.length > 0 && (
        <div className="pb-16">
          <MovieRow
            title="You Might Also Like"
            subtitle="More blockbusters from the catalog"
            movies={similar}
          />
        </div>
      )}

      {/* Active Video Player Overlays */}
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
          onProgress={(progress) => updateProgress(movie, progress)}
          onClose={() => setShowPlayer(false)}
        />
      )}

      {/* Trailer Modal */}
      {showTrailer && trailer && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <span className="font-semibold text-white truncate">{movie.title} - Official Trailer</span>
              <button
                onClick={() => setShowTrailer(false)}
                className="rounded-full bg-white/10 p-1.5 text-zinc-300 hover:bg-white/20 hover:text-white"
              >
                <CloseIcon size={18} />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${trailer}?autoplay=1`}
                title={`${movie.title} Trailer`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
