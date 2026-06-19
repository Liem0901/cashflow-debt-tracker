export default function AppLogo() {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/icons/icon.svg"
        alt=""
        className="h-9 w-9 shrink-0 rounded-xl"
        aria-hidden
      />
      <div>
        <p className="text-base font-bold leading-tight text-white">Cashflow Tracker</p>
        <p className="text-xs text-portfolio-gray">Know what you can safely spend</p>
      </div>
    </div>
  );
}
