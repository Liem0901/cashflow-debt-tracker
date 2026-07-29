import { Link } from 'react-router-dom';
import { AI_BRAND_NAME } from '../../constants/aiBrand';

const iconButtonClass =
  'flex h-9 w-9 shrink-0 items-center justify-center text-portfolio-gray transition-colors hover:text-white';

export default function AIAssistantHeader({ onNewChat, compact = false }) {
  return (
    <header
      className={`shrink-0 border-b border-portfolio-border/60 px-4 pb-3 ${
        compact ? 'safe-area-top-header-compact' : 'safe-area-top-header'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="flex min-w-0 items-center gap-2 text-xl font-bold text-white">
            <i className="fa-regular fa-comment shrink-0 text-lg" aria-hidden />
            <span className="truncate">{AI_BRAND_NAME}</span>
          </h1>
          {!compact ? <p className="mt-0.5 text-sm text-portfolio-gray">Your financial assistant</p> : null}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={onNewChat} className={iconButtonClass} aria-label="New conversation">
            <i className="bi bi-plus-lg text-lg" aria-hidden />
          </button>
          <Link to="/history" className={iconButtonClass} aria-label="Transaction history">
            <i className="bi bi-clock-history text-lg" aria-hidden />
          </Link>
        </div>
      </div>
    </header>
  );
}
