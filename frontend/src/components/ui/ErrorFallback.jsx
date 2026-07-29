import { Link } from 'react-router-dom';

const DEFAULT_MESSAGE =
  "An unexpected error occurred while loading this page. Don't worry, your data is safe.";

export default function ErrorFallback({ message = DEFAULT_MESSAGE }) {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-portfolio-bg px-6">
      <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-portfolio-card/70 p-8 text-center backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 via-lime-500 to-yellow-400">
          <i className="bi bi-exclamation-triangle-fill text-4xl text-white" />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-white">Oops! Something went wrong</h1>

        <p className="mt-3 text-sm leading-6 text-portfolio-gray">{message}</p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleReload}
            className="rounded-xl bg-gradient-to-r from-emerald-500 via-lime-500 to-yellow-400 px-5 py-3 font-semibold text-white transition hover:scale-[1.02] active:scale-95"
          >
            <i className="bi bi-arrow-clockwise mr-2" />
            Reload Page
          </button>

          <Link
            to="/"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-white transition hover:bg-white/10"
          >
            <i className="bi bi-house-door mr-2" />
            Back to Home
          </Link>
        </div>

        <p className="mt-6 text-xs text-portfolio-gray">
          If this problem continues, please contact support.
        </p>
      </div>
    </div>
  );
}
