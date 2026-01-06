import { formatBytes } from '../utils';
import type { StorageStats } from '../types';

export function StoragePanel({
  loadingStorage,
  storageStats,
}: {
  loadingStorage: boolean;
  storageStats: StorageStats | null;
}) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
      {loadingStorage && (
        <div className="p-6 rounded-2xl border border-dashed border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 shadow-sm">
          Loading storage stats...
        </div>
      )}

      {!loadingStorage && !storageStats && (
        <div className="p-6 rounded-2xl border border-dashed border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 shadow-sm">
          Storage stats not available yet.
        </div>
      )}

      {!loadingStorage && storageStats && (
        <>
          <div className="bg-bg-white-0 p-6 rounded-2xl border border-stroke-soft-200 mb-4 shadow-sm">
            <p className="text-xs text-text-sub-600 font-medium uppercase tracking-wider">Cloudinary Storage</p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-2xl font-bold text-text-strong-950 mt-1">
                  {storageStats.cloudinary && !storageStats.cloudinary.error
                    ? formatBytes(storageStats.cloudinary.storage.used)
                    : formatBytes(storageStats.totalBytes)}
                </p>
              </div>

              {storageStats.cloudinary && !storageStats.cloudinary.error ? (
                <div className="flex-1 md:ml-8 max-w-2xl">
                  <div className="flex justify-between text-xs text-text-sub-600 mb-1">
                    <span>
                      Plan Usage:{' '}
                      {storageStats.cloudinary.credits?.percent !== undefined
                        ? `${Number(storageStats.cloudinary.credits.percent || 0).toFixed(2)}%`
                        : 'N/A'}
                    </span>
                    <span>
                      {storageStats.cloudinary.credits?.limit
                        ? `${storageStats.cloudinary.credits.limit} Credits Limit`
                        : 'Limit N/A'}
                    </span>
                  </div>
                  <div className="w-full bg-bg-weak-100 rounded-full h-2 overflow-hidden mb-1">
                    <div
                      className={`h-full rounded-full ${
                        storageStats.cloudinary.credits?.percent > 90 ? 'bg-error-base' : 'bg-primary-base'
                      }`}
                      style={{
                        width: `${Math.min(100, storageStats.cloudinary.credits?.percent || 0)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-text-sub-600 flex justify-between gap-4">
                    <span>Plan: {storageStats.cloudinary.plan}</span>
                    <span title="Shared quota for Storage, Bandwidth, and Transformations">
                      1 Credit ≈ 1 GB (Storage/Bandwidth)
                    </span>
                  </p>
                </div>
              ) : storageStats.cloudinary?.error ? (
                <div className="p-2 bg-error-weak/20 rounded-lg border border-error-weak/50 text-xs text-error-base">
                  API Error: {storageStats.cloudinary.error}
                </div>
              ) : (
                <p className="text-sm text-text-sub-600">Cloudinary API Stats Unavailable</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-bg-white-0 p-5 rounded-2xl border border-stroke-soft-200 shadow-sm">
              <p className="text-xs text-text-sub-600 font-medium uppercase tracking-wider">Database Media</p>
              <p className="text-2xl font-bold text-text-strong-950 mt-1">
                {formatBytes(storageStats.totalBytes)}
              </p>
              <p className="text-sm text-text-sub-600 mt-1">{storageStats.totalPhotos} Photos</p>
            </div>
            <div className="bg-bg-white-0 p-5 rounded-2xl border border-stroke-soft-200 shadow-sm">
              <p className="text-xs text-text-sub-600 font-medium uppercase tracking-wider">Archived Content</p>
              <p className="text-2xl font-bold text-text-strong-950 mt-1">
                {formatBytes(storageStats.statusStats.archived_bytes)}
              </p>
            </div>
            <div className="bg-bg-white-0 p-5 rounded-2xl border border-stroke-soft-200 shadow-sm">
              <p className="text-xs text-text-sub-600 font-medium uppercase tracking-wider">Recycle Bin</p>
              <p className="text-2xl font-bold text-text-strong-950 mt-1">
                {formatBytes(storageStats.statusStats.deleted_bytes)}
              </p>
            </div>
          </div>

          <div className="bg-bg-white-0 rounded-2xl border border-stroke-soft-200 overflow-x-auto shadow-sm">
            <div className="min-w-[700px]">
              <div className="px-6 py-4 border-b border-stroke-soft-200">
                <h3 className="font-semibold text-text-strong-950">Storage by Client</h3>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-bg-weak-50/70 text-text-sub-600">
                  <tr>
                    <th className="px-6 py-3 font-medium">Client</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Photos</th>
                    <th className="px-6 py-3 font-medium">Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke-soft-200">
                  {storageStats.clients.map((client) => (
                    <tr key={client.id}>
                      <td className="px-6 py-3 font-medium text-text-strong-950">{client.name}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            client.status === 'ARCHIVED'
                              ? 'bg-amber-100 text-amber-700'
                              : client.status === 'DELETED'
                              ? 'bg-error-weak text-error-base'
                              : 'bg-success-weak text-success-base'
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-text-sub-600">{client.photo_count}</td>
                      <td className="px-6 py-3 font-mono text-text-sub-600">
                        {formatBytes(client.total_bytes)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
