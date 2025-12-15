import { pool } from '@/lib/db';
import { RiDownloadLine } from '@remixicon/react';
import { Metadata } from 'next';
import Header from '@/components/header';

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
  status?: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
  subheading?: string;
  header_media_url?: string;
  header_media_type?: 'image' | 'video';
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
function getDownloadUrl(url: string, filename: string) {
  // Cloudinary URLs look like: https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg
  // We want to insert /fl_attachment:filename/ after /upload/
  // Use encodeURIComponent to handle spaces and special chars, but usually avoid extension if it doubles up? 
  // filename from DB usually includes extension.
  const attachmentTransform = `fl_attachment:${encodeURIComponent(filename)}`;
  return url.replace('/upload/', `/upload/${attachmentTransform}/`);
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

  return (
    <div className="min-h-screen bg-bg-white-0 pb-20">
      {/* Hero Header */}
      {/* Hero Header */}
      {client.header_media_url ? (
        <div className="relative w-full h-[70vh] flex items-center justify-center overflow-hidden bg-bg-weak-50">
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

             <div className="relative z-10 text-center px-5">
                <h1 className="text-title-h2 font-bold sm:text-title-h1 text-white">
                   {client.name}
                </h1>
                {client.subheading && <p className="mt-1 text-lg text-white/90 max-w-2xl mx-auto whitespace-pre-wrap">{client.subheading}</p>}
                <p className="mt-2 font-medium text-white/80">
                   {new Date(client.event_date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                   })}
                </p>
             </div>
        </div>
      ) : (
         <>
         <Header />
         <div className="py-20 px-5 text-center bg-bg-weak-50 border-b border-stroke-soft-200">
            <h1 className="text-title-h2 font-bold sm:text-title-h1 text-text-strong-950">
               {client.name}
            </h1>
            {client.subheading && <p className="mt-1 text-lg text-text-sub-600 max-w-2xl mx-auto whitespace-pre-wrap">{client.subheading}</p>}
            <p className="mt-2 font-medium text-text-sub-600">
               {new Date(client.event_date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
               })}
            </p>
         </div>
         </>
      )}

      {/* Gallery Grid */}
      <div className="w-full px-2 mt-4">
        <div className="columns-2 gap-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 space-y-2">
          {client.photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative break-inside-avoid overflow-hidden bg-bg-weak-50 shadow-sm"
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
                    href={getDownloadUrl(photo.url, photo.filename)} // Force download transformation
                    download={photo.filename} // Fallback hint
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
