const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function buildHeaders(getIdToken) {
  const headers = { 'Content-Type': 'application/json' };
  if (getIdToken) {
    const token = await getIdToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function adminFetch(path, { method = 'GET', body, getIdToken } = {}) {
  const response = await fetch(`${API_BASE}/api/admin${path}`, {
    method,
    headers: await buildHeaders(getIdToken),
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = payload.hint ? ` ${payload.hint}` : '';
    const error = new Error((payload.error || `Admin API failed (${response.status})`) + detail);
    error.status = response.status;
    throw error;
  }

  return payload;
}

export function fetchAdminMe(getIdToken) {
  return adminFetch('/me', { getIdToken });
}

export function fetchAdminDashboard(getIdToken) {
  return adminFetch('/dashboard', { getIdToken });
}

export function fetchAdminUsers(params, getIdToken) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.disabled) query.set('disabled', params.disabled);
  const qs = query.toString();
  return adminFetch(`/users${qs ? `?${qs}` : ''}`, { getIdToken });
}

export function fetchAdminUser(userId, getIdToken) {
  return adminFetch(`/users/${encodeURIComponent(userId)}`, { getIdToken });
}

export function updateAdminUser(userId, body, getIdToken) {
  return adminFetch(`/users/${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    body,
    getIdToken,
  });
}

export function deleteAdminUser(userId, getIdToken) {
  return adminFetch(`/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    getIdToken,
  });
}

export function fetchAdminTransactions(params, getIdToken) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, String(value));
  });
  const qs = query.toString();
  return adminFetch(`/transactions${qs ? `?${qs}` : ''}`, { getIdToken });
}

export function fetchAdminCategories(getIdToken) {
  return adminFetch('/categories', { getIdToken });
}

export function saveAdminCategories(body, getIdToken) {
  return adminFetch('/categories', { method: 'PUT', body, getIdToken });
}

export function fetchAdminReports(getIdToken) {
  return adminFetch('/reports', { getIdToken });
}
