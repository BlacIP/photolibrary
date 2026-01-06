import { useCallback, useState } from 'react';
import { getApiUrl } from '@/lib/api-client';
import { getGallerySlug } from '../utils';

export function useGalleryDownload({ slug }: { slug?: string } = {}) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadAll = useCallback(async () => {
    setIsDownloading(true);
    try {
      const resolvedSlug = slug || getGallerySlug();
      if (!resolvedSlug) {
        throw new Error('Missing gallery slug');
      }

      const baseUrl = getApiUrl();
      const downloadUrl = `${baseUrl}/gallery/${resolvedSlug}/download`;
      window.location.href = downloadUrl;
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download gallery. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, [slug]);

  return { isDownloading, handleDownloadAll };
}
