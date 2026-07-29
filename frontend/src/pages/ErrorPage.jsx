import { useLocation } from 'react-router-dom';
import ErrorFallback from '../components/ui/ErrorFallback';

export default function ErrorPage() {
  const location = useLocation();
  const message =
    typeof location.state?.message === 'string' && location.state.message.trim()
      ? location.state.message.trim()
      : undefined;

  return <ErrorFallback message={message} />;
}
