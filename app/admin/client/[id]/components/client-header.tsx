import Link from 'next/link';
import { RiCheckLine, RiShareBoxLine } from '@remixicon/react';
import type { Client } from '../types';
import { ClientActions } from './client-actions';

export function ClientHeader({
  client,
  statusLabel,
  statusClass,
  eventDateLabel,
  photoCount,
  publicUrl,
  copied,
  canCopyLink,
  uploading,
  fileInputRef,
  onCopyLink,
  onOpenEdit,
  onArchive,
  onUnarchive,
  onDelete,
  onUploadClick,
  onFileChange,
}: {
  client: Client;
  statusLabel: string;
  statusClass: string;
  eventDateLabel: string;
  photoCount: number;
  publicUrl: string;
  copied: boolean;
  canCopyLink: boolean;
  uploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onCopyLink: () => void;
  onOpenEdit: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onDelete: () => void;
  onUploadClick: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/admin"
          className="text-sm text-text-sub-600 hover:text-text-strong-950 flex items-center gap-1"
        >
          ← Back to Dashboard
        </Link>

        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium border ${statusClass}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h2 className="text-title-h3 font-bold text-text-strong-950">{client.name}</h2>
          {client.subheading && (
            <p className="text-lg text-text-sub-600 whitespace-pre-wrap">{client.subheading}</p>
          )}
          <p className="text-text-sub-600 mt-1">
            {eventDateLabel} • {photoCount} Photos
          </p>

          <div className="mt-4 flex items-center gap-2 max-w-xl">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-bg-white-0 border border-stroke-soft-200 rounded-lg shadow-sm">
              <span className="text-text-sub-600 text-sm truncate flex-1 block w-0">
                {publicUrl || 'Loading public link...'}
              </span>
            </div>
            <button
              onClick={onCopyLink}
              className="p-2 hover:bg-bg-weak-50 rounded-lg text-text-sub-600 transition-colors"
              title="Copy Link"
              disabled={!canCopyLink}
            >
              {copied ? <RiCheckLine size={20} className="text-primary-base" /> : <RiShareBoxLine size={20} />}
            </button>
            <a
              href={publicUrl || '#'}
              target="_blank"
              className="p-2 hover:bg-bg-weak-50 rounded-lg text-text-sub-600 transition-colors"
              title="Preview Public Page"
            >
              <RiShareBoxLine size={20} />
            </a>
          </div>
        </div>

        <ClientActions
          client={client}
          uploading={uploading}
          fileInputRef={fileInputRef}
          onOpenEdit={onOpenEdit}
          onArchive={onArchive}
          onUnarchive={onUnarchive}
          onDelete={onDelete}
          onUploadClick={onUploadClick}
          onFileChange={onFileChange}
        />
      </div>
    </div>
  );
}
