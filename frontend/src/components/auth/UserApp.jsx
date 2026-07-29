import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AppProvider } from '../../context/AppContext';
import LoadingScreen from '../ui/LoadingScreen';
import LoginPage from '../../pages/LoginPage';
import LandingPage from '../../pages/LandingPage';
import App from '../../App';

function AppShell() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading, isAuthBypassed } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthBypassed || user) {
    return children;
  }

  return <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

function LoginRoute() {
  const { user, loading, isAuthBypassed } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthBypassed && user) {
    const redirectTo =
      typeof location.state?.from === 'string' &&
      location.state.from.startsWith('/') &&
      !location.state.from.startsWith('//')
        ? location.state.from
        : '/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  return <LoginPage />;
}

export default function UserApp() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing-page" element={<LandingPage />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
