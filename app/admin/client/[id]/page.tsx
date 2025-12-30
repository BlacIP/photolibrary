'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCallback, useEffect, useState, useRef } from 'react';
import { format } from 'date-fns';
import { RiUploadCloud2Line, RiShareBoxLine, RiDownloadLine, RiCheckLine, RiLoader4Line, RiStarLine, RiDeleteBinLine, RiCloseLine, RiMoreLine, RiEdit2Line, RiArchiveLine } from '@remixicon/react';
import * as Modal from '@/components/ui/modal';
import * as ProgressBar from '@/components/ui/progress-bar';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import { api } from '@/lib/api-client';

interface Photo {
    id: string;
    url: string;
    filename: string;
    public_id: string;
}

interface Client {
    id: string;
    name: string;
    event_date: string;
    slug: string;
    status: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
    subheading?: string;
    photos: Photo[];
    header_media_url?: string;
    header_media_type?: 'image' | 'video';
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

    // Edit State
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editSubheading, setEditSubheading] = useState('');
    const [editDate, setEditDate] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);



    // Header Media State
    const [headerMedia, setHeaderMedia] = useState<{ url: string | null; type: 'image' | 'video' | null }>({ url: null, type: null });
    const [updatingHeader, setUpdatingHeader] = useState(false);


    // Alert & Confirm State
    const [alertState, setAlertState] = useState<{ open: boolean; title: string; message: string }>({ open: false, title: '', message: '' });
    const [confirmState, setConfirmState] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({ open: false, title: '', message: '', onConfirm: () => { } });

    const showAlert = (title: string, message: string) => {
        setAlertState({ open: true, title, message });
    };

    const showConfirm = (title: string, message: string, onConfirm: () => void) => {
        setConfirmState({ open: true, title, message, onConfirm });
    };

    // Lightbox State
    const [lightbox, setLightbox] = useState<{ open: boolean; url: string | null; type: 'image' | 'video' } | null>(null);

    const handleUpdateStatus = async (newStatus: string) => {
        if (!client) return;

        const performUpdate = async () => {
            try {
                await api.put(`admin/legacy/clients/${id}`, { status: newStatus });
                setClient({ ...client, status: newStatus as any });
                if (newStatus === 'DELETED') {
                    showAlert('Success', 'Client deleted (Soft Delete). Public link is now disabled.');
                }
            } catch (e) {
                console.error(e);
                showAlert('Error', 'Failed to update status');
            }
        };

        if (newStatus === 'DELETED') {
            showConfirm('Delete Client?', 'Are you sure you want to delete this client? The public link will show a "Under Construction" page.', performUpdate);
        } else {
            await performUpdate();
        }
    };

    const handleSaveEdit = async () => {
        setSavingEdit(true);
        try {
            await api.put(`admin/legacy/clients/${id}`, { name: editName, subheading: editSubheading, event_date: editDate });
            setClient(prev => prev ? ({ ...prev, name: editName, subheading: editSubheading, event_date: editDate }) : null);
            setEditing(false);
        } catch {
            showAlert('Error', 'Failed to update client');
        } finally {
            setSavingEdit(false);
        }
    };

    const openEdit = () => {
        if (client) {
            setEditName(client.name);
            setEditSubheading(client.subheading || '');
            const dateObj = new Date(client.event_date);
            setEditDate(!isNaN(dateObj.getTime()) ? dateObj.toISOString().split('T')[0] : '');
            setEditing(true);
        }
    };

    // Fetch client details
    const fetchClient = useCallback(async () => {
        try {
            const data = await api.get(`admin/legacy/clients/${id}`);
            setClient({ ...data.client, photos: data.photos });
            if (data.client.header_media_url) {
                setHeaderMedia({
                    url: data.client.header_media_url,
                    type: data.client.header_media_type || 'image'
                });
            }
        } catch (err: any) {
            console.error(err);
        }
    }, [id]);

    // Fetch client details on component mount and id change
    useEffect(() => {
        fetchClient();
    }, [fetchClient]);

    const removeHeaderMedia = async () => {
        showConfirm('Remove Header?', 'Are you sure you want to remove the header media?', async () => {
            setUpdatingHeader(true);
            try {
                await api.put(`admin/legacy/clients/${id}`, {
                    header_media_url: null,
                    header_media_type: null
                });
                setHeaderMedia({ url: null, type: null });
            } catch {
                showAlert('Error', 'Failed to remove header');
            } finally {
                setUpdatingHeader(false);
            }
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        // Filter files
        const MAX_SIZE = 10 * 1024 * 1024; // 10MB Cloudinary Free Limit
        const allFiles = Array.from(e.target.files);
        const validFiles: File[] = [];
        const errors: string[] = [];

        allFiles.forEach(file => {
            if (file.size > MAX_SIZE) {
                errors.push(`${file.name}: File too large (Max 10MB)`);
            } else {
                validFiles.push(file);
            }
        });

        const startUpload = async (filesToUpload: File[]) => {
            setTotalFiles(filesToUpload.length);
            setProgress(0);
            setUploading(true);

            // Batch processing helper
            const BATCH_SIZE = 3;
            const processBatch = async (files: File[]) => {
                for (let i = 0; i < files.length; i += BATCH_SIZE) {
                    const chunk = files.slice(i, i + BATCH_SIZE);
                    await Promise.all(chunk.map(async (file) => {
                        try {
                            // Step 1: Get upload signature from server
                            const { timestamp, signature, folder, cloud_name: cloudName, api_key: apiKey } = await api.post('admin/legacy/photos/upload-signature', { clientId: id });

                            // Step 2: Upload directly to Cloudinary
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('timestamp', timestamp.toString());
                            formData.append('signature', signature);
                            formData.append('folder', folder);
                            formData.append('api_key', apiKey);

                            const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                                method: 'POST',
                                body: formData,
                            });

                            if (!uploadRes.ok) {
                                throw new Error('Cloudinary upload failed');
                            }

                            const uploadData = await uploadRes.json();

                            // Step 3: Save photo record to database
                            await api.post('admin/legacy/photos/save-record', {
                                clientId: id,
                                publicId: uploadData.public_id,
                                url: uploadData.secure_url,
                            });


                        } catch (err: any) {
                            console.error('Upload failed for', file.name, err);
                            errors.push(`${file.name}: ${err.message}`);
                        } finally {
                            setProgress((prev) => prev + 1);
                        }
                    }));
                }
                return errors;
            };

            try {
                const errors = await processBatch(filesToUpload);

                if (errors.length > 0) {
                    const errorMsg = `Some uploads failed:\n${errors.filter(e => !e.includes('File too large')).join('\n')}`;
                    showAlert('Upload Completed with Errors', errorMsg);
                }
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

        if (validFiles.length === 0) {
            showAlert('Invalid Files', `All selected files differ from limits:\n${errors.join('\n')}`);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        if (errors.length > 0) {
            showConfirm('Warning: Some files skipped', `Skipping ${errors.length} large files:\n${errors.join('\n')}\n\nContinue uploading ${validFiles.length} valid files?`, () => {
                startUpload(validFiles);
            });
        } else {
            startUpload(validFiles);
        }
    };

    const setHeaderFromPhoto = async (url: string) => {
        setUpdatingHeader(true);
        try {
            await api.put(`admin/legacy/clients/${id}`, {
                header_media_url: url,
                header_media_type: 'image'
            });

            setHeaderMedia({ url, type: 'image' });
            showAlert('Success', 'Header updated successfully');
        } catch (err: any) {
            const errorMsg = err.message || err.error || 'Failed to update header';
            showAlert('Error', errorMsg);
        } finally {
            setUpdatingHeader(false);
        }
    };

    const handleDeletePhoto = async (photoId: string) => {
        showConfirm('Delete Photo?', 'Are you sure you want to delete this photo?', async () => {
            // Store previous state for rollback
            const previousPhotos = client?.photos;

            // Optimistic Update
            setClient(prev => prev ? ({
                ...prev,
                photos: prev.photos.filter(p => p.id !== photoId)
            }) : null);

            try {
                await api.delete(`admin/legacy/photos/${photoId}`);
            } catch {
                showAlert('Error', 'Error deleting photo');
                // Rollback
                setClient(prev => prev ? ({ ...prev, photos: previousPhotos || [] }) : null);
            }
        });
    };

    const copyLink = () => {
        if (!client) return;
        const url = `${window.location.origin}/gallery/${client.slug}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Helper to get optimized Cloudinary URL for thumbnails
    const getOptimizedUrl = (url: string, width = 600) => {
        if (url.includes('cloudinary.com')) {
            return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
        }
        return url;
    };

    if (!client) return <div className="p-8 text-center">Loading...</div>;

    const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/gallery/${client.slug}` : '';

    return (
        <div>
            {/* Custom Alert Modal */}
            <Modal.Root open={alertState.open} onOpenChange={(open) => setAlertState(prev => ({ ...prev, open }))}>
                <Modal.Content>
                    <Modal.Header title={alertState.title || undefined} />
                    <div className="p-6">
                        <p className="text-text-sub-600 whitespace-pre-wrap">{alertState.message}</p>
                    </div>
                    <Modal.Footer>
                        <button
                            onClick={() => setAlertState(prev => ({ ...prev, open: false }))}
                            className="px-4 py-2 bg-primary-base text-white rounded-lg text-sm font-medium hover:bg-primary-dark"
                        >
                            OK
                        </button>
                    </Modal.Footer>
                </Modal.Content>
            </Modal.Root>

            {/* Custom Confirm Modal */}
            <Modal.Root open={confirmState.open} onOpenChange={(open) => setConfirmState(prev => ({ ...prev, open }))}>
                <Modal.Content>
                    <Modal.Header title={confirmState.title || undefined} />
                    <div className="p-6">
                        <p className="text-text-sub-600 whitespace-pre-wrap">{confirmState.message}</p>
                    </div>
                    <Modal.Footer>
                        <button
                            onClick={() => setConfirmState(prev => ({ ...prev, open: false }))}
                            className="px-4 py-2 text-text-sub-600 hover:bg-bg-weak-50 rounded-lg text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                confirmState.onConfirm();
                                setConfirmState(prev => ({ ...prev, open: false }));
                            }}
                            className="px-4 py-2 bg-primary-base text-white rounded-lg text-sm font-medium hover:bg-primary-dark"
                        >
                            Confirm
                        </button>
                    </Modal.Footer>
                </Modal.Content>
            </Modal.Root>

            {/* Lightbox / "iFrame" View */}
            {lightbox && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 animate-in fade-in duration-200">
                    <button
                        onClick={() => setLightbox(null)}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[101]"
                    >
                        <RiCloseLine size={32} />
                    </button>

                    {lightbox.type === 'image' ? (
                        <img
                            src={lightbox.url}
                            alt="Full View"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                    ) : (
                        <video
                            src={lightbox.url}
                            className="max-w-full max-h-full rounded-lg"
                            controls
                            autoPlay
                        />
                    )}
                </div>
            )}

            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <Link href="/admin" className="text-sm text-text-sub-600 hover:text-text-strong-950 flex items-center gap-1">
                        ← Back to Dashboard
                    </Link>

                    <div className="flex items-center gap-2">
                        {/* Status Badge */}
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${client.status === 'ARCHIVED' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                            client.status === 'DELETED' ? 'bg-red-100 text-red-700 border-red-200' :
                                'bg-green-100 text-green-700 border-green-200'
                            }`}>
                            {client.status || 'ACTIVE'}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-title-h3 font-bold text-text-strong-950">{client.name}</h2>
                        {client.subheading && <p className="text-lg text-text-sub-600 whitespace-pre-wrap">{client.subheading}</p>}
                        <p className="text-text-sub-600 mt-1">
                            {client.event_date && !isNaN(new Date(client.event_date).getTime())
                                ? format(new Date(client.event_date), 'PPP')
                                : 'Date not set'} • {client.photos.length} Photos
                        </p>

                        {/* Link Display */}
                        <div className="mt-4 flex items-center gap-2 max-w-xl">
                            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-bg-white-0 border border-stroke-soft-200 rounded-lg shadow-sm">
                                <span className="text-text-sub-600 text-sm truncate flex-1 block w-0">{publicUrl}</span>
                            </div>
                            <button
                                onClick={copyLink}
                                className="p-2 hover:bg-bg-weak-50 rounded-lg text-text-sub-600 transition-colors"
                                title="Copy Link"
                            >
                                {copied ? <RiCheckLine size={20} className="text-primary-base" /> : <RiShareBoxLine size={20} />}
                            </button>
                            <a
                                href={`/gallery/${client.slug}`}
                                target="_blank"
                                className="p-2 hover:bg-bg-weak-50 rounded-lg text-text-sub-600 transition-colors"
                                title="Preview Public Page"
                            >
                                <RiShareBoxLine size={20} /> {/* Using Share icon for external link behavior, or could use Eye */}
                            </a>
                        </div>
                    </div>

                    <div className="flex gap-3 flex-wrap w-full lg:w-auto">
                        {/* Mobile: Actions Dropdown */}
                        <div className="md:hidden w-full sm:w-auto">
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                    <button className="w-full px-4 py-2 text-sm font-medium text-text-strong-950 bg-bg-white-0 border border-stroke-soft-200 rounded-lg hover:bg-bg-weak-50 flex items-center justify-center gap-2">
                                        Actions
                                    </button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Portal>
                                    <DropdownMenu.Content
                                        className="min-w-[200px] bg-bg-white-0 rounded-lg border border-stroke-soft-200 shadow-lg p-1 z-50"
                                        sideOffset={5}
                                    >
                                        <DropdownMenu.Item
                                            onClick={openEdit}
                                            className="flex items-center gap-2 px-3 py-2 text-sm text-text-strong-950 rounded-md hover:bg-bg-weak-50 cursor-pointer outline-none"
                                        >
                                            <RiEdit2Line size={16} />
                                            Edit Details
                                        </DropdownMenu.Item>

                                        {client.status !== 'ARCHIVED' ? (
                                            <DropdownMenu.Item
                                                onClick={() => handleUpdateStatus('ARCHIVED')}
                                                className="flex items-center gap-2 px-3 py-2 text-sm text-text-strong-950 rounded-md hover:bg-bg-weak-50 cursor-pointer outline-none"
                                            >
                                                <RiArchiveLine size={16} />
                                                Archive
                                            </DropdownMenu.Item>
                                        ) : (
                                            <DropdownMenu.Item
                                                onClick={() => handleUpdateStatus('ACTIVE')}
                                                className="flex items-center gap-2 px-3 py-2 text-sm text-text-strong-950 rounded-md hover:bg-bg-weak-50 cursor-pointer outline-none"
                                            >
                                                <RiArchiveLine size={16} />
                                                Unarchive
                                            </DropdownMenu.Item>
                                        )}

                                        {client.status !== 'DELETED' && (
                                            <DropdownMenu.Item
                                                onClick={() => handleUpdateStatus('DELETED')}
                                                className="flex items-center gap-2 px-3 py-2 text-sm text-error-base rounded-md hover:bg-error-weak-50 cursor-pointer outline-none"
                                            >
                                                <RiDeleteBinLine size={16} />
                                                Delete
                                            </DropdownMenu.Item>
                                        )}
                                    </DropdownMenu.Content>
                                </DropdownMenu.Portal>
                            </DropdownMenu.Root>
                        </div>

                        {/* Desktop: Individual Buttons */}
                        <button
                            onClick={openEdit}
                            className="hidden md:block px-4 py-2 text-sm font-medium text-text-strong-950 bg-bg-white-0 border border-stroke-soft-200 rounded-lg hover:bg-bg-weak-50"
                        >
                            Edit Details
                        </button>

                        {client.status !== 'ARCHIVED' ? (
                            <button
                                onClick={() => handleUpdateStatus('ARCHIVED')}
                                className="hidden md:block px-4 py-2 text-sm font-medium text-text-strong-950 bg-bg-white-0 border border-stroke-soft-200 rounded-lg hover:bg-bg-weak-50"
                            >
                                Archive
                            </button>
                        ) : (
                            <button
                                onClick={() => handleUpdateStatus('ACTIVE')}
                                className="hidden md:block px-4 py-2 text-sm font-medium text-white bg-text-strong-950 rounded-lg hover:opacity-90"
                            >
                                Unarchive
                            </button>
                        )}

                        {client.status !== 'DELETED' && (
                            <button
                                onClick={() => handleUpdateStatus('DELETED')}
                                className="hidden md:block px-4 py-2 text-sm font-medium text-error-base bg-bg-white-0 border border-stroke-soft-200 rounded-lg hover:bg-error-weak-50 hover:border-error-weak-200"
                            >
                                Delete
                            </button>
                        )}

                        {/* Upload Button - Always Visible */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-primary-base px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-70"
                        >
                            <RiUploadCloud2Line size={18} />
                            {uploading ? 'Uploading...' : 'Upload Photos'}
                        </button>
                        <span className="hidden sm:inline text-xs text-text-sub-600 self-center">Max 10MB</span>
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
            </div>

            {/* Edit Modal - DIY since we don't have a complex Modal component prepared for inputs */}
            {
                editing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md bg-bg-white-0 rounded-xl p-6 shadow-xl space-y-4">
                            <h3 className="text-lg font-bold">Edit Client</h3>
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full px-3 py-2 border border-stroke-soft-200 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Subheading</label>
                                <textarea
                                    value={editSubheading}
                                    onChange={(e) => setEditSubheading(e.target.value)}
                                    placeholder="Optional subheading text (Multiple lines supported)"
                                    className="w-full px-3 py-2 border border-stroke-soft-200 rounded-lg min-h-[100px]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Event Date</label>
                                <input
                                    type="date"
                                    value={editDate}
                                    onChange={(e) => setEditDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-stroke-soft-200 rounded-lg"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button onClick={() => setEditing(false)} className="text-sm font-medium text-text-sub-600">Cancel</button>
                                <button
                                    onClick={handleSaveEdit}
                                    disabled={savingEdit}
                                    className="px-4 py-2 bg-primary-base text-white rounded-lg text-sm font-semibold"
                                >
                                    {savingEdit ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }



            {/* Header Media Section */}
            <div className="bg-bg-white-0 rounded-xl border border-stroke-soft-200 p-4 md:p-6 flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-strong-950 mb-1">Gallery Header</h3>
                    <p className="text-sm text-text-sub-600 mb-4">
                        The header image appears at the top of the public gallery.
                    </p>

                    {!headerMedia.url ? (
                        <div className="p-4 bg-bg-weak-50 rounded-lg border border-dashed border-stroke-soft-200 text-text-sub-600 text-sm">
                            <p>No header image set.</p>
                            <p className="mt-1 text-xs">Click the <RiStarLine className="inline mx-1 align-text-bottom text-text-strong-950" size={14} /> icon on any photo below to set it as the gallery header.</p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <button
                                onClick={removeHeaderMedia}
                                className="px-4 py-2 bg-error-weak/10 text-error-base hover:bg-error-weak/20 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 w-full sm:w-auto"
                                disabled={updatingHeader}
                            >
                                {updatingHeader ? 'Removing...' : 'Remove Header Media'}
                            </button>
                        </div>
                    )}
                </div>

                {headerMedia.url && (
                    <div className="w-full md:w-64 aspect-video rounded-lg overflow-hidden bg-black relative border border-stroke-soft-200 shadow-sm">
                        {headerMedia.type === 'video' ? (
                            <video src={headerMedia.url} className="w-full h-full object-cover" controls />
                        ) : (
                            <img src={headerMedia.url} alt="Header" className="w-full h-full object-cover" />
                        )}
                        <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-full backdrop-blur-sm">
                            Current Header
                        </div>
                    </div>
                )}
            </div>

            {/* Upload Section */}
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

            {
                client.photos.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-stroke-soft-200 bg-bg-white-0 text-center">
                        <RiUploadCloud2Line className="mb-4 text-text-sub-600" size={32} />
                        <p className="text-text-strong-950 font-medium">No photos yet</p>
                        <p className="text-sm text-text-sub-600">Upload photos to share with the client</p>
                        <p className="text-xs text-text-sub-600 mt-1">(Max 10MB per file)</p>
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
                                className="group relative aspect-square overflow-hidden bg-bg-weak-50 rounded-lg border border-stroke-soft-200 shadow-sm"
                            >
                                {/* Image */}
                                <img
                                    src={getOptimizedUrl(photo.url)}
                                    alt={photo.filename}
                                    className="h-full w-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                    onClick={() => setLightbox({ open: true, url: photo.url, type: 'image' })}
                                />

                                {/* Action Buttons - Always visible on mobile, hover on desktop */}
                                <div className="absolute top-2 right-2 flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setHeaderFromPhoto(photo.url)}
                                        className="p-2 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full text-white transition-colors shadow-lg"
                                        title="Set as Gallery Header"
                                    >
                                        <RiStarLine size={16} />
                                    </button>
                                    <a
                                        href={`/api/download?url=${encodeURIComponent(photo.url)}&filename=${encodeURIComponent(photo.filename)}`}
                                        download={photo.filename}
                                        target="_blank"
                                        className="p-2 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full text-white transition-colors shadow-lg"
                                        title="Download"
                                    >
                                        <RiDownloadLine size={16} />
                                    </a>
                                    <button
                                        onClick={() => handleDeletePhoto(photo.id)}
                                        className="p-2 bg-black/60 hover:bg-red-500/90 backdrop-blur-sm rounded-full text-white transition-colors shadow-lg"
                                        title="Delete Photo"
                                    >
                                        <RiDeleteBinLine size={16} />
                                    </button>
                                </div>

                                {/* Filename - Always visible */}
                                <div className="absolute bottom-0 inset-x-0 p-2 text-center bg-gradient-to-t from-black/70 to-transparent backdrop-blur-sm">
                                    <p className="text-xs text-white truncate px-1 font-medium">{photo.filename}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            }
        </div >
    );
}
