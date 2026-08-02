import { Link } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';
import SocialIcons from './SocialIcons';

export default function Footer() {
  const { settings } = useSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <img src="/brand/logo-horizontal-light.png" alt={settings.site_title} />
          <p>{settings.footer_tagline}</p>
          <SocialIcons
            className="footer__social"
            links={{
              facebook: settings.facebook_url,
              instagram: settings.instagram_url,
              linkedin: settings.linkedin_url,
            }}
          />
        </div>

        <div className="footer__col">
          <h4>Explore</h4>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/why-choose-us">Why Choose Us</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h4>Destinations</h4>
          <ul>
            <li><Link to="/services/australia">Australia</Link></li>
            <li><Link to="/services/south-korea">South Korea</Link></li>
            <li><Link to="/services/malaysia">Malaysia</Link></li>
            <li><Link to="/services/malta">Malta</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h4>Contact</h4>
          <ul className="footer__contact">
            {settings.phone && <li>{settings.phone}</li>}
            {settings.email && <li>{settings.email}</li>}
            {settings.address && <li>{settings.address}</li>}
          </ul>
        </div>
      </div>

      <div className="container footer__bottom">
        <p>&copy; {year} {settings.site_title}. All rights reserved.</p>
      </div>
    </footer>
  );
}
