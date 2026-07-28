import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const navItems = [
  { to: '/admin', label: 'Users', end: true },
  { to: '/admin/categories', label: 'Categories' },
];

function SidebarLink({ to, label, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `block rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
          isActive ? 'bg-white text-black' : 'text-portfolio-gray hover:bg-portfolio-elevated hover:text-white'
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-black text-white lg:flex">
      <aside className="border-b border-portfolio-border bg-portfolio-card lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="p-4">
          <p className="text-xs uppercase tracking-widest text-portfolio-gray">Admin</p>
          <h1 className="mt-1 text-lg font-bold">Cashflow Tracker</h1>
          <p className="mt-2 truncate text-xs text-portfolio-gray">{user?.email}</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-4 lg:flex-col lg:overflow-visible">
          {navItems.map((item) => (
            <SidebarLink key={item.to} to={item.to} label={item.label} end={item.end} />
          ))}
        </nav>
        <div className="hidden border-t border-portfolio-border p-4 lg:block">
          <Button variant="secondary" size="sm" className="w-full" onClick={() => navigate('/')}>
            Back to app
          </Button>
          <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-portfolio-border px-4 py-3 lg:hidden">
          <p className="text-sm font-semibold">Admin Panel</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              App
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Out
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
