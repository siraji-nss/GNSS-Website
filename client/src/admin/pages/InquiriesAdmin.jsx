import { useEffect, useMemo, useState } from 'react';
import { api, downloadInquiriesExcel, resolveMediaUrl } from '../../api/client';

// SQLite's datetime('now') stores UTC as "YYYY-MM-DD HH:MM:SS" with no
// timezone marker. Normalize to a real ISO string so Date parsing is
// unambiguous (otherwise some engines read it as local time).
function parseCreatedAt(value) {
  return new Date(`${value.replace(' ', 'T')}Z`);
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek() {
  const d = startOfToday();
  const day = d.getDay(); // 0 = Sunday .. 6 = Saturday
  const diffToMonday = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diffToMonday);
  return d;
}

function startOfMonth() {
  const d = startOfToday();
  d.setDate(1);
  return d;
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'range', label: 'Date Range' },
];

export default function InquiriesAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  function load() {
    setLoading(true);
    api.get('/inquiries', { auth: true }).then(setItems).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  const filterCounts = useMemo(() => {
    const today = startOfToday();
    const week = startOfWeek();
    const month = startOfMonth();
    return {
      all: items.length,
      new: items.filter((i) => !i.is_read).length,
      today: items.filter((i) => parseCreatedAt(i.created_at) >= today).length,
      week: items.filter((i) => parseCreatedAt(i.created_at) >= week).length,
      month: items.filter((i) => parseCreatedAt(i.created_at) >= month).length,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    switch (filter) {
      case 'new':
        return items.filter((i) => !i.is_read);
      case 'today':
        return items.filter((i) => parseCreatedAt(i.created_at) >= startOfToday());
      case 'week':
        return items.filter((i) => parseCreatedAt(i.created_at) >= startOfWeek());
      case 'month':
        return items.filter((i) => parseCreatedAt(i.created_at) >= startOfMonth());
      case 'range':
        if (!dateRange.from && !dateRange.to) return items;
        return items.filter((i) => {
          const d = parseCreatedAt(i.created_at);
          if (dateRange.from && d < new Date(`${dateRange.from}T00:00:00`)) return false;
          if (dateRange.to && d > new Date(`${dateRange.to}T23:59:59`)) return false;
          return true;
        });
      default:
        return items;
    }
  }, [items, filter, dateRange]);

  async function remove(id) {
    if (!confirm('Delete this inquiry?')) return;
    await api.del(`/inquiries/${id}`, { auth: true });
    load();
  }

  async function toggleRead(item) {
    try {
      const updated = await api.patch(`/inquiries/${item.id}/read`, { is_read: item.is_read ? 0 : 1 }, { auth: true });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      await downloadInquiriesExcel(filter === 'all' ? null : filteredItems.map((i) => i.id));
    } catch (e) {
      setError(e.message);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel__head">
        <h2>Student Inquiries ({filteredItems.length}{filter !== 'all' ? ` of ${items.length}` : ''})</h2>
        <button className="btn btn-gold btn-sm" onClick={handleExport} disabled={exporting || filteredItems.length === 0}>
          {exporting ? 'Exporting...' : filter === 'all' ? 'Export to Excel' : 'Export Filtered to Excel'}
        </button>
      </div>

      <div className="inquiry-filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`inquiry-filters__tab ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            {f.key in filterCounts && <span className="inquiry-filters__count">{filterCounts[f.key]}</span>}
          </button>
        ))}
      </div>

      {filter === 'range' && (
        <div className="inquiry-filters__range">
          <label>
            From
            <input type="date" value={dateRange.from} onChange={(e) => setDateRange((r) => ({ ...r, from: e.target.value }))} />
          </label>
          <label>
            To
            <input type="date" value={dateRange.to} onChange={(e) => setDateRange((r) => ({ ...r, to: e.target.value }))} />
          </label>
          {(dateRange.from || dateRange.to) && (
            <button className="btn btn-outline btn-sm" onClick={() => setDateRange({ from: '', to: '' })}>Clear</button>
          )}
        </div>
      )}

      {error && <div className="admin-error">{error}</div>}
      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>District</th>
                <th>Desired Country</th>
                <th>English Proficiency</th>
                <th>Document</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className={!item.is_read ? 'inquiry-row--new' : ''}>
                  <td>{!item.is_read && <span className="inquiry-new-dot" title="New" />}</td>
                  <td>{item.name}</td>
                  <td>{item.phone}</td>
                  <td>{item.email}</td>
                  <td>{item.district}</td>
                  <td>{item.desired_country}</td>
                  <td>{item.english_proficiency}</td>
                  <td>
                    {item.proficiency_document ? (
                      <a href={resolveMediaUrl(item.proficiency_document)} target="_blank" rel="noreferrer" className="link-arrow">View</a>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>{parseCreatedAt(item.created_at).toLocaleString()}</td>
                  <td className="admin-table-actions">
                    <button className="btn btn-outline btn-sm" onClick={() => toggleRead(item)}>
                      {item.is_read ? 'Mark New' : 'Mark Read'}
                    </button>
                    <button className="btn btn-sm admin-btn-danger" onClick={() => remove(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-muted">
                    {items.length === 0 ? 'No inquiries submitted yet.' : 'No inquiries match this filter.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
