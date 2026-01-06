import { useCallback, useState } from 'react';
import { api } from '@/lib/api-client';
import type { Studio } from '../types';

export function useStudioStatus({
  studio,
  studioId,
  onRefresh,
}: {
  studio: Studio | null;
  studioId: string;
  onRefresh: () => Promise<unknown>;
}) {
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const updateStatus = useCallback(
    async (status: string) => {
      if (!studio) return;
      const confirmMessage =
        status === 'DELETED'
          ? 'Delete this studio? This will block access for all users.'
          : `Set studio status to ${status}?`;
      if (!confirm(confirmMessage)) return;

      setUpdatingStatus(true);
      try {
        await api.patch(`admin/studios/${studioId}/status`, { status });
        await onRefresh();
      } catch (err) {
        console.error(err);
        alert('Failed to update studio status');
      } finally {
        setUpdatingStatus(false);
      }
    },
    [onRefresh, studio, studioId]
  );

  return { updatingStatus, updateStatus };
}
