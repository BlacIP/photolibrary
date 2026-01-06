import type { SettingsTab, User } from './types';

export const userRoleStyles: Record<string, string> = {
  SUPER_ADMIN_MAX: 'bg-amber-100 text-amber-700 border border-amber-200',
  SUPER_ADMIN: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-bg-weak-100 text-text-sub-600',
};

export const userRoleLabels: Record<string, string> = {
  SUPER_ADMIN_MAX: 'Owner',
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
};

export const permissionLabelMap: Record<string, string> = {
  manage_clients: 'Clients',
  manage_photos: 'Photos',
};

export function formatUserName(user: User) {
  return user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'No Name';
}

export function formatBytes(bytes: number) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function calculateDaysLeft(dateString: string, maxDays: number) {
  const updated = new Date(dateString).getTime();
  const now = new Date().getTime();
  const diffDays = (now - updated) / (1000 * 3600 * 24);
  return Math.max(0, Math.ceil(maxDays - diffDays));
}

export function getLifecycleConfig(activeTab: SettingsTab) {
  if (activeTab === 'archive') {
    return {
      title: 'Archive',
      description: 'Clients in Archive are kept for 30 days before moving to Recycle Bin.',
      status: 'ARCHIVED',
      days: 30,
    };
  }
  if (activeTab === 'recycle') {
    return {
      title: 'Recycle Bin',
      description: 'Clients in Recycle Bin are kept for 7 days before permanent deletion.',
      status: 'DELETED',
      days: 7,
    };
  }
  return null;
}
