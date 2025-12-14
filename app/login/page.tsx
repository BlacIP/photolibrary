'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiLockPasswordLine, RiUserLine, RiLoader4Line } from '@remixicon/react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        // const data = await res.json();
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-weak-50">
      <div className="w-full max-w-sm rounded-2xl bg-bg-white-0 p-8 shadow-lg ring-1 ring-stroke-soft-200">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-text-strong-950">Studio Access</h1>
          <p className="mt-2 text-sm text-text-sub-600">Please sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-sub-600">Email</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-sub-600">
                <RiUserLine size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 py-2.5 pl-10 pr-3 text-sm text-text-strong-950 placeholder-text-sub-600 focus:border-primary-base focus:outline-none focus:ring-1 focus:ring-primary-base"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-text-sub-600">Password</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-sub-600">
                <RiLockPasswordLine size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 py-2.5 pl-10 pr-3 text-sm text-text-strong-950 placeholder-text-sub-600 focus:border-primary-base focus:outline-none focus:ring-1 focus:ring-primary-base"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-error-weak p-3 text-xs font-medium text-error-base">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-text-strong-950 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? <RiLoader4Line className="animate-spin" size={20} /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
