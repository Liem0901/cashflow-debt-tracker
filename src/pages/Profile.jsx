import { BudgetSettings, DataManagement } from '../components/profile/ProfileSections';
import AccountSettings from '../components/profile/AccountSettings';
import SyncStatus from '../components/profile/SyncStatus';
import { useApp } from '../context/AppContext';

export default function Profile() {
  const { syncStatus } = useApp();

  return (
    <div className="page-padding space-y-4 animate-fade-in">
      <header>
        <h1 className="text-xl font-bold text-white">Profile</h1>
        <p className="text-sm text-portfolio-gray">Settings & preferences</p>
      </header>

      <SyncStatus status={syncStatus} />

      <AccountSettings />
      <BudgetSettings />
      <DataManagement />
    </div>
  );
}
