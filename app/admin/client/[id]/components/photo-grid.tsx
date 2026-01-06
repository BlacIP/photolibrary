import Image from 'next/image';
import { RiDeleteBinLine, RiDownloadLine, RiStarLine, RiUploadCloud2Line } from '@remixicon/react';
import type { Photo } from '../types';
import { getOptimizedUrl } from '../utils';

export function PhotoGrid({
  photos,
  onOpenLightbox,
  onSetHeader,
  onDeletePhoto,
  onUploadClick,
}: {
  photos: Photo[];
  onOpenLightbox: (url: string) => void;
  onSetHeader: (url: string) => void;
  onDeletePhoto: (photoId: string) => void;
  onUploadClick: () => void;
}) {
  if (photos.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-stroke-soft-200 bg-bg-white-0 text-center">
        <RiUploadCloud2Line className="mb-4 text-text-sub-600" size={32} />
        <p className="text-text-strong-950 font-medium">No photos yet</p>
        <p className="text-sm text-text-sub-600">Upload photos to share with the client</p>
        <p className="text-xs text-text-sub-600 mt-1">(Max 10MB per file)</p>
        <button onClick={onUploadClick} className="mt-4 text-sm text-primary-base hover:underline">
          Select photos from computer
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="group relative aspect-square overflow-hidden bg-bg-weak-50 rounded-lg border border-stroke-soft-200 shadow-sm"
        >
          <Image
            src={getOptimizedUrl(photo.url)}
            alt={photo.filename}
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
            onClick={() => onOpenLightbox(photo.url)}
          />

          <div className="absolute top-2 right-2 flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onSetHeader(photo.url)}
              className="p-2 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full text-white transition-colors shadow-lg"
              title="Set as Gallery Header"
            >
              <RiStarLine size={16} />
            </button>
            <a
              href={`/api/download?url=${encodeURIComponent(photo.url)}&filename=${encodeURIComponent(
                photo.filename
              )}&publicId=${encodeURIComponent(photo.public_id)}`}
              download={photo.filename}
              target="_blank"
              className="p-2 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full text-white transition-colors shadow-lg"
              title="Download"
            >
              <RiDownloadLine size={16} />
            </a>
            <button
              onClick={() => onDeletePhoto(photo.id)}
              className="p-2 bg-black/60 hover:bg-red-500/90 backdrop-blur-sm rounded-full text-white transition-colors shadow-lg"
              title="Delete Photo"
            >
              <RiDeleteBinLine size={16} />
            </button>
          </div>

          <div className="absolute bottom-0 inset-x-0 p-2 text-center bg-gradient-to-t from-black/70 to-transparent backdrop-blur-sm">
            <p className="text-xs text-white truncate px-1 font-medium">{photo.filename}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
