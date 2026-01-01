'use client';

import { useState, useEffect } from 'react';
import { RiUserLine, RiLockPasswordLine, RiLoader4Line, RiCheckLine, RiEdit2Line } from '@remixicon/react';
import { api } from '@/lib/api-client';
import { useSession } from '@/lib/hooks/use-session';

export default function ProfilePage() {
  const { data: session, error: sessionError } = useSession();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (sessionError) {
      setLoading(false);
      return;
    }
    if (!session || user) return;
    setUser(session);
    const names = (session.name || '').split(' ');
    setFirstName(names[0] || '');
    setLastName(names.slice(1).join(' ') || '');
    setLoading(false);
  }, [session, sessionError, user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await api.put('auth/profile', { firstName, lastName });
      setMessage('Profile updated successfully');
      // Update local user state
      setUser((prev: any) => ({ ...prev, name: `${firstName} ${lastName}`.trim() }));
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setSaving(true);
    setMessage('');
    setError('');

    try {
      await api.put('auth/profile', { currentPassword, newPassword });
      setMessage('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };



  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // ... (keep existing state/effects)

  // Fetch logic needs to make sure we have email/role/permissions
  // The fetch('/api/auth/me') return object has them.
  // I need to ensure `user` state has them.

  if (loading) return <div className="p-8">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-title-h4 font-bold text-text-strong-950">My Profile</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-text-strong-950 text-white text-sm font-semibold rounded-lg hover:opacity-90"
          >
            <RiEdit2Line size={16} /> Edit Profile
          </button>
        )}
      </div>

      {message && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
          <RiCheckLine size={20} /> {message}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-error-weak/10 text-error-base rounded-lg">
          {error}
        </div>
      )}

      {/* User Info Card */}
      <div className="bg-bg-white-0 rounded-xl border border-stroke-soft-200 p-6 mb-8">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <RiUserLine className="text-primary-base" /> Personal Details
        </h2>

        {isEditing ? (
          <form onSubmit={(e) => { handleUpdateProfile(e); setIsEditing(false); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-sub-600 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-lg border border-stroke-soft-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-sub-600 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-lg border border-stroke-soft-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
            {/* Email Read Only in Edit too? Usually email update requires validation. Let's keep it read-only for now or just display it. */}
            <div>
              <label className="block text-xs font-semibold text-text-sub-600 mb-1">Email</label>
              <div className="text-sm text-text-sub-600 px-3 py-2 bg-bg-weak-50 rounded-lg border border-stroke-soft-200 cursor-not-allowed">
                {user.email}
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
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
                <label className="block text-xs font-semibold text-text-sub-600 mb-1">Full Name</label>
                <p className="text-text-strong-950 font-medium">{user.first_name} {user.last_name}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-sub-600 mb-1">Email</label>
                <p className="text-text-strong-950 font-medium">{user.email}</p>
              </div>
            </div>

            <div className="border-t border-stroke-soft-200 pt-4">
              <label className="block text-xs font-semibold text-text-sub-600 mb-2">Role & Permissions</label>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${user.role === 'SUPER_ADMIN_MAX'
                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                  : user.role === 'SUPER_ADMIN'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-bg-weak-100 text-text-sub-600'
                  }`}>
                  {user.role === 'SUPER_ADMIN_MAX' ? 'Owner' : user.role === 'SUPER_ADMIN' ? 'Super Admin' : user.role}
                </span>
                {(user.role === 'SUPER_ADMIN' || user.role === 'SUPER_ADMIN_MAX') ? (
                  <span className="bg-bg-weak-100 px-2 py-1 rounded-full text-xs text-text-strong-950 border border-stroke-soft-200">
                    {user.role === 'SUPER_ADMIN_MAX' ? 'System Owner' : 'Full System Access'}
                  </span>
                ) : (
                  user.permissions?.map((p: string) => (
                    <span key={p} className="bg-bg-weak-100 px-2 py-1 rounded-full text-xs text-text-strong-950 border border-stroke-soft-200">
                      {p.replace('_', ' ')}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Change Password - Only show in Edit Mode? Or separate toggle? User said "Edit button before able to edit details". I'll hide this unless isEditing is true, OR make it separate. I'll keep it visible but maybe "Edit" button unlocks it? 
      Actually, separate card is fine. I'll keep it there but maybe users prefer it hidden. 
      Let's keep it visible so they know they can change it, but it functions independently as before.
      */}
      <div className="bg-bg-white-0 rounded-xl border border-stroke-soft-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <RiLockPasswordLine className="text-primary-base" /> Change Password
          </h2>
          {!isChangingPassword && (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="text-sm font-semibold text-text-strong-950 underline hover:text-primary-base"
            >
              Update Password
            </button>
          )}
        </div>

        {isChangingPassword && (
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md animate-in fade-in slide-in-from-top-2 duration-200">
            <div>
              <label className="block text-xs font-semibold text-text-sub-600 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-stroke-soft-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-sub-600 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-stroke-soft-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-sub-600 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-stroke-soft-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setIsChangingPassword(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}
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

    </div>
  );
}
