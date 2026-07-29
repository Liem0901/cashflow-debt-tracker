import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import { initCollections } from '../server/config/dbIndexes.js';
import { setupMongoDns } from '../server/config/setupMongoDns.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

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

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(rootDir, '.env'));

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI is missing. Add it to .env first.');
  process.exit(1);
}

setupMongoDns(uri);

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db('cashflow');
  const result = await initCollections(db);

  console.log(`Database: ${result.database}`);
  console.log(`Collections ready: ${result.collections.join(', ')}`);
} catch (error) {
  console.error('Failed to init collections:', error.message);
  process.exit(1);
} finally {
  await client.close();
}
