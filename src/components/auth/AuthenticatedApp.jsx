import { useAuth } from '../../context/AuthContext';
import { AppProvider } from '../../context/AppContext';
import LoadingScreen from '../ui/LoadingScreen';
import LoginPage from '../../pages/LoginPage';
import App from '../../App';

export default function AuthenticatedApp() {
  const { user, loading, requiresAuth } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (requiresAuth && !user) {
    return <LoginPage />;
  }

  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}
