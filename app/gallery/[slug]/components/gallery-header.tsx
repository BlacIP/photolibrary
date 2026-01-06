import Header from '@/components/header';
import type { Client } from '../types';
import { GalleryActions } from './gallery-actions';

export function GalleryHeader({
  client,
  formattedDate,
  isDownloading,
  onDownload,
  onSlideshow,
}: {
  client: Client;
  formattedDate: string;
  isDownloading: boolean;
  onDownload: () => void;
  onSlideshow: () => void;
}) {
  return (
    <>
      <Header />
      <div className="py-16 sm:py-24 px-4 text-center bg-bg-weak-50 border-b border-stroke-soft-200">
        <h1
          style={{ fontSize: 'clamp(1.5rem, 5vw, 3.75rem)' }}
          className="font-semibold text-text-strong-950 break-words leading-tight"
        >
          {client.name}
        </h1>
        {client.subheading && (
          <p
            style={{ fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)' }}
            className="mt-4 text-text-sub-600 max-w-3xl mx-auto whitespace-pre-wrap leading-relaxed"
          >
            {client.subheading}
          </p>
        )}
        <p
          style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)' }}
          className="mt-5 font-normal text-text-sub-600"
        >
          {formattedDate}
        </p>
        <div className="mt-6 flex flex-col items-center gap-4">
          <GalleryActions
            isDownloading={isDownloading}
            onDownload={onDownload}
            onSlideshow={onSlideshow}
            variant="light"
          />
        </div>
      </div>
    </>
  );
}
