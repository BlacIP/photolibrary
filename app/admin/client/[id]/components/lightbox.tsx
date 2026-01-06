import Image from 'next/image';
import { RiCloseLine } from '@remixicon/react';
import type { LightboxState } from '../types';

export function Lightbox({
  lightbox,
  onClose,
}: {
  lightbox: LightboxState;
  onClose: () => void;
}) {
  if (!lightbox) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 animate-in fade-in duration-200">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[101]"
      >
        <RiCloseLine size={32} />
      </button>

      {lightbox.type === 'image' ? (
        <div className="relative h-full w-full max-h-full max-w-full">
          <Image
            src={lightbox.url || ''}
            alt="Full View"
            fill
            sizes="100vw"
            className="object-contain rounded-lg shadow-2xl"
          />
        </div>
      ) : (
        <video
          src={lightbox.url || ''}
          className="max-w-full max-h-full rounded-lg"
          controls
          autoPlay
        />
      )}
    </div>
  );
}
