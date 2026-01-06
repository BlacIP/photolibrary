'use client';

import { useProfile } from './hooks/use-profile';
import { ProfileHeader } from './components/profile-header';
import { StatusAlerts } from './components/status-alerts';
import { ProfileDetailsCard } from './components/profile-details-card';
import { PasswordCard } from './components/password-card';

export default function ProfilePage() {
  const {
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
  } = useProfile();

  const labelClass = 'block text-xs font-semibold text-text-sub-600 mb-1';
  const inputClass = 'w-full rounded-lg border border-stroke-soft-200 px-3 py-2 text-sm';
  const cardClass = 'bg-bg-white-0 rounded-xl border border-stroke-soft-200 p-6';
  const pillClass =
    'bg-bg-weak-100 px-2 py-1 rounded-full text-xs text-text-strong-950 border border-stroke-soft-200';

  if (loading) return <div className="p-8">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <ProfileHeader isEditing={isEditing} onEdit={() => setIsEditing(true)} />

      <StatusAlerts message={message} error={error} />

      <ProfileDetailsCard
        isEditing={isEditing}
        saving={saving}
        user={user}
        form={form}
        meta={meta}
        labelClass={labelClass}
        inputClass={inputClass}
        cardClass={cardClass}
        pillClass={pillClass}
        onFieldChange={setField}
        onCancelEdit={() => setIsEditing(false)}
        onSave={handleUpdateProfile}
      />

      <PasswordCard
        isChangingPassword={isChangingPassword}
        saving={saving}
        form={form}
        labelClass={labelClass}
        inputClass={inputClass}
        cardClass={cardClass}
        onFieldChange={setField}
        onStart={() => setIsChangingPassword(true)}
        onCancel={closePasswordForm}
        onSubmit={handleChangePassword}
      />
    </div>
  );
}
