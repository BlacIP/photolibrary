'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCachedSWR } from '@/lib/hooks/use-cached-swr';
import { useStudioStatus } from './hooks/use-studio-status';
import { StudioHeader } from './components/studio-header';
import { StudioStats } from './components/studio-stats';
import { OwnersPanel } from './components/owners-panel';
import { ClientsPanel } from './components/clients-panel';
import type { StudioClient, StudioDetailResponse } from './types';
import { formatBytes, formatDateLabel } from './utils';

export default function StudioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studioId = params.studioId as string;

  const {
    data: studioData,
    error: studioError,
    isLoading: studioLoading,
    mutate: mutateStudio,
  } = useCachedSWR<StudioDetailResponse>(
    studioId ? `admin/studios/${studioId}` : null,
    { refreshInterval: 120_000 },
    { ttlMs: 120_000 }
  );
  const {
    data: clientsData,
    error: clientsError,
    isLoading: clientsLoading,
  } = useCachedSWR<StudioClient[]>(
    studioId ? `admin/studios/${studioId}/clients` : null,
    { refreshInterval: 120_000 },
    { ttlMs: 120_000 }
  );

  const studio = studioData?.studio ?? null;
  const stats = studioData?.stats ?? null;
  const owners = Array.isArray(studioData?.owners) ? studioData?.owners : [];
  const clients = Array.isArray(clientsData) ? clientsData : [];
  const loading = studioLoading || clientsLoading;
  const loadError = studioError || clientsError;

  const { updatingStatus, updateStatus } = useStudioStatus({
    studio,
    studioId,
    onRefresh: () => mutateStudio(),
  });

  if (loading) {
    return <div className="p-8 text-center text-text-sub-600">Loading studio...</div>;
  }

  if (loadError && !studio) {
    return (
      <div className="p-8">
        <p className="text-text-sub-600">Failed to load studio.</p>
        <button
          onClick={() => router.push('/admin')}
          className="mt-4 text-sm text-primary-base hover:text-primary-dark"
        >
          Back to studios
        </button>
      </div>
    );
  }

  if (!studio) {
    return (
      <div className="p-8">
        <p className="text-text-sub-600">Studio not found.</p>
        <button
          onClick={() => router.push('/admin')}
          className="mt-4 text-sm text-primary-base hover:text-primary-dark"
        >
          Back to studios
        </button>
      </div>
    );
  }

  const photoCount = Number(stats?.photo_count || 0);
  const storageBytes = Number(stats?.storage_bytes || 0);
  const clientCount = Number(stats?.client_count || 0);
  const formattedCreatedAt = formatDateLabel(studio.created_at);
  const ownerCountLabel = `${owners.length} total`;
  const clientCountLabel = `${clients.length} total`;
  const storageLabel = formatBytes(storageBytes);

  return (
    <div className="w-full">
      <StudioHeader
        studio={studio}
        formattedCreatedAt={formattedCreatedAt}
        updatingStatus={updatingStatus}
        onActivate={() => updateStatus('ACTIVE')}
        onSuspend={() => updateStatus('SUSPENDED')}
        onDelete={() => updateStatus('DELETED')}
      />

      <StudioStats
        clientCount={clientCount}
        photoCount={photoCount}
        storageLabel={storageLabel}
      />

      <OwnersPanel owners={owners} ownerCountLabel={ownerCountLabel} />

      <ClientsPanel
        studioId={studioId}
        clients={clients}
        clientCountLabel={clientCountLabel}
      />
    </div>
  );
}
