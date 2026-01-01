'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';

export type SessionUser = {
  id: string;
  email: string;
  role?: string;
  permissions?: string[];
  name?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
};

const SESSION_CACHE_KEY = 'photolibrary_session_v1';
let sessionCache: SessionUser | null = null;

function readSessionCache(): SessionUser | null {
  if (sessionCache) return sessionCache;
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionUser;
    sessionCache = parsed;
    return parsed;
  } catch {
    return null;
  }
}

function writeSessionCache(data: SessionUser) {
  sessionCache = data;
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors.
  }
}

export function clearSessionCache() {
  sessionCache = null;
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(SESSION_CACHE_KEY);
  } catch {
    // Ignore storage errors.
  }
}

type UseSessionOptions = {
  requireFresh?: boolean;
};

export function useSession(options: UseSessionOptions = {}) {
  const { requireFresh = false } = options;
  const [fallback] = useState<SessionUser | undefined>(() => readSessionCache() ?? undefined);

  const swr = useSWR<SessionUser>('auth/me', {
    fallbackData: fallback,
    revalidateOnMount: requireFresh || !fallback,
  });

  useEffect(() => {
    if (swr.data) {
      writeSessionCache(swr.data);
    }
  }, [swr.data]);

  return swr;
}
