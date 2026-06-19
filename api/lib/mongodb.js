import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.warn('MONGODB_URI is not set — API will run in local-only mode');
}

const globalWithMongo = globalThis;

if (uri && !globalWithMongo._mongoClientPromise) {
  const client = new MongoClient(uri);
  globalWithMongo._mongoClientPromise = client.connect();
}

export async function getDb() {
  if (!uri) {
    throw new Error('MONGODB_URI not configured');
  }
  const client = await globalWithMongo._mongoClientPromise;
  return client.db('cashflow');
}

export function getUserId() {
  return process.env.DEFAULT_USER_ID || 'default-user';
}
