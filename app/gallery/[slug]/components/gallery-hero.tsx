import Image from 'next/image';
import Header from '@/components/header';
import type { Client } from '../types';
import { GalleryActions } from './gallery-actions';

export function GalleryHero({
  client,
  formattedDate,
  isDownloading,
  onDownload,
  onSlideshow,
  onScrollToGallery,
}: {
  client: Client;
  formattedDate: string;
  isDownloading: boolean;
  onDownload: () => void;
  onSlideshow: () => void;
  onScrollToGallery: () => void;
}) {
  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-bg-weak-50">
      <Header className="absolute top-0 left-0 right-0 z-50 border-none bg-transparent text-white" />

      {client.header_media_type === 'video' ? (
        <video
          src={client.header_media_url}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <Image
          src={client.header_media_url}
          alt={client.name}
          fill
          sizes="100vw"
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <h1
          style={{ fontSize: 'clamp(1.5rem, 5vw, 3.75rem)' }}
          className="font-semibold text-white break-words leading-tight"
        >
          {client.name}
        </h1>
        {client.subheading && (
          <p
            style={{ fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)' }}
            className="mt-4 text-white/90 max-w-3xl mx-auto whitespace-pre-wrap leading-relaxed"
          >
            {client.subheading}
          </p>
        )}
        <p
          style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)' }}
          className="mt-5 font-normal text-white/80"
        >
          {formattedDate}
        </p>
        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            onClick={onScrollToGallery}
            className="px-8 py-4 border-2 border-white text-white rounded-lg font-normal text-lg hover:bg-white/10 transition-all"
          >
            View Gallery ↓
          </button>
          <GalleryActions
            isDownloading={isDownloading}
            onDownload={onDownload}
            onSlideshow={onSlideshow}
            variant="dark"
          />
        </div>
      </div>
    </div>
  );
}
