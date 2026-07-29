import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

function loadEnvFile(filePath) {
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

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
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

let loaded = false;

/** Load .env for local vercel dev — serverless handlers don't always get it. */
export function ensureLocalEnv() {
  if (loaded) return;
  loaded = true;

  if (process.env.VERCEL) return;

  loadEnvFile(path.join(rootDir, '.env'));
  stripInvalidServiceAccountJson();
}

ensureLocalEnv();
