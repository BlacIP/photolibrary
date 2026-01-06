import { settingsTabs, type SettingsTab } from '../types';

export function SettingsHeader({
  activeTab,
  isSuperAdmin,
  onChangeTab,
}: {
  activeTab: SettingsTab;
  isSuperAdmin: boolean;
  onChangeTab: (tab: SettingsTab) => void;
}) {
  const tabBaseClass = 'flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-full transition-colors';
  const tabClass = (tab: SettingsTab) =>
    `${tabBaseClass} ${
      activeTab === tab
        ? 'bg-bg-white-0 text-text-strong-950 shadow-sm ring-1 ring-stroke-soft-200'
        : 'text-text-sub-600 hover:text-text-strong-950'
    }`;

  return (
    <div className="mb-8 space-y-4">
      <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-text-sub-600">Admin console</p>
        <h1 className="mt-2 text-title-h4 font-bold text-text-strong-950">Settings</h1>
        <p className="mt-2 text-sm text-text-sub-600">
          Manage your profile, admin access, and storage lifecycle in one place.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-full bg-bg-weak-50 p-1 w-full sm:w-fit">
        {settingsTabs.map((tab) => {
          if (tab.requiresSuperAdmin && !isSuperAdmin) return null;
          return (
            <button key={tab.id} onClick={() => onChangeTab(tab.id)} className={tabClass(tab.id)}>
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
