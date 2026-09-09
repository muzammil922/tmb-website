'use client';

import { useWatchlistStore } from '@/store/watchlist';
import { CheckIcon } from '@/components/icons';

export function Toast() {
  const toastMessage = useWatchlistStore((s) => s.toastMessage);
  const setToast = useWatchlistStore((s) => s.setToast);

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-8 right-6 z-[200] flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900/95 px-5 py-3.5 text-sm font-medium text-white shadow-2xl backdrop-blur-xl animate-toast">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white">
        <CheckIcon size={14} />
      </div>
      <span>{toastMessage}</span>
      <button
        onClick={() => setToast(null)}
        className="ml-2 text-xs text-zinc-400 hover:text-white transition"
      >
        ✕
      </button>
    </div>
  );
}
