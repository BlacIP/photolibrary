import Image from 'next/image';
import { RiCloseLine } from '@remixicon/react';
import type { Photo } from '../types';

export function GallerySlideshow({
  photos,
  currentSlideIndex,
  isPlaying,
  onClose,
  onPrevious,
  onNext,
  onTogglePlay,
}: {
  photos: Photo[];
  currentSlideIndex: number;
  isPlaying: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="absolute top-0 left-0 right-0 z-[101] flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="text-white text-lg font-medium">
          {currentSlideIndex + 1} / {photos.length}
        </div>
        <button
          onClick={onClose}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
        >
          <RiCloseLine size={32} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative h-full w-full max-h-full max-w-full">
          <Image
            src={photos[currentSlideIndex].url}
            alt={photos[currentSlideIndex].filename}
            fill
            sizes="100vw"
            className="object-contain"
          />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-[101] flex justify-center items-center gap-4 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <button
          onClick={onPrevious}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          title="Previous (←)"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={onTogglePlay}
          className="p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {isPlaying ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </button>

        <button
          onClick={onNext}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          title="Next (→)"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
