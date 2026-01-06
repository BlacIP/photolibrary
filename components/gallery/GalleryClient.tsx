'use client';

import { useState } from 'react';
import type { GalleryLightbox, Photo } from './types';
import { useSlideshow } from './hooks/use-slideshow';
import { GallerySlideshow } from './components/gallery-slideshow';
import { GalleryLightbox } from './components/gallery-lightbox';
import { GalleryGrid } from './components/gallery-grid';

interface GalleryClientProps {
  photos: Photo[];
}

export default function GalleryClient({ photos }: GalleryClientProps) {
  const [lightbox, setLightbox] = useState<GalleryLightbox>(null);
  const {
    isSlideshow,
    currentSlideIndex,
    isPlaying,
    setIsPlaying,
    goNextSlide,
    goPreviousSlide,
    closeSlideshow,
    hasSlides,
  } = useSlideshow(photos.length);

  return (
    <>
      {isSlideshow && hasSlides && (
        <GallerySlideshow
          photos={photos}
          currentSlideIndex={currentSlideIndex}
          isPlaying={isPlaying}
          onClose={closeSlideshow}
          onPrevious={goPreviousSlide}
          onNext={goNextSlide}
          onTogglePlay={() => setIsPlaying((prev) => !prev)}
        />
      )}

      <GalleryLightbox lightbox={lightbox} onClose={() => setLightbox(null)} />

      <GalleryGrid
        photos={photos}
        onPhotoClick={(photo) =>
          setLightbox({ open: true, url: photo.url, filename: photo.filename })
        }
      />
    </>
  );
}
