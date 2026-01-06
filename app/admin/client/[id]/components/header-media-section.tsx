import Image from 'next/image';
import { RiStarLine } from '@remixicon/react';
import type { HeaderMediaState } from '../types';

export function HeaderMediaSection({
  headerMedia,
  updating,
  onRemove,
}: {
  headerMedia: HeaderMediaState;
  updating: boolean;
  onRemove: () => void;
}) {
  return (
    <div className="bg-bg-white-0 rounded-xl border border-stroke-soft-200 p-4 md:p-6 flex flex-col md:flex-row gap-6 items-start">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-text-strong-950 mb-1">Gallery Header</h3>
        <p className="text-sm text-text-sub-600 mb-4">
          The header image appears at the top of the public gallery.
        </p>

        {!headerMedia.url ? (
          <div className="p-4 bg-bg-weak-50 rounded-lg border border-dashed border-stroke-soft-200 text-text-sub-600 text-sm">
            <p>No header image set.</p>
            <p className="mt-1 text-xs">
              Click the{' '}
              <RiStarLine
                className="inline mx-1 align-text-bottom text-text-strong-950"
                size={14}
              />
              icon on any photo below to set it as the gallery header.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <button
              onClick={onRemove}
              className="px-4 py-2 bg-error-weak/10 text-error-base hover:bg-error-weak/20 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 w-full sm:w-auto"
              disabled={updating}
            >
              {updating ? 'Removing...' : 'Remove Header Media'}
            </button>
          </div>
        )}
      </div>

      {headerMedia.url && (
        <div className="w-full md:w-64 aspect-video rounded-lg overflow-hidden bg-black relative border border-stroke-soft-200 shadow-sm">
          {headerMedia.type === 'video' ? (
            <video src={headerMedia.url} className="w-full h-full object-cover" controls />
          ) : (
            <Image
              src={headerMedia.url}
              alt="Header"
              fill
              sizes="(min-width: 768px) 256px, 100vw"
              className="object-cover"
            />
          )}
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-full backdrop-blur-sm">
            Current Header
          </div>
        </div>
      )}
    </div>
  );
}
