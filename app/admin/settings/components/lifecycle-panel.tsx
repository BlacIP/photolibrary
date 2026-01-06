import { RiRefreshLine } from '@remixicon/react';
import { calculateDaysLeft } from '../utils';
import type { LifecycleClient } from '../types';

export function LifecyclePanel({
  title,
  description,
  status,
  days,
  clients,
  onRunCleanup,
  onUpdateStatus,
}: {
  title: string;
  description: string;
  status: string;
  days: number;
  clients: LifecycleClient[];
  onRunCleanup: () => void;
  onUpdateStatus: (id: string, status: string) => void;
}) {
  const isArchiveTab = status === 'ARCHIVED';
  const showEmptyClients = clients.length === 0;

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stroke-soft-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-text-strong-950">{title}</h2>
            <p className="mt-1 text-sm text-text-sub-600">{description}</p>
          </div>
          <button
            onClick={onRunCleanup}
            className="flex items-center gap-2 rounded-full border border-stroke-soft-200 bg-bg-weak-50 px-4 py-2 text-sm text-text-sub-600 hover:text-text-strong-950"
          >
            <RiRefreshLine size={16} /> Run Lifecycle Cleanup
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="bg-bg-weak-50/70 text-text-sub-600">
              <tr>
                <th className="px-6 py-3 font-medium">Client</th>
                <th className="px-6 py-3 font-medium">Status Updated</th>
                <th className="px-6 py-3 font-medium">Auto-Move In</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke-soft-200">
              {clients.map((client) => (
                <tr key={client.id}>
                  <td className="px-6 py-3 font-medium text-text-strong-950">{client.name}</td>
                  <td className="px-6 py-3 text-text-sub-600">
                    {new Date(client.statusUpdatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 text-text-sub-600">
                    {calculateDaysLeft(client.statusUpdatedAt, days)} Days
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onUpdateStatus(client.id, 'ACTIVE')}
                        className="rounded-full border border-stroke-soft-200 bg-bg-weak-50 px-3 py-1.5 text-xs font-semibold text-text-strong-950 hover:bg-bg-weak-100"
                      >
                        Restore
                      </button>
                      {isArchiveTab ? (
                        <button
                          onClick={() => onUpdateStatus(client.id, 'DELETED')}
                          className="rounded-full px-3 py-1.5 text-xs font-semibold text-error-base hover:bg-error-weak/10"
                        >
                          Move to Bin
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateStatus(client.id, 'DELETED_FOREVER')}
                          className="rounded-full px-3 py-1.5 text-xs font-semibold text-error-base hover:bg-error-weak/10"
                        >
                          Delete Forever
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {showEmptyClients && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-text-sub-600">
                    No clients in {title}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
