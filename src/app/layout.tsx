import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Toast } from '@/components/Toast';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: 'TMB Cinema - Stream Blockbuster Movies & Series',
  description:
    'Instant free streaming for movies, trailers, and series. No login or registration required. Beautiful, fast, and easy to use.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.variable} min-h-screen bg-[#08080c] font-sans text-zinc-100 antialiased`}>
        <Providers>
          <Navbar />
          <main className="min-h-screen pb-16 md:pb-0">{children}</main>
          <Footer />
          <Toast />
        </Providers>
      </body>
    </html>
  );
}
