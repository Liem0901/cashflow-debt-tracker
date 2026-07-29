import { MongoClient } from 'mongodb';
import { resolveMongoUri } from './resolveMongoUri.js';

const globalWithMongo = globalThis;

const MONGO_OPTIONS = {
  maxPoolSize: 10,
  minPoolSize: 0,
  maxIdleTimeMS: 10000,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 20000,
  autoSelectFamily: false,
};

export function getMongoUri() {
  return process.env.MONGODB_URI?.trim() || '';
}

function resetMongoCache() {
  globalWithMongo._mongoClient = null;
  globalWithMongo._mongoClientPromise = null;
  globalWithMongo._mongoResolvedUri = null;
}

function getCachedClient() {
  const client = globalWithMongo._mongoClient;
  return client && typeof client.db === 'function' ? client : null;
}

async function connectMongoClient() {
  const uri = getMongoUri();
  if (!uri) {
    throw new Error('MONGODB_URI not configured');
  }

  let connectionUri = globalWithMongo._mongoResolvedUri;
  if (!connectionUri) {
    connectionUri = await resolveMongoUri(uri);
    globalWithMongo._mongoResolvedUri = connectionUri;
  }

  const client = new MongoClient(connectionUri, MONGO_OPTIONS);
  const connected = await client.connect();
  await connected.db('cashflow').command({ ping: 1 });

  if (!connected || typeof connected.db !== 'function') {
    throw new Error('MongoDB client unavailable');
  }

  globalWithMongo._mongoClient = connected;
  return connected;
}

async function getConnectedClient() {
  const cached = getCachedClient();
  if (cached) return cached;

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = connectMongoClient().catch((error) => {
      resetMongoCache();
      throw error;
    });
  }

  try {
    const client = await globalWithMongo._mongoClientPromise;
    if (!client || typeof client.db !== 'function') {
      resetMongoCache();
      throw new Error('MongoDB client unavailable');
    }
    return client;
  } catch (error) {
    resetMongoCache();
    throw error;
  }
}

export async function getDb() {
  const client = await getConnectedClient();
  return client.db('cashflow');
}

export async function pingMongo() {
  const db = await getDb();
  await db.command({ ping: 1 });
  return true;
}

export function getUserId() {
  return process.env.DEFAULT_USER_ID || 'default-user';
}
