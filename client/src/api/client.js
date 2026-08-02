const TOKEN_KEY = 'globalnest_admin_token';

// In a split deploy (frontend on Vercel, backend on Render/Railway) the API
// lives on a different origin, so it must be set via VITE_API_URL at build
// time. Left empty for local dev, where Vite's dev-server proxy handles
// relative /api and /uploads requests against the local backend.
const API_BASE = import.meta.env.VITE_API_URL || '';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

// Uploaded images/documents are stored as relative "/uploads/..." paths.
// When the API is on a different origin than the frontend, those paths need
// the API origin prefixed to resolve correctly.
export function resolveMediaUrl(url) {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE}${url}`;
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  let data = null;
  const text = await res.text();
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }

  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }
  return data;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};

export async function uploadFile(file) {
  const token = getToken();
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data.url;
}

export async function submitInquiry(fields, file) {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => form.append(key, value ?? ''));
  if (file) form.append('document', file);

  const res = await fetch(`${API_BASE}/api/inquiries`, { method: 'POST', body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Submission failed');
  return data;
}

export function exportInquiriesUrl() {
  return `${API_BASE}/api/inquiries/export/excel`;
}

export async function downloadInquiriesExcel(ids) {
  const token = getToken();
  const query = ids && ids.length ? `?ids=${ids.join(',')}` : '';
  const res = await fetch(`${API_BASE}/api/inquiries/export/excel${query}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `globalnest-inquiries-${Date.now()}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
