const styles = {
  danger: 'border-portfolio-light bg-portfolio-elevated text-white',
  warning: 'border-portfolio-gray bg-portfolio-elevated text-portfolio-light',
};

export default function Warnings({ warnings }) {
  if (warnings.length === 0) return null;

  return (
    <div className="space-y-2 animate-fade-in">
      {warnings.map((w) => (
        <div
          key={w.id}
          className={`flex items-start gap-3 rounded-xl border p-3 ${styles[w.type]}`}
        >
          <svg className="h-5 w-5 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div>
            <p className="text-sm font-semibold">{w.title}</p>
            <p className="mt-0.5 text-xs text-portfolio-gray">{w.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
