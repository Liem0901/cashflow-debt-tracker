import '../../lib/loadLocalEnv.js';
import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';

const globalWithFirebase = globalThis;

function trimEnv(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function normalizePrivateKey(key) {
  if (!key) return key;
  return key.replace(/\\n/g, '\n');
}

function getServiceAccount() {
  const serviceAccountJson = trimEnv(process.env.FIREBASE_SERVICE_ACCOUNT);
  if (serviceAccountJson) {
    try {
      const parsed = JSON.parse(serviceAccountJson);
      const hasUsableKey =
        parsed.private_key &&
        parsed.private_key !== '...' &&
        String(parsed.private_key).includes('BEGIN PRIVATE KEY');

      if (parsed.project_id && parsed.client_email && hasUsableKey) {
        parsed.private_key = normalizePrivateKey(parsed.private_key);
        return parsed;
      }
    } catch {
      // fall through to separate credential fields
    }
  }

  const projectId = trimEnv(process.env.FIREBASE_PROJECT_ID);
  const clientEmail = trimEnv(process.env.FIREBASE_CLIENT_EMAIL);
  const privateKey = normalizePrivateKey(trimEnv(process.env.FIREBASE_PRIVATE_KEY));

  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey };
  }

  return null;
}

export function isAuthConfigured() {
  return Boolean(getServiceAccount());
}

function getAdminApp() {
  if (!globalWithFirebase._firebaseAdminApp) {
    const serviceAccount = getServiceAccount();
    if (!serviceAccount) return null;

    globalWithFirebase._firebaseAdminApp = admin.initializeApp({
      credential: admin.cert(serviceAccount),
    });
  }

  return globalWithFirebase._firebaseAdminApp;
}

export async function verifyAuthToken(authHeader) {
  const identity = await verifyAuthTokenFull(authHeader);
  return identity?.uid ?? null;
}

export async function verifyAuthTokenFull(authHeader) {
  if (!isAuthConfigured()) return null;
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  if (!token) return null;

  try {
    getAdminApp();
    const decoded = await getAuth().verifyIdToken(token);

    let email = decoded.email || null;
    if (!email) {
      try {
        const userRecord = await getAuth().getUser(decoded.uid);
        email = userRecord.email || null;
      } catch {
        // ignore — uid-only allowlist may still apply
      }
    }

    return {
      uid: decoded.uid,
      email,
      name: decoded.name || null,
    };
  } catch (error) {
    console.warn('Token verification failed:', error.code || error.message);
    return null;
  }
}
