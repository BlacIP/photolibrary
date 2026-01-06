import { RiLockPasswordLine } from '@remixicon/react';
import type { ProfileFormState } from '../types';

export function PasswordCard({
  isChangingPassword,
  saving,
  form,
  labelClass,
  inputClass,
  cardClass,
  onFieldChange,
  onStart,
  onCancel,
  onSubmit,
}: {
  isChangingPassword: boolean;
  saving: boolean;
  form: ProfileFormState;
  labelClass: string;
  inputClass: string;
  cardClass: string;
  onFieldChange: (field: keyof ProfileFormState, value: string) => void;
  onStart: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <RiLockPasswordLine className="text-primary-base" /> Change Password
        </h2>
        {!isChangingPassword && (
          <button
            onClick={onStart}
            className="text-sm font-semibold text-text-strong-950 underline hover:text-primary-base"
          >
            Update Password
          </button>
        )}
      </div>

      {isChangingPassword && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
          className="space-y-4 max-w-md animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div>
            <label className={labelClass}>Current Password</label>
            <input
              type="password"
              required
              value={form.currentPassword}
              onChange={(e) => onFieldChange('currentPassword', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>New Password</label>
            <input
              type="password"
              required
              value={form.newPassword}
              onChange={(e) => onFieldChange('newPassword', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Confirm New Password</label>
            <input
              type="password"
              required
              value={form.confirmPassword}
              onChange={(e) => onFieldChange('confirmPassword', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-text-sub-600 hover:bg-bg-weak-50 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-text-strong-950 text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Change Password'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
