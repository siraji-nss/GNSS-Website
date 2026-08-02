import { useEffect, useState } from 'react';
import { api, uploadFile, resolveMediaUrl } from '../../api/client';

const BLANK = { title: '', excerpt: '', content: '', cover_image: '', author: 'GlobalNest Team', is_published: 1 };

export default function BlogAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    api.get('/blog?all=1').then(setItems).finally(() => setLoading(false));
  }
  useEffect(load, []);

  function startNew() {
    setForm(BLANK);
    setEditingId('new');
    setError('');
  }

  function startEdit(item) {
    setForm({ ...BLANK, ...item });
    setEditingId(item.id);
    setError('');
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId === 'new') {
        await api.post('/blog', form, { auth: true });
      } else {
        await api.put(`/blog/${editingId}`, form, { auth: true });
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
    if (!confirm('Delete this blog post?')) return;
    await api.del(`/blog/${id}`, { auth: true });
    load();
  }

  async function handleCoverUpload(file) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setForm((s) => ({ ...s, cover_image: url }));
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  if (editingId !== null) {
    return (
      <div className="admin-panel">
        <div className="admin-panel__head">
          <h2>{editingId === 'new' ? 'New Blog Post' : 'Edit Post'}</h2>
        </div>
        {error && <div className="admin-error">{error}</div>}
        <form className="admin-form" onSubmit={save}>
          <div className="admin-form__field">
            <label>Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} required />
          </div>
          <div className="admin-form__field">
            <label>Excerpt (short summary shown on blog list)</label>
            <textarea rows={2} value={form.excerpt} onChange={(e) => setForm((s) => ({ ...s, excerpt: e.target.value }))} />
          </div>
          <div className="admin-form__field">
            <label>Content</label>
            <textarea rows={10} value={form.content} onChange={(e) => setForm((s) => ({ ...s, content: e.target.value }))} />
          </div>
          <div className="admin-form__field">
            <label>Cover Image</label>
            <div className="admin-image-field">
              {form.cover_image && <img src={resolveMediaUrl(form.cover_image)} alt="" className="admin-image-preview" />}
              <input type="file" accept="image/*" onChange={(e) => handleCoverUpload(e.target.files?.[0])} />
              {uploading && <span className="text-muted">Uploading...</span>}
              <input
                type="text"
                placeholder="or paste image URL"
                value={form.cover_image}
                onChange={(e) => setForm((s) => ({ ...s, cover_image: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-2">
            <div className="admin-form__field">
              <label>Author</label>
              <input type="text" value={form.author} onChange={(e) => setForm((s) => ({ ...s, author: e.target.value }))} />
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
        <h2>Blog Posts</h2>
        <button className="btn btn-primary btn-sm" onClick={startNew}>+ New Post</button>
      </div>
      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Published</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{item.author}</td>
                <td>{item.is_published ? 'Yes' : 'Draft'}</td>
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
