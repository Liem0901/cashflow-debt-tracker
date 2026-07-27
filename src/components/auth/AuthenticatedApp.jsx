import { Routes, Route } from 'react-router-dom';
import AdminApp from '../../admin/AdminApp';
import UserApp from './UserApp';

export default function AuthenticatedApp() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/*" element={<UserApp />} />
    </Routes>
  );
}
