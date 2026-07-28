import {
  parseApiBody,
  isTransientHtmlResponse,
  sleep,
} from '../utils/apiResponse.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const API_RETRY_ATTEMPTS = 3;
const API_RETRY_DELAY_MS = 1200;

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

async function fetchApi(path, options) {
  for (let attempt = 0; attempt < API_RETRY_ATTEMPTS; attempt += 1) {
    const response = await fetch(`${API_BASE}${path}`, options);
    const bodyText = await response.text();

    if (isTransientHtmlResponse(bodyText) && attempt < API_RETRY_ATTEMPTS - 1) {
      await sleep(API_RETRY_DELAY_MS);
      continue;
    }

    const payload = parseApiBody(bodyText, ApiSyncError, { status: response.status });
    return { response, payload };
  }

  throw new ApiSyncError(
    'API unavailable after retries — on production, cold starts can take a moment; refresh to retry'
  );
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
    const headers = await buildHeaders(getIdToken);
    const { response, payload } = await fetchApi('/api/data', {
      method: 'GET',
      headers,
    });

    if (response.status === 503 || response.status === 504) {
      return { data: null, offline: true };
    }

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
    const headers = await buildHeaders(getIdToken);
    const { response, payload } = await fetchApi('/api/data', {
      method: 'PUT',
      headers,
      body: JSON.stringify({ data }),
    });

    if (response.status === 503 || response.status === 504) {
      return { ok: false, offline: true };
    }

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
