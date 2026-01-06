import * as Modal from '@/components/ui/modal';

export function CreateAdminModal({
  open,
  onClose,
  newFirstName,
  newLastName,
  newEmail,
  newPassword,
  newRole,
  creating,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPasswordChange,
  onRoleChange,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  newFirstName: string;
  newLastName: string;
  newEmail: string;
  newPassword: string;
  newRole: string;
  creating: boolean;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}) {
  return (
    <Modal.Root open={open}>
      <Modal.Content showClose>
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-text-sub-600 hover:text-text-strong-950"
          />
          <Modal.Header title="Create New Admin" description="Grant access to the studio dashboard." />
          <form onSubmit={onSubmit} className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-sub-600 mb-1">First Name</label>
                <input
                  value={newFirstName}
                  onChange={(e) => onFirstNameChange(e.target.value)}
                  className="w-full rounded-lg border border-stroke-soft-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-sub-600 mb-1">Last Name</label>
                <input
                  value={newLastName}
                  onChange={(e) => onLastNameChange(e.target.value)}
                  className="w-full rounded-lg border border-stroke-soft-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-sub-600 mb-1">Email</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => onEmailChange(e.target.value)}
                className="w-full rounded-lg border border-stroke-soft-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-sub-600 mb-1">Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => onPasswordChange(e.target.value)}
                className="w-full rounded-lg border border-stroke-soft-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-sub-600 mb-1">Role</label>
              <select
                value={newRole}
                onChange={(e) => onRoleChange(e.target.value)}
                className="w-full rounded-lg border border-stroke-soft-200 px-3 py-2 text-sm bg-bg-white-0"
              >
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-lg bg-text-strong-950 py-2.5 text-sm font-semibold text-white"
              >
                {creating ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}
