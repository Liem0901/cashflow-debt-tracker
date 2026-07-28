import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function SyncBadge() {
  const { syncStatus, syncError, cloudSyncHint } = useApp();
  const { isLocalOnly, isGuest } = useAuth();

  if (syncStatus === 'loading' || syncStatus === 'syncing' || syncStatus === 'synced') {
    return null;
  }

  let label = 'Saved on this device';
  let tone = 'text-portfolio-gray border-portfolio-border';

  if (syncStatus === 'saved-local') {
    label = 'Saved to local storage';
    tone = 'text-metric-cash border-metric-cash/30 bg-metric-cash/5';
  } else if (syncStatus === 'error') {
    label = 'Saved to local storage';
    tone = 'text-portfolio-light border-portfolio-border';
  } else if (isGuest) {
    label = 'Guest · device only';
  } else if (!isLocalOnly) {
    label = 'Cloud unavailable · saved locally';
  } else {
    label = 'Local-only · device only';
  }

  return (
    <div
      className={`mt-1.5 inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors ${tone}`}
      title={syncError || cloudSyncHint || undefined}
    >
      <i className="bi bi-hdd shrink-0 text-[11px]" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </div>
  );
}
