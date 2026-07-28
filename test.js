/**
 * Deployment smoke test.
 *
 * Usage:
 *   node test.js
 *   node test.js https://cashflow-debt-tracker.vercel.app
 *   DEPLOY_URL=https://your-preview.vercel.app node test.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const DEFAULT_URL = 'https://cashflow-debt-tracker.vercel.app';
const baseUrl = (process.argv[2] || process.env.DEPLOY_URL || DEFAULT_URL).replace(/\/$/, '');

let failed = 0;

function pass(label, detail = '') {
  console.log(`  ✓ ${label}${detail ? ` — ${detail}` : ''}`);
}

function fail(label, detail = '') {
  failed += 1;
  console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`);
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { res, body, text };
}

function checkLocalReady() {
  console.log('\n1) Local deploy readiness');

  const handlerPath = path.join(rootDir, 'api', 'handler.js');
  if (fs.existsSync(handlerPath)) {
    pass('api/handler.js exists');
  } else {
    fail('api/handler.js missing');
  }

  const vercelPath = path.join(rootDir, 'vercel.json');
  if (!fs.existsSync(vercelPath)) {
    fail('vercel.json missing');
    return;
  }

  const vercel = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
  const rewrite = (vercel.rewrites || []).find(
    (r) => typeof r.source === 'string' && r.source.includes('/api/')
  );
  if (rewrite?.destination?.includes('/api/handler')) {
    pass('vercel.json API rewrite', rewrite.destination);
  } else {
    fail('vercel.json missing /api → handler rewrite');
  }

  const check = spawnSync(process.execPath, ['scripts/check-serverless-count.js'], {
    cwd: rootDir,
    encoding: 'utf8',
  });
  if (check.status === 0) {
    pass('serverless function count', (check.stdout || '').trim());
  } else {
    fail('serverless function count', (check.stderr || check.stdout || '').trim());
  }
}

async function checkSite() {
  console.log(`\n2) Live site — ${baseUrl}`);

  try {
    const res = await fetch(baseUrl, { redirect: 'follow' });
    if (res.ok) {
      pass('GET /', `${res.status}`);
    } else {
      fail('GET /', `${res.status}`);
    }
  } catch (error) {
    fail('GET /', error.message);
  }
}

async function checkApi() {
  console.log('\n3) API endpoints');

  const cases = [
    {
      path: '/api/data',
      ok: (status) => [200, 401, 503].includes(status),
      hint: 'expect 200 (no auth), 401 (auth on), or 503 (mongo missing)',
    },
    {
      path: '/api/admin/me',
      ok: (status) => [401, 403].includes(status),
      hint: 'expect 401/403 without auth token',
    },
    {
      path: '/api/not-a-real-route',
      ok: (status) => status === 404,
      hint: 'expect 404 from handler',
    },
  ];

  for (const testCase of cases) {
    try {
      const { res, body, text } = await fetchJson(`${baseUrl}${testCase.path}`);
      const detail =
        typeof body === 'object' && body?.error
          ? `${res.status} (${body.error})`
          : `${res.status}`;

      if (testCase.ok(res.status)) {
        pass(`GET ${testCase.path}`, detail);
        continue;
      }

      if (res.status === 500 && /FUNCTION_INVOCATION_FAILED/i.test(text)) {
        fail(
          `GET ${testCase.path}`,
          '500 FUNCTION_INVOCATION_FAILED — function crashed on boot (check firebase-admin/jose ESM)'
        );
        continue;
      }

      fail(`GET ${testCase.path}`, `unexpected ${detail}; ${testCase.hint}`);
    } catch (error) {
      fail(`GET ${testCase.path}`, error.message);
    }
  }
}

async function main() {
  console.log('Deployment test');
  console.log('===============');

  checkLocalReady();
  await checkSite();
  await checkApi();

  console.log('\n---------------');
  if (failed > 0) {
    console.error(`FAILED — ${failed} check(s) failed`);
    process.exit(1);
  }
  console.log('PASSED — deployment looks healthy');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
