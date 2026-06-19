import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/CalendarPage';
import AddTransactionPage from './pages/AddTransactionPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import Profile from './pages/Profile';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="add" element={<AddTransactionPage />} />
        <Route path="history" element={<TransactionHistoryPage />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
