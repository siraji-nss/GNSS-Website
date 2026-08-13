import { useEffect, useState } from 'react';
import { api, submitInquiry } from '../api/client';

const ENGLISH_LEVELS = ['Not yet tested', 'IELTS', 'PTE', 'TOEFL', 'Duolingo', 'Other'];

const BLANK_FORM = (defaultCountry) => ({
  name: '',
  address: '',
  district: 'Dhaka',
  desired_country: defaultCountry,
  phone: '',
  email: '',
  english_proficiency: '',
});

export default function InquiryForm({ variant = 'card', defaultCountry = 'Australia' }) {
  const [countries, setCountries] = useState([]);
  const [countriesLoaded, setCountriesLoaded] = useState(false);
  const [form, setForm] = useState(BLANK_FORM(defaultCountry));
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/target-countries')
      .then((data) => setCountries(data.filter((c) => c.is_active)))
      .catch(() => {})
      .finally(() => setCountriesLoaded(true));
  }, []);

  function update(key, value) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  const showDocumentUpload = form.english_proficiency && form.english_proficiency !== 'Not yet tested';

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setError('');
    try {
      await submitInquiry(form, file);
      setStatus('success');
      setForm(BLANK_FORM(defaultCountry));
      setFile(null);
    } catch (e) {
      setError(e.message);
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className={`inquiry-form inquiry-form--${variant} inquiry-form--success`}>
        <h3>Thank you!</h3>
        <p>Your inquiry has been received. One of our counsellors will reach out to you shortly.</p>
        <button className="btn btn-outline btn-sm" onClick={() => setStatus('idle')}>Submit another inquiry</button>
      </div>
    );
  }

  return (
    <form className={`inquiry-form inquiry-form--${variant}`} onSubmit={handleSubmit}>
      <div className="inquiry-form__row">
        <label>
          Full Name
          <input type="text" required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Your full name" />
        </label>
        <label>
          Phone Number
          <input type="tel" required value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="01XXXXXXXXX" />
        </label>
      </div>
      <div className="inquiry-form__row">
        <label>
          Email Address
          <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" />
        </label>
        <label>
          District
          <input type="text" value={form.district} onChange={(e) => update('district', e.target.value)} placeholder="Dhaka" />
        </label>
      </div>
      <label>
        Address
        <input type="text" value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Your present address" />
      </label>
      <div className="inquiry-form__row">
        <label>
          Desired Country
          <select value={form.desired_country} onChange={(e) => update('desired_country', e.target.value)}>
            {!countriesLoaded && <option value="">Loading destinations…</option>}
            {countries.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </label>
        <label>
          English Proficiency
          <select
            value={form.english_proficiency}
            onChange={(e) => {
              update('english_proficiency', e.target.value);
              if (e.target.value === 'Not yet tested' || !e.target.value) setFile(null);
            }}
          >
            <option value="">Select one</option>
            {ENGLISH_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
        </label>
      </div>

      {showDocumentUpload && (
        <label>
          Upload {form.english_proficiency} Score Document <span className="text-muted">(optional)</span>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
      )}

      {error && <div className="admin-error">{error}</div>}

      <button className="btn btn-primary" type="submit" disabled={status === 'submitting'} style={{ width: '100%' }}>
        {status === 'submitting' ? 'Submitting...' : 'Request Free Consultation'}
      </button>
    </form>
  );
}
