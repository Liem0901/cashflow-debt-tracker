import { parseFetchResponse } from '../utils/apiResponse.js';

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
  return parseFetchResponse(response, AiApiError, { fallback: true });
}

function parseSseBlock(rawBlock) {
  let event = 'message';
  const dataLines = [];

  for (const line of rawBlock.split('\n')) {
    if (!line || line.startsWith(':')) continue;
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim());
    }
  }

  if (!dataLines.length) return null;
  return { event, data: dataLines.join('\n') };
}

export async function streamAiChat({ messages, context, getIdToken, onDelta }) {
  let response;
  try {
    response = await fetch(`${API_BASE}/api/ai/chat`, {
      method: 'POST',
      headers: await buildHeaders(getIdToken),
      body: JSON.stringify({ messages, context }),
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new AiApiError('Cannot reach AI API — run npm run dev:full', { fallback: true });
    }
    throw error;
  }

  const contentType = response.headers.get('content-type') || '';
  const isStream = response.ok && contentType.includes('text/event-stream') && response.body;

  if (!isStream) {
    const payload = await parseApiResponse(response);

    if ((response.status === 503 || response.status === 429) && payload?.fallback) {
      throw new AiApiError(payload.message || payload.error || 'AI temporarily unavailable', {
        status: response.status,
        fallback: true,
      });
    }

    throw new AiApiError(payload?.error || `AI request failed (${response.status})`, {
      status: response.status,
      fallback: response.status >= 500 || response.status === 429,
    });
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let content = '';
  let followUps = [];
  let streamError = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let separatorIndex;
    while ((separatorIndex = buffer.indexOf('\n\n')) !== -1) {
      const rawBlock = buffer.slice(0, separatorIndex);
      buffer = buffer.slice(separatorIndex + 2);

      const parsed = parseSseBlock(rawBlock);
      if (!parsed) continue;

      let payload;
      try {
        payload = JSON.parse(parsed.data);
      } catch {
        continue;
      }

      if (parsed.event === 'delta') {
        content += payload.text || '';
        onDelta?.(content);
      } else if (parsed.event === 'done') {
        followUps = Array.isArray(payload.followUps) ? payload.followUps : [];
      } else if (parsed.event === 'error') {
        streamError = payload;
      }
    }
  }

  if (!content) {
    throw new AiApiError(streamError?.error || streamError?.message || 'Invalid AI response', {
      fallback: streamError?.fallback ?? true,
    });
  }

  return { content, followUps };
}
