import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

export default function DashboardPage() {
  const [counts, setCounts] = useState({ inquiries: null, blog: null, services: null });

  useEffect(() => {
    api.get('/inquiries', { auth: true }).then((d) => setCounts((c) => ({ ...c, inquiries: d.length })));
    api.get('/blog?all=1').then((d) => setCounts((c) => ({ ...c, blog: d.length })));
    api.get('/country-services').then((d) => setCounts((c) => ({ ...c, services: d.length })));
  }, []);

  const tiles = [
    { label: 'Student Inquiries', value: counts.inquiries, to: '/admin/inquiries' },
    { label: 'Blog Posts', value: counts.blog, to: '/admin/blog' },
    { label: 'Country Service Pages', value: counts.services, to: '/admin/services' },
  ];

  return (
    <div className="admin-panel">
      <div className="admin-panel__head">
        <h2>Dashboard</h2>
      </div>
      <div className="grid grid-3">
        {tiles.map((t) => (
          <Link to={t.to} key={t.label} className="card admin-dashboard-tile">
            <span className="admin-dashboard-tile__value">{t.value ?? '—'}</span>
            <span className="admin-dashboard-tile__label">{t.label}</span>
          </Link>
        ))}
      </div>
      <p className="text-muted" style={{ marginTop: 28 }}>
        Use the sidebar to edit every section of the public website — hero slides, About, Why Choose Us, target
        countries, country service pages, the working process, testimonials, blog posts, and site-wide settings.
      </p>
    </div>
  );
}
