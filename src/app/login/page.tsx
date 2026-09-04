'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken);
      router.push('/');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-16">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg bg-zinc-900 p-8">
        <h1 className="mb-6 text-2xl font-bold">Sign In</h1>
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="mb-4 w-full rounded bg-zinc-800 px-4 py-3 outline-none focus:ring-2 focus:ring-red-600"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="mb-6 w-full rounded bg-zinc-800 px-4 py-3 outline-none focus:ring-2 focus:ring-red-600"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-red-600 py-3 font-semibold hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <p className="mt-4 text-center text-sm text-gray-400">
          No account? <Link href="/register" className="text-red-500 hover:underline">Register</Link>
        </p>
      </form>
    </div>
  );
}
