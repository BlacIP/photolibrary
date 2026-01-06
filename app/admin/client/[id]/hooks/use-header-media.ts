import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import type { Client, HeaderMediaState } from '../types';

export function useHeaderMedia({
  client,
  clientId,
  onRefresh,
  showAlert,
  showConfirm,
}: {
  client: Client | null;
  clientId: string;
  onRefresh: () => Promise<unknown>;
  showAlert: (title: string, message: string) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
}) {
  const [headerMedia, setHeaderMedia] = useState<HeaderMediaState>({
    url: null,
    type: null,
  });
  const [updatingHeader, setUpdatingHeader] = useState(false);

  useEffect(() => {
    if (!client) return;
    if (client.header_media_url) {
      setHeaderMedia({
        url: client.header_media_url,
        type: client.header_media_type || 'image',
      });
    } else {
      setHeaderMedia({ url: null, type: null });
    }
  }, [client]);

  const removeHeaderMedia = useCallback(() => {
    showConfirm('Remove Header?', 'Are you sure you want to remove the header media?', async () => {
      setUpdatingHeader(true);
      try {
        await api.put(`admin/legacy/clients/${clientId}`, {
          header_media_url: null,
          header_media_type: null,
        });
        setHeaderMedia({ url: null, type: null });
        await onRefresh();
      } catch {
        showAlert('Error', 'Failed to remove header');
      } finally {
        setUpdatingHeader(false);
      }
    });
  }, [clientId, onRefresh, showAlert, showConfirm]);

  const setHeaderFromPhoto = useCallback(
    async (url: string) => {
      setUpdatingHeader(true);
      try {
        await api.put(`admin/legacy/clients/${clientId}`, {
          header_media_url: url,
          header_media_type: 'image',
        });

        setHeaderMedia({ url, type: 'image' });
        showAlert('Success', 'Header updated successfully');
      } catch (err: unknown) {
        const error = err as { message?: string; error?: string };
        const errorMsg = error?.message || error?.error || 'Failed to update header';
        showAlert('Error', errorMsg);
      } finally {
        setUpdatingHeader(false);
      }
    },
    [clientId, showAlert]
  );

  return { headerMedia, updatingHeader, removeHeaderMedia, setHeaderFromPhoto };
}
