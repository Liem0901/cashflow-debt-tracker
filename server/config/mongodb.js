import { MongoClient } from 'mongodb';
import { setupMongoDns } from './setupMongoDns.js';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.warn('MONGODB_URI is not set — API will run in local-only mode');
}

setupMongoDns(uri);

const globalWithMongo = globalThis;

const MONGO_OPTIONS = {
  maxPoolSize: 10,
  minPoolSize: 0,
  maxIdleTimeMS: 10000,
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
  socketTimeoutMS: 15000,
};

function createClientPromise() {
  const client = new MongoClient(uri, MONGO_OPTIONS);
  return client.connect().catch((error) => {
    globalWithMongo._mongoClientPromise = null;
    throw error;
  });
}

if (uri && !globalWithMongo._mongoClientPromise) {
  globalWithMongo._mongoClientPromise = createClientPromise();
}

export async function getDb() {
  if (!uri) {
    throw new Error('MONGODB_URI not configured');
  }

  try {
    const client = await globalWithMongo._mongoClientPromise;
    return client.db('cashflow');
  } catch (error) {
    globalWithMongo._mongoClientPromise = null;
    throw error;
  }
}

export function getUserId() {
  return process.env.DEFAULT_USER_ID || 'default-user';
}
