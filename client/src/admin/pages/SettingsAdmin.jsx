import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const FIELD_GROUPS = [
  {
    title: 'Site',
    fields: [
      ['site_title', 'Site Title'],
      ['meta_description', 'Meta Description'],
      ['tagline', 'Hero Tagline'],
      ['footer_tagline', 'Footer Tagline'],
    ],
  },
  {
    title: 'Contact Details',
    fields: [
      ['phone', 'Phone Number'],
      ['whatsapp', 'WhatsApp Number'],
      ['email', 'Email Address'],
      ['address', 'Office Address'],
    ],
  },
  {
    title: 'Social Links',
    fields: [
      ['facebook_url', 'Facebook URL'],
      ['instagram_url', 'Instagram URL'],
      ['linkedin_url', 'LinkedIn URL'],
    ],
  },
  {
    title: 'Legal',
    fields: [
      ['services_disclaimer', 'Services Disclaimer'],
    ],
  },
];

export default function SettingsAdmin() {
  const { refresh } = useSiteSettings();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/settings').then((data) => {
      setForm(data);
      setLoading(false);
    });
  }, []);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put('/settings', form, { auth: true });
      await refresh();
      setMessage('Saved.');
    } catch (e) {
      setMessage(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-muted">Loading...</p>;

  return (
    <div className="admin-panel">
      <div className="admin-panel__head">
        <h2>Site Settings</h2>
      </div>
      {message && <div className="admin-error">{message}</div>}
      <form className="admin-form" onSubmit={save}>
        {FIELD_GROUPS.map((group) => (
          <fieldset key={group.title} className="admin-fieldset">
            <legend>{group.title}</legend>
            {group.fields.map(([key, label]) => (
              <div className="admin-form__field" key={key}>
                <label>{label}</label>
                {key.includes('disclaimer') || key === 'meta_description' ? (
                  <textarea rows={2} value={form[key] || ''} onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))} />
                ) : (
                  <input type="text" value={form[key] || ''} onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))} />
                )}
              </div>
            ))}
          </fieldset>
        ))}
        <div className="admin-form__actions">
          <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
