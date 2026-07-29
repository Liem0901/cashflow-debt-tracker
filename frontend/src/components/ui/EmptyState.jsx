export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-portfolio-border bg-portfolio-elevated/80 text-2xl">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-portfolio-gray">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
