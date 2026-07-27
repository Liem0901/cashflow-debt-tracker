import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/ui/LoadingScreen';
import { isAdminUser, hasAdminAllowlist } from '../lib/adminAccess';

export default function AdminGuard() {
  const { user, loading, isGuest, requiresAuth } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!requiresAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-6 text-center text-portfolio-light">
        <div>
          <p className="text-lg font-semibold text-white">Admin requires Firebase auth</p>
          <p className="mt-2 text-sm text-portfolio-gray">
            Configure VITE_FIREBASE_* and disable VITE_AUTH_BYPASS to use the admin panel.
          </p>
        </div>
      </div>
    );
  }

  if (!user || isGuest) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (!hasAdminAllowlist()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-6 text-center text-portfolio-light">
        <div>
          <p className="text-lg font-semibold text-white">Admin allowlist not configured</p>
          <p className="mt-2 text-sm text-portfolio-gray">
            Set VITE_ADMIN_EMAILS or VITE_ADMIN_UIDS in your environment.
          </p>
        </div>
      </div>
    );
  }

  if (!isAdminUser(user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-6 text-center text-portfolio-light">
        <div>
          <p className="text-lg font-semibold text-white">Access denied</p>
          <p className="mt-2 text-sm text-portfolio-gray">
            Signed in as {user.email || user.uid}. This account is not an administrator.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
