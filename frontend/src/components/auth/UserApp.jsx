import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AppProvider } from '../../context/AppContext';
import LoadingScreen from '../ui/LoadingScreen';
import LoginPage from '../../pages/LoginPage';
import App from '../../App';

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

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthBypassed && user) {
    return <Navigate to="/" replace />;
  }

  return <LoginPage />;
}

export default function UserApp() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppProvider>
              <App />
            </AppProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
