'use client';

import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  initialProgress?: number;
  onProgress?: (progress: number) => void;
  onClose?: () => void;
}

export function VideoPlayer({ src, poster, initialProgress = 0, onProgress, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const setProgress = () => {
      if (video.duration) {
        video.currentTime = (initialProgress / 100) * video.duration;
      }
    };
    video.addEventListener('loadedmetadata', setProgress);

    const interval = setInterval(() => {
      if (video.duration && onProgress) {
        onProgress((video.currentTime / video.duration) * 100);
      }
    }, 5000);

    return () => {
      video.removeEventListener('loadedmetadata', setProgress);
      clearInterval(interval);
    };
  }, [initialProgress, onProgress]);

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
        src={src}
        poster={poster}
        controls
        autoPlay
        className="max-h-full max-w-full"
      />
    </div>
  );
}
