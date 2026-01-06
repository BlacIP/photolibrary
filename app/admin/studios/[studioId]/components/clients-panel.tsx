import Link from 'next/link';
import type { StudioClient } from '../types';
import { formatBytes, formatDateLabel } from '../utils';

export function ClientsPanel({
  studioId,
  clients,
  clientCountLabel,
}: {
  studioId: string;
  clients: StudioClient[];
  clientCountLabel: string;
}) {
  const hasClients = clients.length > 0;

  return (
    <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0">
      <div className="flex items-center justify-between border-b border-stroke-soft-200 px-5 py-4">
        <h2 className="text-sm font-semibold text-text-strong-950">Clients</h2>
        <span className="text-xs text-text-sub-600">{clientCountLabel}</span>
      </div>
      {!hasClients ? (
        <div className="p-6 text-sm text-text-sub-600">No clients yet.</div>
      ) : (
        <div className="divide-y divide-stroke-soft-200">
          {clients.map((client) => (
            <Link
              key={client.client_id}
              href={`/admin/studios/${studioId}/clients/${client.client_id}`}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm hover:bg-bg-weak-50"
            >
              <div>
                <div className="font-semibold text-text-strong-950">{client.name}</div>
                <div className="text-xs text-text-sub-600">
                  {client.slug} • {formatDateLabel(client.event_date)}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-text-sub-600">
                <span>{Number(client.photo_count || 0)} photos</span>
                <span>{formatBytes(Number(client.storage_bytes || 0))}</span>
                <span className="uppercase">{client.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
