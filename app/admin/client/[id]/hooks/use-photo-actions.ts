import { useCallback } from 'react';
import { api } from '@/lib/api-client';
import type { Client } from '../types';

export function usePhotoActions({
  client,
  setClient,
  showAlert,
  showConfirm,
}: {
  client: Client | null;
  setClient: React.Dispatch<React.SetStateAction<Client | null>>;
  showAlert: (title: string, message: string) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
}) {
  const deletePhoto = useCallback(
    (photoId: string) => {
      showConfirm('Delete Photo?', 'Are you sure you want to delete this photo?', async () => {
        const previousPhotos = client?.photos;

        setClient((prev) =>
          prev
            ? {
                ...prev,
                photos: prev.photos.filter((photo) => photo.id !== photoId),
              }
            : null
        );

        try {
          await api.delete(`admin/legacy/photos/${photoId}`);
        } catch {
          showAlert('Error', 'Error deleting photo');
          setClient((prev) => (prev ? { ...prev, photos: previousPhotos || [] } : null));
        }
      });
    },
    [client, setClient, showAlert, showConfirm]
  );

  return { deletePhoto };
}
