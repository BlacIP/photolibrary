export type SettingsTab = 'profile' | 'team' | 'storage' | 'archive' | 'recycle';

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  created_at: string;
  permissions?: string[];
}

export type LifecycleClient = {
  id: string;
  name: string;
  status: string;
  statusUpdatedAt: string;
};

export type StorageStats = {
  totalBytes: number;
  totalPhotos: number;
  statusStats: {
    archived_bytes: number;
    deleted_bytes: number;
  };
  clients: Array<{
    id: string;
    name: string;
    status: string;
    photo_count: number;
    total_bytes: number;
  }>;
  cloudinary?: Record<string, unknown>;
};

export const settingsTabs = [
  { id: 'profile', label: 'My Profile' },
  { id: 'team', label: 'Team & Roles', requiresSuperAdmin: true },
  { id: 'storage', label: 'Storage', requiresSuperAdmin: true },
  { id: 'archive', label: 'Archive' },
  { id: 'recycle', label: 'Recycle Bin' },
] as const;

export const AVAILABLE_PERMISSIONS = [
  { id: 'manage_clients', label: 'Manage Clients (Create, Edit, Delete)' },
  { id: 'manage_photos', label: 'Manage Photos (Upload, Delete)' },
] as const;
