import { RiHardDriveLine, RiImageLine, RiUser3Line } from '@remixicon/react';

export function StudioStats({
  clientCount,
  photoCount,
  storageLabel,
}: {
  clientCount: number;
  photoCount: number;
  storageLabel: string;
}) {
  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4">
        <div className="flex items-center gap-2 text-sm text-text-sub-600">
          <RiUser3Line size={16} />
          Clients
        </div>
        <div className="mt-2 text-2xl font-semibold text-text-strong-950">{clientCount}</div>
      </div>
      <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4">
        <div className="flex items-center gap-2 text-sm text-text-sub-600">
          <RiImageLine size={16} />
          Photos
        </div>
        <div className="mt-2 text-2xl font-semibold text-text-strong-950">{photoCount}</div>
      </div>
      <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4">
        <div className="flex items-center gap-2 text-sm text-text-sub-600">
          <RiHardDriveLine size={16} />
          Storage
        </div>
        <div className="mt-2 text-2xl font-semibold text-text-strong-950">{storageLabel}</div>
      </div>
    </div>
  );
}
