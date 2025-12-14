'use client';

import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState, useRef } from 'react';
import { format } from 'date-fns';
import { RiUploadCloud2Line, RiShareBoxLine, RiDownloadLine, RiCheckLine, RiLoader4Line } from '@remixicon/react';
import * as Modal from '@/components/ui/modal';
import * as ProgressBar from '@/components/ui/progress-bar';

interface Photo {
  id: string;
  url: string;
  filename: string;
}

interface Client {
  id: string;
  name: string;
  eventDate: string;
  slug: string;
  photos: Photo[];
}

export default function ClientDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [client, setClient] = useState<Client | null>(null);
  
  // Upload State
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  const fetchClient = useCallback(async () => {
    try {
      const res = await fetch(`/api/clients/${id}`);
      if (res.ok) {
        const data = await res.json();
        setClient(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchClient();
  }, [id, fetchClient]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    setTotalFiles(files.length);
    setProgress(0);
    setUploading(true);
    
    // Create an array of promises for parallel uploads
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('clientId', id);

      try {
        await fetch('/api/photos/upload', {
          method: 'POST',
          body: formData,
        });
      } catch (err) {
        console.error('Upload failed for', file.name, err);
      } finally {
        setProgress((prev) => prev + 1);
      }
    });

    try {
      await Promise.all(uploadPromises);
      // Auto-refresh data after all uploads complete
      await fetchClient();
    } catch (error) {
      console.error("Batch upload error", error);
    } finally {
      // Small delay to allow user to see 100% completion
      setTimeout(() => {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setProgress(0);
        setTotalFiles(0);
      }, 800);
    }
  };

  const copyLink = () => {
    if (!client) return;
    const url = `${window.location.origin}/gallery/${client.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!client) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-title-h4 font-bold text-text-strong-950">{client.name}</h2>
          <p className="text-paragraph-sm text-text-sub-600">
            {format(new Date(client.eventDate), 'PPP')} • {client.photos.length} Photos
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={copyLink}
            className="flex items-center gap-2 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-4 py-2 text-sm font-medium text-text-strong-950 hover:bg-bg-weak-50"
          >
            {copied ? <RiCheckLine size={18} /> : <RiShareBoxLine size={18} />}
            {copied ? 'Copied' : 'Share Gallery'}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-lg bg-primary-base px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-70"
          >
            <RiUploadCloud2Line size={18} />
            {uploading ? 'Uploading...' : 'Upload Photos'}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>

      {/* Upload Progress Modal */}
      <Modal.Root open={uploading}>
        <Modal.Content showClose={false}>
          <Modal.Header
            icon={RiLoader4Line}
            title="Uploading Photos"
            description={`Please wait while we upload your photos. Do not close this page.`}
          />
          <div className="px-5 pb-6">
            <div className="mb-2 flex justify-between text-xs font-medium text-text-sub-600">
              <span>{progress} of {totalFiles} uploaded</span>
              <span>{Math.round((progress / totalFiles) * 100)}%</span>
            </div>
            <ProgressBar.Root value={progress} max={totalFiles} color="blue" />
          </div>
        </Modal.Content>
      </Modal.Root>

      {client.photos.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-stroke-soft-200 bg-bg-white-0 text-center">
          <RiUploadCloud2Line className="mb-4 text-text-sub-600" size={32} />
          <p className="text-text-strong-950 font-medium">No photos yet</p>
          <p className="text-sm text-text-sub-600">Upload photos to share with the client</p>
          <button
            onClick={() => fileInputRef.current?.click()}
             className="mt-4 text-sm text-primary-base hover:underline"
          >
            Select photos from computer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {client.photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square overflow-hidden rounded-lg bg-bg-weak-50"
            >
              {/* Using standard img for now, verify Next/Image later */}
              <img
                src={photo.url}
                alt={photo.filename}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <a
                  href={photo.url}
                  download={photo.filename}
                  target="_blank"
                  className="rounded-full bg-white/20 p-2 text-white hover:bg-white/40 backdrop-blur-sm"
                  title="Download"
                >
                  <RiDownloadLine size={20} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
