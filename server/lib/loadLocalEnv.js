import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const LOCAL_OVERRIDE_KEYS = new Set([
  'MONGODB_URI',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_SERVICE_ACCOUNT',
  'ADMIN_EMAILS',
  'ADMIN_UIDS',
  'DEFAULT_USER_ID',
]);

function loadEnvFile(filePath, { overrideKeys = false } = {}) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf8');

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    value = value.replace(/\\n/g, '\n');

    if (process.env[key] === undefined || (overrideKeys && LOCAL_OVERRIDE_KEYS.has(key))) {
      process.env[key] = value;
    }
  }
}

let loaded = false;

/** Load .env files for local vercel dev — serverless handlers don't always get .env.local. */
export function ensureLocalEnv() {
  if (loaded) return;
  loaded = true;

  if (process.env.VERCEL) return;

  loadEnvFile(path.join(rootDir, '.env'));
  loadEnvFile(path.join(rootDir, '.env.development.local'), { overrideKeys: true });
  loadEnvFile(path.join(rootDir, '.env.local'), { overrideKeys: true });

  stripInvalidServiceAccountJson();
}

function stripInvalidServiceAccountJson() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    const key = parsed.private_key;
    const valid =
      parsed.project_id &&
      parsed.project_id !== '...' &&
      parsed.client_email &&
      key &&
      key !== '...' &&
      key.includes('BEGIN PRIVATE KEY');

    if (!valid) {
      delete process.env.FIREBASE_SERVICE_ACCOUNT;
    }
  } catch {
    delete process.env.FIREBASE_SERVICE_ACCOUNT;
  }
}

ensureLocalEnv();
