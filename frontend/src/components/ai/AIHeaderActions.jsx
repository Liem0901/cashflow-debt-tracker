import { Link } from 'react-router-dom';
import { useAIChatActions } from '../../context/AIChatActionsContext';

const iconButtonClass =
  'flex h-9 w-9 shrink-0 items-center justify-center text-portfolio-gray transition-colors hover:text-white';

export default function AIHeaderActions() {
  const { triggerNewChat } = useAIChatActions();

  return (
    <div className="flex shrink-0 items-center gap-1">
      <button type="button" onClick={triggerNewChat} className={iconButtonClass} aria-label="New conversation">
        <i className="bi bi-plus-lg text-lg" aria-hidden />
      </button>
      <Link to="/history" className={iconButtonClass} aria-label="History">
        <i className="bi bi-clock-history text-lg" aria-hidden />
      </Link>
    </div>
  );
}
