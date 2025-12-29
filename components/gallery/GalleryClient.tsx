'use client';

import { useState, useEffect } from 'react';
import { RiCloseLine, RiDownloadLine } from '@remixicon/react';

interface Photo {
  id: string;
  url: string;
  filename: string;
}

interface GalleryClientProps {
  photos: Photo[];
}

// Helper to get optimized Cloudinary URL for display
const getOptimizedUrl = (url: string, width = 800) => {
  // Check if it's a Cloudinary URL
  if (url.includes('cloudinary.com')) {
    // Insert transformations before '/upload/'
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
  }
  return url; // Return original if not Cloudinary
};

const getDownloadUrl = (url: string, filename: string) => {
  // If it's a Cloudinary URL, use the fl_attachment transformation to force download
  if (url.includes('cloudinary.com')) {
    // Use fl_attachment:filename to specify the download filename
    // We strip the extension because Cloudinary adds it based on the format
    const nameWithoutExt = filename.split('.').slice(0, -1).join('.') || filename;
    return url.replace('/upload/', `/upload/fl_attachment:${encodeURIComponent(nameWithoutExt)}/`);
  }
  // Fallback to direct URL (might open in new tab if cross-origin headers not set)
  return url;
};

export default function GalleryClient({ photos }: GalleryClientProps) {
  const [lightbox, setLightbox] = useState<{ open: boolean; url: string; filename: string } | null>(null);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadAll = async () => {
    setIsDownloading(true);
    try {
      // Get slug from URL
      const slug = window.location.pathname.split('/').pop();
      const response = await fetch(`/api/gallery/${slug}/download`);

      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Gallery.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download gallery. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Auto-advance slideshow
  useEffect(() => {
    if (!isSlideshow || !isPlaying || photos.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
    }, 5000); // 5 seconds

    return () => clearInterval(timer);
  }, [isSlideshow, isPlaying, photos.length]);

  // Keyboard controls for slideshow
  useEffect(() => {
    if (!isSlideshow) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          setCurrentSlideIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
          break;
        case 'ArrowRight':
          setCurrentSlideIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying((prev) => !prev);
          break;
        case 'Escape':
          setIsSlideshow(false);
          setIsPlaying(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSlideshow, photos.length]);

  // Listen for slideshow event from hero button
  useEffect(() => {
    const handleOpenSlideshow = () => {
      setIsSlideshow(true);
      setCurrentSlideIndex(0);
      setIsPlaying(true);
    };

    window.addEventListener('openSlideshow', handleOpenSlideshow);
    return () => window.removeEventListener('openSlideshow', handleOpenSlideshow);
  }, []);

  return (
    <>
      {/* Slideshow Modal */}
      {isSlideshow && photos.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 z-[101] flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="text-white text-lg font-medium">
              {currentSlideIndex + 1} / {photos.length}
            </div>
            <button
              onClick={() => {
                setIsSlideshow(false);
                setIsPlaying(true);
              }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <RiCloseLine size={32} />
            </button>
          </div>

          {/* Current Image */}
          <div className="flex-1 flex items-center justify-center p-4">
            <img
              src={photos[currentSlideIndex].url}
              alt={photos[currentSlideIndex].filename}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 z-[101] flex justify-center items-center gap-4 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <button
              onClick={() => setCurrentSlideIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              title="Previous (←)"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => setCurrentSlideIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              title="Next (→)"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 animate-in fade-in duration-200">
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[101]"
          >
            <RiCloseLine size={32} />
          </button>

          <a
            href={getDownloadUrl(lightbox.url, lightbox.filename)}
            download={lightbox.filename}
            target="_blank"
            className="absolute top-4 left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[101]"
            title="Download Original"
          >
            <RiDownloadLine size={32} />
          </a>

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
              onClick={() => setLightbox({ open: true, url: photo.url, filename: photo.filename })}
            >
              <img
                src={getOptimizedUrl(photo.url)}
                alt={photo.filename}
                className="w-full transform transition-transform duration-500 will-change-transform group-hover:scale-105"
                loading="lazy"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <a
                    href={getDownloadUrl(photo.url, photo.filename)}
                    download={photo.filename}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-text-strong-950 shadow-md transition-transform hover:scale-110 active:scale-95"
                    title="Download Photo"
                    onClick={(e) => e.stopPropagation()}
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
