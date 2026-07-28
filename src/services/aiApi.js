const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export class AiApiError extends Error {
  constructor(message, { status, fallback } = {}) {
    super(message);
    this.name = 'AiApiError';
    this.status = status;
    this.fallback = fallback;
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
    throw new AiApiError('Unexpected API response — is the server running?', {
      status: response.status,
      fallback: true,
    });
  }

  try {
    return JSON.parse(bodyText);
  } catch {
    throw new AiApiError('Invalid API response', { status: response.status, fallback: true });
  }
}

export async function sendAiChat({ messages, context, getIdToken }) {
  try {
    const response = await fetch(`${API_BASE}/api/ai/chat`, {
      method: 'POST',
      headers: await buildHeaders(getIdToken),
      body: JSON.stringify({ messages, context }),
    });

    const payload = await parseApiResponse(response);

    if ((response.status === 503 || response.status === 429) && payload?.fallback) {
      throw new AiApiError(payload.message || payload.error || 'AI temporarily unavailable', {
        status: response.status,
        fallback: true,
      });
    }

    if (!response.ok) {
      throw new AiApiError(payload?.error || `AI request failed (${response.status})`, {
        status: response.status,
        fallback: response.status >= 500 || response.status === 429,
      });
    }

    if (!payload?.content || typeof payload.content !== 'string') {
      throw new AiApiError('Invalid AI response', { status: response.status, fallback: true });
    }

    return {
      content: payload.content,
      followUps: Array.isArray(payload.followUps) ? payload.followUps : [],
    };
  } catch (error) {
    if (error instanceof AiApiError) throw error;
    if (error instanceof TypeError) {
      throw new AiApiError('Cannot reach AI API — run npm run dev:full', {
        fallback: true,
      });
    }
    throw error;
  }
}
