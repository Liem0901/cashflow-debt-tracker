import { useAuth } from '../../context/AuthContext';
import { AppProvider } from '../../context/AppContext';
import LoadingScreen from '../ui/LoadingScreen';
import LoginPage from '../../pages/LoginPage';
import App from '../../App';

export default function AuthenticatedApp() {
  const { user, loading, isAuthBypassed } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // Local dev: skip login. Production (Vercel): always show login until signed in.
  if (!isAuthBypassed && !user) {
    return <LoginPage />;
  }

  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}
