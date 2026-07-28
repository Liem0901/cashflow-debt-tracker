/**
 * Test MongoDB Atlas connectivity (same path as Vercel production).
 * Usage: node scripts/check-mongo-atlas.js
 */
import { loadEnv } from 'vite';
import { pingMongo, getMongoUri } from '../server/config/mongodb.js';

const rootDir = process.cwd();
const viteEnv = loadEnv('development', rootDir, '');

for (const [key, value] of Object.entries(viteEnv)) {
  if (process.env[key] === undefined) process.env[key] = value;
}

console.log('MongoDB Atlas connectivity check');
console.log('================================');

const uri = getMongoUri();
if (!uri) {
  console.error('MONGODB_URI is not set.');
  process.exit(1);
}

console.log(`URI host: ${uri.replace(/\/\/([^@]+)@/, '//***@').split('?')[0]}`);

try {
  await pingMongo();
  console.log('Ping: OK — Atlas is reachable from this network.');
  console.log('');
  console.log('If Vercel still returns 503:');
  console.log('  1. Atlas → Network Access → allow 0.0.0.0/0');
  console.log('  2. Redeploy after setting MONGODB_URI in Vercel dashboard');
  console.log('  3. Open https://YOUR-APP.vercel.app/api/health after deploy');
} catch (error) {
  console.error('Ping: FAILED');
  console.error(error.message || error);
  console.log('');
  console.log('Fix Atlas → Network Access → Add IP → Allow Access from Anywhere (0.0.0.0/0)');
  process.exit(1);
}
