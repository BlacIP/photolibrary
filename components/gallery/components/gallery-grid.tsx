import Image from 'next/image';
import { RiDownloadLine } from '@remixicon/react';
import type { Photo } from '../types';
import { getDownloadUrl, getOptimizedUrl } from '../utils';

export function GalleryGrid({
  photos,
  onPhotoClick,
}: {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
}) {
  const hasPhotos = photos.length > 0;

  return (
    <div className="w-full px-2 mt-4">
      <div className="columns-2 gap-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 space-y-2">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group relative break-inside-avoid overflow-hidden bg-bg-weak-50 shadow-sm cursor-pointer"
            onClick={() => onPhotoClick(photo)}
          >
            <Image
              src={getOptimizedUrl(photo.url)}
              alt={photo.filename}
              width={photo.width ?? 1200}
              height={photo.height ?? 800}
              sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 768px) 25vw, 50vw"
              className="h-auto w-full transform transition-transform duration-500 will-change-transform group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="absolute bottom-4 right-4 flex gap-2">
                <a
                  href={getDownloadUrl(photo.url, photo.filename)}
                  download={photo.filename}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-text-strong-950 shadow-md transition-transform hover:scale-110 active:scale-95"
                  title="Download Photo"
                  onClick={(event) => event.stopPropagation()}
                >
                  <RiDownloadLine size={20} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!hasPhotos && (
        <div className="py-20 text-center text-text-sub-600">
          <p>No photos have been uploaded to this gallery yet.</p>
        </div>
      )}
    </div>
  );
}
