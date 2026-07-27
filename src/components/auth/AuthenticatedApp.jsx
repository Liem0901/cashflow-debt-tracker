import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingScreen from '../ui/LoadingScreen';
import UserApp from './UserApp';

const AdminApp = lazy(() => import('../../admin/AdminApp'));

export default function AuthenticatedApp() {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <AdminApp />
          </Suspense>
        }
      />
      <Route path="/*" element={<UserApp />} />
    </Routes>
  );
}
