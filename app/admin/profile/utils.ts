import type { ProfileMeta } from './types';

const roleLabelMap: Record<string, string> = {
  SUPER_ADMIN_MAX: 'Owner',
  SUPER_ADMIN: 'Super Admin',
};

const roleStyleMap: Record<string, string> = {
  SUPER_ADMIN_MAX: 'bg-amber-100 text-amber-700 border border-amber-200',
  SUPER_ADMIN: 'bg-purple-100 text-purple-700',
};

export function buildProfileMeta({
  role,
  permissions,
}: {
  role?: string;
  permissions?: string[];
}): ProfileMeta {
  const roleLabel = roleLabelMap[role || ''] || (role || '');
  const roleBadgeClass = roleStyleMap[role || ''] || 'bg-bg-weak-100 text-text-sub-600';
  const isElevatedRole = role === 'SUPER_ADMIN' || role === 'SUPER_ADMIN_MAX';
  const permissionBadges = isElevatedRole
    ? [{ label: role === 'SUPER_ADMIN_MAX' ? 'System Owner' : 'Full System Access' }]
    : (permissions || []).map((permission) => ({
        label: permission.replace('_', ' '),
      }));

  return { roleLabel, roleBadgeClass, permissionBadges };
}
