import { pool } from '@/lib/db';
import { Metadata } from 'next';
import Header from '@/components/header';
import GalleryClient from '@/components/gallery/GalleryClient';

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

    // Fetch photos
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

             <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white break-words">
                   {client.name}
                </h1>
                {client.subheading && <p className="mt-2 text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto whitespace-pre-wrap">{client.subheading}</p>}
                <p className="mt-3 font-medium text-white/80 text-sm sm:text-base">
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
         <div className="py-12 sm:py-20 px-4 text-center bg-bg-weak-50 border-b border-stroke-soft-200">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-strong-950 break-words">
               {client.name}
            </h1>
            {client.subheading && <p className="mt-2 text-base sm:text-lg text-text-sub-600 max-w-2xl mx-auto whitespace-pre-wrap">{client.subheading}</p>}
            <p className="mt-3 font-medium text-text-sub-600 text-sm sm:text-base">
               {new Date(client.event_date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
               })}
            </p>
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
