import { useEffect, useState } from 'react';
import { api, uploadFile, resolveMediaUrl } from '../api/client';

const emptyFromFields = (fields) =>
  Object.fromEntries(fields.map((f) => [f.key, f.type === 'checkbox' ? 1 : f.type === 'number' ? 0 : '']));

export default function SimpleCollectionEditor({ title, endpoint, fields, helpText }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyFromFields(fields));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingKey, setUploadingKey] = useState('');

  function load() {
    setLoading(true);
    api
      .get(endpoint)
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [endpoint]);

  function startNew() {
    setEditingId('new');
    setForm(emptyFromFields(fields));
    setError('');
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm(Object.fromEntries(fields.map((f) => [f.key, item[f.key] ?? (f.type === 'checkbox' ? 0 : '')])));
    setError('');
  }

  function cancel() {
    setEditingId(null);
    setError('');
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId === 'new') {
        await api.post(endpoint, form, { auth: true });
      } else {
        await api.put(`${endpoint}/${editingId}`, form, { auth: true });
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
    if (!confirm('Delete this item? This cannot be undone.')) return;
    try {
      await api.del(`${endpoint}/${id}`, { auth: true });
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleFileChange(key, file) {
    if (!file) return;
    setUploadingKey(key);
    try {
      const url = await uploadFile(file);
      setForm((f) => ({ ...f, [key]: url }));
    } catch (e) {
      setError(e.message);
    } finally {
      setUploadingKey('');
    }
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel__head">
        <div>
          <h2>{title}</h2>
          {helpText && <p className="admin-help">{helpText}</p>}
        </div>
        {editingId === null && (
          <button className="btn btn-primary btn-sm" onClick={startNew}>+ Add New</button>
        )}
      </div>

      {error && <div className="admin-error">{error}</div>}

      {editingId !== null && (
        <form className="admin-form" onSubmit={save}>
          {fields.map((f) => (
            <div className="admin-form__field" key={f.key}>
              <label>{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea
                  rows={4}
                  value={form[f.key] ?? ''}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                />
              ) : f.type === 'checkbox' ? (
                <input
                  type="checkbox"
                  checked={!!form[f.key]}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.checked ? 1 : 0 }))}
                />
              ) : f.type === 'number' ? (
                <input
                  type="number"
                  value={form[f.key] ?? 0}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: Number(e.target.value) }))}
                />
              ) : f.type === 'image' ? (
                <div className="admin-image-field">
                  {form[f.key] && <img src={resolveMediaUrl(form[f.key])} alt="" className="admin-image-preview" />}
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(f.key, e.target.files?.[0])} />
                  {uploadingKey === f.key && <span className="text-muted">Uploading...</span>}
                  <input
                    type="text"
                    placeholder="or paste image URL"
                    value={form[f.key] ?? ''}
                    onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                  />
                </div>
              ) : (
                <input
                  type="text"
                  value={form[f.key] ?? ''}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                />
              )}
            </div>
          ))}
          <div className="admin-form__actions">
            <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button className="btn btn-outline btn-sm" type="button" onClick={cancel}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              {fields.slice(0, 3).map((f) => (
                <th key={f.key}>{f.label}</th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                {fields.slice(0, 3).map((f) => (
                  <td key={f.key}>
                    {f.type === 'image' && item[f.key] ? (
                      <img src={resolveMediaUrl(item[f.key])} alt="" className="admin-table-thumb" />
                    ) : f.type === 'checkbox' ? (
                      item[f.key] ? 'Yes' : 'No'
                    ) : (
                      String(item[f.key] ?? '').slice(0, 80)
                    )}
                  </td>
                ))}
                <td className="admin-table-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => startEdit(item)}>Edit</button>
                  <button className="btn btn-sm admin-btn-danger" onClick={() => remove(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="text-muted">No items yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
