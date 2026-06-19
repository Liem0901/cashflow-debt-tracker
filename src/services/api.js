const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function fetchAppData() {
  const res = await fetch(`${API_BASE}/data`);
  if (res.status === 503) {
    return { data: null, offline: true, reason: 'not_configured' };
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }
  const json = await res.json();
  return { data: json.data, updatedAt: json.updatedAt, offline: false };
}

export async function saveAppData(data) {
  const res = await fetch(`${API_BASE}/data`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  });

  if (res.status === 503) {
    return { ok: false, offline: true, reason: 'not_configured' };
  }
  if (!res.ok) {
    throw new Error(`Failed to save: ${res.status}`);
  }

  const json = await res.json();
  return { ok: true, updatedAt: json.updatedAt, offline: false };
}
