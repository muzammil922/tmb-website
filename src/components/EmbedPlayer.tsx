'use client';

interface EmbedPlayerProps {
  src: string;
  onClose?: () => void;
}

export function EmbedPlayer({ src, onClose }: EmbedPlayerProps) {
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
      <iframe
        src={src}
        className="h-full w-full max-h-[90vh] max-w-6xl"
        allowFullScreen
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      />
    </div>
  );
}
