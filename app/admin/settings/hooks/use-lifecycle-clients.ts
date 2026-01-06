import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import type { LifecycleClient } from '../types';

export function useLifecycleClients(active: boolean) {
  const [clients, setClients] = useState<LifecycleClient[]>([]);

  const fetchClients = useCallback(async () => {
    try {
      const data = await api.get('admin/legacy/clients');
      setClients(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (active) {
      fetchClients();
    }
  }, [active, fetchClients]);

  const runCleanup = async () => {
    if (
      !confirm(
        'This will permanently delete items in Recycle Bin older than 7 days and move Archive items older than 30 days to Recycle Bin. Continue?'
      )
    )
      return;
    try {
      // TODO: Implement lifecycle endpoint in backend
      // await api.post('admin/lifecycle/cleanup');
      // alert('Cleanup completed');
      // fetchClients();
    } catch (e) {
      console.error(e);
    }
  };

  const updateClientStatus = async (id: string, status: string, onRefresh?: () => void) => {
    if (status === 'DELETED_FOREVER') {
      if (
        !confirm(
          'Are you sure you want to permanently delete this client and all photos? This cannot be undone.'
        )
      )
        return;
      try {
        await api.delete(`admin/legacy/clients/${id}`);
        fetchClients();
        onRefresh?.();
      } catch (e) {
        console.error(e);
      }
      return;
    }

    try {
      await api.put(`admin/legacy/clients/${id}`, { status });
      fetchClients();
    } catch (e) {
      console.error(e);
    }
  };

  return {
    clients,
    fetchClients,
    runCleanup,
    updateClientStatus,
  };
}
