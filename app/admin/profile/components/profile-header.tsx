import { RiEdit2Line } from '@remixicon/react';

export function ProfileHeader({
  isEditing,
  onEdit,
}: {
  isEditing: boolean;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-title-h4 font-bold text-text-strong-950">My Profile</h1>
      {!isEditing && (
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-4 py-2 bg-text-strong-950 text-white text-sm font-semibold rounded-lg hover:opacity-90"
        >
          <RiEdit2Line size={16} /> Edit Profile
        </button>
      )}
    </div>
  );
}
