import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function WhyChooseUs() {
  const [pillars, setPillars] = useState([]);

  useEffect(() => {
    api.get('/why-choose-pillars').then(setPillars);
  }, []);

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <span className="eyebrow">Why Choose Us</span>
          <h1>Why Partners Trust GlobalNest Study Solution</h1>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="why-list">
            {pillars.map((p, i) => (
              <div className="why-item" key={p.id}>
                <span className="why-item__num">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <span className="eyebrow">{p.title}</span>
                  <h3>{p.headline}</h3>
                  <p className="text-muted">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section cta-band">
        <div className="container center">
          <h2>Ready to start your journey?</h2>
          <p className="lede center">Book a free consultation and let our counsellors map your path forward.</p>
          <Link to="/contact" className="btn btn-gold">Get Started</Link>
        </div>
      </section>
    </>
  );
}
