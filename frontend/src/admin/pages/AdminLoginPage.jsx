import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import LoadingScreen from '../../components/ui/LoadingScreen';
import { isAdminUser, hasAdminAllowlist } from '../../lib/adminAccess';

export default function AdminLoginPage() {
  const { user, loading, isGuest, signInWithGoogle, error, requiresAuth } = useAuth();
  const location = useLocation();
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (user && !isGuest && hasAdminAllowlist() && !isAdminUser(user)) {
      setDenied(true);
    } else {
      setDenied(false);
    }
  }, [user, isGuest]);

  if (loading) return <LoadingScreen />;

  if (user && !isGuest && isAdminUser(user)) {
    const redirectTo = location.state?.from || '/admin';
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-portfolio-border bg-portfolio-card p-6">
        <p className="text-xs uppercase tracking-widest text-portfolio-gray">Administrator</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Admin sign in</h1>
        <p className="mt-2 text-sm text-portfolio-gray">
          Sign in with your Google account. Only allowlisted admin emails can access this panel.
        </p>

        {denied ? (
          <p className="mt-4 rounded-xl bg-rose-950/40 px-3 py-2 text-sm text-rose-300">
            {user?.email || 'This account'} is not authorized for admin access.
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-xl bg-rose-950/40 px-3 py-2 text-sm text-rose-300">{error}</p>
        ) : null}

        {!requiresAuth ? (
          <p className="mt-4 text-sm text-portfolio-gray">
            Firebase auth is required. Configure VITE_FIREBASE_* in your environment.
          </p>
        ) : (
          <Button className="mt-6 w-full" size="lg" onClick={signInWithGoogle}>
            Continue with Google
          </Button>
        )}
      </div>
    </div>
  );
}
