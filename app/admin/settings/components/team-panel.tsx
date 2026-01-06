import { RiAddLine, RiShieldUserLine, RiUserLine, RiEdit2Line } from '@remixicon/react';
import { permissionLabelMap, formatUserName, userRoleLabels, userRoleStyles } from '../utils';
import type { User } from '../types';

export function TeamPanel({
  users,
  onAddAdmin,
  onEditRoles,
}: {
  users: User[];
  onAddAdmin: () => void;
  onEditRoles: (user: User) => void;
}) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stroke-soft-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-text-strong-950">Team management</h2>
            <p className="mt-1 text-sm text-text-sub-600">
              Invite admins and manage access levels for this studio.
            </p>
          </div>
          <button
            onClick={onAddAdmin}
            className="flex items-center gap-2 rounded-full bg-primary-base px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            <RiAddLine size={18} />
            Add Admin
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[600px]">
            <thead className="bg-bg-weak-50/70 text-text-sub-600">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Permissions</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke-soft-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-bg-weak-50/40">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-weak/20 text-primary-base font-semibold text-xs">
                        {user.first_name ? user.first_name[0] : <RiUserLine size={16} />}
                      </div>
                      <div>
                        <div className="font-medium text-text-strong-950">{formatUserName(user)}</div>
                        <div className="text-xs text-text-sub-600">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        userRoleStyles[user.role] || userRoleStyles.ADMIN
                      }`}
                    >
                      {(user.role === 'SUPER_ADMIN_MAX' || user.role === 'SUPER_ADMIN') && (
                        <RiShieldUserLine size={14} />
                      )}
                      {userRoleLabels[user.role] || 'Admin'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-sub-600">
                    {user.role === 'SUPER_ADMIN' || user.role === 'SUPER_ADMIN_MAX' ? (
                      <span
                        className={`text-xs italic ${
                          user.role === 'SUPER_ADMIN_MAX'
                            ? 'text-amber-600 font-medium'
                            : 'text-purple-600'
                        }`}
                      >
                        {user.role === 'SUPER_ADMIN_MAX' ? 'System Owner' : 'Full Access'}
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {user.permissions && user.permissions.length > 0 ? (
                          user.permissions.map((perm) => (
                            <span
                              key={perm}
                              className="bg-bg-weak-100 px-1.5 py-0.5 rounded text-xs text-text-strong-950 border border-stroke-soft-200"
                            >
                              {permissionLabelMap[perm] || perm}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-text-weak-400">View Only</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.role !== 'SUPER_ADMIN_MAX' && (
                      <button
                        onClick={() => onEditRoles(user)}
                        className="flex items-center gap-1 rounded-full border border-stroke-soft-200 bg-bg-weak-50 px-2.5 py-1 text-xs font-medium text-text-sub-600 transition-colors hover:text-primary-base"
                      >
                        <RiEdit2Line size={14} /> Roles
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
