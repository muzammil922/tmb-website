import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoIcon, SparklesIcon, FilmIcon } from '@/components/icons';

export const metadata: Metadata = {
  title: 'About - Flowlab',
  description: 'About Flowlab and the NetMirror media discovery engine.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16">
      <div className="rounded-2xl border border-white/10 bg-[#0e0e17]/80 p-6 backdrop-blur-xl sm:p-10 shadow-2xl space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3.5 border-b border-white/10 pb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 text-white shadow-lg shadow-red-600/25">
            <InfoIcon size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">About Flowlab</h1>
            <p className="mt-1 text-xs text-zinc-400">Next-Generation Streaming Directory &amp; Index Engine</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
          <p className="text-base text-zinc-200">
            <strong className="text-white">Flowlab</strong> is a modern media index and catalog directory designed for cinema fans, television series followers, and anime enthusiasts worldwide.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <SparklesIcon size={16} />
                <span>Fast &amp; Seamless Indexing</span>
              </div>
              <p className="text-xs text-zinc-400">
                Discover trending movies, TV shows, and anime series with comprehensive metadata, posters, casts, and season guides.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <FilmIcon size={16} />
                <span>Multi-Source Aggregation</span>
              </div>
              <p className="text-xs text-zinc-400">
                Integrated with premier third-party streaming engines offering multi-server playback and trailer previews.
              </p>
            </div>
          </div>

          <section className="space-y-3 pt-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Non-Hosting Architecture
            </h2>
            <p className="text-zinc-400">
              NetMirror and Flowlab operate solely as automated indexing engines. We do not host, upload, or store any media files or video streams on our servers. All playback streams are embedded or linked from non-affiliated third-party service providers.
            </p>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-2">
            <h2 className="text-base font-bold text-white">Contact Us</h2>
            <p className="text-zinc-400">
              For platform inquiries, feedback, or legal notices, reach out to our team:
            </p>
            <p className="font-mono text-sm text-red-400">
              Email:{' '}
              <a href="mailto:support@netmirror.net" className="hover:underline text-rose-300">
                support@netmirror.net
              </a>
            </p>
          </section>

          <div className="pt-4 flex items-center gap-4 text-xs text-zinc-500">
            <Link href="/privacy" className="hover:text-zinc-300 transition">Privacy Policy</Link>
            <span>&bull;</span>
            <Link href="/terms" className="hover:text-zinc-300 transition">Terms of Use</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
