import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Movie } from '@/lib/shared';

export interface HistoryItem {
  movie: Movie;
  progress: number; // percentage 0-100
  updatedAt: string;
}

interface WatchlistState {
  watchlist: Movie[];
  favorites: Movie[];
  history: HistoryItem[];
  toastMessage: string | null;
  setToast: (msg: string | null) => void;
  isInWatchlist: (id: string) => boolean;
  isInFavorites: (id: string) => boolean;
  toggleWatchlist: (movie: Movie) => boolean;
  toggleFavorite: (movie: Movie) => boolean;
  removeFromWatchlist: (id: string) => void;
  removeFromFavorites: (id: string) => void;
  updateProgress: (movie: Movie, progress: number) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchlist: [],
      favorites: [],
      history: [],
      toastMessage: null,

      setToast: (msg) => {
        set({ toastMessage: msg });
        if (msg) {
          setTimeout(() => {
            if (get().toastMessage === msg) {
              set({ toastMessage: null });
            }
          }, 3000);
        }
      },

      isInWatchlist: (id: string) => {
        return get().watchlist.some((m) => m.id === id);
      },

      isInFavorites: (id: string) => {
        return get().favorites.some((m) => m.id === id);
      },

      toggleWatchlist: (movie: Movie) => {
        const exists = get().watchlist.some((m) => m.id === movie.id);
        if (exists) {
          set({
            watchlist: get().watchlist.filter((m) => m.id !== movie.id),
          });
          get().setToast(`Removed "${movie.title}" from My List`);
          return false;
        } else {
          set({
            watchlist: [movie, ...get().watchlist],
          });
          get().setToast(`Added "${movie.title}" to My List`);
          return true;
        }
      },

      toggleFavorite: (movie: Movie) => {
        const exists = get().favorites.some((m) => m.id === movie.id);
        if (exists) {
          set({
            favorites: get().favorites.filter((m) => m.id !== movie.id),
          });
          get().setToast(`Removed "${movie.title}" from Favorites`);
          return false;
        } else {
          set({
            favorites: [movie, ...get().favorites],
          });
          get().setToast(`Added "${movie.title}" to Favorites`);
          return true;
        }
      },

      removeFromWatchlist: (id: string) => {
        set({
          watchlist: get().watchlist.filter((m) => m.id !== id),
        });
      },

      removeFromFavorites: (id: string) => {
        set({
          favorites: get().favorites.filter((m) => m.id !== id),
        });
      },

      updateProgress: (movie: Movie, progress: number) => {
        const now = new Date().toISOString();
        const filtered = get().history.filter((item) => item.movie.id !== movie.id);
        if (progress > 95) {
          // Finished movie, don't keep in continue watching
          set({ history: filtered });
          return;
        }
        set({
          history: [{ movie, progress: Math.round(progress), updatedAt: now }, ...filtered],
        });
      },

      removeFromHistory: (id: string) => {
        set({
          history: get().history.filter((item) => item.movie.id !== id),
        });
      },

      clearHistory: () => {
        set({ history: [] });
      },
    }),
    {
      name: 'tmb-user-library',
    },
  ),
);
