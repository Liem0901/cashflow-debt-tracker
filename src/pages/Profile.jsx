import AccountSettings from '../components/profile/AccountSettings';
import SyncStatus from '../components/profile/SyncStatus';
import AppFooter from '../components/profile/AppFooter';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { syncStatus, syncError } = useApp();
  const { isLocalOnly, isGuest } = useAuth();

  return (
    <div className="page-padding space-y-4 animate-fade-in">
      <header>
        <h1 className="text-xl font-bold text-white">Profile</h1>
        <p className="text-sm text-portfolio-gray">Account & sync settings</p>
      </header>

      <SyncStatus status={syncStatus} syncError={syncError} isLocalOnly={isLocalOnly} isGuest={isGuest} />

      <AccountSettings />
      <AppFooter />
    </div>
  );
}
