import type { StudioOwner } from '../types';
import { formatDateLabel } from '../utils';

export function OwnersPanel({
  owners,
  ownerCountLabel,
}: {
  owners: StudioOwner[];
  ownerCountLabel: string;
}) {
  const hasOwners = owners.length > 0;

  return (
    <div className="mb-8 rounded-xl border border-stroke-soft-200 bg-bg-white-0">
      <div className="flex items-center justify-between border-b border-stroke-soft-200 px-5 py-4">
        <h2 className="text-sm font-semibold text-text-strong-950">Studio owners</h2>
        <span className="text-xs text-text-sub-600">{ownerCountLabel}</span>
      </div>
      {!hasOwners ? (
        <div className="p-6 text-sm text-text-sub-600">No owners recorded.</div>
      ) : (
        <div className="divide-y divide-stroke-soft-200">
          {owners.map((owner) => (
            <div
              key={owner.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm"
            >
              <div>
                <div className="font-semibold text-text-strong-950">
                  {owner.display_name || owner.email}
                </div>
                <div className="text-xs text-text-sub-600">
                  {owner.email} • {owner.role} • {(owner.auth_provider || 'local').toUpperCase()}
                </div>
              </div>
              <div className="text-xs text-text-sub-600">
                Joined {formatDateLabel(owner.created_at)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
