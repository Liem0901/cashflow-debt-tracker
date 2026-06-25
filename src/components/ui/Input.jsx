export default function Input({ label, error, className = '', inputClassName = '', type, ...props }) {
  const isDate = type === 'date';

  return (
    <div className={`min-w-0 ${isDate ? 'w-1/2 min-w-[50%]' : ''} ${className}`}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-portfolio-gray">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`box-border w-full min-w-0 max-w-full rounded-xl border border-portfolio-border bg-portfolio-elevated px-4 py-3 text-portfolio-white transition-colors placeholder:text-portfolio-muted focus:border-portfolio-white focus:ring-2 focus:ring-white/10 ${error ? 'border-portfolio-light' : ''} ${isDate ? 'date-input' : ''} ${inputClassName}`}
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
