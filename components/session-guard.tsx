'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clearSessionCache, useSession } from '@/lib/hooks/use-session';

type SessionGuardProps = {
  redirectTo?: string;
};

export default function SessionGuard({ redirectTo = '/login' }: SessionGuardProps) {
  const router = useRouter();
  const { data, error, isLoading } = useSession({ requireFresh: true });
  const loading = isLoading ?? (!data && !error);

  useEffect(() => {
    if (loading) return;
    if (!data || error) {
      clearSessionCache();
      router.replace(redirectTo);
    }
  }, [data, error, loading, redirectTo, router]);

  return null;
}
