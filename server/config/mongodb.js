import { MongoClient } from 'mongodb';
import { setupMongoDns } from './setupMongoDns.js';

const globalWithMongo = globalThis;

const MONGO_OPTIONS = {
  maxPoolSize: 10,
  minPoolSize: 0,
  maxIdleTimeMS: 10000,
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
  socketTimeoutMS: 15000,
  // Avoid Node 18+ happy-eyeballs IPv6 issues on Vercel → Atlas TLS failures.
  autoSelectFamily: false,
};

export function getMongoUri() {
  return process.env.MONGODB_URI?.trim() || '';
}

function createClientPromise(uri) {
  setupMongoDns(uri);
  const client = new MongoClient(uri, MONGO_OPTIONS);
  return client.connect().catch((error) => {
    globalWithMongo._mongoClientPromise = null;
    throw error;
  });
}

function getClientPromise() {
  const uri = getMongoUri();
  if (!uri) {
    throw new Error('MONGODB_URI not configured');
  }

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = createClientPromise(uri);
  }

  return globalWithMongo._mongoClientPromise;
}

export async function getDb() {
  try {
    const client = await getClientPromise();
    if (!client) {
      globalWithMongo._mongoClientPromise = null;
      throw new Error('MongoDB client unavailable');
    }
    return client.db('cashflow');
  } catch (error) {
    globalWithMongo._mongoClientPromise = null;
    throw error;
  }
}

export function getUserId() {
  return process.env.DEFAULT_USER_ID || 'default-user';
}
