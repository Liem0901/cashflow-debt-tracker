const SIZES = {
  sm: {
    box: 'h-5 w-5',
    ring: 'inset-[2px]',
    inner: 'inset-[3px]',
    label: 'text-[7px] leading-none',
    shine: true,
  },
  md: {
    box: 'h-10 w-10',
    ring: 'inset-[3px]',
    inner: 'inset-[7px]',
    label: 'text-[11px]',
    shine: true,
  },
};

export default function ShinyCoin({ size = 'md', className = '', showLabel = true }) {
  const config = SIZES[size] || SIZES.md;

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center ${config.box} ${className}`}
      aria-hidden
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700 shadow-[0_2px_12px_rgba(251,191,36,0.45)] ring-2 ring-amber-200/40" />
      <div className={`absolute ${config.ring} rounded-full border border-amber-300/50`} />
      <div className={`absolute ${config.inner} rounded-full border border-amber-600/30`} />
      {showLabel ? (
        <span className={`relative z-[1] font-bold tracking-tight text-amber-950/85 ${config.label}`}>
          RM
        </span>
      ) : null}
      {config.shine ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full motion-reduce:hidden">
          <div className="absolute -left-1/2 top-0 h-full w-1/2 animate-coin-shine bg-gradient-to-r from-transparent via-white/45 to-transparent" />
        </div>
      ) : null}
    </div>
  );
}
