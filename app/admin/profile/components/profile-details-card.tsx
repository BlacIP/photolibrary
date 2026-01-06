import { RiUserLine } from '@remixicon/react';
import type { SessionUser } from '@/lib/hooks/use-session';
import type { ProfileFormState, ProfileMeta } from '../types';

type ProfileUser = SessionUser & {
  first_name?: string;
  last_name?: string;
};

export function ProfileDetailsCard({
  isEditing,
  saving,
  user,
  form,
  meta,
  labelClass,
  inputClass,
  cardClass,
  pillClass,
  onFieldChange,
  onCancelEdit,
  onSave,
}: {
  isEditing: boolean;
  saving: boolean;
  user: ProfileUser | null;
  form: ProfileFormState;
  meta: ProfileMeta;
  labelClass: string;
  inputClass: string;
  cardClass: string;
  pillClass: string;
  onFieldChange: (field: keyof ProfileFormState, value: string) => void;
  onCancelEdit: () => void;
  onSave: () => void;
}) {
  return (
    <div className={`${cardClass} mb-8`}>
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <RiUserLine className="text-primary-base" /> Personal Details
      </h2>

      {isEditing ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => onFieldChange('firstName', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => onFieldChange('lastName', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <div className="text-sm text-text-sub-600 px-3 py-2 bg-bg-weak-50 rounded-lg border border-stroke-soft-200 cursor-not-allowed">
              {user?.email}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-4 py-2 text-sm font-medium text-text-sub-600 hover:bg-bg-weak-50 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-text-strong-950 text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Full Name</label>
              <p className="text-text-strong-950 font-medium">
                {user?.first_name} {user?.last_name}
              </p>
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <p className="text-text-strong-950 font-medium">{user?.email}</p>
            </div>
          </div>

          <div className="border-t border-stroke-soft-200 pt-4">
            <label className="block text-xs font-semibold text-text-sub-600 mb-2">Role & Permissions</label>
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.roleBadgeClass}`}
              >
                {meta.roleLabel}
              </span>
              {meta.permissionBadges.map((badge) => (
                <span key={badge.label} className={pillClass}>
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
