export default function PageSkeleton() {
  return (
    <div className="page-padding space-y-4" aria-hidden>
      <div className="h-6 w-32 animate-pulse rounded bg-portfolio-elevated" />
      <div className="h-24 animate-pulse rounded-xl bg-portfolio-card" />
      <div className="h-24 animate-pulse rounded-xl bg-portfolio-card" />
      <div className="h-40 animate-pulse rounded-xl bg-portfolio-card" />
    </div>
  );
}
