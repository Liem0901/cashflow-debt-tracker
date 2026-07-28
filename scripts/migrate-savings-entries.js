import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import { initCollections } from '../server/models/indexes.js';
import { AppDataService } from '../server/models/appDataService.js';
import { setupMongoDns } from '../server/lib/setupMongoDns.js';
import { COLLECTIONS } from '../server/models/constants.js';

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
  await initCollections(db);

  const appData = new AppDataService(db);
  const users = db.collection(COLLECTIONS.USERS);
  const embeddedUsers = await users.find({ savingsHistory: { $exists: true } }).toArray();
  const toMigrate = embeddedUsers.filter(
    (doc) => Array.isArray(doc.savingsHistory) && doc.savingsHistory.length > 0
  );

  console.log(`Found ${toMigrate.length} user document(s) with embedded savingsHistory.`);

  for (const doc of toMigrate) {
    await appData.savings.migrateEmbeddedHistory(doc.userId, doc.savingsHistory);
    console.log(`Migrated savings for ${doc.userId} (${doc.savingsHistory.length} entries)`);
  }

  console.log('Savings entries migration complete.');
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
} finally {
  await client.close();
}
