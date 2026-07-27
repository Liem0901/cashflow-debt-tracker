const statusConfig = {
  loading: { label: 'Connecting...', color: 'bg-portfolio-elevated text-portfolio-gray', dot: 'bg-portfolio-gray' },
  synced: { label: 'Synced to cloud', color: 'bg-portfolio-elevated text-white border border-portfolio-border', dot: 'bg-white' },
  syncing: { label: 'Saving...', color: 'bg-portfolio-elevated text-portfolio-light border border-portfolio-border', dot: 'bg-portfolio-light animate-pulse' },
  local: { label: 'Local only (no cloud)', color: 'bg-portfolio-elevated text-portfolio-gray border border-portfolio-border', dot: 'bg-portfolio-gray' },
  error: { label: 'Sync error — saved locally', color: 'bg-portfolio-black text-white border border-white', dot: 'bg-white' },
};

export default function SyncStatus({ status, syncError = '', isLocalOnly = false, isGuest = false }) {
  let label = statusConfig[status]?.label ?? statusConfig.local.label;

  if (status === 'local' && isLocalOnly) {
    label = isGuest ? 'Guest · saved on this device' : 'Signed in · saved on this device';
  }

  if (status === 'error' && syncError) {
    label = syncError;
  }

  const config = statusConfig[status] || statusConfig.local;

  return (
    <div className={`rounded-xl px-3 py-2 text-xs font-medium ${config.color}`}>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 shrink-0 rounded-full ${config.dot}`} />
        <span>{status === 'error' && syncError ? 'Sync error' : label}</span>
      </div>
      {status === 'error' && syncError && (
        <p className="mt-1 pl-4 text-[11px] leading-snug text-portfolio-gray">{syncError}</p>
      )}
    </div>
  );
}
