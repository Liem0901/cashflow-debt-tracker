import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { isAdminUser } from '../../lib/adminAccess';

export default function AccountSettings() {
  const { user, signOut, isAuthBypassed, isGuest } = useAuth();
  const navigate = useNavigate();
  const showAdminLink = isAdminUser(user);

  // Auth bypass has no session — nothing to sign out of
  if (isAuthBypassed) {
    return (
      <Card>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-portfolio-gray">
          Account
        </h2>
        <p className="text-sm text-portfolio-gray">
          Auth bypass is on (`VITE_AUTH_BYPASS=true`). Turn it off in Vercel env to enable login and
          sign out.
        </p>
      </Card>
    );
  }

  if (!user) return null;

  return (
    <Card>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-portfolio-gray">
        Account
      </h2>
      <div className="mb-4 flex items-center gap-3">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt=""
            className="h-10 w-10 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-portfolio-elevated text-sm font-bold text-white">
            {(user.displayName || user.email || '?').charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-medium text-white">
            {user.displayName || (isGuest ? 'Guest' : 'Signed in')}
          </p>
          <p className="truncate text-xs text-portfolio-gray">
            {isGuest ? 'Guest · saved on this device' : user.email}
          </p>
        </div>
      </div>
      {showAdminLink ? (
        <Button
          type="button"
          variant="outline"
          className="mb-2 w-full"
          onClick={() => navigate('/admin')}
        >
          Admin dashboard
        </Button>
      ) : null}
      <Button type="button" variant="secondary" className="w-full" onClick={signOut}>
        Sign out
      </Button>
    </Card>
  );
}
