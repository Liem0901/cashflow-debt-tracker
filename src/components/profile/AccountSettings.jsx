import Card from '../ui/Card';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function AccountSettings() {
  const { user, signOut, isAuthBypassed, isGuest } = useAuth();

  if (isAuthBypassed || !user) return null;

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
            {user.displayName || 'Google user'}
          </p>
          <p className="truncate text-xs text-portfolio-gray">
            {isGuest ? 'Guest · saved on this device' : user.email}
          </p>
        </div>
      </div>
      <Button type="button" variant="secondary" className="w-full" onClick={signOut}>
        Sign out
      </Button>
    </Card>
  );
}
