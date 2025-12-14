import { pool } from '@/lib/db';
import { RiDownloadLine } from '@remixicon/react';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

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
  event_date: Date;
  photos: Photo[];
}

async function getClientBySlug(slug: string): Promise<Client | null> {
  try {
    const clientRes = await pool.query('SELECT * FROM clients WHERE slug = $1', [slug]);
    
    if (clientRes.rows.length === 0) return null;
    const client = clientRes.rows[0];

    const photosRes = await pool.query(
      'SELECT * FROM photos WHERE client_id = $1 ORDER BY created_at DESC',
      [client.id]
    );

    return {
      ...client,
      photos: photosRes.rows
    } as Client;
  } catch (error) {
    console.error('Database Error:', error);
    return null;
  }
}

// Helper to force download via Cloudinary
function getDownloadUrl(url: string) {
  // Cloudinary URLs look like: https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg
  // We want to insert /fl_attachment/ after /upload/
  return url.replace('/upload/', '/upload/fl_attachment/');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const client = await getClientBySlug(params.slug);
  return {
    title: client ? `${client.name} - Photo Gallery` : 'Gallery Not Found',
  };
}

export default async function GalleryPage({ params }: Props) {
  const client = await getClientBySlug(params.slug);

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

  return (
    <div className="min-h-screen bg-bg-white-0 pb-20">
      {/* Hero Header */}
      <div className="relative bg-bg-weak-50 px-5 pt-20 pb-16 text-center">
        <h1 className="text-title-h2 font-bold text-text-strong-950 sm:text-title-h1">
          {client.name}
        </h1>
        <p className="mt-2 text-text-sub-600 font-medium">
          {new Date(client.event_date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <button className="flex items-center gap-2 rounded-full bg-text-strong-950 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-95">
             Scroll to Photos
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="container mx-auto px-4 mt-8">
        <div className="columns-1 gap-4 sm:columns-2 md:columns-3 lg:columns-4 space-y-4">
          {client.photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative break-inside-avoid overflow-hidden rounded-xl bg-bg-weak-50 shadow-sm"
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
                    href={getDownloadUrl(photo.url)} // Force download transformation
                    download // Fallback hint
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-text-strong-950 shadow-md transition-transform hover:scale-110 active:scale-95"
                    title="Download Photo"
                  >
                    <RiDownloadLine size={20} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {client.photos.length === 0 && (
          <div className="py-20 text-center text-text-sub-600">
            <p>No photos have been uploaded to this gallery yet.</p>
          </div>
        )}
      </div>

       <footer className="mt-20 border-t border-stroke-soft-200 py-8 text-center text-sm text-text-sub-600">
        <p>Powered by Studio Gallery</p>
      </footer>
    </div>
  );
}
