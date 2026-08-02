import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import InquiryForm from '../components/InquiryForm';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function CountryService() {
  const { slug } = useParams();
  const { settings } = useSiteSettings();
  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    api
      .get(`/country-services/slug/${slug}`)
      .then(setData)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (data?.page_title) document.title = data.page_title;
  }, [data]);

  if (loading) return <div className="section container">Loading...</div>;
  if (notFound || !data) {
    return (
      <div className="section container center">
        <h1>Destination Not Found</h1>
        <p className="lede center">We couldn't find guidance for that destination yet.</p>
        <Link to="/services" className="btn btn-primary">Back to Services</Link>
      </div>
    );
  }

  const facts = [
    { label: 'Processing Time', value: data.processing_time },
    { label: 'Visa Fee', value: data.visa_fee },
    { label: 'Tuition Range', value: data.tuition_range },
    { label: 'Living Cost', value: data.living_cost },
  ].filter((f) => f.value);

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <span className="eyebrow">{data.country_name} Student Visa</span>
          <h1>{data.hero_tagline || `Study in ${data.country_name}`}</h1>
        </div>
      </div>

      <section className="section">
        <div className="container service-layout">
          <div className="service-layout__main">
            <p className="lede">{data.intro}</p>

            {data.why_choose_points?.length > 0 && (
              <ul className="check-list">
                {data.why_choose_points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            )}

            {data.requirements?.length > 0 && (
              <div className="service-block">
                <h2>Key Requirements</h2>
                <div className="grid grid-2">
                  {data.requirements.map((r, i) => (
                    <div className="card requirement-card" key={i}>
                      <span className="requirement-card__num">{i + 1}</span>
                      <h4>{r.title}</h4>
                      {r.description && <p className="text-muted">{r.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.process_steps?.length > 0 && (
              <div className="service-block">
                <h2>Our Process</h2>
                <div className="timeline">
                  {data.process_steps.map((step, i) => (
                    <div className="timeline__item" key={i}>
                      <span className="timeline__num">{i + 1}</span>
                      <div>
                        <h4>{step.title}</h4>
                        {step.description && <p className="text-muted">{step.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.faqs?.length > 0 && (
              <div className="service-block">
                <h2>Frequently Asked Questions</h2>
                <div className="faq-list">
                  {data.faqs.map((f, i) => (
                    <details className="faq-item" key={i}>
                      <summary>{f.q}</summary>
                      <p>{f.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {data.extra_notes && <p className="text-muted">{data.extra_notes}</p>}
            {settings.services_disclaimer && <p className="disclaimer-text">{settings.services_disclaimer}</p>}
          </div>

          <aside className="service-layout__aside">
            {facts.length > 0 && (
              <div className="card quick-facts">
                <h4>Quick Facts</h4>
                <dl>
                  {facts.map((f) => (
                    <div key={f.label}>
                      <dt>{f.label}</dt>
                      <dd>{f.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            <div className="card">
              <h4 style={{ marginBottom: 12 }}>Get Personalized Guidance</h4>
              <InquiryForm variant="sidebar" defaultCountry={data.country_name} />
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
