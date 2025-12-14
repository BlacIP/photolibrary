'use client';

import { useEffect, useState } from 'react';
import { RiAddLine, RiUserLine, RiShieldUserLine, RiLoader4Line } from '@remixicon/react';
import * as Modal from '@/components/ui/modal';

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Create User State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        // Handle forbidden
        if (res.status === 403) setError('Access Denied. Super Admin only.');
      }
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, password: newPassword }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNewEmail('');
        setNewPassword('');
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create user');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="p-8">Loading settings...</div>;
  if (error) return <div className="p-8 text-error-base bg-error-weak/10 rounded-lg">{error}</div>;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-title-h4 font-bold text-text-strong-950">User Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-primary-base px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          <RiAddLine size={18} />
          Add Admin
        </button>
      </div>

      <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-bg-weak-50 text-text-sub-600">
            <tr>
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stroke-soft-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-bg-weak-50/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-weak/20 text-primary-base">
                      <RiUserLine size={16} />
                    </div>
                    <span className="font-medium text-text-strong-950">{user.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    user.role === 'SUPER_ADMIN' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-bg-weak-100 text-text-sub-600'
                  }`}>
                    {user.role === 'SUPER_ADMIN' && <RiShieldUserLine size={14} />}
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-text-sub-600">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal.Root open={isModalOpen}>
        <Modal.Content showClose={true}>
          <div className="relative">
             <button 
               onClick={() => setIsModalOpen(false)}
               className="absolute right-4 top-4 text-text-sub-600 hover:text-text-strong-950"
             >
               {/* Close handled by showClose prop mostly but manual trigger good too */}
             </button>
             <Modal.Header title="Create New Admin" description="Grant access to the studio dashboard." />
             <form onSubmit={handleCreateUser} className="p-5 space-y-4">
               <div>
                 <label className="block text-xs font-semibold text-text-sub-600 mb-1">Email</label>
                 <input 
                   type="email" 
                   required
                   value={newEmail}
                   onChange={(e) => setNewEmail(e.target.value)}
                   className="w-full rounded-lg border border-stroke-soft-200 px-3 py-2 text-sm focus:border-primary-base focus:ring-1 focus:ring-primary-base"
                 />
               </div>
               <div>
                 <label className="block text-xs font-semibold text-text-sub-600 mb-1">Password</label>
                 <input 
                   type="password" 
                   required
                   value={newPassword}
                   onChange={(e) => setNewPassword(e.target.value)}
                   className="w-full rounded-lg border border-stroke-soft-200 px-3 py-2 text-sm focus:border-primary-base focus:ring-1 focus:ring-primary-base"
                 />
               </div>
               <div className="pt-2">
                 <button 
                   type="submit" 
                   disabled={creating}
                   className="w-full rounded-lg bg-text-strong-950 py-2.5 text-sm font-semibold text-white disabled:opacity-70 flex justify-center"
                 >
                   {creating ? <RiLoader4Line className="animate-spin" /> : 'Create User'}
                 </button>
               </div>
             </form>
          </div>
        </Modal.Content>
      </Modal.Root>
    </div>
  );
}
