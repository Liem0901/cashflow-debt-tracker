function looksLikeHtml(text) {
  const sample = text.trimStart().slice(0, 256).toLowerCase();
  return (
    sample.startsWith('<!doctype') ||
    sample.startsWith('<html') ||
    (sample.includes('<head') && sample.includes('<body'))
  );
}

function looksLikeJson(text) {
  const trimmed = text.trimStart();
  return trimmed.startsWith('{') || trimmed.startsWith('[');
}

function htmlResponseMessage() {
  return (
    'API returned a web page instead of JSON — use npm run dev:full and open http://localhost:3005 ' +
    '(not npm run dev on :5173). If you just edited .env, wait for the server to finish restarting.'
  );
}

export function parseApiBody(bodyText, ErrorClass, { status, fallback = false } = {}) {
  if (looksLikeHtml(bodyText)) {
    throw new ErrorClass(htmlResponseMessage(), { status, fallback });
  }

  if (looksLikeJson(bodyText)) {
    try {
      return JSON.parse(bodyText);
    } catch {
      throw new ErrorClass('Invalid API response', { status, fallback });
    }
  }

  throw new ErrorClass(
    'Unexpected API response — run npm run dev:full and open http://localhost:3005',
    { status, fallback }
  );
}

export async function parseFetchResponse(response, ErrorClass, { fallback = false } = {}) {
  const bodyText = await response.text();
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json') || looksLikeJson(bodyText)) {
    return parseApiBody(bodyText, ErrorClass, { status: response.status, fallback });
  }

  return parseApiBody(bodyText, ErrorClass, { status: response.status, fallback });
}

export function isTransientHtmlResponse(bodyText) {
  return looksLikeHtml(bodyText);
}

export async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
