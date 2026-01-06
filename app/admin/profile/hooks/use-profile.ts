import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api-client';
import { useSession } from '@/lib/hooks/use-session';
import type { SessionUser } from '@/lib/hooks/use-session';
import { buildProfileMeta } from '../utils';
import type { ProfileFormState } from '../types';

const initialForm: ProfileFormState = {
  firstName: '',
  lastName: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

type ProfileUser = SessionUser & {
  first_name?: string;
  last_name?: string;
};

export function useProfile() {
  const { data: session, error: sessionError } = useSession();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState<ProfileFormState>(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (sessionError) {
      setLoading(false);
      return;
    }
    if (!session || user) return;
    setUser(session);
    const names = (session.name || '').split(' ');
    setForm((prev) => ({
      ...prev,
      firstName: names[0] || '',
      lastName: names.slice(1).join(' ') || '',
    }));
    setLoading(false);
  }, [session, sessionError, user]);

  const meta = useMemo(
    () => buildProfileMeta({ role: user?.role, permissions: user?.permissions }),
    [user]
  );

  const setField = (field: keyof ProfileFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await api.put('auth/profile', { firstName: form.firstName, lastName: form.lastName });
      setMessage('Profile updated successfully');
      setUser((prev) =>
        prev
          ? {
              ...prev,
              name: `${form.firstName} ${form.lastName}`.trim(),
            }
          : prev
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match');
      return false;
    }

    setSaving(true);
    setMessage('');
    setError('');

    try {
      await api.put('auth/profile', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setMessage('Password changed successfully');
      setForm((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setIsChangingPassword(false);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to change password';
      setError(message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const closePasswordForm = () => {
    setIsChangingPassword(false);
    setForm((prev) => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }));
  };

  return {
    user,
    loading,
    saving,
    message,
    error,
    form,
    isEditing,
    isChangingPassword,
    meta,
    setField,
    setIsEditing,
    setIsChangingPassword,
    handleUpdateProfile,
    handleChangePassword,
    closePasswordForm,
  };
}
