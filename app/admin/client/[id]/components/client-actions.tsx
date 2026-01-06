import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  RiArchiveLine,
  RiDeleteBinLine,
  RiEdit2Line,
  RiUploadCloud2Line,
} from '@remixicon/react';
import type { Client } from '../types';

export function ClientActions({
  client,
  uploading,
  fileInputRef,
  onOpenEdit,
  onArchive,
  onUnarchive,
  onDelete,
  onUploadClick,
  onFileChange,
}: {
  client: Client;
  uploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onOpenEdit: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onDelete: () => void;
  onUploadClick: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex gap-3 flex-wrap w-full lg:w-auto">
      <div className="md:hidden w-full sm:w-auto">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="w-full px-4 py-2 text-sm font-medium text-text-strong-950 bg-bg-white-0 border border-stroke-soft-200 rounded-lg hover:bg-bg-weak-50 flex items-center justify-center gap-2">
              Actions
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[200px] bg-bg-white-0 rounded-lg border border-stroke-soft-200 shadow-lg p-1 z-50"
              sideOffset={5}
            >
              <DropdownMenu.Item
                onClick={onOpenEdit}
                className="flex items-center gap-2 px-3 py-2 text-sm text-text-strong-950 rounded-md hover:bg-bg-weak-50 cursor-pointer outline-none"
              >
                <RiEdit2Line size={16} />
                Edit Details
              </DropdownMenu.Item>

              {client.status !== 'ARCHIVED' ? (
                <DropdownMenu.Item
                  onClick={onArchive}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-text-strong-950 rounded-md hover:bg-bg-weak-50 cursor-pointer outline-none"
                >
                  <RiArchiveLine size={16} />
                  Archive
                </DropdownMenu.Item>
              ) : (
                <DropdownMenu.Item
                  onClick={onUnarchive}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-text-strong-950 rounded-md hover:bg-bg-weak-50 cursor-pointer outline-none"
                >
                  <RiArchiveLine size={16} />
                  Unarchive
                </DropdownMenu.Item>
              )}

              {client.status !== 'DELETED' && (
                <DropdownMenu.Item
                  onClick={onDelete}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-error-base rounded-md hover:bg-error-weak-50 cursor-pointer outline-none"
                >
                  <RiDeleteBinLine size={16} />
                  Delete
                </DropdownMenu.Item>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      <button
        onClick={onOpenEdit}
        className="hidden md:block px-4 py-2 text-sm font-medium text-text-strong-950 bg-bg-white-0 border border-stroke-soft-200 rounded-lg hover:bg-bg-weak-50"
      >
        Edit Details
      </button>

      {client.status !== 'ARCHIVED' ? (
        <button
          onClick={onArchive}
          className="hidden md:block px-4 py-2 text-sm font-medium text-text-strong-950 bg-bg-white-0 border border-stroke-soft-200 rounded-lg hover:bg-bg-weak-50"
        >
          Archive
        </button>
      ) : (
        <button
          onClick={onUnarchive}
          className="hidden md:block px-4 py-2 text-sm font-medium text-white bg-text-strong-950 rounded-lg hover:opacity-90"
        >
          Unarchive
        </button>
      )}

      {client.status !== 'DELETED' && (
        <button
          onClick={onDelete}
          className="hidden md:block px-4 py-2 text-sm font-medium text-error-base bg-bg-white-0 border border-stroke-soft-200 rounded-lg hover:bg-error-weak-50 hover:border-error-weak-200"
        >
          Delete
        </button>
      )}

      <button
        onClick={onUploadClick}
        disabled={uploading}
        className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-primary-base px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-70"
      >
        <RiUploadCloud2Line size={18} />
        {uploading ? 'Uploading...' : 'Upload Photos'}
      </button>
      <span className="hidden sm:inline text-xs text-text-sub-600 self-center">Max 10MB</span>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        multiple
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
