export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-portfolio-gray">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-xl border border-portfolio-border bg-portfolio-elevated px-4 py-3 text-portfolio-white transition-colors placeholder:text-portfolio-muted focus:border-portfolio-white focus:ring-2 focus:ring-white/10 ${error ? 'border-portfolio-light' : ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-portfolio-light">{error}</p>}
    </div>
  );
}

export function Select({ label, children, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-portfolio-gray">
          {label}
        </label>
      )}
      <select
        className="w-full rounded-xl border border-portfolio-border bg-portfolio-elevated px-4 py-3 text-portfolio-white focus:border-portfolio-white focus:ring-2 focus:ring-white/10"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
