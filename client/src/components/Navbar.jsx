import { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About Us' },
  { to: '/why-choose-us', label: 'Why Choose Us' },
  { to: '/services', label: 'Services' },
  { to: '/blog', label: 'Blog' },
];

export default function Navbar() {
  const { settings } = useSiteSettings();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand" onClick={() => setOpen(false)}>
          <img src="/brand/logo-horizontal-dark.png" alt={settings.site_title} />
        </Link>

        <nav className={`navbar__links ${open ? 'is-open' : ''}`}>
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>
              {l.label}
            </NavLink>
          ))}
          <Link to="/contact" className="btn btn-primary btn-sm navbar__cta" onClick={() => setOpen(false)}>
            Free Consultation
          </Link>
        </nav>

        <button className="navbar__toggle" aria-label="Toggle menu" onClick={() => setOpen((v) => !v)}>
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
