const statusConfig = {
  loading: { label: 'Connecting...', color: 'bg-portfolio-elevated text-portfolio-gray', dot: 'bg-portfolio-gray' },
  synced: { label: 'Synced to cloud', color: 'bg-portfolio-elevated text-white border border-portfolio-border', dot: 'bg-white' },
  syncing: { label: 'Saving...', color: 'bg-portfolio-elevated text-portfolio-light border border-portfolio-border', dot: 'bg-portfolio-light animate-pulse' },
  'saved-local': { label: 'Saved to local storage', color: 'bg-portfolio-elevated text-metric-cash border border-metric-cash/30', dot: 'bg-metric-cash' },
  local: { label: 'Saved on this device', color: 'bg-portfolio-elevated text-portfolio-gray border border-portfolio-border', dot: 'bg-portfolio-gray' },
  error: { label: 'Saved to local storage', color: 'bg-portfolio-elevated text-portfolio-light border border-portfolio-border', dot: 'bg-portfolio-gray' },
};

export default function SyncStatus({
  status,
  syncError = '',
  isLocalOnly = false,
  isGuest = false,
  cloudSyncHint = '',
}) {
  let label = statusConfig[status]?.label ?? statusConfig.local.label;

  if (status === 'local') {
    if (isGuest) {
      label = 'Guest · saved on this device only';
    } else if (isLocalOnly) {
      label = 'Local-only mode · saved on this device';
    } else {
      label = 'Cloud sync unavailable · saved locally';
    }
  }

  if (status === 'error' && syncError) {
    label = 'Saved to local storage';
  }

  const config = statusConfig[status] || statusConfig.local;
  const hint = syncError || (status === 'local' || status === 'error' ? cloudSyncHint : '');

  return (
    <div className={`rounded-xl px-3 py-2 text-xs font-medium ${config.color}`}>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 shrink-0 rounded-full ${config.dot}`} />
        <span>{label}</span>
      </div>
      {hint ? (
        <p className="mt-1 pl-4 text-[11px] leading-snug text-portfolio-gray">{hint}</p>
      ) : null}
    </div>
  );
}
