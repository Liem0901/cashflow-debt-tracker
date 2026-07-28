import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoadingScreen from './components/ui/LoadingScreen';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const BudgetPage = lazy(() => import('./pages/BudgetPage'));
const AIAssistantPage = lazy(() => import('./pages/AIAssistantPage'));
const DebtsPage = lazy(() => import('./pages/DebtsPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const AddTransactionPage = lazy(() => import('./pages/AddTransactionPage'));
const TransactionHistoryPage = lazy(() => import('./pages/TransactionHistoryPage'));
const Profile = lazy(() => import('./pages/Profile'));
const SavingsPage = lazy(() => import('./pages/SavingsPage'));

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="ai" element={<AIAssistantPage />} />
          <Route path="debts" element={<DebtsPage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="add" element={<AddTransactionPage />} />
          <Route path="history" element={<TransactionHistoryPage />} />
          <Route path="savings" element={<SavingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
