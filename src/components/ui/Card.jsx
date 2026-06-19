export default function Card({ children, className = '', animate = false }) {
  return (
    <div
      className={`rounded-2xl border border-portfolio-border bg-portfolio-card p-4 shadow-card ${animate ? 'animate-slide-up' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
