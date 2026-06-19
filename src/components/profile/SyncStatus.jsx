const statusConfig = {
  loading: { label: 'Connecting...', color: 'bg-portfolio-elevated text-portfolio-gray', dot: 'bg-portfolio-gray' },
  synced: { label: 'Synced to cloud', color: 'bg-portfolio-elevated text-white border border-portfolio-border', dot: 'bg-white' },
  syncing: { label: 'Saving...', color: 'bg-portfolio-elevated text-portfolio-light border border-portfolio-border', dot: 'bg-portfolio-light animate-pulse' },
  local: { label: 'Local only (no cloud)', color: 'bg-portfolio-elevated text-portfolio-gray border border-portfolio-border', dot: 'bg-portfolio-gray' },
  error: { label: 'Sync error — saved locally', color: 'bg-portfolio-black text-white border border-white', dot: 'bg-white' },
};

export default function SyncStatus({ status }) {
  const config = statusConfig[status] || statusConfig.local;

  return (
    <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${config.color}`}>
      <span className={`h-2 w-2 rounded-full ${config.dot}`} />
      {config.label}
    </div>
  );
}
