'use client';

import { use, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { getTmdbImageUrl, resolvePlaybackUrl, type Movie } from '@/lib/shared';
import { MovieRow } from '@/components/MovieRow';
import { MovieCard } from '@/components/MovieCard';
import { NetflixPlayer, type VideoSource } from '@/components/NetflixPlayer';
import { useWatchlistStore } from '@/store/watchlist';
import {
  PlayIcon,
  StarIcon,
  BookmarkIcon,
  HeartIcon,
  CloseIcon,
  ClockIcon,
} from '@/components/icons';

/* ───── Skeleton Components ───── */

function HeroSkeleton() {
  return (
    <section className="relative min-h-[580px] w-full lg:h-[78vh] lg:min-h-[600px]">
      <div className="absolute inset-0 skeleton-shimmer" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-[#08080c]/60 to-black/35" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#08080c] via-[#08080c]/85 to-transparent md:w-3/4" />
      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-16 pt-32 md:px-12">
        {/* Breadcrumb skeleton */}
        <div className="mb-4 flex items-center gap-2">
          <div className="h-3 w-10 rounded skeleton-shimmer" />
          <div className="h-3 w-3 rounded skeleton-shimmer" />
          <div className="h-3 w-14 rounded skeleton-shimmer" />
          <div className="h-3 w-3 rounded skeleton-shimmer" />
          <div className="h-3 w-32 rounded skeleton-shimmer" />
        </div>
        {/* Title */}
        <div className="mb-3 h-12 w-96 max-w-full rounded-lg skeleton-shimmer md:h-16" />
        {/* Badges */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="h-7 w-24 rounded-md skeleton-shimmer" />
          <div className="h-7 w-28 rounded-md skeleton-shimmer" />
          <div className="h-7 w-16 rounded-md skeleton-shimmer" />
          <div className="h-7 w-20 rounded-md skeleton-shimmer" />
          <div className="h-7 w-20 rounded-md skeleton-shimmer" />
        </div>
        {/* Overview */}
        <div className="mb-6 max-w-2xl space-y-2">
          <div className="h-4 w-full rounded skeleton-shimmer" />
          <div className="h-4 w-5/6 rounded skeleton-shimmer" />
          <div className="h-4 w-3/4 rounded skeleton-shimmer" />
        </div>
        {/* Buttons */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-40 rounded-xl skeleton-shimmer" />
          <div className="h-12 w-36 rounded-xl skeleton-shimmer" />
          <div className="h-12 w-44 rounded-xl skeleton-shimmer" />
          <div className="h-11 w-11 rounded-xl skeleton-shimmer" />
        </div>
      </div>
    </section>
  );
}

function CastSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12 md:px-12">
      <div className="mb-6 h-7 w-40 rounded-lg skeleton-shimmer" />
      <div className="flex gap-5 overflow-hidden pb-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="w-28 flex-shrink-0 text-center">
            <div className="mx-auto h-24 w-24 rounded-full skeleton-shimmer" />
            <div className="mt-2.5 mx-auto h-3 w-20 rounded skeleton-shimmer" />
            <div className="mt-1 mx-auto h-2.5 w-16 rounded skeleton-shimmer" />
          </div>
        ))}
      </div>
    </section>
  );
}

