import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { Footer } from '@/components/Footer';
import { Toast } from '@/components/Toast';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: 'Flowlab - Stream Blockbuster Movies, Web Series & Anime',
  description:
    'Flowlab: Next-generation streaming catalog and discovery engine for movies, TV series, dramas, and anime. No login required.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://player.videasy.to" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://player.videasy.to" />
        <link rel="preconnect" href="https://www.vidking.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.vidking.net" />
        <link rel="preconnect" href="https://vidsrc.cc" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://vidsrc.cc" />
      </head>
      <body className={`${geist.variable} min-h-screen bg-[#08080c] font-sans text-zinc-100 antialiased selection:bg-red-600 selection:text-white`}>
        <Providers>
          <Sidebar />
          <TopBar />
          <div className="flex min-h-screen flex-col md:pl-64">
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
          </div>
          <Toast />
        </Providers>
      </body>
    </html>
  );
}
