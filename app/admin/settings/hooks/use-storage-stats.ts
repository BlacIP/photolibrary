import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import type { StorageStats } from '../types';

export function useStorageStats(active: boolean) {
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [loadingStorage, setLoadingStorage] = useState(false);

  const fetchStorage = async () => {
    setLoadingStorage(true);
    try {
      const res = await api.get('admin/storage');
      setStorageStats(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStorage(false);
    }
  };

  useEffect(() => {
    if (active) fetchStorage();
  }, [active]);

  return { storageStats, loadingStorage, fetchStorage };
}
