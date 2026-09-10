'use client';

import { use, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { getTmdbImageUrl, resolvePlaybackUrl, type Series, type Season, type Episode } from '@/lib/shared';
import { NetflixPlayer, type VideoSource } from '@/components/NetflixPlayer';
import {
  PlayIcon,
  StarIcon,
  FilmIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@/components/icons';

interface StreamItem {
  name?: string;
  url: string;
  type?: 'hls' | 'mp4' | 'embed' | string;
}

export default function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [selectedEpisodeNumber, setSelectedEpisodeNumber] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Load series details with all seasons and episodes
  const { data: series, isLoading, isError } = useQuery<Series>({
    queryKey: ['series-detail', id],
    queryFn: async () => {
      const res = await api.get(`/series/${id}`);
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  // Load active episode playback stream sources
  const { data: playbackData } = useQuery({
    queryKey: ['episode-playback', id, selectedSeasonNumber, selectedEpisodeNumber],
    queryFn: async () => {
      const res = await api.get(`/series/${id}/playback/${selectedSeasonNumber}/${selectedEpisodeNumber}`);
      return res.data;
    },
    enabled: !!series,
    staleTime: 1000 * 60 * 5,
  });

  // Calculate seasons and active season
  const seasons: Season[] = useMemo(() => {
    return series?.seasons && series.seasons.length > 0
      ? series.seasons
      : [
          {
            id: 'default-season',
            seriesId: id,
            seasonNumber: 1,
            name: 'Season 1',
            episodeCount: 1,
          },
        ];
  }, [series, id]);

  const activeSeason = useMemo(() => {
    return seasons.find((s) => s.seasonNumber === selectedSeasonNumber) || seasons[0];
  }, [seasons, selectedSeasonNumber]);

  // Calculate episodes of active season
  const episodes: Episode[] = useMemo(() => {
    if (activeSeason?.episodes && activeSeason.episodes.length > 0) {
      return activeSeason.episodes;
    }
    // Fallback if episodes not nested
    if (series?.episodes && series.episodes.length > 0) {
      const filtered = series.episodes.filter((e) => e.seasonNumber === selectedSeasonNumber);
      if (filtered.length > 0) return filtered;
    }
    return [
      {
        id: 'ep-default-1',
        seriesId: id,
        seasonId: activeSeason?.id || 'default',
        seasonNumber: selectedSeasonNumber,
        episodeNumber: 1,
        title: 'Episode 1',
        overview: 'Episode 1 of ' + (series?.title || 'Series'),
      },
    ];
  }, [activeSeason, series, selectedSeasonNumber, id]);

  const activeEpisode = useMemo(() => {
    return episodes.find((e) => e.episodeNumber === selectedEpisodeNumber) || episodes[0];
  }, [episodes, selectedEpisodeNumber]);

  // Prepare multi-server playback sources for the active episode
  const videoSources: VideoSource[] = useMemo(() => {
    const sources: VideoSource[] = [];

    // 1. Direct or UrduBox stream from playback API
    if (playbackData?.streams && Array.isArray(playbackData.streams)) {
      playbackData.streams.forEach((stream: StreamItem, idx: number) => {
        sources.push({
          id: `stream-${idx}`,
          name: stream.name || `Server ${idx + 1} (${stream.type?.toUpperCase()})`,
          url: resolvePlaybackUrl(stream.url),
          type: stream.type === 'hls' ? 'hls' : stream.type === 'embed' ? 'embed' : 'mp4',
        });
      });
    }

    // 2. Direct videoUrl on episode
    if (activeEpisode?.videoUrl) {
      const isHls = activeEpisode.videoUrl.includes('.m3u8');
      if (!sources.some((s) => s.url === activeEpisode.videoUrl)) {
        sources.unshift({
          id: 'server-ep-direct',
          name: isHls ? 'Server 1 (HLS Ultra Fast)' : 'Server 1 (Direct Video)',
          url: activeEpisode.videoUrl,
          type: isHls ? 'hls' : 'mp4',
        });
      }
    }

    // 3. Multi-server Cloud streams if TMDB ID exists
    const tmdbId = series?.tmdbId;
    if (tmdbId) {
      sources.push({
        id: 'server-autoembed',
        name: 'Server 2 (AutoEmbed HD)',
        url: `https://autoembed.co/tv/tmdb/${tmdbId}/${selectedSeasonNumber}/${selectedEpisodeNumber}`,
        type: 'embed',
      });
      sources.push({
        id: 'server-smashy',
        name: 'Server 3 (Smashy Cloud)',
        url: `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&season=${selectedSeasonNumber}&episode=${selectedEpisodeNumber}`,
        type: 'embed',
      });
      sources.push({
        id: 'server-vidsrc',
        name: 'Server 4 (Multi-Source 4K)',
        url: `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${selectedSeasonNumber}&episode=${selectedEpisodeNumber}`,
        type: 'embed',
      });
    }

    // Fallback demo if no stream is configured
    if (sources.length === 0) {
      sources.push({
        id: 'server-placeholder',
        name: 'Server 1 (AutoEmbed HD)',
        url: `https://autoembed.co/tv/tmdb/${tmdbId || 1399}/${selectedSeasonNumber}/${selectedEpisodeNumber}`,
        type: 'embed',
      });
    }

    return sources;
  }, [playbackData, activeEpisode, series, selectedSeasonNumber, selectedEpisodeNumber]);

  // Navigate to previous or next episode
  const currentEpIndex = episodes.findIndex((e) => e.episodeNumber === selectedEpisodeNumber);
  const hasPrevEp = currentEpIndex > 0;
  const hasNextEp = currentEpIndex >= 0 && currentEpIndex < episodes.length - 1;

  const handlePrevEp = () => {
    if (hasPrevEp) {
      const prev = episodes[currentEpIndex - 1];
      setSelectedEpisodeNumber(prev.episodeNumber);
    }
  };

  const handleNextEp = () => {
    if (hasNextEp) {
      const next = episodes[currentEpIndex + 1];
      setSelectedEpisodeNumber(next.episodeNumber);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen px-6 pt-32 md:px-12">
        <div className="aspect-[16/9] w-full max-w-5xl mx-auto rounded-2xl skeleton-shimmer" />
        <div className="mt-8 mx-auto max-w-5xl space-y-4">
          <div className="h-8 w-64 rounded skeleton-shimmer" />
          <div className="h-4 w-96 rounded skeleton-shimmer" />
        </div>
      </div>
    );
  }

  if (isError || !series) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center pt-24">
        <span className="text-5xl">📺</span>
        <h2 className="mt-4 text-2xl font-bold text-white">Series Not Found</h2>
        <p className="mt-2 text-sm text-zinc-400">
          The requested series could not be located in our library.
        </p>
        <Link
          href="/series"
          className="mt-6 rounded-xl bg-red-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition"
        >
          Back to Web Series
        </Link>
      </div>
    );
  }

  const backdrop = getTmdbImageUrl(series.backdropPath, 'original');
  const isAnime = series.contentType === 'ANIME';

  return (
    <div className="min-h-screen bg-[#08080c] pb-24 pt-24">
      {/* Breadcrumb Navigation */}
      <div className="mx-auto max-w-7xl px-5 md:px-12 mb-4">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <Link href={isAnime ? '/anime' : '/series'} className="hover:text-white transition">
            {isAnime ? 'Anime' : 'Web Series'}
          </Link>
          <span>/</span>
          <span className="text-white font-medium truncate max-w-[200px]">{series.title}</span>
          <span>/</span>
          <span className="text-red-400 font-semibold">S{selectedSeasonNumber} E{selectedEpisodeNumber}</span>
        </div>
      </div>

      {/* Hero / Player Section */}
      <div className="mx-auto max-w-7xl px-5 md:px-12">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-black/80">
          {isPlaying ? (
            <div className="aspect-[16/9] w-full">
              <NetflixPlayer
                title={`${series.title} - S${selectedSeasonNumber}:E${selectedEpisodeNumber} "${activeEpisode?.title || ''}"`}
                sources={videoSources}
                onClose={() => setIsPlaying(false)}
                poster={backdrop || undefined}
              />
            </div>
          ) : (
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              {backdrop ? (
                <img
                  src={backdrop}
                  alt={series.title}
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-zinc-950">
                  <FilmIcon size={64} className="text-zinc-800" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              {/* Play Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="group flex h-20 w-20 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl shadow-red-600/60 transition duration-300 hover:scale-110 hover:bg-red-500"
                  aria-label="Play Episode"
                >
                  <PlayIcon size={32} />
                </button>
                <div className="mt-4">
                  <span className="rounded-md bg-red-600/30 border border-red-500/40 px-2.5 py-1 text-xs font-bold text-red-400">
                    SEASON {selectedSeasonNumber} • EPISODE {selectedEpisodeNumber}
                  </span>
                  <h2 className="mt-2 text-xl font-bold text-white md:text-2xl">
                    {activeEpisode?.title || `Episode ${selectedEpisodeNumber}`}
                  </h2>
                  <p className="mt-1 text-xs text-zinc-300">
                    Click to start high-definition multi-server streaming
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Episode Quick Bar under Player */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-zinc-950/80 px-6 py-4 backdrop-blur-md">
            <div>
              <p className="text-sm font-bold text-white">
                S{selectedSeasonNumber} E{selectedEpisodeNumber}: {activeEpisode?.title}
              </p>
              <p className="text-xs text-zinc-400 line-clamp-1">
                {activeEpisode?.overview || series.overview}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!hasPrevEp}
                onClick={handlePrevEp}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 transition"
              >
                <ChevronLeftIcon size={14} />
                <span>Prev Ep</span>
              </button>
              <button
                type="button"
                disabled={!hasNextEp}
                onClick={handleNextEp}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 transition"
              >
                <span>Next Ep</span>
                <ChevronRightIcon size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Series Info & Season/Episode Selection Grid */}
      <div className="mx-auto max-w-7xl px-5 md:px-12 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Season Selector & Episodes List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Episodes</h3>
              <p className="text-xs text-zinc-400">
                Select a season and episode to play
              </p>
            </div>

            {/* Season Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {seasons.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSelectedSeasonNumber(s.seasonNumber);
                    setSelectedEpisodeNumber(1);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition shrink-0 ${
                    selectedSeasonNumber === s.seasonNumber
                      ? 'bg-red-600 text-white shadow'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-white/5'
                  }`}
                >
                  {s.name || `Season ${s.seasonNumber}`}
                </button>
              ))}
            </div>
          </div>

          {/* Episodes List Cards */}
          <div className="space-y-3">
            {episodes.map((ep) => {
              const isSelected = ep.episodeNumber === selectedEpisodeNumber;
              const epStill = getTmdbImageUrl(ep.stillPath, 'w342') || backdrop;

              return (
                <div
                  key={ep.id}
                  onClick={() => {
                    setSelectedEpisodeNumber(ep.episodeNumber);
                    setIsPlaying(true);
                  }}
                  className={`group flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border p-3.5 transition cursor-pointer ${
                    isSelected
                      ? 'border-red-600 bg-red-950/20 shadow-lg shadow-red-950/30'
                      : 'border-white/5 bg-zinc-900/60 hover:border-white/20 hover:bg-zinc-900'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[16/9] w-full sm:w-44 shrink-0 overflow-hidden rounded-lg bg-zinc-950">
                    {epStill ? (
                      <img
                        src={epStill}
                        alt={ep.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-bold text-zinc-600">
                        EP {ep.episodeNumber}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow">
                        <PlayIcon size={14} />
                      </span>
                    </div>
                    <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      E{ep.episodeNumber}
                    </span>
                  </div>

                  {/* Episode Meta */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-bold transition ${isSelected ? 'text-red-400' : 'text-white group-hover:text-red-400'}`}>
                        {ep.episodeNumber}. {ep.title}
                      </h4>
                      {isSelected && (
                        <span className="rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-bold text-white">
                          NOW PLAYING
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
                      {ep.overview || 'Enjoy uninterrupted streaming of this episode.'}
                    </p>
                    {ep.runtime && (
                      <p className="mt-1.5 text-[11px] text-zinc-500">
                        Duration: {ep.runtime} mins
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Series Details, Cast & Badges */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-md">
            <h3 className="text-xl font-black text-white">{series.title}</h3>
            {series.originalTitle && series.originalTitle !== series.title && (
              <p className="text-xs text-zinc-500 italic mt-0.5">{series.originalTitle}</p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-red-600/20 border border-red-500/40 px-2 py-0.5 text-[11px] font-bold text-red-400">
                {isAnime ? '⛩️ Anime' : '📺 Series'}
              </span>
              {series.rating ? (
                <span className="flex items-center gap-1 rounded-md bg-black/60 border border-white/10 px-2 py-0.5 text-[11px] font-bold text-amber-400">
                  <StarIcon size={12} />
                  <span>{series.rating.toFixed(1)}</span>
                </span>
              ) : null}
              {series.firstAirDate && (
                <span className="text-xs text-zinc-400">
                  {new Date(series.firstAirDate).getFullYear()}
                </span>
              )}
            </div>

            <p className="mt-4 text-xs leading-relaxed text-zinc-300">
              {series.overview || 'No synopsis available for this series.'}
            </p>

            {/* Category tags */}
            {series.categorySeries && series.categorySeries.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Categories
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {series.categorySeries.map((cs) => (
                    <span
                      key={cs.category.id}
                      className="rounded-lg bg-zinc-800 px-2 py-1 text-[11px] font-medium text-zinc-300 border border-white/5"
                    >
                      {cs.category.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Content Source */}
            {series.contentSource && (
              <div className="mt-4 pt-4 border-t border-white/10 text-xs text-zinc-400">
                <span>Provider Source: </span>
                <span className="font-bold text-white">{series.contentSource}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
