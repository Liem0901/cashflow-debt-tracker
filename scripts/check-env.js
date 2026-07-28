/**
 * Check local .env and print what mode the app will run in.
 * Usage: node scripts/check-env.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(rootDir, '.env');

function loadEnv(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;

  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
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
    out[key] = value;
  }
  return out;
}

function present(value) {
  return Boolean(value && value !== '...' && !value.includes('your-project'));
}

const env = loadEnv(envPath);

console.log('Local env check');
console.log('===============');
console.log(`.env file: ${fs.existsSync(envPath) ? 'found' : 'MISSING — copy .env.example to .env'}`);
console.log('');

const checks = [
  ['VITE_AUTH_BYPASS', env.VITE_AUTH_BYPASS || '(unset → false)'],
  ['VITE_LOCAL_ONLY', env.VITE_LOCAL_ONLY || '(unset → true in npm run dev)'],
  ['VITE_FIREBASE_API_KEY', present(env.VITE_FIREBASE_API_KEY) ? 'set' : 'MISSING'],
  ['VITE_FIREBASE_PROJECT_ID', present(env.VITE_FIREBASE_PROJECT_ID) ? 'set' : 'MISSING'],
  ['FIREBASE_PROJECT_ID', present(env.FIREBASE_PROJECT_ID) ? 'set' : 'MISSING'],
  ['FIREBASE_CLIENT_EMAIL', present(env.FIREBASE_CLIENT_EMAIL) ? 'set' : 'MISSING'],
  ['FIREBASE_PRIVATE_KEY', present(env.FIREBASE_PRIVATE_KEY) ? 'set' : 'MISSING'],
  ['MONGODB_URI', present(env.MONGODB_URI) ? 'set' : 'MISSING'],
  ['ADMIN_EMAILS', present(env.ADMIN_EMAILS) ? 'set' : 'MISSING'],
  ['VITE_ADMIN_EMAILS', present(env.VITE_ADMIN_EMAILS) ? 'set' : 'MISSING'],
];

for (const [key, value] of checks) {
  console.log(`  ${key.padEnd(28)} ${value}`);
}

const authBypass = env.VITE_AUTH_BYPASS === 'true';
const localOnly = env.VITE_LOCAL_ONLY === 'true';
const firebaseOk =
  present(env.VITE_FIREBASE_API_KEY) &&
  present(env.VITE_FIREBASE_PROJECT_ID) &&
  present(env.VITE_FIREBASE_APP_ID);
const mongoOk = present(env.MONGODB_URI);
const serverFirebaseOk =
  present(env.FIREBASE_PRIVATE_KEY) || present(env.FIREBASE_SERVICE_ACCOUNT);

console.log('\nMode');
console.log('----');

if (authBypass) {
  console.log('  Login: SKIPPED (VITE_AUTH_BYPASS=true)');
} else if (firebaseOk) {
  console.log('  Login: email/password + Google (Firebase client OK)');
} else {
  console.log('  Login: guest only (Firebase client vars missing)');
}

if (localOnly || env.VITE_LOCAL_ONLY !== 'false') {
  console.log('  Data:  localStorage only');
  console.log('  Run:   npm run dev  →  http://localhost:5173');
} else {
  console.log('  Data:  cloud sync via /api + MongoDB');
  if (!mongoOk) console.log('  WARN:  MONGODB_URI missing — API will return 503');
  if (!serverFirebaseOk) {
    console.log('  WARN:  server Firebase credentials missing — API auth will fail');
  }
  console.log('  Run:   npm run dev:full  →  http://localhost:3000');
  console.log('  Note:  npm run dev (5173) has NO API — sync will fail');
}

console.log('\nProduction env lives in Vercel dashboard (not .env).');
