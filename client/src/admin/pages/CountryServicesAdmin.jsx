import { useEffect, useState } from 'react';
import { api } from '../../api/client';

const BLANK = {
  country_name: '',
  slug: '',
  page_title: '',
  meta_description: '',
  hero_tagline: '',
  intro: '',
  why_choose_points: [],
  requirements: [],
  process_steps: [],
  faqs: [],
  processing_time: '',
  visa_fee: '',
  tuition_range: '',
  living_cost: '',
  extra_notes: '',
  sort_order: 0,
  is_published: 1,
};

function StringListEditor({ label, items, onChange }) {
  return (
    <div className="admin-form__field">
      <label>{label}</label>
      {items.map((val, i) => (
        <div className="admin-repeat-row" key={i}>
          <input
            type="text"
            value={val}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
          />
          <button type="button" className="btn btn-sm admin-btn-danger" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-outline btn-sm" onClick={() => onChange([...items, ''])}>
        + Add
      </button>
    </div>
  );
}

function ObjectListEditor({ label, items, keys, onChange }) {
  return (
    <div className="admin-form__field">
      <label>{label}</label>
      {items.map((obj, i) => (
        <div className="admin-repeat-card" key={i}>
          {keys.map((k) => (
            <input
              key={k.key}
              type="text"
              placeholder={k.label}
              value={obj[k.key] || ''}
              onChange={(e) => {
                const next = items.map((it, idx) => (idx === i ? { ...it, [k.key]: e.target.value } : it));
                onChange(next);
              }}
            />
          ))}
          <button type="button" className="btn btn-sm admin-btn-danger" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className="btn btn-outline btn-sm"
        onClick={() => onChange([...items, Object.fromEntries(keys.map((k) => [k.key, '']))])}
      >
        + Add
      </button>
    </div>
  );
}

export default function CountryServicesAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    api.get('/country-services').then(setItems).finally(() => setLoading(false));
  }
  useEffect(load, []);

  function startNew() {
    setForm(BLANK);
    setEditingId('new');
    setError('');
  }

  function startEdit(item) {
    setForm({
      ...BLANK,
      ...item,
      why_choose_points: item.why_choose_points || [],
      requirements: item.requirements || [],
      process_steps: item.process_steps || [],
      faqs: item.faqs || [],
    });
    setEditingId(item.id);
    setError('');
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId === 'new') {
        await api.post('/country-services', form, { auth: true });
      } else {
        await api.put(`/country-services/${editingId}`, form, { auth: true });
      }
      setEditingId(null);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!confirm('Delete this country service page?')) return;
    await api.del(`/country-services/${id}`, { auth: true });
    load();
  }

  if (editingId !== null) {
    return (
      <div className="admin-panel">
        <div className="admin-panel__head">
          <h2>{editingId === 'new' ? 'New Country Service Page' : `Edit: ${form.country_name}`}</h2>
        </div>
        {error && <div className="admin-error">{error}</div>}
        <form className="admin-form" onSubmit={save}>
          <div className="admin-form__field">
            <label>Country Name</label>
            <input type="text" value={form.country_name} onChange={(e) => setForm((s) => ({ ...s, country_name: e.target.value }))} required />
          </div>
          <div className="admin-form__field">
            <label>Slug (used in URL: /services/slug)</label>
            <input type="text" value={form.slug} onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))} required />
          </div>
          <div className="admin-form__field">
            <label>Page Title (SEO)</label>
            <input type="text" value={form.page_title} onChange={(e) => setForm((s) => ({ ...s, page_title: e.target.value }))} />
          </div>
          <div className="admin-form__field">
            <label>Meta Description (SEO)</label>
            <textarea rows={2} value={form.meta_description} onChange={(e) => setForm((s) => ({ ...s, meta_description: e.target.value }))} />
          </div>
          <div className="admin-form__field">
            <label>Hero Tagline</label>
            <input type="text" value={form.hero_tagline} onChange={(e) => setForm((s) => ({ ...s, hero_tagline: e.target.value }))} />
          </div>
          <div className="admin-form__field">
            <label>Intro Paragraph</label>
            <textarea rows={3} value={form.intro} onChange={(e) => setForm((s) => ({ ...s, intro: e.target.value }))} />
          </div>

          <StringListEditor
            label="Why Choose Points (short bullet list)"
            items={form.why_choose_points}
            onChange={(v) => setForm((s) => ({ ...s, why_choose_points: v }))}
          />

          <ObjectListEditor
            label="Requirements"
            items={form.requirements}
            keys={[{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description' }]}
            onChange={(v) => setForm((s) => ({ ...s, requirements: v }))}
          />

          <ObjectListEditor
            label="Process Steps"
            items={form.process_steps}
            keys={[{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description' }]}
            onChange={(v) => setForm((s) => ({ ...s, process_steps: v }))}
          />

          <ObjectListEditor
            label="FAQs"
            items={form.faqs}
            keys={[{ key: 'q', label: 'Question' }, { key: 'a', label: 'Answer' }]}
            onChange={(v) => setForm((s) => ({ ...s, faqs: v }))}
          />

          <div className="grid grid-4">
            <div className="admin-form__field">
              <label>Processing Time</label>
              <input type="text" value={form.processing_time} onChange={(e) => setForm((s) => ({ ...s, processing_time: e.target.value }))} />
            </div>
            <div className="admin-form__field">
              <label>Visa Fee</label>
              <input type="text" value={form.visa_fee} onChange={(e) => setForm((s) => ({ ...s, visa_fee: e.target.value }))} />
            </div>
            <div className="admin-form__field">
              <label>Tuition Range</label>
              <input type="text" value={form.tuition_range} onChange={(e) => setForm((s) => ({ ...s, tuition_range: e.target.value }))} />
            </div>
            <div className="admin-form__field">
              <label>Living Cost</label>
              <input type="text" value={form.living_cost} onChange={(e) => setForm((s) => ({ ...s, living_cost: e.target.value }))} />
            </div>
          </div>

          <div className="admin-form__field">
            <label>Extra Notes</label>
            <textarea rows={2} value={form.extra_notes} onChange={(e) => setForm((s) => ({ ...s, extra_notes: e.target.value }))} />
          </div>

          <div className="grid grid-2">
            <div className="admin-form__field">
              <label>Sort Order</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm((s) => ({ ...s, sort_order: Number(e.target.value) }))} />
            </div>
            <div className="admin-form__field">
              <label>
                <input
                  type="checkbox"
                  checked={!!form.is_published}
                  onChange={(e) => setForm((s) => ({ ...s, is_published: e.target.checked ? 1 : 0 }))}
                />{' '}
                Published
              </label>
            </div>
          </div>

          <div className="admin-form__actions">
            <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button className="btn btn-outline btn-sm" type="button" onClick={() => setEditingId(null)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel__head">
        <h2>Country Service Pages</h2>
        <button className="btn btn-primary btn-sm" onClick={startNew}>+ Add Country</button>
      </div>
      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Country</th>
              <th>Slug</th>
              <th>Published</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.country_name}</td>
                <td>/services/{item.slug}</td>
                <td>{item.is_published ? 'Yes' : 'No'}</td>
                <td className="admin-table-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => startEdit(item)}>Edit</button>
                  <button className="btn btn-sm admin-btn-danger" onClick={() => remove(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
