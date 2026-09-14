'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { resolvePlaybackUrl } from '@/lib/shared';

export interface VideoSource {
  id: string;
  name: string;
  url: string;
  type: 'hls' | 'mp4' | 'embed' | 'resolve';
  quality?: string;
}

export interface NetflixPlayerProps {
  src?: string;
  sources?: VideoSource[];
  title?: string;
  year?: string | number | null;
  poster?: string;
  initialProgress?: number;
  onProgress?: (progress: number) => void;
  onClose?: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function NetflixPlayer({
  src,
  sources: incomingSources,
  title = 'Movie',
  year,
  poster,
  initialProgress = 0,
  onProgress,
  onClose,
}: NetflixPlayerProps) {
  // Normalize sources
  const resolvedSources: VideoSource[] = incomingSources && incomingSources.length > 0
    ? incomingSources
    : src
    ? [
        {
          id: 'server-1',
          name: src.includes('.m3u8') ? 'Server 1 (HLS Ultra Fast)' : 'Server 1 (HD Cloud)',
          url: src,
          type: src.includes('.m3u8') ? 'hls' : 'mp4',
        },
      ]
    : [];

  const [activeSourceIndex, setActiveSourceIndex] = useState(0);
  const [resolvedStreamUrl, setResolvedStreamUrl] = useState<string | null>(null);
  const [resolveFailed, setResolveFailed] = useState(false);
  const currentSource = resolvedSources[activeSourceIndex] || null;
  const effectiveSource =
    currentSource?.type === 'resolve' && resolvedStreamUrl
      ? {
          ...currentSource,
          url: resolvedStreamUrl,
          type: resolvedStreamUrl.includes('.m3u8') ? 'hls' as const : 'mp4' as const,
        }
      : currentSource;

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(1);
  const [bufferedRanges, setBufferedRanges] = useState<{ start: number; end: number }[]>([]);
  const [isBuffering, setIsBuffering] = useState(true);
  const [showRemainingTime, setShowRemainingTime] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Quality levels from HLS
  const [qualityLevels, setQualityLevels] = useState<{ id: number; height: number; bitrate: number }[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 = Auto

  // Menus
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [embedLoading, setEmbedLoading] = useState(true);
  const [allFailed, setAllFailed] = useState(false);

  // Inactivity / Auto-hide controls
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  // Scrubbing & Hover
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Toast / Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);

  // Center ripple animation
  const [centerAnimation, setCenterAnimation] = useState<'play' | 'pause' | 'rewind' | 'forward' | null>(null);
  const centerAnimTimeout = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToastMessage(msg);
    toastTimeout.current = setTimeout(() => setToastMessage(null), 1800);
  }, []);

  const triggerCenterAnimation = useCallback((type: 'play' | 'pause' | 'rewind' | 'forward') => {
    if (centerAnimTimeout.current) clearTimeout(centerAnimTimeout.current);
    setCenterAnimation(type);
    centerAnimTimeout.current = setTimeout(() => setCenterAnimation(null), 600);
  }, []);

  // Lock body scroll on mount
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Auto-hide controls timer
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    if (isPlaying && !isScrubbing && !showSpeedMenu && !showQualityMenu) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 2600);
    }
  }, [isPlaying, isScrubbing, showSpeedMenu, showQualityMenu]);

  // Mouse move resets timer
  useEffect(() => {
    resetControlsTimer();
  }, [isPlaying, resetControlsTimer]);

  const tryNextSource = useCallback(() => {
    if (activeSourceIndex < resolvedSources.length - 1) {
      setResolvedStreamUrl(null);
      setResolveFailed(false);
      setEmbedLoading(true);
      setActiveSourceIndex((prev) => prev + 1);
      return true;
    }
    setAllFailed(true);
    return false;
  }, [activeSourceIndex, resolvedSources.length]);

  // Resolve anime / dynamic sources before playback
  useEffect(() => {
    if (!currentSource || currentSource.type !== 'resolve') {
      setResolvedStreamUrl(null);
      setResolveFailed(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    setResolvedStreamUrl(null);
    setResolveFailed(false);
    setIsBuffering(true);

    const resolveUrl = resolvePlaybackUrl(currentSource.url);

    fetch(resolveUrl, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        clearTimeout(timeoutId);
        if (cancelled) return;
        const playUrl = data.playUrl || data.proxyUrl || data.url;
        if (!playUrl) {
          setResolveFailed(true);
          tryNextSource();
          return;
        }
        setResolvedStreamUrl(playUrl);
        setIsBuffering(false);
      })
      .catch(() => {
        clearTimeout(timeoutId);
        if (cancelled) return;
        setResolveFailed(true);
        tryNextSource();
      });

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [currentSource, tryNextSource]);

  // Embed watchdog timeout: auto-fallback if embed hangs
  useEffect(() => {
    if (effectiveSource?.type !== 'embed') return;

    setEmbedLoading(true);
    const watchdog = setTimeout(() => {
      if (activeSourceIndex < resolvedSources.length - 1) {
        tryNextSource();
      } else {
        setEmbedLoading(false);
      }
    }, 10000);

    return () => clearTimeout(watchdog);
  }, [effectiveSource, activeSourceIndex, resolvedSources.length, tryNextSource]);

  // Initialize Video & HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !effectiveSource || effectiveSource.type === 'embed' || effectiveSource.type === 'resolve') return;

    setIsBuffering(true);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHlsUrl = effectiveSource.url.includes('.m3u8') || effectiveSource.type === 'hls';

    if (isHlsUrl) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          // Fast start: small initial buffer, then scale up
          maxBufferLength: 12,
          maxMaxBufferLength: 60,
          maxBufferSize: 30 * 1024 * 1024,
          backBufferLength: 15,
          startLevel: 0,
          lowLatencyMode: true,
          startFragPrefetch: true,
        });

        hls.loadSource(effectiveSource.url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          setIsBuffering(false);
          const levels = data.levels.map((lvl, index) => ({
            id: index,
            height: lvl.height,
            bitrate: lvl.bitrate,
          }));
          setQualityLevels(levels);
          video.play().catch(() => {});
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
          setCurrentQuality(data.level);
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                // Auto switch to next server if available
                tryNextSource();
                break;
            }
          }
        });

        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native Safari HLS
        video.src = effectiveSource.url;
        video.play().catch(() => {});
      }
    } else {
      // Direct MP4 / WebM with progressive chunk loading
      video.src = effectiveSource.url;
      video.load();
      video.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [effectiveSource, activeSourceIndex, resolvedSources.length, showToast, tryNextSource]);

  // Initial Progress Seek
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      if (video.duration && initialProgress > 0) {
        video.currentTime = (initialProgress / 100) * video.duration;
      }
      setDuration(video.duration || 0);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, [initialProgress]);

  // Track Video Events (time, buffer chunks, waiting, playing)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateBuffer = () => {
      const ranges: { start: number; end: number }[] = [];
      for (let i = 0; i < video.buffered.length; i++) {
        ranges.push({
          start: video.buffered.start(i),
          end: video.buffered.end(i),
        });
      }
      setBufferedRanges(ranges);
    };

    const handleTimeUpdate = () => {
      if (!isScrubbing) {
        setCurrentTime(video.currentTime);
      }
      updateBuffer();
    };

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };
    const handlePause = () => setIsPlaying(false);
    const handleDurationChange = () => setDuration(video.duration || 0);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('progress', updateBuffer);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('pause', handlePause);
    video.addEventListener('durationchange', handleDurationChange);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('progress', updateBuffer);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('durationchange', handleDurationChange);
    };
  }, [isScrubbing]);

  // Periodic Progress Reporting (every 5 seconds)
  useEffect(() => {
    if (!onProgress) return;
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (video && video.duration > 0) {
        onProgress((video.currentTime / video.duration) * 100);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [onProgress]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Controls Handlers
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
        triggerCenterAnimation('play');
      }).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
      triggerCenterAnimation('pause');
    }
  }, [triggerCenterAnimation]);

  const seekRelative = useCallback((delta: number) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = Math.min(Math.max(video.currentTime + delta, 0), duration);
    video.currentTime = newTime;
    setCurrentTime(newTime);
    triggerCenterAnimation(delta < 0 ? 'rewind' : 'forward');
    showToast(`${delta > 0 ? '+' : ''}${delta}s`);
  }, [duration, showToast, triggerCenterAnimation]);

  const handleVolumeChange = useCallback((newVol: number) => {
    const video = videoRef.current;
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolume(clamped);
    if (video) {
      video.volume = clamped;
      video.muted = clamped === 0;
    }
    setIsMuted(clamped === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted || volume === 0) {
      const restored = prevVolume > 0 ? prevVolume : 0.8;
      setVolume(restored);
      video.volume = restored;
      video.muted = false;
      setIsMuted(false);
      showToast(`Volume: ${Math.round(restored * 100)}%`);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      video.volume = 0;
      video.muted = true;
      setIsMuted(true);
      showToast('Muted');
    }
  }, [isMuted, volume, prevVolume, showToast]);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch {
      showToast('Picture-in-Picture not supported');
    }
  }, [showToast]);

  const changeSpeed = useCallback((speed: number) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = speed;
      setPlaybackSpeed(speed);
      showToast(`Speed: ${speed}x`);
    }
    setShowSpeedMenu(false);
  }, [showToast]);

  const changeQuality = useCallback((lvlIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = lvlIndex;
      setCurrentQuality(lvlIndex);
      const label = lvlIndex === -1 ? 'Auto' : `${qualityLevels[lvlIndex]?.height}p`;
      showToast(`Quality: ${label}`);
    }
    setShowQualityMenu(false);
  }, [qualityLevels, showToast]);

  // Timeline / Scrubber scrubbing
  const handleScrubberClickOrDrag = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = progressBarRef.current;
      const video = videoRef.current;
      if (!bar || !video || duration <= 0) return;

      const rect = bar.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const targetTime = pos * duration;

      video.currentTime = targetTime;
      setCurrentTime(targetTime);
    },
    [duration]
  );

  const handleMouseMoveOnProgress = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = progressBarRef.current;
      if (!bar || duration <= 0) return;

      const rect = bar.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setHoverPosition(pos * 100);
      setHoverTime(pos * duration);
    },
    [duration]
  );

  // Keyboard Shortcuts (Space, Arrows, F, M, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;

      resetControlsTimer();

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowleft':
        case 'j':
          e.preventDefault();
          seekRelative(-10);
          break;
        case 'arrowright':
        case 'l':
          e.preventDefault();
          seekRelative(10);
          break;
        case 'arrowup':
          e.preventDefault();
          handleVolumeChange(volume + 0.1);
          showToast(`Volume: ${Math.min(100, Math.round((volume + 0.1) * 100))}%`);
          break;
        case 'arrowdown':
          e.preventDefault();
          handleVolumeChange(volume - 0.1);
          showToast(`Volume: ${Math.max(0, Math.round((volume - 0.1) * 100))}%`);
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'escape':
          if (!document.fullscreenElement && onClose) {
            onClose();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seekRelative, handleVolumeChange, toggleMute, toggleFullscreen, onClose, resetControlsTimer, volume, showToast]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimer}
      onClick={resetControlsTimer}
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black select-none overflow-hidden ${
        !showControls && isPlaying ? 'cursor-none' : 'cursor-default'
      }`}
    >
      {/* ───── Video Element (or Embed iFrame) ───── */}
      {effectiveSource?.type === 'embed' ? (
        <div className="relative h-full w-full">
          {embedLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm pointer-events-none">
              {poster && (
                <img
                  src={poster}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-20 filter blur-lg"
                />
              )}
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="h-14 w-14 rounded-full border-4 border-red-600/30 border-t-red-600 animate-spin" />
                <p className="text-xs font-semibold tracking-widest text-zinc-300 uppercase drop-shadow-md">
                  Connecting to Stream...
                </p>
              </div>
            </div>
          )}
          <iframe
            src={effectiveSource.url}
            title={title}
            className="h-full w-full border-0"
            allowFullScreen
            referrerPolicy="origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            onLoad={() => setEmbedLoading(false)}
            onError={() => {
              setEmbedLoading(false);
              tryNextSource();
            }}
          />
        </div>
      ) : (
        <video
          ref={videoRef}
          poster={poster}
          playsInline
          preload="auto"
          onClick={togglePlay}
          onDoubleClick={toggleFullscreen}
          className="h-full w-full object-contain cursor-pointer"
        />
      )}

      {/* ───── Toast Notification ───── */}
      {toastMessage && (
        <div className="pointer-events-none absolute top-20 z-50 rounded-full bg-black/80 px-6 py-2 text-sm font-semibold text-white backdrop-blur-md border border-white/10 shadow-2xl transition-all animate-fadeIn">
          {toastMessage}
        </div>
      )}

      {/* ───── Central Play / Pause / Seek Ripple Animation ───── */}
      {centerAnimation && (
        <div className="pointer-events-none absolute z-40 flex h-24 w-24 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md animate-ping">
          {centerAnimation === 'play' && (
            <svg className="h-12 w-12 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
          {centerAnimation === 'pause' && (
            <svg className="h-12 w-12 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          )}
          {centerAnimation === 'rewind' && (
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 19l-9-7 9-7v14z" fill="currentColor" />
                <path d="M22 19l-9-7 9-7v14z" fill="currentColor" />
              </svg>
              <span className="text-[10px] font-bold mt-1">-10s</span>
            </div>
          )}
          {centerAnimation === 'forward' && (
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 19l9-7-9-7v14z" fill="currentColor" />
                <path d="M2 19l9-7-9-7v14z" fill="currentColor" />
              </svg>
              <span className="text-[10px] font-bold mt-1">+10s</span>
            </div>
          )}
        </div>
      )}

      {/* ───── Netflix Center Loading / Buffering Spinner ───── */}
      {isBuffering && effectiveSource?.type !== 'embed' && (
        <div className="pointer-events-none absolute z-30 flex flex-col items-center justify-center gap-3">
          <div className="h-16 w-16 rounded-full border-4 border-red-600/30 border-t-red-600 animate-spin" />
          <span className="text-xs font-semibold tracking-wider text-zinc-300 uppercase drop-shadow-md">
            Buffering Chunks...
          </span>
        </div>
      )}

      {/* ───── Top Netflix Cinema Header Bar ───── */}
      <div
        className={`absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-6 bg-gradient-to-b from-black/95 via-black/60 to-transparent transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        {/* Left: Back to browse & Movie Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 hover:scale-105"
            aria-label="Back to browse"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">Back to Browse</span>
          </button>

          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-white drop-shadow-md md:text-xl line-clamp-1">
              {title}
            </h1>
            {year && (
              <span className="text-xs font-medium text-zinc-400">
                {year} &bull; Cinema Mode
              </span>
            )}
          </div>
        </div>

        {/* Right: Badges & Close Button */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 md:flex">
            <span className="rounded border border-white/20 bg-black/40 px-2 py-0.5 text-[11px] font-bold text-zinc-300">
              4K ULTRA HD
            </span>
            <span className="rounded border border-white/20 bg-black/40 px-2 py-0.5 text-[11px] font-bold text-zinc-300">
              5.1 AUDIO
            </span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-red-600 hover:scale-105"
              aria-label="Close player"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ───── Bottom Netflix Controls Bar (for Direct Streams) ───── */}
      {effectiveSource?.type !== 'embed' && (
        <div
          className={`absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/95 via-black/75 to-transparent px-6 pb-6 pt-16 transition-all duration-300 ${
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          {/* ─── Netflix Progress Bar & Chunk Buffer Display ─── */}
          <div
            ref={progressBarRef}
            onClick={handleScrubberClickOrDrag}
            onMouseMove={handleMouseMoveOnProgress}
            onMouseLeave={() => {
              setHoverPosition(null);
              setHoverTime(null);
            }}
            onMouseDown={() => setIsScrubbing(true)}
            onMouseUp={() => setIsScrubbing(false)}
            className="group relative mb-4 flex h-3 w-full cursor-pointer items-center"
          >
            {/* Background Track */}
            <div className="relative h-1 w-full rounded-full bg-white/20 transition-all duration-150 group-hover:h-2">
              {/* YouTube / Netflix Chunk Buffer Range Bars */}
              {bufferedRanges.map((range, index) => {
                if (duration <= 0) return null;
                const leftPercent = (range.start / duration) * 100;
                const widthPercent = ((range.end - range.start) / duration) * 100;
                return (
                  <div
                    key={index}
                    style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                    className="absolute top-0 bottom-0 rounded-full bg-white/40 transition-all"
                  />
                );
              })}

              {/* Hover Indicator Line */}
              {hoverPosition !== null && (
                <div
                  style={{ width: `${hoverPosition}%` }}
                  className="absolute top-0 bottom-0 rounded-full bg-white/20"
                />
              )}

              {/* Played Progress (Netflix Red #E50914) */}
              <div
                style={{ width: `${progressPercent}%` }}
                className="absolute top-0 bottom-0 rounded-full bg-red-600"
              />

              {/* Scrubber Thumb Knob */}
              <div
                style={{ left: `${progressPercent}%` }}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-red-600 shadow-md ring-2 ring-white scale-0 transition-transform duration-150 group-hover:scale-100"
              />
            </div>

            {/* Hover Time Tooltip */}
            {hoverPosition !== null && hoverTime !== null && (
              <div
                style={{ left: `${hoverPosition}%` }}
                className="pointer-events-none absolute -top-8 -translate-x-1/2 rounded bg-black/90 px-2 py-0.5 text-[11px] font-bold text-white shadow-lg border border-white/10"
              >
                {formatTime(hoverTime)}
              </div>
            )}
          </div>

          {/* ─── Controls Row ─── */}
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center gap-4">
              {/* Play / Pause Toggle */}
              <button
                onClick={togglePlay}
                className="text-white transition hover:text-red-500 hover:scale-110"
                aria-label={isPlaying ? 'Pause' : 'Play'}
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isPlaying ? (
                  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Rewind 10s */}
              <button
                onClick={() => seekRelative(-10)}
                className="text-white transition hover:text-red-500 hover:scale-110 flex items-center gap-0.5"
                title="Rewind 10s (Left Arrow)"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 3v5h5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[10px] font-bold">10</span>
              </button>

              {/* Forward 10s */}
              <button
                onClick={() => seekRelative(10)}
                className="text-white transition hover:text-red-500 hover:scale-110 flex items-center gap-0.5"
                title="Forward 10s (Right Arrow)"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 3v5h-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[10px] font-bold">10</span>
              </button>

              {/* Volume Slider with Hover Expansion */}
              <div className="group/vol flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="text-white transition hover:text-red-500 hover:scale-110"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                  title="Mute (M)"
                >
                  {isMuted || volume === 0 ? (
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" />
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                  ) : volume < 0.5 ? (
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" strokeLinecap="round" />
                    </svg>
                  )}
                </button>

                <div className="w-0 overflow-hidden transition-all duration-200 group-hover/vol:w-24">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-white/30 accent-red-600"
                  />
                </div>
              </div>

              {/* Time Display (Current / Total or Remaining) */}
              <button
                onClick={() => setShowRemainingTime(!showRemainingTime)}
                className="text-xs font-mono font-medium text-zinc-300 hover:text-white transition"
                title="Click to toggle remaining time"
              >
                {showRemainingTime ? (
                  <span>-{formatTime(Math.max(0, duration - currentTime))}</span>
                ) : (
                  <span>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                )}
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-4">
              {/* Speed Menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSpeedMenu(!showSpeedMenu);
                    setShowQualityMenu(false);
                  }}
                  className="rounded px-2 py-1 text-xs font-bold text-white transition hover:bg-white/10"
                  title="Playback Speed"
                >
                  {playbackSpeed}x
                </button>

                {showSpeedMenu && (
                  <div className="absolute bottom-10 right-0 w-32 rounded-xl border border-white/10 bg-black/95 p-1.5 shadow-2xl backdrop-blur-xl">
                    <div className="px-2 py-1 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      Speed
                    </div>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => changeSpeed(spd)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          playbackSpeed === spd
                            ? 'bg-red-600 text-white font-bold'
                            : 'text-zinc-300 hover:bg-white/10'
                        }`}
                      >
                        <span>{spd === 1 ? 'Normal' : `${spd}x`}</span>
                        {playbackSpeed === spd && (
                          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quality Menu (HLS Levels) */}
              {qualityLevels.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowQualityMenu(!showQualityMenu);
                      setShowSpeedMenu(false);
                    }}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs font-bold text-white transition hover:bg-white/10"
                    title="Video Quality"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                    </svg>
                    <span>{currentQuality === -1 ? 'Auto' : `${qualityLevels[currentQuality]?.height}p`}</span>
                  </button>

                  {showQualityMenu && (
                    <div className="absolute bottom-10 right-0 w-32 rounded-xl border border-white/10 bg-black/95 p-1.5 shadow-2xl backdrop-blur-xl">
                      <div className="px-2 py-1 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                        Quality
                      </div>
                      <button
                        onClick={() => changeQuality(-1)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          currentQuality === -1
                            ? 'bg-red-600 text-white font-bold'
                            : 'text-zinc-300 hover:bg-white/10'
                        }`}
                      >
                        <span>Auto</span>
                        {currentQuality === -1 && (
                          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      {qualityLevels.map((lvl) => (
                        <button
                          key={lvl.id}
                          onClick={() => changeQuality(lvl.id)}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                            currentQuality === lvl.id
                              ? 'bg-red-600 text-white font-bold'
                              : 'text-zinc-300 hover:bg-white/10'
                          }`}
                        >
                          <span>{lvl.height}p</span>
                          {currentQuality === lvl.id && (
                            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Picture-in-Picture */}
              <button
                onClick={togglePiP}
                className="text-white transition hover:text-red-500 hover:scale-110"
                title="Picture-in-Picture"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <rect x="12" y="10" width="8" height="8" rx="1" fill="currentColor" />
                </svg>
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="text-white transition hover:text-red-500 hover:scale-110"
                title="Fullscreen (F)"
              >
                {isFullscreen ? (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9L4 4m0 0h5m-5 0v5m11 11l5 5m0 0h-5m5 0v-5m-5-11l5-5m0 0h-5m5 0v5M9 15l-5 5m0 0h5m-5 0v-5" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ───── All Sources Failed Fallback Screen ───── */}
      {allFailed && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600/20 text-red-500 mb-4">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white md:text-2xl">Stream Connection Issue</h2>
          <p className="mt-2 max-w-md text-sm text-zinc-400">
            We encountered an issue connecting to playback sources for this title. Click retry to reconnect.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => {
                setAllFailed(false);
                setActiveSourceIndex(0);
                setEmbedLoading(true);
              }}
              className="rounded-xl bg-red-600 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-red-700 hover:scale-105 shadow-lg shadow-red-600/30"
            >
              Retry Connection
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="rounded-xl bg-white/10 px-6 py-2.5 text-xs font-semibold text-zinc-300 transition hover:bg-white/20"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
