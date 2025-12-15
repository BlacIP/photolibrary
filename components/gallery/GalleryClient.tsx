'use client';

import { useState } from 'react';
import { RiDownloadLine, RiCloseLine } from '@remixicon/react';

interface Photo {
  id: string;
  url: string;
  public_id: string;
  filename: string;
}

interface GalleryClientProps {
  photos: Photo[];
}

function getDownloadUrl(url: string, filename: string) {
  return `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
}

export default function GalleryClient({ photos }: GalleryClientProps) {
  const [lightbox, setLightbox] = useState<{ open: boolean; url: string; } | null>(null);

  return (
    <>
      {/* Lightbox */}
      {lightbox && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 animate-in fade-in duration-200">
                <button 
                    onClick={() => setLightbox(null)}
                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[101]"
                >
                    <RiCloseLine size={32} />
                </button>
                <img 
                    src={lightbox.url} 
                    alt="Full View" 
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                 />
             </div>
      )}

      {/* Gallery Grid */}
      <div className="w-full px-2 mt-4">
        <div className="columns-2 gap-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 space-y-2">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative break-inside-avoid overflow-hidden bg-bg-weak-50 shadow-sm cursor-pointer"
              onClick={() => setLightbox({ open: true, url: photo.url })}
            >
              <img
                src={photo.url}
                alt={photo.filename}
                className="w-full transform transition-transform duration-500 will-change-transform group-hover:scale-105"
                loading="lazy"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <a
                    href={getDownloadUrl(photo.url, photo.filename)} // Force download transformation
                    download={photo.filename} // Fallback hint
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-text-strong-950 shadow-md transition-transform hover:scale-110 active:scale-95"
                    title="Download Photo"
                    onClick={(e) => e.stopPropagation()} // Prevent opening lightbox
                  >
                    <RiDownloadLine size={20} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {photos.length === 0 && (
          <div className="py-20 text-center text-text-sub-600">
            <p>No photos have been uploaded to this gallery yet.</p>
          </div>
        )}
      </div>
    </>
  );
}
