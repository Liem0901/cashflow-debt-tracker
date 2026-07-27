import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    if (process.env[key]) continue;
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

for (const file of ['.env', '.env.local', '.env.development.local']) {
  loadEnvFile(path.join(root, file));
}

const { isAuthConfigured } = await import('../server/lib/auth.js');

let saProject = null;
let saEmail = null;
let parseError = null;

try {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw) {
    const parsed = JSON.parse(raw);
    saProject = parsed.project_id;
    saEmail = parsed.client_email;
  }
} catch (error) {
  parseError = error.message;
}

console.log('auth configured:', isAuthConfigured());
console.log('client project (VITE_FIREBASE_PROJECT_ID):', process.env.VITE_FIREBASE_PROJECT_ID || '(missing)');
console.log('server FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID || '(missing)');
console.log('has FIREBASE_PRIVATE_KEY:', Boolean(process.env.FIREBASE_PRIVATE_KEY));
console.log('private key has literal \\n:', process.env.FIREBASE_PRIVATE_KEY?.includes('\\n') ?? false);
console.log('private key has real newlines:', process.env.FIREBASE_PRIVATE_KEY?.includes('\n') ?? false);
console.log('service account project:', saProject || parseError || process.env.FIREBASE_PROJECT_ID || '(missing)');
console.log('service account email:', saEmail || process.env.FIREBASE_CLIENT_EMAIL || '(missing)');

const serverProject = saProject || process.env.FIREBASE_PROJECT_ID;
console.log('projects match:', serverProject === process.env.VITE_FIREBASE_PROJECT_ID);

if (parseError) {
  console.log('\nFIREBASE_SERVICE_ACCOUNT JSON is invalid:', parseError);
}

if (saProject && process.env.VITE_FIREBASE_PROJECT_ID && saProject !== process.env.VITE_FIREBASE_PROJECT_ID) {
  console.log('\nMismatch: service account and client app use different Firebase projects.');
}

if (!process.env.FIREBASE_SERVICE_ACCOUNT && !process.env.FIREBASE_CLIENT_EMAIL) {
  console.log('\nMissing server credentials. Add FIREBASE_SERVICE_ACCOUNT to .env.local');
}

try {
  const { verifyAuthToken } = await import('../server/lib/auth.js');
  await verifyAuthToken('Bearer invalid');
  console.log('\nAdmin SDK init: OK (invalid token rejected as expected)');
} catch (error) {
  console.log('\nAdmin SDK init FAILED:', error.code || error.message);
}
