import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import PageSkeleton from './components/ui/PageSkeleton';
import ErrorBoundary from './components/ui/ErrorBoundary';

// After a new deploy, a stale tab's chunk hashes 404. Reload once to pick up
// the current build instead of leaving the lazy import rejected and blank.
function lazyWithReload(importer) {
  return lazy(async () => {
    try {
      const mod = await importer();
      window.sessionStorage.removeItem('chunk-reload-attempted');
      return mod;
    } catch (error) {
      if (!window.sessionStorage.getItem('chunk-reload-attempted')) {
        window.sessionStorage.setItem('chunk-reload-attempted', '1');
        window.location.reload();
        return new Promise(() => {});
      }
      throw error;
    }
  });
}

const Dashboard = lazyWithReload(() => import('./pages/Dashboard'));
const BudgetPage = lazyWithReload(() => import('./pages/BudgetPage'));
const AIAssistantPage = lazyWithReload(() => import('./pages/AIAssistantPage'));
const DebtsPage = lazyWithReload(() => import('./pages/DebtsPage'));
const CalendarPage = lazyWithReload(() => import('./pages/CalendarPage'));
const AddTransactionPage = lazyWithReload(() => import('./pages/AddTransactionPage'));
const TransactionHistoryPage = lazyWithReload(() => import('./pages/TransactionHistoryPage'));
const Profile = lazyWithReload(() => import('./pages/Profile'));
const SavingsPage = lazyWithReload(() => import('./pages/SavingsPage'));

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="budget" element={<BudgetPage />} />
            <Route path="ai" element={<AIAssistantPage />} />
            <Route path="debts" element={<DebtsPage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="add" element={<AddTransactionPage />} />
            <Route path="history" element={<TransactionHistoryPage />} />
            <Route path="savings" element={<SavingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
