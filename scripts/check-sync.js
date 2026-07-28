/**
 * Diagnose cloud sync prerequisites.
 * Usage: node scripts/check-sync.js
 */
import { loadEnv } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(rootDir, '.env');

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    const hash = value.indexOf(' #');
    if (hash !== -1) value = value.slice(0, hash).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    value = value.replace(/\\n/g, '\n');
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadDotEnv(envPath);
const viteEnv = loadEnv('development', rootDir, '');

for (const [key, value] of Object.entries(viteEnv)) {
  if (process.env[key] === undefined) process.env[key] = value;
}

const localOnly =
  viteEnv.VITE_LOCAL_ONLY === 'true' ||
  (process.env.NODE_ENV !== 'production' && viteEnv.VITE_LOCAL_ONLY !== 'false');

console.log('Cloud sync diagnostic');
console.log('=====================');
console.log(`VITE_LOCAL_ONLY (vite): ${JSON.stringify(viteEnv.VITE_LOCAL_ONLY)}`);
console.log(`Client local-only mode: ${localOnly ? 'YES — cloud disabled' : 'NO — cloud allowed'}`);
console.log('');

const { isAuthConfigured } = await import('../server/config/firebase.js');
console.log(`Server Firebase admin: ${isAuthConfigured() ? 'OK' : 'MISSING — API returns 401'}`);
console.log(`MONGODB_URI set: ${Boolean(process.env.MONGODB_URI?.trim())}`);

try {
  const { getDb } = await import('../server/config/mongodb.js');
  const db = await getDb();
  await db.command({ ping: 1 });
  console.log('MongoDB ping: OK');
} catch (error) {
  console.log(`MongoDB ping: FAILED — ${error.message}`);
}

try {
  const response = await fetch('http://127.0.0.1:3005/api/data');
  console.log(`API http://127.0.0.1:3005/api/data: ${response.status} ${response.statusText}`);
} catch (error) {
  console.log(`API http://127.0.0.1:3005: NOT REACHABLE — ${error.message}`);
  console.log('  → Run: npm run dev:full');
}

console.log('');
console.log('Client cloud sync needs ALL of:');
console.log('  1. VITE_LOCAL_ONLY=false');
console.log('  2. npm run dev:full running, open http://localhost:3005');
console.log('  3. Signed in with Google/email (NOT Guest)');
console.log('  4. Server Firebase + MongoDB OK (above)');
