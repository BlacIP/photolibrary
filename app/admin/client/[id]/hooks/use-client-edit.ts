import { useCallback, useState } from 'react';
import { api } from '@/lib/api-client';
import type { Client } from '../types';

export function useClientEdit({
  client,
  clientId,
  setClient,
  onRefresh,
  showAlert,
}: {
  client: Client | null;
  clientId: string;
  setClient: React.Dispatch<React.SetStateAction<Client | null>>;
  onRefresh: () => Promise<unknown>;
  showAlert: (title: string, message: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSubheading, setEditSubheading] = useState('');
  const [editDate, setEditDate] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const openEdit = useCallback(() => {
    if (!client) return;
    setEditName(client.name);
    setEditSubheading(client.subheading || '');
    const dateObj = new Date(client.event_date);
    setEditDate(!Number.isNaN(dateObj.getTime()) ? dateObj.toISOString().split('T')[0] : '');
    setEditing(true);
  }, [client]);

  const saveEdit = useCallback(async () => {
    setSavingEdit(true);
    try {
      await api.put(`admin/legacy/clients/${clientId}`, {
        name: editName,
        subheading: editSubheading,
        event_date: editDate,
      });
      setClient((prev) =>
        prev
          ? {
              ...prev,
              name: editName,
              subheading: editSubheading,
              event_date: editDate,
            }
          : null
      );
      await onRefresh();
      setEditing(false);
    } catch {
      showAlert('Error', 'Failed to update client');
    } finally {
      setSavingEdit(false);
    }
  }, [clientId, editDate, editName, editSubheading, onRefresh, setClient, showAlert]);

  const closeEdit = useCallback(() => setEditing(false), []);

  return {
    editing,
    editName,
    editSubheading,
    editDate,
    savingEdit,
    setEditName,
    setEditSubheading,
    setEditDate,
    openEdit,
    saveEdit,
    closeEdit,
  };
}
