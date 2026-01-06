import { useEffect, useState } from 'react';
import { getApiUrl } from '@/lib/api-client';
import type { Client } from '../types';

export function useGalleryClient(slug: string) {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function fetchClient() {
      setLoading(true);
      setError(false);
      try {
        const baseUrl = getApiUrl();
        const url = `${baseUrl}/gallery/${slug}`;
        const response = await fetch(url);
        if (!isActive) return;
        if (response.ok) {
          const data = await response.json();
          setClient(data);
        } else {
          setClient(null);
          setError(true);
        }
      } catch (fetchError) {
        console.error('Error fetching client:', fetchError);
        if (isActive) {
          setClient(null);
          setError(true);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    fetchClient();
    return () => {
      isActive = false;
    };
  }, [slug]);

  return { client, loading, error };
}
