'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCachedSWR } from '@/lib/hooks/use-cached-swr';
import type { Client, ClientResponse, LightboxState } from './types';
import { getEventDateLabel, getStatusClass } from './utils';
import { useAlerts } from './hooks/use-alerts';
import { useClientEdit } from './hooks/use-client-edit';
import { useClientStatus } from './hooks/use-client-status';
import { useHeaderMedia } from './hooks/use-header-media';
import { usePhotoActions } from './hooks/use-photo-actions';
import { usePhotoUpload } from './hooks/use-photo-upload';
import { AlertModal, ConfirmModal } from './components/client-modals';
import { ClientHeader } from './components/client-header';
import { EditClientModal } from './components/edit-client-modal';
import { HeaderMediaSection } from './components/header-media-section';
import { Lightbox } from './components/lightbox';
import { PhotoGrid } from './components/photo-grid';
import { UploadProgressModal } from './components/upload-progress-modal';

export default function ClientDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [client, setClient] = useState<Client | null>(null);
  const { data, error, isLoading, mutate } = useCachedSWR<ClientResponse>(
    id ? `admin/legacy/clients/${id}` : null
  );

  const { alertState, confirmState, showAlert, showConfirm, closeAlert, closeConfirm } =
    useAlerts();

  const { uploading, progress, totalFiles, fileInputRef, handleFileUpload } = usePhotoUpload({
    clientId: id,
    onRefresh: () => mutate(),
    showAlert,
    showConfirm,
  });

  const {
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
  } = useClientEdit({
    client,
    clientId: id,
    setClient,
    onRefresh: () => mutate(),
    showAlert,
  });

  const { updateStatus } = useClientStatus({
    client,
    clientId: id,
    setClient,
    onRefresh: () => mutate(),
    showAlert,
    showConfirm,
  });

  const { headerMedia, updatingHeader, removeHeaderMedia, setHeaderFromPhoto } = useHeaderMedia({
    client,
    clientId: id,
    onRefresh: () => mutate(),
    showAlert,
    showConfirm,
  });

  const { deletePhoto } = usePhotoActions({
    client,
    setClient,
    showAlert,
    showConfirm,
  });

  const [copied, setCopied] = useState(false);
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const [publicUrl, setPublicUrl] = useState('');

  useEffect(() => {
    if (!data) return;
    setClient({ ...data.client, photos: data.photos });
  }, [data]);

  useEffect(() => {
    if (!client || typeof window === 'undefined') return;
    setPublicUrl(`${window.location.origin}/gallery/${client.slug}`);
  }, [client]);

  const copyLink = () => {
    if (!client) return;
    const url = publicUrl || `${window.location.origin}/gallery/${client.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isInitialLoading = isLoading && !client;
  const isLoadError = error && !client;

  if (isInitialLoading) return <div className="p-8 text-center">Loading...</div>;
  if (isLoadError) return <div className="p-8 text-center">Failed to load client.</div>;
  if (!client) return <div className="p-8 text-center">Client not found.</div>;

  const statusLabel = client.status || 'ACTIVE';
  const statusClass = getStatusClass(statusLabel);
  const eventDateLabel = getEventDateLabel(client.event_date);
  const photoCount = client.photos.length;
  const canCopyLink = Boolean(client);

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleConfirm = () => {
    confirmState.onConfirm();
    closeConfirm();
  };

  return (
    <div>
      <AlertModal alertState={alertState} onClose={closeAlert} />
      <ConfirmModal confirmState={confirmState} onConfirm={handleConfirm} onClose={closeConfirm} />

      <Lightbox lightbox={lightbox} onClose={() => setLightbox(null)} />

      <ClientHeader
        client={client}
        statusLabel={statusLabel}
        statusClass={statusClass}
        eventDateLabel={eventDateLabel}
        photoCount={photoCount}
        publicUrl={publicUrl}
        copied={copied}
        canCopyLink={canCopyLink}
        uploading={uploading}
        fileInputRef={fileInputRef}
        onCopyLink={copyLink}
        onOpenEdit={openEdit}
        onArchive={() => updateStatus('ARCHIVED')}
        onUnarchive={() => updateStatus('ACTIVE')}
        onDelete={() => updateStatus('DELETED')}
        onUploadClick={handleUploadClick}
        onFileChange={handleFileUpload}
      />

      <EditClientModal
        open={editing}
        editName={editName}
        editSubheading={editSubheading}
        editDate={editDate}
        saving={savingEdit}
        onChangeName={setEditName}
        onChangeSubheading={setEditSubheading}
        onChangeDate={setEditDate}
        onSave={saveEdit}
        onCancel={closeEdit}
      />

      <HeaderMediaSection
        headerMedia={headerMedia}
        updating={updatingHeader}
        onRemove={removeHeaderMedia}
      />

      <UploadProgressModal open={uploading} progress={progress} totalFiles={totalFiles} />

      <PhotoGrid
        photos={client.photos}
        onOpenLightbox={(url) => setLightbox({ open: true, url, type: 'image' })}
        onSetHeader={setHeaderFromPhoto}
        onDeletePhoto={deletePhoto}
        onUploadClick={handleUploadClick}
      />
    </div>
  );
}
