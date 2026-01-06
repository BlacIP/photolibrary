export function EditClientModal({
  open,
  editName,
  editSubheading,
  editDate,
  saving,
  onChangeName,
  onChangeSubheading,
  onChangeDate,
  onSave,
  onCancel,
}: {
  open: boolean;
  editName: string;
  editSubheading: string;
  editDate: string;
  saving: boolean;
  onChangeName: (value: string) => void;
  onChangeSubheading: (value: string) => void;
  onChangeDate: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-bg-white-0 rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-bold">Edit Client</h3>
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            value={editName}
            onChange={(e) => onChangeName(e.target.value)}
            className="w-full px-3 py-2 border border-stroke-soft-200 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Subheading</label>
          <textarea
            value={editSubheading}
            onChange={(e) => onChangeSubheading(e.target.value)}
            placeholder="Optional subheading text (Multiple lines supported)"
            className="w-full px-3 py-2 border border-stroke-soft-200 rounded-lg min-h-[100px]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Event Date</label>
          <input
            type="date"
            value={editDate}
            onChange={(e) => onChangeDate(e.target.value)}
            className="w-full px-3 py-2 border border-stroke-soft-200 rounded-lg"
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onCancel} className="text-sm font-medium text-text-sub-600">
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 bg-primary-base text-white rounded-lg text-sm font-semibold"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
