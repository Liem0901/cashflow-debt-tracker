import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminGuard from './AdminGuard';
import AdminLayout from './AdminLayout';
import LoadingScreen from '../components/ui/LoadingScreen';

const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const AdminUserDetailPage = lazy(() => import('./pages/AdminUserDetailPage'));
const AdminCategoriesPage = lazy(() => import('./pages/AdminCategoriesPage'));

export default function AdminApp() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="login" element={<AdminLoginPage />} />
        <Route element={<AdminGuard />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminUsersPage />} />
            <Route path="users/:userId" element={<AdminUserDetailPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="users" element={<Navigate to="/admin" replace />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
