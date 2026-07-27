import { Link } from 'react-router-dom';

const iconButtonClass =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-portfolio-gray transition-colors hover:bg-portfolio-elevated hover:text-white';

export default function AIAssistantHeader({ onNewChat, compact = false }) {
  return (
    <header
      className={`shrink-0 border-b border-portfolio-border/60 px-4 pb-3 ${
        compact ? 'pt-2' : 'pt-[calc(env(safe-area-inset-top,0px)+0.5rem)]'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <h1 className="flex min-w-0 items-center gap-2 text-base font-bold text-white">
          <i className="fa-regular fa-comment shrink-0 text-[1.125rem]" aria-hidden />
          <span className="truncate">AI Assistant</span>
        </h1>

        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={onNewChat} className={iconButtonClass} aria-label="New conversation">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
          <Link to="/history" className={iconButtonClass} aria-label="Transaction history">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
