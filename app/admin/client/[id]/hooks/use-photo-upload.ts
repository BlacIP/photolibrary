import { useCallback, useRef, useState } from 'react';
import { api } from '@/lib/api-client';

const MAX_SIZE = 10 * 1024 * 1024;
const BATCH_SIZE = 3;
const SAVE_BATCH_SIZE = 20;
const SAVE_RETRY_DELAY_MS = 800;

type UploadSignature = {
  timestamp: number;
  signature: string;
  folder: string;
  cloudName?: string;
  cloud_name?: string;
  apiKey?: string;
  api_key?: string;
};

type UploadedRecord = {
  publicId: string;
  url: string;
  filename: string;
  bytes: number;
  width: number;
  height: number;
  format: string;
  resourceType: string;
};

type CloudinaryUploadResponse = {
  public_id: string;
  secure_url: string;
  bytes: number;
  width: number;
  height: number;
  format: string;
  resource_type: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function saveBatchWithRetry(clientId: string, records: UploadedRecord[]) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      return await api.post('admin/legacy/photos/save-records', { clientId, photos: records });
    } catch (err) {
      if (attempt === 2) throw err;
      await sleep(SAVE_RETRY_DELAY_MS);
    }
  }
}

export function usePhotoUpload({
  clientId,
  onRefresh,
  showAlert,
  showConfirm,
}: {
  clientId: string;
  onRefresh: () => Promise<unknown>;
  showAlert: (title: string, message: string) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;

      const allFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      const errors: string[] = [];

      allFiles.forEach((file) => {
        if (file.size > MAX_SIZE) {
          errors.push(`${file.name}: File too large (Max 10MB)`);
        } else {
          validFiles.push(file);
        }
      });

      const processBatch = async (files: File[]) => {
        for (let i = 0; i < files.length; i += BATCH_SIZE) {
          const chunk = files.slice(i, i + BATCH_SIZE);
          const signaturePayload = await api.post<UploadSignature>(
            'admin/legacy/photos/upload-signature',
            {
              clientId,
            }
          );
          const timestamp = signaturePayload.timestamp;
          const signature = signaturePayload.signature;
          const folder = signaturePayload.folder;
          const cloudName = signaturePayload.cloudName || signaturePayload.cloud_name;
          const apiKey = signaturePayload.apiKey || signaturePayload.api_key;

          const uploadedRecords: UploadedRecord[] = [];

          await Promise.all(
            chunk.map(async (file) => {
              try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('timestamp', timestamp.toString());
                formData.append('signature', signature);
                formData.append('folder', folder);
                formData.append('api_key', apiKey);

                const uploadRes = await fetch(
                  `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                  { method: 'POST', body: formData }
                );

                if (!uploadRes.ok) {
                  throw new Error('Cloudinary upload failed');
                }

                const uploadData = (await uploadRes.json()) as CloudinaryUploadResponse;
                uploadedRecords.push({
                  publicId: uploadData.public_id,
                  url: uploadData.secure_url,
                  filename: file.name,
                  bytes: uploadData.bytes,
                  width: uploadData.width,
                  height: uploadData.height,
                  format: uploadData.format,
                  resourceType: uploadData.resource_type,
                });
              } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Upload failed';
                console.error('Upload failed for', file.name, err);
                errors.push(`${file.name}: ${message}`);
              } finally {
                setProgress((prev) => prev + 1);
              }
            })
          );

          for (let j = 0; j < uploadedRecords.length; j += SAVE_BATCH_SIZE) {
            const batch = uploadedRecords.slice(j, j + SAVE_BATCH_SIZE);
            try {
              await saveBatchWithRetry(clientId, batch);
            } catch (err: unknown) {
              console.error('Save records failed', err);
              errors.push(`Metadata save failed for ${batch.length} file(s). Please retry.`);
            }
          }
        }
      };

      const startUpload = async (filesToUpload: File[]) => {
        setTotalFiles(filesToUpload.length);
        setProgress(0);
        setUploading(true);

        try {
          await processBatch(filesToUpload);

          if (errors.length > 0) {
            const errorMsg = `Some uploads failed:\n${errors
              .filter((entry) => !entry.includes('File too large'))
              .join('\n')}`;
            showAlert('Upload Completed with Errors', errorMsg);
          }
          await onRefresh();
        } catch (error) {
          console.error('Batch upload error', error);
        } finally {
          setTimeout(() => {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            setProgress(0);
            setTotalFiles(0);
          }, 800);
        }
      };

      if (validFiles.length === 0) {
        showAlert('Invalid Files', `All selected files differ from limits:\n${errors.join('\n')}`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      if (errors.length > 0) {
        showConfirm(
          'Warning: Some files skipped',
          `Skipping ${errors.length} large files:\n${errors.join('\n')}\n\nContinue uploading ${validFiles.length} valid files?`,
          () => {
            startUpload(validFiles);
          }
        );
      } else {
        startUpload(validFiles);
      }
    },
    [clientId, onRefresh, showAlert, showConfirm]
  );

  return {
    uploading,
    progress,
    totalFiles,
    fileInputRef,
    handleFileUpload,
  };
}
