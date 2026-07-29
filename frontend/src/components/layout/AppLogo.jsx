import { Link } from 'react-router-dom';

export default function AppLogo() {
  return (
    <div className="flex items-center gap-3">
      <Link
        to="/"
        className="shrink-0 rounded-xl transition-opacity hover:opacity-80"
        aria-label="Back to home"
      >
        <img
          src="/favicon.svg"
          alt=""
          className="h-9 w-9 rounded-xl"
          aria-hidden
        />
      </Link>
      <div>
        <p className="text-base font-bold leading-tight text-white">Cashflow Tracker</p>
        <p className="text-xs text-portfolio-gray">Personal Finance Assistant</p>
      </div>
    </div>
  );
}
