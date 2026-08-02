import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function About() {
  const [about, setAbout] = useState(null);
  const [values, setValues] = useState([]);

  useEffect(() => {
    api.get('/about').then(setAbout);
    api.get('/core-values').then(setValues);
  }, []);

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <span className="eyebrow">About GlobalNest</span>
          <h1>Your Trusted Partner in World-Class Education</h1>
        </div>
      </div>

      <section className="section">
        <div className="container center" style={{ maxWidth: 780 }}>
          <p className="lede center">{about?.intro}</p>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container grid grid-2">
          <div className="card mission-card">
            <span className="eyebrow">Our Mission</span>
            <p>{about?.mission}</p>
          </div>
          <div className="card mission-card">
            <span className="eyebrow">Our Vision</span>
            <p>{about?.vision}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="center" style={{ maxWidth: 640, marginBottom: 48 }}>
            <span className="eyebrow center">What Guides Us</span>
            <h2 className="center">Our Core Values</h2>
          </div>
          <div className="grid grid-4">
            {values.map((v) => (
              <div className="card pillar-card" key={v.id}>
                <h4>{v.title}</h4>
                <p className="text-muted">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
