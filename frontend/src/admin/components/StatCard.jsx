export default function StatCard({ label, value, sublabel, accent = 'white' }) {
  const accentClass =
    accent === 'green'
      ? 'text-emerald-400'
      : accent === 'red'
        ? 'text-rose-400'
        : accent === 'blue'
          ? 'text-sky-400'
          : 'text-white';

  return (
    <div className="rounded-2xl border border-portfolio-border bg-portfolio-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-portfolio-gray">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${accentClass}`}>{value}</p>
      {sublabel ? <p className="mt-1 text-xs text-portfolio-gray">{sublabel}</p> : null}
    </div>
  );
}
