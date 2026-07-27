const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

function isValidAppData(data) {
  return data && Array.isArray(data.transactions) && Array.isArray(data.debts);
}

export class ApiSyncError extends Error {
  constructor(message, { status } = {}) {
    super(message);
    this.name = 'ApiSyncError';
    this.status = status;
  }
}

async function buildHeaders(getIdToken) {
  const headers = { 'Content-Type': 'application/json' };

  if (getIdToken) {
    const token = await getIdToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

async function parseApiResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const bodyText = await response.text();

  if (!contentType.includes('application/json')) {
    if (bodyText.startsWith('import ') || bodyText.includes('export default')) {
      throw new ApiSyncError(
        'API not running — use npm run dev:full and open that URL (not npm run dev)',
        { status: response.status }
      );
    }

    throw new ApiSyncError('Unexpected API response — is the server running?', {
      status: response.status,
    });
  }

  try {
    return JSON.parse(bodyText);
  } catch {
    throw new ApiSyncError('Invalid API response', { status: response.status });
  }
}

function mapHttpError(status, payload) {
  if (status === 401) {
    return new ApiSyncError(
      'Unauthorized — check FIREBASE_SERVICE_ACCOUNT matches your Firebase project',
      { status }
    );
  }

  if (status === 400) {
    const detail = payload?.details?.[0];
    return new ApiSyncError(detail || 'Invalid data sent to server', { status });
  }

  return new ApiSyncError(payload?.error || payload?.message || `API failed (${status})`, {
    status,
  });
}

export async function fetchUserData(userId, getIdToken) {
  if (!userId) {
    return { data: null, offline: true };
  }

  try {
    const response = await fetch(`${API_BASE}/api/data`, {
      method: 'GET',
      headers: await buildHeaders(getIdToken),
    });

    if (response.status === 503) {
      return { data: null, offline: true };
    }

    const payload = await parseApiResponse(response);

    if (!response.ok) {
      throw mapHttpError(response.status, payload);
    }

    if (!payload.data) {
      return { data: null, updatedAt: payload.updatedAt ?? null, offline: false };
    }

    if (!isValidAppData(payload.data)) {
      return { data: null, updatedAt: null, offline: false };
    }

    return {
      data: payload.data,
      updatedAt: payload.updatedAt ?? null,
      offline: false,
    };
  } catch (error) {
    if (error instanceof ApiSyncError) throw error;
    if (error instanceof TypeError) {
      throw new ApiSyncError('Cannot reach API — run npm run dev:full for cloud sync');
    }
    console.warn('API fetch failed:', error);
    throw error;
  }
}

export async function saveUserData(userId, data, getIdToken) {
  if (!userId) {
    return { ok: false, offline: true };
  }

  if (!isValidAppData(data)) {
    throw new ApiSyncError('Invalid data format');
  }

  try {
    const response = await fetch(`${API_BASE}/api/data`, {
      method: 'PUT',
      headers: await buildHeaders(getIdToken),
      body: JSON.stringify({ data }),
    });

    if (response.status === 503) {
      return { ok: false, offline: true };
    }

    const payload = await parseApiResponse(response);

    if (!response.ok) {
      throw mapHttpError(response.status, payload);
    }

    return { ok: true, updatedAt: payload.updatedAt ?? null, offline: false };
  } catch (error) {
    if (error instanceof ApiSyncError) throw error;
    if (error instanceof TypeError) {
      throw new ApiSyncError('Cannot reach API — run npm run dev:full for cloud sync');
    }
    console.warn('API save failed:', error);
    throw error;
  }
}
