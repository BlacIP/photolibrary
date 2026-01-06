import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import type { User } from '../types';

export function useAdminUsers({ enabled }: { enabled: boolean }) {
  const [users, setUsers] = useState<User[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newRole, setNewRole] = useState('ADMIN');
  const [creating, setCreating] = useState(false);

  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permChanges, setPermChanges] = useState<string[]>([]);
  const [roleChange, setRoleChange] = useState('ADMIN');
  const [savingPerms, setSavingPerms] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await api.get<User[]>('users');
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      fetchUsers();
    }
  }, [enabled, fetchUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('users', {
        email: newEmail,
        password: newPassword,
        firstName: newFirstName,
        lastName: newLastName,
        role: newRole,
      });

      setIsModalOpen(false);
      setNewEmail('');
      setNewPassword('');
      setNewFirstName('');
      setNewLastName('');
      fetchUsers();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to create user';
      alert(message);
    } finally {
      setCreating(false);
    }
  };

  const openPermModal = (user: User) => {
    setSelectedUser(user);
    setPermChanges(user.permissions || []);
    setRoleChange(user.role);
    setIsPermModalOpen(true);
  };

  const togglePermission = (permId: string) => {
    setPermChanges((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;
    setSavingPerms(true);
    try {
      await api.put(`users/${selectedUser.id}`, { permissions: permChanges, role: roleChange });
      alert('Permissions updated');
      setIsPermModalOpen(false);
      fetchUsers();
    } catch (e) {
      console.error(e);
      alert('Error saving permissions');
    } finally {
      setSavingPerms(false);
    }
  };

  return {
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
  };
}
