import { RiCheckLine } from '@remixicon/react';
import * as Modal from '@/components/ui/modal';
import { AVAILABLE_PERMISSIONS } from '../types';
import type { User } from '../types';

export function PermissionsModal({
  open,
  onClose,
  selectedUser,
  roleChange,
  permChanges,
  saving,
  onRoleChange,
  onTogglePermission,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  selectedUser: User | null;
  roleChange: string;
  permChanges: string[];
  saving: boolean;
  onRoleChange: (value: string) => void;
  onTogglePermission: (permId: string) => void;
  onSave: () => void;
}) {
  return (
    <Modal.Root open={open}>
      <Modal.Content showClose>
        <div className="relative">
          <button onClick={onClose} className="absolute right-4 top-4 text-text-sub-600" />
          <Modal.Header
            title="Edit Permissions"
            description={`Manage access level for ${selectedUser?.first_name || 'User'}`}
          />
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-sub-600 mb-1">Role</label>
              <select
                value={roleChange}
                onChange={(e) => onRoleChange(e.target.value)}
                className="w-full rounded-lg border border-stroke-soft-200 px-3 py-2 text-sm bg-bg-white-0"
              >
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>

            {roleChange !== 'SUPER_ADMIN' && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-text-sub-600">Permissions</label>
                <div className="space-y-2">
                  {AVAILABLE_PERMISSIONS.map((perm) => (
                    <div
                      key={perm.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-stroke-soft-200 hover:bg-bg-weak-50 transition-colors cursor-pointer"
                      onClick={() => onTogglePermission(perm.id)}
                    >
                      <div
                        className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border ${
                          permChanges.includes(perm.id)
                            ? 'bg-primary-base border-primary-base text-white'
                            : 'border-stroke-soft-200 bg-white'
                        }`}
                      >
                        {permChanges.includes(perm.id) && <RiCheckLine size={14} />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-strong-950">{perm.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button onClick={onClose} className="text-sm font-medium text-text-sub-600">
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="px-4 py-2 bg-text-strong-950 text-white text-sm font-semibold rounded-lg"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}
