import type { Metadata } from 'next';
import { FileTextIcon } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Terms of Service - Flowlab',
  description: 'Terms of Service and legal hosting disclaimer for Flowlab / NetMirror.',
};

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16">
      <div className="rounded-2xl border border-white/10 bg-[#0e0e17]/80 p-6 backdrop-blur-xl sm:p-10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3.5 border-b border-white/10 pb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/25">
            <FileTextIcon size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Terms of Service</h1>
            <p className="mt-1 text-xs text-zinc-400">Flowlab / NetMirror Legal Terms</p>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8 space-y-8 text-sm text-zinc-300 leading-relaxed">
          <p className="text-base text-zinc-200">
            By accessing and using NetMirror and the Flowlab platform, you agree to comply with these Terms of Service.
          </p>

          <section className="space-y-3 rounded-xl border border-red-500/20 bg-red-950/20 p-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Content Hosting &amp; DMCA Safe Harbor
            </h2>
            <p className="text-zinc-300">
              NetMirror does not host, upload, or store any video files on its servers. All media content is provided by third-party services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              User Responsibility
            </h2>
            <p className="text-zinc-400">
              Users are responsible for ensuring that their use of the website complies with applicable laws in their jurisdiction.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Third-Party Links
            </h2>
            <p className="text-zinc-400">
              Our website may contain links and embedded content from third-party providers. We are not responsible for the content or policies of these services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Limitation of Liability
            </h2>
            <p className="text-zinc-400">
              NetMirror shall not be held liable for any damages arising from the use of content provided by third-party sources.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Changes
            </h2>
            <p className="text-zinc-400">
              We reserve the right to update these Terms at any time without prior notice.
            </p>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-2">
            <h2 className="text-base font-bold text-white">Legal &amp; DMCA Inquiries</h2>
            <p className="text-zinc-400">
              For legal communications, takedown requests, or service inquiries:
            </p>
            <p className="font-mono text-sm text-red-400">
              Email:{' '}
              <a href="mailto:support@netmirror.net" className="hover:underline text-rose-300">
                support@netmirror.net
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
