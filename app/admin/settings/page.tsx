'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/hooks/use-session';
import ProfilePage from '../profile/page';
import { SettingsHeader } from './components/settings-header';
import { TeamPanel } from './components/team-panel';
import { StoragePanel } from './components/storage-panel';
import { LifecyclePanel } from './components/lifecycle-panel';
import { CreateAdminModal } from './components/create-admin-modal';
import { PermissionsModal } from './components/permissions-modal';
import type { SettingsTab } from './types';
import { getLifecycleConfig } from './utils';
import { useAdminUsers } from './hooks/use-admin-users';
import { useLifecycleClients } from './hooks/use-lifecycle-clients';
import { useStorageStats } from './hooks/use-storage-stats';

export default function SettingsPage() {
  const { data: currentUser, error: sessionError } = useSession();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'SUPER_ADMIN_MAX';
  const lifecycleConfig = getLifecycleConfig(activeTab);
  const isStorageTab = activeTab === 'storage';

  const {
    users,
    isModalOpen,
    setIsModalOpen,
    newEmail,
    setNewEmail,
    newPassword,
    setNewPassword,
    newFirstName,
    setNewFirstName,
    newLastName,
    setNewLastName,
    newRole,
    setNewRole,
    creating,
    isPermModalOpen,
    setIsPermModalOpen,
    selectedUser,
    permChanges,
    roleChange,
    setRoleChange,
    savingPerms,
    handleCreateUser,
    openPermModal,
    togglePermission,
    handleSavePermissions,
  } = useAdminUsers({ enabled: Boolean(currentUser && isSuperAdmin) });

  const { clients, runCleanup, updateClientStatus } = useLifecycleClients(Boolean(currentUser));
  const { storageStats, loadingStorage, fetchStorage } = useStorageStats(isStorageTab);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-8">Loading...</div>;
  if (sessionError) return <div className="p-8">Failed to load session.</div>;
  if (!currentUser) return <div className="p-8">Loading...</div>;

  const filteredClients = lifecycleConfig
    ? clients.filter((client) => client.status === lifecycleConfig.status)
    : [];

  return (
    <div>
      <SettingsHeader
        activeTab={activeTab}
        isSuperAdmin={Boolean(isSuperAdmin)}
        onChangeTab={setActiveTab}
      />

      {activeTab === 'profile' && (
        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
          <ProfilePage />
        </div>
      )}

      {activeTab === 'team' && isSuperAdmin && (
        <TeamPanel users={users} onAddAdmin={() => setIsModalOpen(true)} onEditRoles={openPermModal} />
      )}

      {activeTab === 'storage' && (
        <StoragePanel loadingStorage={loadingStorage} storageStats={storageStats} />
      )}

      {lifecycleConfig && (
        <LifecyclePanel
          title={lifecycleConfig.title}
          description={lifecycleConfig.description}
          status={lifecycleConfig.status}
          days={lifecycleConfig.days}
          clients={filteredClients}
          onRunCleanup={runCleanup}
          onUpdateStatus={(id, status) => updateClientStatus(id, status, fetchStorage)}
        />
      )}

      <CreateAdminModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        newFirstName={newFirstName}
        newLastName={newLastName}
        newEmail={newEmail}
        newPassword={newPassword}
        newRole={newRole}
        creating={creating}
        onFirstNameChange={setNewFirstName}
        onLastNameChange={setNewLastName}
        onEmailChange={setNewEmail}
        onPasswordChange={setNewPassword}
        onRoleChange={setNewRole}
        onSubmit={handleCreateUser}
      />

      <PermissionsModal
        open={isPermModalOpen}
        onClose={() => setIsPermModalOpen(false)}
        selectedUser={selectedUser}
        roleChange={roleChange}
        permChanges={permChanges}
        saving={savingPerms}
        onRoleChange={setRoleChange}
        onTogglePermission={togglePermission}
        onSave={handleSavePermissions}
      />
    </div>
  );
}
