import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, resolveMediaUrl } from '../api/client';

export default function ServicesHub() {
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    api.get('/target-countries').then((d) => setCountries(d.filter((c) => c.is_active)));
  }, []);

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <span className="eyebrow">Services</span>
          <h1>Admission &amp; Student Visa Guidance, by Destination</h1>
          <p className="lede" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Consultation &amp; Profile Assessment, University Application Management, Visa File Preparation, and
            Submission &amp; Support — tailored to each destination's requirements.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container grid grid-3">
          {countries.map((c) => (
            <Link to={`/services/${c.slug}`} key={c.id} className="card country-card">
              <div className="country-card__media" style={c.image_url ? { backgroundImage: `url(${resolveMediaUrl(c.image_url)})` } : undefined}>
                <span className="country-card__flag">{c.name}</span>
              </div>
              <div className="country-card__body">
                {c.highlight && <span className="badge">{c.highlight}</span>}
                <p>{c.tagline}</p>
                <span className="link-arrow">View Visa Guidance &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
