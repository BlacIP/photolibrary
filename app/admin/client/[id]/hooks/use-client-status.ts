import { useCallback } from 'react';
import { api } from '@/lib/api-client';
import type { Client } from '../types';

export function useClientStatus({
  client,
  clientId,
  setClient,
  onRefresh,
  showAlert,
  showConfirm,
}: {
  client: Client | null;
  clientId: string;
  setClient: React.Dispatch<React.SetStateAction<Client | null>>;
  onRefresh: () => Promise<unknown>;
  showAlert: (title: string, message: string) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
}) {
  const updateStatus = useCallback(
    async (newStatus: Client['status']) => {
      if (!client) return;

      const performUpdate = async () => {
        try {
          await api.put(`admin/legacy/clients/${clientId}`, { status: newStatus });
          setClient({ ...client, status: newStatus });
          await onRefresh();
          if (newStatus === 'DELETED') {
            showAlert('Success', 'Client deleted (Soft Delete). Public link is now disabled.');
          }
        } catch (e) {
          console.error(e);
          showAlert('Error', 'Failed to update status');
        }
      };

      if (newStatus === 'DELETED') {
        showConfirm(
          'Delete Client?',
          'Are you sure you want to delete this client? The public link will show a "Under Construction" page.',
          performUpdate
        );
      } else {
        await performUpdate();
      }
    },
    [client, clientId, onRefresh, setClient, showAlert, showConfirm]
  );

  return { updateStatus };
}
