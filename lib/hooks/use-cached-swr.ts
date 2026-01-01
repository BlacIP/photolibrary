'use client';

import { useEffect, useMemo, useState } from 'react';
import useSWR, { type SWRConfiguration, type SWRResponse } from 'swr';

type CacheEntry<T> = {
  data: T;
  cachedAt: number;
};

type CacheOptions = {
  storageKey?: string;
  ttlMs?: number;
};

const CACHE_PREFIX = 'photolibrary_swr_v1:';
const memoryCache = new Map<string, unknown>();

function readCache<T>(key: string, ttlMs?: number): T | undefined {
  if (memoryCache.has(key)) {
    return memoryCache.get(key) as T;
  }
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.sessionStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (ttlMs && Date.now() - parsed.cachedAt > ttlMs) {
      window.sessionStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return undefined;
    }
    memoryCache.set(key, parsed.data);
    return parsed.data;
  } catch {
    return undefined;
  }
}

function writeCache<T>(key: string, data: T) {
  memoryCache.set(key, data);
  if (typeof window === 'undefined') return;
  try {
    const payload: CacheEntry<T> = { data, cachedAt: Date.now() };
    window.sessionStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(payload));
  } catch {
    // Ignore storage errors.
  }
}

export function useCachedSWR<T>(
  key: string | null,
  config: SWRConfiguration<T> = {},
  cacheOptions: CacheOptions = {},
): SWRResponse<T> {
  const storageKey = useMemo(() => cacheOptions.storageKey ?? key ?? '', [cacheOptions.storageKey, key]);
  const [fallback, setFallback] = useState<T | undefined>(() => {
    if (!storageKey) return undefined;
    return readCache<T>(storageKey, cacheOptions.ttlMs);
  });
  const [ready, setReady] = useState(() => !storageKey || key === null || fallback !== undefined);

  useEffect(() => {
    if (!storageKey) {
      setReady(true);
      return;
    }
    if (fallback !== undefined) {
      setReady(true);
      return;
    }
    const cached = readCache<T>(storageKey, cacheOptions.ttlMs);
    if (cached !== undefined) {
      setFallback(cached);
    }
    setReady(true);
  }, [storageKey, fallback, cacheOptions.ttlMs]);

  const swr = useSWR<T>(ready && key ? key : null, {
    ...config,
    fallbackData: fallback ?? config.fallbackData,
    revalidateOnMount: config.revalidateOnMount ?? fallback === undefined,
  });

  useEffect(() => {
    if (!storageKey || swr.data === undefined) return;
    writeCache(storageKey, swr.data);
  }, [storageKey, swr.data]);

  return swr;
}
