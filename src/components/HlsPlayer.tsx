'use client';

import { useEffect, useRef } from 'react';

interface HlsPlayerProps {
  src: string;
  poster?: string;
  onClose?: () => void;
}

export function HlsPlayer({ src, poster, onClose }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: { destroy: () => void } | null = null;
    let cancelled = false;

    const setup = async () => {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        return;
      }

      const mod = await import('hls.js');
      if (cancelled || !video) return;

      if (mod.default.isSupported()) {
        const instance = new mod.default({ enableWorker: true });
        instance.loadSource(src);
        instance.attachMedia(video);
        hls = instance;
      } else {
        video.src = src;
      }
    };

    setup().catch(() => {
      if (video) video.src = src;
    });

    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, [src]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-6 top-6 z-10 rounded-full bg-black/60 px-4 py-2 text-white hover:bg-black/80"
        >
          ✕ Close
        </button>
      )}
      <video
        ref={videoRef}
        poster={poster}
        controls
        autoPlay
        className="max-h-full max-w-full"
      />
    </div>
  );
}
