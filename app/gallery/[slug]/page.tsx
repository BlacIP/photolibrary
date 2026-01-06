'use client';

import GalleryClient from '@/components/gallery/GalleryClient';
import { useGalleryDownload } from '@/components/gallery/hooks/use-gallery-download';
import { GalleryLoading } from './components/gallery-loading';
import { GalleryNotFound } from './components/gallery-not-found';
import { GalleryUnderConstruction } from './components/gallery-under-construction';
import { GalleryHero } from './components/gallery-hero';
import { GalleryHeader } from './components/gallery-header';
import { GalleryFooter } from './components/gallery-footer';
import { useGalleryClient } from './hooks/use-gallery-client';
import { formatEventDate, isUnavailableStatus, openSlideshow } from './utils';

interface Props {
  params: { slug: string };
}

export default function GalleryPage({ params }: Props) {
  const { client, loading, error } = useGalleryClient(params.slug);
  const { isDownloading, handleDownloadAll } = useGalleryDownload({ slug: params.slug });

  if (loading) return <GalleryLoading />;
  if (!client || error) return <GalleryNotFound />;
  if (isUnavailableStatus(client.status)) return <GalleryUnderConstruction />;

  const hasHeaderMedia = Boolean(client.header_media_url);
  const formattedDate = formatEventDate(client.event_date);

  const scrollToGallery = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-bg-white-0 pb-20">
      {hasHeaderMedia ? (
        <GalleryHero
          client={client}
          formattedDate={formattedDate}
          isDownloading={isDownloading}
          onDownload={handleDownloadAll}
          onSlideshow={openSlideshow}
          onScrollToGallery={scrollToGallery}
        />
      ) : (
        <GalleryHeader
          client={client}
          formattedDate={formattedDate}
          isDownloading={isDownloading}
          onDownload={handleDownloadAll}
          onSlideshow={openSlideshow}
        />
      )}

      <GalleryClient photos={client.photos} />

      <GalleryFooter />
    </div>
  );
}
