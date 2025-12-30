'use client';

import { useEffect, useState } from 'react';
import { RiAddLine, RiUserLine, RiShieldUserLine, RiCheckLine, RiEdit2Line, RiHardDriveLine, RiArchiveLine, RiDeleteBinLine, RiRefreshLine } from '@remixicon/react';
import * as Modal from '@/components/ui/modal';
import { api } from '@/lib/api-client';
import ProfilePage from '../profile/page'; // Reuse existing Profile Page logic

interface User {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role: string;
    created_at: string;
    permissions?: string[];
}

export default function SettingsPage() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'storage' | 'archive' | 'recycle'>('profile');
    const [clients, setClients] = useState<any[]>([]); // Using any for brevity or defines interface
    const [storageStats, setStorageStats] = useState<any>(null);
    const [loadingStorage, setLoadingStorage] = useState(false);

    // Create User State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newFirstName, setNewFirstName] = useState('');
    const [newLastName, setNewLastName] = useState('');
    const [newRole, setNewRole] = useState('ADMIN');
    const [creating, setCreating] = useState(false);

    // Permissions Modal
    const [isPermModalOpen, setIsPermModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [permChanges, setPermChanges] = useState<string[]>([]);
    const [roleChange, setRoleChange] = useState('ADMIN');
    const [savingPerms, setSavingPerms] = useState(false);

    // Available Permissions
    const AVAILABLE_PERMISSIONS = [
        { id: 'manage_clients', label: 'Manage Clients (Create, Edit, Delete)' },
        { id: 'manage_photos', label: 'Manage Photos (Upload, Delete)' },
    ];

    const fetchCurrentUser = async () => {
        try {
            const data = await api.get('auth/me');
            setCurrentUser(data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await api.get('users');
            setUsers(data);
        } catch (err) {
            console.error(err);
        }
    };

    const formatBytes = (bytes: number) => {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const calculateDaysLeft = (dateString: string, maxDays: number) => {
        const updated = new Date(dateString).getTime();
        const now = new Date().getTime();
        const diffDays = (now - updated) / (1000 * 3600 * 24);
        return Math.max(0, Math.ceil(maxDays - diffDays));
    };

    const fetchClients = async () => {
        try {
            const data = await api.get('admin/legacy/clients');
            setClients(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
    };

    const fetchStorage = async () => {
        setLoadingStorage(true);
        try {
            const res = await api.get('admin/storage');
            setStorageStats(res);
        } catch (e) { console.error(e); }
        finally { setLoadingStorage(false); }
    };

    const runCleanup = async () => {
        if (!confirm('This will permanently delete items in Recycle Bin older than 7 days and move Archive items older than 30 days to Recycle Bin. Continue?')) return;
        try {
            // TODO: Implement lifecycle endpoint in backend
            // await api.post('admin/lifecycle/cleanup');
            // alert('Cleanup completed');
            // fetchClients();
            // fetchStorage();
        } catch (e) { console.error(e); }
    };

    const updateClientStatus = async (id: string, status: string) => {
        if (status === 'DELETED_FOREVER') {
            if (!confirm('Are you sure you want to permanently delete this client and all photos? This cannot be undone.')) return;
            try {
                await api.delete(`admin/legacy/clients/${id}`);
                fetchClients();
                fetchStorage();
            } catch (e) { console.error(e); }
            return;
        }

        try {
            await api.put(`admin/legacy/clients/${id}`, { status });
            fetchClients();
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        fetchCurrentUser().then(() => {
            fetchUsers();
            fetchClients();
        });
    }, []);

    useEffect(() => {
        if (activeTab === 'storage') fetchStorage();
    }, [activeTab]);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            await api.post('users', {
                email: newEmail,
                password: newPassword,
                firstName: newFirstName,
                lastName: newLastName,
                role: newRole
            });

            setIsModalOpen(false);
            setNewEmail('');
            setNewPassword('');
            setNewFirstName('');
            setNewLastName('');
            fetchUsers();
        } catch (err: any) {
            console.error(err);
            alert(err.message || 'Failed to create user');
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
        setPermChanges(prev =>
            prev.includes(permId)
                ? prev.filter(p => p !== permId)
                : [...prev, permId]
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

    if (!currentUser) return <div className="p-8">Loading...</div>;

    const isSuperAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SUPER_ADMIN_MAX';

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-title-h4 font-bold text-text-strong-950 mb-4">Settings</h1>

                <div className="flex flex-wrap gap-1 bg-bg-weak-50 p-1 rounded-lg w-full sm:w-fit">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'profile'
                            ? 'bg-white text-text-strong-950 shadow-sm'
                            : 'text-text-sub-600 hover:text-text-strong-950'
                            }`}
                    >
                        My Profile
                    </button>
                    {isSuperAdmin && (
                        <button
                            onClick={() => setActiveTab('team')}
                            className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'team'
                                ? 'bg-white text-text-strong-950 shadow-sm'
                                : 'text-text-sub-600 hover:text-text-strong-950'
                                }`}
                        >
                            Team & Roles
                        </button>
                    )}
                    {isSuperAdmin && (
                        <button
                            onClick={() => setActiveTab('storage')}
                            className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'storage'
                                ? 'bg-white text-text-strong-950 shadow-sm'
                                : 'text-text-sub-600 hover:text-text-strong-950'
                                }`}
                        >
                            Storage
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('archive')}
                        className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'archive'
                            ? 'bg-white text-text-strong-950 shadow-sm'
                            : 'text-text-sub-600 hover:text-text-strong-950'
                            }`}
                    >
                        Archive
                    </button>
                    <button
                        onClick={() => setActiveTab('recycle')}
                        className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'recycle'
                            ? 'bg-white text-text-strong-950 shadow-sm'
                            : 'text-text-sub-600 hover:text-text-strong-950'
                            }`}
                    >
                        Recycle Bin
                    </button>
                </div>
            </div>

            {activeTab === 'profile' && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                    <ProfilePage />
                </div>
            )}

            {activeTab === 'team' && isSuperAdmin && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-text-strong-950">Team Management</h2>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 rounded-lg bg-primary-base px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
                        >
                            <RiAddLine size={18} />
                            Add Admin
                        </button>
                    </div>

                    <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-sm overflow-x-auto">
                        <table className="w-full text-left text-sm min-w-[600px]">
                            <thead className="bg-bg-weak-50 text-text-sub-600">
                                <tr>
                                    <th className="px-6 py-4 font-medium">User</th>
                                    <th className="px-6 py-4 font-medium">Role</th>
                                    <th className="px-6 py-4 font-medium">Permissions</th>
                                    <th className="px-6 py-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stroke-soft-200">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-bg-weak-50/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-weak/20 text-primary-base font-semibold text-xs">
                                                    {user.first_name ? user.first_name[0] : <RiUserLine size={16} />}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-text-strong-950">
                                                        {user.first_name ? `${user.first_name} ${user.last_name}` : 'No Name'}
                                                    </div>
                                                    <div className="text-xs text-text-sub-600">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${user.role === 'SUPER_ADMIN_MAX'
                                                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                                : user.role === 'SUPER_ADMIN'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-bg-weak-100 text-text-sub-600'
                                                }`}>
                                                {user.role === 'SUPER_ADMIN_MAX' && <RiShieldUserLine size={14} />}
                                                {user.role === 'SUPER_ADMIN' && <RiShieldUserLine size={14} />}
                                                {user.role === 'SUPER_ADMIN_MAX' ? 'Owner' : user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-text-sub-600">
                                            {(user.role === 'SUPER_ADMIN' || user.role === 'SUPER_ADMIN_MAX') ? (
                                                <span className={`text-xs italic ${user.role === 'SUPER_ADMIN_MAX' ? 'text-amber-600 font-medium' : 'text-purple-600'}`}>
                                                    {user.role === 'SUPER_ADMIN_MAX' ? 'System Owner' : 'Full Access'}
                                                </span>
                                            ) : (
                                                <div className="flex flex-wrap gap-1">
                                                    {user.permissions && user.permissions.length > 0 ? (
                                                        user.permissions.map(p => (
                                                            <span key={p} className="bg-bg-weak-100 px-1.5 py-0.5 rounded text-xs text-text-strong-950 border border-stroke-soft-200">
                                                                {p === 'manage_clients' ? 'Clients' : p === 'manage_photos' ? 'Photos' : p}
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
                                                    onClick={() => openPermModal(user)}
                                                    className="flex items-center gap-1 text-text-sub-600 hover:text-primary-base font-medium text-xs bg-bg-weak-50 px-2 py-1 rounded border border-transparent hover:border-stroke-soft-200 transition-colors"
                                                >
                                                    <RiEdit2Line size={14} /> Roles
                                                </button>
                                            )}
                                            {/* We could add Reset Password here too if needed, but omitted to save space for now */}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'storage' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                    {loadingStorage && (
                        <div className="p-6 rounded-xl border border-dashed border-stroke-soft-200 bg-bg-white-0 text-text-sub-600">
                            Loading storage stats...
                        </div>
                    )}

                    {!loadingStorage && !storageStats && (
                        <div className="p-6 rounded-xl border border-dashed border-stroke-soft-200 bg-bg-white-0 text-text-sub-600">
                            Storage stats not available yet.
                        </div>
                    )}

                    {!loadingStorage && storageStats && (
                        <>
                            {/* Top Row: Cloudinary Usage (Full Width) */}
                            <div className="bg-bg-white-0 p-4 rounded-xl border border-stroke-soft-200 mb-4">
                                <p className="text-xs text-text-sub-600 font-medium uppercase tracking-wider">Cloudinary Storage</p>
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                    <div>
                                        <p className="text-2xl font-bold text-text-strong-950 mt-1">
                                            {storageStats.cloudinary && !storageStats.cloudinary.error
                                                ? formatBytes(storageStats.cloudinary.storage.used)
                                                : formatBytes(storageStats.totalBytes)}
                                        </p>
                                    </div>

                                    {storageStats.cloudinary && !storageStats.cloudinary.error ? (
                                        <div className="flex-1 md:ml-8 max-w-2xl">
                                            <div className="flex justify-between text-xs text-text-sub-600 mb-1">
                                                <span>
                                                    Plan Usage:{' '}
                                                    {storageStats.cloudinary.credits?.percent !== undefined
                                                        ? `${Number(storageStats.cloudinary.credits.percent || 0).toFixed(2)}%`
                                                        : 'N/A'}
                                                </span>
                                                <span>
                                                    {storageStats.cloudinary.credits?.limit
                                                        ? `${storageStats.cloudinary.credits.limit} Credits Limit`
                                                        : 'Limit N/A'}
                                                </span>
                                            </div>
                                            <div className="w-full bg-bg-weak-100 rounded-full h-2 overflow-hidden mb-1">
                                                <div
                                                    className={`h-full rounded-full ${storageStats.cloudinary.credits?.percent > 90 ? 'bg-error-base' : 'bg-primary-base'}`}
                                                    style={{ width: `${Math.min(100, storageStats.cloudinary.credits?.percent || 0)}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-text-sub-600 flex justify-between gap-4">
                                                <span>Plan: {storageStats.cloudinary.plan}</span>
                                                <span title="Shared quota for Storage, Bandwidth, and Transformations">1 Credit ≈ 1 GB (Storage/Bandwidth)</span>
                                            </p>
                                        </div>
                                    ) : storageStats.cloudinary?.error ? (
                                        <div className="p-2 bg-error-weak/20 rounded-lg border border-error-weak/50 text-xs text-error-base">
                                            API Error: {storageStats.cloudinary.error}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-text-sub-600">Cloudinary API Stats Unavailable</p>
                                    )}
                                </div>
                            </div>

                            {/* Bottom Row: App Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-bg-white-0 p-4 rounded-xl border border-stroke-soft-200">
                                    <p className="text-xs text-text-sub-600 font-medium uppercase tracking-wider">Database Media</p>
                                    <p className="text-2xl font-bold text-text-strong-950 mt-1">{formatBytes(storageStats.totalBytes)}</p>
                                    <p className="text-sm text-text-sub-600 mt-1">{storageStats.totalPhotos} Photos</p>
                                </div>
                                <div className="bg-bg-white-0 p-4 rounded-xl border border-stroke-soft-200">
                                    <p className="text-xs text-text-sub-600 font-medium uppercase tracking-wider">Archived Content</p>
                                    <p className="text-2xl font-bold text-text-strong-950 mt-1">{formatBytes(storageStats.statusStats.archived_bytes)}</p>
                                </div>
                                <div className="bg-bg-white-0 p-4 rounded-xl border border-stroke-soft-200">
                                    <p className="text-xs text-text-sub-600 font-medium uppercase tracking-wider">Recycle Bin</p>
                                    <p className="text-2xl font-bold text-text-strong-950 mt-1">{formatBytes(storageStats.statusStats.deleted_bytes)}</p>
                                </div>
                            </div>

                            <div className="bg-bg-white-0 rounded-xl border border-stroke-soft-200 overflow-x-auto">
                                <div className="min-w-[700px]">
                                    <div className="px-6 py-4 border-b border-stroke-soft-200">
                                        <h3 className="font-semibold text-text-strong-950">Storage by Client</h3>
                                    </div>
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-bg-weak-50 text-text-sub-600">
                                            <tr>
                                                <th className="px-6 py-3 font-medium">Client</th>
                                                <th className="px-6 py-3 font-medium">Status</th>
                                                <th className="px-6 py-3 font-medium">Photos</th>
                                                <th className="px-6 py-3 font-medium">Size</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-stroke-soft-200">
                                            {storageStats.clients.map((c: any) => (
                                                <tr key={c.id}>
                                                    <td className="px-6 py-3 font-medium text-text-strong-950">{c.name}</td>
                                                    <td className="px-6 py-3">
                                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${c.status === 'ARCHIVED' ? 'bg-amber-100 text-amber-700' : c.status === 'DELETED' ? 'bg-error-weak text-error-base' : 'bg-success-weak text-success-base'}`}>
                                                            {c.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3 text-text-sub-600">{c.photo_count}</td>
                                                    <td className="px-6 py-3 font-mono text-text-sub-600">{formatBytes(c.total_bytes)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {(activeTab === 'archive' || activeTab === 'recycle') && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-text-strong-950">{activeTab === 'archive' ? 'Archive' : 'Recycle Bin'}</h2>
                        <button onClick={runCleanup} className="flex items-center gap-2 text-sm text-text-sub-600 hover:text-text-strong-950">
                            <RiRefreshLine size={16} /> Run Lifecycle Cleanup
                        </button>
                    </div>
                    <p className="text-sm text-text-sub-600 mb-6">
                        {activeTab === 'archive'
                            ? 'Clients in Archive are kept for 30 days before moving to Recycle Bin.'
                            : 'Clients in Recycle Bin are kept for 7 days before permanent deletion.'}
                    </p>

                    <div className="bg-bg-white-0 rounded-xl border border-stroke-soft-200 overflow-x-auto">
                        <table className="w-full text-left text-sm min-w-[700px]">
                            <thead className="bg-bg-weak-50 text-text-sub-600">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Client</th>
                                    <th className="px-6 py-3 font-medium">Status Updated</th>
                                    <th className="px-6 py-3 font-medium">Auto-Move In</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stroke-soft-200">
                                {clients.filter(c => c.status === (activeTab === 'archive' ? 'ARCHIVED' : 'DELETED')).map(client => (
                                    <tr key={client.id}>
                                        <td className="px-6 py-3 font-medium text-text-strong-950">{client.name}</td>
                                        <td className="px-6 py-3 text-text-sub-600">{new Date(client.statusUpdatedAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-3 text-text-sub-600">
                                            {calculateDaysLeft(client.statusUpdatedAt, activeTab === 'archive' ? 30 : 7)} Days
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => updateClientStatus(client.id, 'ACTIVE')}
                                                    className="px-3 py-1.5 text-xs font-semibold text-text-strong-950 bg-bg-weak-50 rounded hover:bg-bg-weak-100 border border-stroke-soft-200"
                                                >
                                                    Restore
                                                </button>
                                                {activeTab === 'archive' ? (
                                                    <button
                                                        onClick={() => updateClientStatus(client.id, 'DELETED')}
                                                        className="px-3 py-1.5 text-xs font-semibold text-error-base hover:bg-error-weak/10 rounded"
                                                    >
                                                        Move to Bin
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => updateClientStatus(client.id, 'DELETED_FOREVER')}
                                                        className="px-3 py-1.5 text-xs font-semibold text-error-base hover:bg-error-weak/10 rounded"
                                                    >
                                                        Delete Forever
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {clients.filter(c => c.status === (activeTab === 'archive' ? 'ARCHIVED' : 'DELETED')).length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-text-sub-600">
                                            No clients in {activeTab === 'archive' ? 'Archive' : 'Recycle Bin'}.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Admin Modal */}
            <Modal.Root open={isModalOpen}>
                <Modal.Content showClose={true}>
                    <div className="relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-4 top-4 text-text-sub-600 hover:text-text-strong-950"
                        >
                        </button>
                        <Modal.Header title="Create New Admin" description="Grant access to the studio dashboard." />
                        <form onSubmit={handleCreateUser} className="p-5 space-y-4">
                            {/* Form fields same as before, simplified for this replace check... Keeping it concise */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-text-sub-600 mb-1">First Name</label>
                                    <input value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} className="w-full rounded-lg border border-stroke-soft-200 px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-text-sub-600 mb-1">Last Name</label>
                                    <input value={newLastName} onChange={(e) => setNewLastName(e.target.value)} className="w-full rounded-lg border border-stroke-soft-200 px-3 py-2 text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-text-sub-600 mb-1">Email</label>
                                <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full rounded-lg border border-stroke-soft-200 px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-text-sub-600 mb-1">Password</label>
                                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-lg border border-stroke-soft-200 px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-text-sub-600 mb-1">Role</label>
                                <select
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value)}
                                    className="w-full rounded-lg border border-stroke-soft-200 px-3 py-2 text-sm bg-bg-white-0"
                                >
                                    <option value="ADMIN">Admin</option>
                                    <option value="SUPER_ADMIN">Super Admin</option>
                                </select>
                            </div>
                            <div className="pt-2">
                                <button type="submit" disabled={creating} className="w-full rounded-lg bg-text-strong-950 py-2.5 text-sm font-semibold text-white">
                                    {creating ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal.Content>
            </Modal.Root>

            {/* Permissions Modal */}
            <Modal.Root open={isPermModalOpen}>
                <Modal.Content showClose={true}>
                    <div className="relative">
                        <button onClick={() => setIsPermModalOpen(false)} className="absolute right-4 top-4 text-text-sub-600" />
                        <Modal.Header title="Edit Permissions" description={`Manage access level for ${selectedUser?.first_name || 'User'}`} />
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-text-sub-600 mb-1">Role</label>
                                <select
                                    value={roleChange}
                                    onChange={(e) => setRoleChange(e.target.value)}
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
                                        {AVAILABLE_PERMISSIONS.map(perm => (
                                            <div key={perm.id} className="flex items-start gap-3 p-3 rounded-lg border border-stroke-soft-200 hover:bg-bg-weak-50 transition-colors cursor-pointer" onClick={() => togglePermission(perm.id)}>
                                                <div className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border ${permChanges.includes(perm.id) ? 'bg-primary-base border-primary-base text-white' : 'border-stroke-soft-200 bg-white'}`}>
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
                                <button onClick={() => setIsPermModalOpen(false)} className="text-sm font-medium text-text-sub-600">Cancel</button>
                                <button onClick={handleSavePermissions} disabled={savingPerms} className="px-4 py-2 bg-text-strong-950 text-white text-sm font-semibold rounded-lg">
                                    {savingPerms ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal.Content>
            </Modal.Root>
        </div>
    );
}
