import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import { initCollections } from '../api/models/indexes.js';
import { AppDataService } from '../api/models/appDataService.js';
import { setupMongoDns } from '../api/lib/setupMongoDns.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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
    value = value.replace(/\\n/g, '\n');
    process.env[key] = value;
  }
}

for (const file of ['.env', '.env.local', '.env.development.local']) {
  loadEnvFile(path.join(rootDir, file));
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is missing.');
  process.exit(1);
}

setupMongoDns(uri);
const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db('cashflow');
  await initCollections(db);

  const appData = new AppDataService(db);
  const users = db.collection('users');
  const legacyUsers = await users.find({ data: { $exists: true } }).toArray();

  console.log(`Found ${legacyUsers.length} legacy user document(s) to migrate.`);

  for (const doc of legacyUsers) {
    await appData.migrateLegacyUser(doc.userId, doc.data);
    console.log(`Migrated ${doc.userId}`);
  }

  console.log('Migration complete.');
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
} finally {
  await client.close();
}
