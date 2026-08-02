import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function AboutAdmin() {
  const [form, setForm] = useState({ intro: '', mission: '', vision: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/about').then((data) => {
      setForm({ intro: data.intro || '', mission: data.mission || '', vision: data.vision || '' });
      setLoading(false);
    });
  }, []);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put('/about', form, { auth: true });
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
        <h2>About Us Page</h2>
      </div>
      {message && <div className="admin-error">{message}</div>}
      <form className="admin-form" onSubmit={save}>
        <div className="admin-form__field">
          <label>Welcome / Intro paragraph</label>
          <textarea rows={4} value={form.intro} onChange={(e) => setForm((s) => ({ ...s, intro: e.target.value }))} />
        </div>
        <div className="admin-form__field">
          <label>Mission Statement</label>
          <textarea rows={3} value={form.mission} onChange={(e) => setForm((s) => ({ ...s, mission: e.target.value }))} />
        </div>
        <div className="admin-form__field">
          <label>Vision Statement</label>
          <textarea rows={3} value={form.vision} onChange={(e) => setForm((s) => ({ ...s, vision: e.target.value }))} />
        </div>
        <div className="admin-form__actions">
          <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
      <p className="text-muted">Core Values are managed separately under "Core Values".</p>
    </div>
  );
}
