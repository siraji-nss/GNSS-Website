import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/inquiries', label: 'Student Inquiries' },
  { to: '/admin/hero-slides', label: 'Hero Slides' },
  { to: '/admin/about', label: 'About Page' },
  { to: '/admin/core-values', label: 'Core Values' },
  { to: '/admin/why-choose-us', label: 'Why Choose Us' },
  { to: '/admin/target-countries', label: 'Target Countries' },
  { to: '/admin/services', label: 'Country Service Pages' },
  { to: '/admin/working-process', label: 'Working Process' },
  { to: '/admin/testimonials', label: 'Testimonials' },
  { to: '/admin/blog', label: 'Blog Posts' },
  { to: '/admin/settings', label: 'Site Settings' },
  { to: '/admin/change-password', label: 'Change Password' },
];

export default function AdminLayout() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <img src="/brand/logo-horizontal-light.png" alt="GlobalNest Study Solution" />
        </div>
        <nav className="admin-sidebar__nav">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <span>Signed in as {username}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Log Out</button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
