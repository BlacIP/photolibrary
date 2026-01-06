import Link from 'next/link';
import {
  RiArrowLeftLine,
  RiDeleteBinLine,
  RiShieldCheckLine,
  RiShieldCrossLine,
} from '@remixicon/react';
import type { Studio } from '../types';

export function StudioHeader({
  studio,
  formattedCreatedAt,
  updatingStatus,
  onActivate,
  onSuspend,
  onDelete,
}: {
  studio: Studio;
  formattedCreatedAt: string;
  updatingStatus: boolean;
  onActivate: () => void;
  onSuspend: () => void;
  onDelete: () => void;
}) {
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-text-sub-600">
        <Link href="/admin" className="inline-flex items-center gap-1 hover:text-primary-base">
          <RiArrowLeftLine />
          Back to studios
        </Link>
        <span>•</span>
        <span>{studio.slug}</span>
      </div>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-title-h4 font-bold text-text-strong-950">{studio.name}</h1>
          <p className="text-sm text-text-sub-600">
            {studio.status} • {studio.plan} • Created {formattedCreatedAt}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onActivate}
            disabled={updatingStatus}
            className="inline-flex items-center gap-2 rounded-lg border border-stroke-soft-200 px-3 py-2 text-sm font-medium text-text-strong-950 hover:border-primary-base"
          >
            <RiShieldCheckLine size={16} />
            Activate
          </button>
          <button
            onClick={onSuspend}
            disabled={updatingStatus}
            className="inline-flex items-center gap-2 rounded-lg border border-stroke-soft-200 px-3 py-2 text-sm font-medium text-text-strong-950 hover:border-primary-base"
          >
            <RiShieldCrossLine size={16} />
            Suspend
          </button>
          <button
            onClick={onDelete}
            disabled={updatingStatus}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:border-red-400"
          >
            <RiDeleteBinLine size={16} />
            Delete
          </button>
        </div>
      </div>
    </>
  );
}