function RelatedRowSkeleton() {
  return (
    <section className="mb-12 px-6 md:px-12">
      <div className="mb-4 h-7 w-56 rounded-lg skeleton-shimmer" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-40 flex-shrink-0 md:w-48">
            <div className="aspect-[2/3] w-full rounded-xl skeleton-shimmer" />
            <div className="mt-2 h-3.5 w-3/4 rounded skeleton-shimmer" />
            <div className="mt-1 h-2.5 w-1/2 rounded skeleton-shimmer" />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───── Main Page ───── */

export default function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const autoPlay = searchParams.get('play') === '1';

  const [showPlayer, setShowPlayer] = useState(autoPlay);
  const [showTrailer, setShowTrailer] = useState(false);
  const [loadExtra, setLoadExtra] = useState(false);

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

  // Related movies from same genres (from database)
  useEffect(() => {
    if (!movie) return;
    const timer = window.setTimeout(() => setLoadExtra(true), 200);
    return () => window.clearTimeout(timer);
  }, [movie]);

  const { data: similar, isLoading: isSimilarLoading } = useQuery({
    queryKey: ['similar', id],
    queryFn: async () => {
      try {
        const { data } = await api.get<{ data: Movie[] }>(`/movies/${id}/similar`);
        return data.data;
      } catch {
        return [];
      }
    },
    enabled: loadExtra && !!movie,
    staleTime: 1000 * 60 * 5,
  });

  // Per-genre breakdowns for the "More in [Genre]" sections
  const movieGenres = movie?.genres ?? [];
  const genreGroupedMovies: { genre: string; movies: Movie[] }[] = [];

  if (similar && similar.length > 0 && movieGenres.length > 0) {
    for (const genre of movieGenres.slice(0, 3)) {
      const genreMovies = similar.filter(
        (m) => m.genres?.some((g) => g.name === genre.name) && m.id !== id
      );
      if (genreMovies.length > 0) {
        genreGroupedMovies.push({ genre: genre.name, movies: genreMovies.slice(0, 20) });
      }
    }
  }

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
    enabled: loadExtra && !!movie && !movie.trailerKey,
  });

  useEffect(() => {
    if (autoPlay && movie) {
      setShowPlayer(true);
    }
  }, [autoPlay, movie]);

  const tmdbId = movie?.tmdbId || (movie && !Number.isNaN(Number(movie.id)) ? Number(movie.id) : null);
  const playback = movie?.playback;

  const { data: playerSources } = useQuery({
    queryKey: ['movie-sources', tmdbId, playback?.sourcesUrl],
    queryFn: async () => {
      const url = playback?.sourcesUrl
        ? resolvePlaybackUrl(playback.sourcesUrl)
        : tmdbId
        ? resolvePlaybackUrl(`/api/player/sources/movie/${tmdbId}`)
        : null;
      if (!url) return null;
      const res = await fetch(url);
      return res.json();
    },
    enabled: Boolean(movie && (tmdbId || playback?.sourcesUrl)),
    staleTime: 1000 * 60 * 10,
  });

  // ─── SKELETON LOADING STATE ───
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <HeroSkeleton />
        <CastSkeleton />
        <RelatedRowSkeleton />
        <RelatedRowSkeleton />
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

  const sources: VideoSource[] = [];

  if (movie.videoUrl) {
    const isHls = movie.videoUrl.includes('.m3u8');
    sources.push({
      id: 'server-direct',
      name: isHls ? 'Server 1 (HLS Ultra Fast)' : 'Server 1 (Fast HD Chunks)',
      url: movie.videoUrl,
      type: isHls ? 'hls' : 'mp4',
    });
  }

  if (playerSources?.sources?.length) {
    playerSources.sources.forEach((src: { id: string; name: string; url: string; type: string }, idx: number) => {
      sources.push({
        id: src.id || `api-${idx}`,
        name: src.name || `Server ${idx + 1}`,
        url: resolvePlaybackUrl(src.url),
        type: src.type === 'resolve' ? 'resolve' : src.type === 'embed' ? 'embed' : src.type === 'hls' ? 'hls' : 'mp4',
      });
    });
  } else if (playback?.mode === 'EMBED' && playback.playerUrl) {
    sources.push({
      id: 'server-embed-primary',
      name: 'Server 1 (HD Stream)',
      url: resolvePlaybackUrl(playback.playerUrl),
      type: 'embed',
    });
  }

  // Instant resilient fallbacks if playerSources has not arrived yet or is empty
  if (sources.length === 0 && tmdbId) {
    sources.push(
      {
        id: 'fallback-vidking',
        name: 'Server 1 (HD Stream)',
        url: `https://www.vidking.net/embed/movie/${tmdbId}?autoPlay=true`,
        type: 'embed',
      },
      {
        id: 'fallback-vidsrc',
        name: 'Server 2 (Direct Cloud)',
        url: `https://vidsrc.cc/v2/embed/movie/${tmdbId}`,
        type: 'embed',
      },
      {
        id: 'fallback-videasy',
        name: 'Server 3 (Fast Stream)',
        url: `https://player.videasy.to/movie/${tmdbId}?overlay=true`,
        type: 'embed',
      }
    );
  }

  if (trailer && sources.length === 0) {
    sources.push({
      id: 'server-trailer',
      name: 'Official Trailer Preview',
      url: `https://www.youtube-nocookie.com/embed/${trailer}?autoplay=1`,
      type: 'embed',
    });
  }

  const canPlayFull = sources.length > 0;
  const backdrop = getTmdbImageUrl(movie.backdropPath, 'w1280');

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
            fetchPriority="high"
            decoding="async"
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
              <Link
                key={g.id}
                href={`/movies?genre=${encodeURIComponent(g.name)}`}
                className="rounded-md border border-white/10 bg-black/40 px-2.5 py-1 text-zinc-300 font-medium hover:bg-white/10 hover:text-white transition"
              >
                {g.name}
              </Link>
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
                      loading="lazy"
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

      {/* ── Related Movies Section ── */}
      {isSimilarLoading && (
        <>
          <RelatedRowSkeleton />
          <RelatedRowSkeleton />
        </>
      )}

      {/* All Related Movies in one big row */}
      {similar && similar.length > 0 && (
        <MovieRow
          title="You Might Also Like"
          subtitle={`Similar movies based on ${movieGenres.map((g) => g.name).join(', ')}`}
          movies={similar}
        />
      )}

      {/* Per-Genre Breakdown Sections */}
      {genreGroupedMovies.map((group) => (
        <section key={group.genre} className="mb-10 px-6 md:px-12">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                More in {group.genre}
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                {group.movies.length} related {group.genre.toLowerCase()} movies
              </p>
            </div>
            <Link
              href={`/movies?genre=${encodeURIComponent(group.genre)}`}
              className="text-xs font-semibold text-zinc-400 transition hover:text-red-500 hover:underline"
            >
              See All &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {group.movies.slice(0, 12).map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </section>
      ))}

      {/* Netflix Cinema Video Player */}
      {showPlayer && sources.length > 0 && (
        <NetflixPlayer
          title={movie.title}
          year={year}
          sources={sources}
          poster={getTmdbImageUrl(movie.posterPath, 'w780') ?? getTmdbImageUrl(movie.backdropPath, 'w780') ?? undefined}
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
