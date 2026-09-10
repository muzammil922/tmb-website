import type { Metadata } from 'next';
import { ShieldIcon } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Privacy Policy - Flowlab',
  description: 'This Privacy Policy explains how NetMirror collects and uses information on Flowlab.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16">
      <div className="rounded-2xl border border-white/10 bg-[#0e0e17]/80 p-6 backdrop-blur-xl sm:p-10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3.5 border-b border-white/10 pb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/25">
            <ShieldIcon size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Privacy Policy</h1>
            <p className="mt-1 text-xs text-zinc-400">Last updated &bull; Flowlab / NetMirror Network</p>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8 space-y-8 text-sm text-zinc-300 leading-relaxed">
          <p className="text-base text-zinc-200">
            This Privacy Policy explains how NetMirror collects and uses information across the Flowlab platform.
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Information We Collect
            </h2>
            <ul className="list-disc space-y-1.5 pl-6 text-zinc-400">
              <li>Basic browser and device information</li>
              <li>Cookies for functionality and analytics</li>
              <li>Third-party advertising data</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Advertising
            </h2>
            <p className="text-zinc-400">
              We use third-party advertising services (such as Monetag) which may use cookies and tracking technologies to display relevant ads.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Third-Party Services
            </h2>
            <p className="text-zinc-400">
              Embedded video players and advertising networks may collect data according to their own privacy policies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Cookies
            </h2>
            <p className="text-zinc-400">
              Cookies are used to enhance user experience. You may disable cookies in your browser settings.
            </p>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-2">
            <h2 className="text-base font-bold text-white">Contact</h2>
            <p className="text-zinc-400">
              For any inquiries or privacy-related questions, please reach out to:
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
