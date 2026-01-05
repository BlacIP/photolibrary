'use client';

import Header from '@/components/header';
import GalleryClient from '@/components/gallery/GalleryClient';
import { useEffect, useState } from 'react';
import { getApiUrl } from '@/lib/api-client';

// export const dynamic = 'force-dynamic'; // Not needed for client component

interface Props {
  params: { slug: string };
}

interface Photo {
  id: string;
  url: string;
  public_id: string;
  filename: string;
}

interface Client {
  id: string;
  name: string;
  slug: string;
  event_date: string; // API returns string
  status?: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
  subheading?: string;
  header_media_url?: string;
  header_media_type?: 'image' | 'video';
  photos: Photo[];
}

export default function GalleryPage({ params }: Props) {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    async function fetchClient() {
      try {
        const baseUrl = getApiUrl();
        const url = `${baseUrl}/gallery/${params.slug}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setClient(data);
        } else {
          setClient(null);
        }
      } catch (error) {
        console.error('Error fetching client:', error);
        setClient(null);
      } finally {
        setLoading(false);
      }
    }
    fetchClient();
  }, [params.slug]);

  const handleDownloadAll = async () => {
    setIsDownloading(true);
    try {
      // Trigger download by opening in new window or creating link
      const baseUrl = getApiUrl();
      const downloadUrl = `${baseUrl}/gallery/${params.slug}/download`;

      // Method 1: Direct navigation (simplest for zip)
      window.location.href = downloadUrl;

      // Method 2: Fetch blob (gives more control but memory intensive for huge zips)
      /*
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${client?.name.replace(/[^a-z0-9]/gi, '_')}_Gallery.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      */

    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download gallery. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-white-0">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-base mx-auto"></div>
          <p className="mt-4 text-text-sub-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-white-0 text-text-sub-600">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-strong-950">Gallery Not Found</h1>
          <p className="mt-2">The link might be invalid or expired.</p>
        </div>
      </div>
    );
  }

  // Handle Archived/Deleted status
  if (client.status === 'ARCHIVED' || client.status === 'DELETED') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-white-0 text-text-sub-600">
        <div className="text-center max-w-md px-6">
          <div className="mb-4 text-4xl">🚧</div>
          <h1 className="text-2xl font-bold text-text-strong-950">Under Construction</h1>
          <p className="mt-2 text-lg">The page is under construction please contact the studio.</p>
        </div>
      </div>
    );
  }

  const hasHeaderMedia = Boolean(client.header_media_url);
  const formattedDate = client.event_date
    ? new Date(client.event_date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';
  const downloadTitle = isDownloading ? 'Preparing download...' : 'Download All';
  const downloadIcon = isDownloading ? (
    <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  ) : (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
  const openSlideshow = () => {
    const event = new CustomEvent('openSlideshow');
    window.dispatchEvent(event);
  };

  return (
    <div className="min-h-screen bg-bg-white-0 pb-20">
      {/* Hero Header */}
      {hasHeaderMedia ? (
        <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-bg-weak-50">
          {/* Overlay Header */}
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
            <img
              src={client.header_media_url}
              alt={client.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
            <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 3.75rem)' }} className="font-semibold text-white break-words leading-tight">
              {client.name}
            </h1>
            {client.subheading && <p style={{ fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)' }} className="mt-4 text-white/90 max-w-3xl mx-auto whitespace-pre-wrap leading-relaxed">{client.subheading}</p>}
            <p style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)' }} className="mt-5 font-normal text-white/80">
              {formattedDate}
            </p>
            <div className="mt-8 flex flex-col items-center gap-4">
              <button
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                className="px-8 py-4 border-2 border-white text-white rounded-lg font-normal text-lg hover:bg-white/10 transition-all"
              >
                View Gallery ↓
              </button>
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadAll}
                  disabled={isDownloading}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors backdrop-blur-sm disabled:opacity-50"
                  title={downloadTitle}
                >
                  {downloadIcon}
                </button>
                <button
                  onClick={openSlideshow}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors backdrop-blur-sm"
                  title="Play Slideshow"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Header />
          <div className="py-16 sm:py-24 px-4 text-center bg-bg-weak-50 border-b border-stroke-soft-200">
            <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 3.75rem)' }} className="font-semibold text-text-strong-950 break-words leading-tight">
              {client.name}
            </h1>
            {client.subheading && <p style={{ fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)' }} className="mt-4 text-text-sub-600 max-w-3xl mx-auto whitespace-pre-wrap leading-relaxed">{client.subheading}</p>}
            <p style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)' }} className="mt-5 font-normal text-text-sub-600">
              {formattedDate}
            </p>
            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadAll}
                  disabled={isDownloading}
                  className="p-3 bg-bg-white-0 hover:bg-bg-weak-50 rounded-lg text-text-strong-950 transition-colors shadow-sm border border-stroke-soft-200 disabled:opacity-50"
                  title={downloadTitle}
                >
                  {downloadIcon}
                </button>
                <button
                  onClick={openSlideshow}
                  className="p-3 bg-bg-white-0 hover:bg-bg-weak-50 rounded-lg text-text-strong-950 transition-colors shadow-sm border border-stroke-soft-200"
                  title="Play Slideshow"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Interactive Gallery Grid using Client Component */}
      <GalleryClient photos={client.photos} />

      <footer className="mt-20 border-t border-stroke-soft-200 py-8 text-center text-sm text-text-sub-600">
        <p>Powered by Studio Gallery</p>
      </footer>
    </div>
  );
}
