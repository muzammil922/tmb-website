'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/movies', label: 'Movies' },
    { href: '/search', label: 'Search' },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full bg-gradient-to-b from-black/90 to-transparent px-6 py-4 md:px-12">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-red-600">
          TMB
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition hover:text-white ${pathname === link.href ? 'text-white font-semibold' : 'text-gray-300'}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/profile" className="text-sm text-gray-300 hover:text-white">
                {user.name}
              </Link>
              <button onClick={logout} className="rounded bg-red-600 px-4 py-1.5 text-sm font-medium hover:bg-red-700">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="rounded bg-red-600 px-4 py-1.5 text-sm font-medium hover:bg-red-700">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
