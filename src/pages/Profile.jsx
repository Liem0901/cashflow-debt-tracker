import {
  SalarySettings,
  DebtManagement,
  BudgetSettings,
  DataManagement,
} from '../components/profile/ProfileSections';
import InstallApp from '../components/profile/InstallApp';
import SyncStatus from '../components/profile/SyncStatus';
import { useApp } from '../context/AppContext';

export default function Profile() {
  const { syncStatus } = useApp();

  return (
    <div className="page-padding space-y-4 animate-fade-in">
      <header>
        <h1 className="text-xl font-bold text-white">Profile</h1>
        <p className="text-sm text-portfolio-gray">Settings & debt management</p>
      </header>

      <SyncStatus status={syncStatus} />

      <InstallApp />
      <SalarySettings />
      <DebtManagement />
      <BudgetSettings />
      <DataManagement />
    </div>
  );
}
