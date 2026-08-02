import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, resolveMediaUrl } from '../api/client';
import InquiryForm from '../components/InquiryForm';

function HeroCarousel({ slides }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <div className="hero">
        <div className="hero__bg" />
        <div className="container hero__content">
          <span className="eyebrow">GlobalNest Study Solution</span>
          <h1>Your dream to study abroad can start here!</h1>
          <p className="lede" style={{ color: 'rgba(255,255,255,0.82)' }}>
            Navigating Your Educational Horizon with Integrity
          </p>
          <div className="hero__actions">
            <Link to="/contact" className="btn btn-gold">Start Your Journey</Link>
            <Link to="/services" className="btn btn-ghost">Explore Destinations</Link>
          </div>
        </div>
      </div>
    );
  }

  const slide = slides[index];
  return (
    <div className="hero">
      <div className="hero__bg" style={slide.image_url ? { backgroundImage: `url(${resolveMediaUrl(slide.image_url)})` } : undefined} />
      <div className="container hero__content">
        <span className="eyebrow">GlobalNest Study Solution</span>
        <h1>{slide.headline}</h1>
        {slide.subheadline && <p className="lede" style={{ color: 'rgba(255,255,255,0.82)' }}>{slide.subheadline}</p>}
        <div className="hero__actions">
          <Link to={slide.cta_link || '/contact'} className="btn btn-gold">{slide.cta_label || 'Get Started'}</Link>
          <Link to="/services" className="btn btn-ghost">Explore Destinations</Link>
        </div>
      </div>
      {slides.length > 1 && (
        <div className="hero__dots">
          {slides.map((s, i) => (
            <button key={s.id} className={i === index ? 'active' : ''} onClick={() => setIndex(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [heroSlides, setHeroSlides] = useState([]);
  const [about, setAbout] = useState(null);
  const [countries, setCountries] = useState([]);
  const [process, setProcess] = useState([]);
  const [pillars, setPillars] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api.get('/hero-slides').then((d) => setHeroSlides(d.filter((s) => s.is_active)));
    api.get('/about').then(setAbout);
    api.get('/target-countries').then((d) => setCountries(d.filter((c) => c.is_active)));
    api.get('/working-process-steps').then(setProcess);
    api.get('/why-choose-pillars').then(setPillars);
    api.get('/testimonials').then(setTestimonials);
    api.get('/blog').then((d) => setPosts(d.slice(0, 3)));
  }, []);

  return (
    <>
      <HeroCarousel slides={heroSlides} />

      <section className="section">
        <div className="container welcome-grid">
          <div>
            <span className="eyebrow">Welcome to GlobalNest</span>
            <h2>Elegant, streamlined guidance for global academic excellence</h2>
            <div className="divider-gold" />
            <p className="lede">{about?.intro}</p>
            <Link to="/about" className="btn btn-outline btn-sm">More About Us</Link>
          </div>
          <div className="welcome-grid__stats">
            <div className="stat-card">
              <strong>7</strong>
              <span>Study Destinations</span>
            </div>
            <div className="stat-card">
              <strong>4</strong>
              <span>Step Guided Process</span>
            </div>
            <div className="stat-card stat-card--gold">
              <strong>Honesty</strong>
              <span>Without Borders</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <div className="center" style={{ maxWidth: 640, marginBottom: 48 }}>
            <span className="eyebrow center">Our Target Countries</span>
            <h2 className="center">Seven Destinations, One Trusted Partner</h2>
          </div>
          <div className="grid grid-4">
            {countries.map((c) => (
              <Link to={`/services/${c.slug}`} key={c.id} className="card country-card">
                <div className="country-card__media" style={c.image_url ? { backgroundImage: `url(${resolveMediaUrl(c.image_url)})` } : undefined}>
                  <span className="country-card__flag">{c.name}</span>
                </div>
                <div className="country-card__body">
                  {c.highlight && <span className="badge">{c.highlight}</span>}
                  <p>{c.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid-2 focus-grid">
          <div className="card focus-card">
            <span className="eyebrow">Where We Focus</span>
            <h3>End-to-End Application Support</h3>
            <p className="text-muted">
              From university shortlisting through offer letters — including precise Statement of Purpose
              preparation — we manage every detail of your application process so nothing is left to chance.
            </p>
          </div>
          <div className="card focus-card">
            <span className="eyebrow">Visa Assistance</span>
            <h3>Confident, Compliant Visa Filing</h3>
            <p className="text-muted">
              Navigating student visa requirements can be complex. Our specialists prepare meticulous,
              evidence-backed visa files tailored to each destination's requirements.
            </p>
          </div>
        </div>
      </section>

      <section className="section--navy section">
        <div className="container">
          <div className="center" style={{ maxWidth: 640, marginBottom: 48 }}>
            <span className="eyebrow center">How We Work</span>
            <h2 className="center">Our Working Process</h2>
          </div>
          <div className="grid grid-3">
            {process.map((step, i) => (
              <div className="process-step" key={step.id}>
                <span className="process-step__num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <div className="center" style={{ maxWidth: 640, marginBottom: 48 }}>
            <span className="eyebrow center">Why Partners Trust Us</span>
            <h2 className="center">Why Choose GlobalNest Study Solution</h2>
          </div>
          <div className="grid grid-4">
            {pillars.map((p) => (
              <div className="card pillar-card" key={p.id}>
                <h4>{p.headline}</h4>
                <p className="text-muted">{p.description}</p>
              </div>
            ))}
          </div>
          <div className="center" style={{ marginTop: 36 }}>
            <Link to="/why-choose-us" className="btn btn-outline btn-sm">See Full Story</Link>
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="center" style={{ maxWidth: 640, marginBottom: 48 }}>
              <span className="eyebrow center">Success Stories</span>
              <h2 className="center">A Legacy of Success Stories</h2>
            </div>
            <div className="grid grid-3">
              {testimonials.map((t) => (
                <div className="card testimonial-card" key={t.id}>
                  <p>&ldquo;{t.quote}&rdquo;</p>
                  <div className="testimonial-card__author">
                    {t.image_url && <img src={resolveMediaUrl(t.image_url)} alt={t.name} />}
                    <div>
                      <strong>{t.name}</strong>
                      <span>{t.country}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section className="section section--tint">
          <div className="container">
            <div className="center" style={{ maxWidth: 640, marginBottom: 48 }}>
              <span className="eyebrow center">From the Blog</span>
              <h2 className="center">Scholarships, Visa Updates &amp; Student Life</h2>
            </div>
            <div className="grid grid-3">
              {posts.map((p) => (
                <Link to={`/blog/${p.slug}`} key={p.id} className="card blog-card">
                  <div className="blog-card__media" style={p.cover_image ? { backgroundImage: `url(${resolveMediaUrl(p.cover_image)})` } : undefined} />
                  <div className="blog-card__body">
                    <h4>{p.title}</h4>
                    <p className="text-muted">{p.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section cta-section">
        <div className="container cta-grid">
          <div>
            <span className="eyebrow">Get Started Today</span>
            <h2>Your Pathway to World-Class Education</h2>
            <p className="lede">
              Book a free consultation with our counsellors and take the first confident step toward your
              international study journey.
            </p>
          </div>
          <div className="card">
            <InquiryForm />
          </div>
        </div>
      </section>
    </>
  );
}
