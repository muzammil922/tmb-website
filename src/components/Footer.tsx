import Link from 'next/link';
import { FilmIcon, SparklesIcon } from './icons';

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#060608] text-zinc-400">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 text-2xl font-black tracking-wider text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-lg shadow-red-600/30">
                <FilmIcon size={20} />
              </span>
              <span>TMB<span className="text-red-500 font-medium text-lg ml-1">CINEMA</span></span>
            </Link>
            <p className="mt-4 max-w-md text-sm text-zinc-400 leading-relaxed">
              Your premier gateway to blockbuster movies, timeless classics, and trending releases. Enjoy instant HD streaming with zero login barriers, seamless watchlists, and lightning-fast search.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <SparklesIcon size={14} />
              <span>100% Free &bull; No Login Required &bull; Ultra HD Ready</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Explore</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition">Home Spotlight</Link>
              </li>
              <li>
                <Link href="/movies" className="hover:text-white transition">Browse All Movies</Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-white transition">Live Search</Link>
              </li>
              <li>
                <Link href="/my-list" className="hover:text-white transition">My Watchlist &amp; History</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Features</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                <span>Instant Playback</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                <span>Local Bookmarks &amp; Resume</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                <span>Official HD Trailers</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                <span>Mobile &amp; TV Optimized</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-white/5 pt-8 text-xs text-zinc-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} TMB Platform. Made for movie lovers everywhere.</p>
          <p className="mt-2 sm:mt-0">All metadata and images powered by TMDB.</p>
        </div>
      </div>
    </footer>
  );
}
