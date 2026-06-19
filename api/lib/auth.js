import admin from 'firebase-admin';

const globalWithFirebase = globalThis;

function trimEnv(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function getServiceAccount() {
  const serviceAccountJson = trimEnv(process.env.FIREBASE_SERVICE_ACCOUNT);
  if (serviceAccountJson) {
    return JSON.parse(serviceAccountJson);
  }

  const projectId = trimEnv(process.env.FIREBASE_PROJECT_ID);
  const clientEmail = trimEnv(process.env.FIREBASE_CLIENT_EMAIL);
  const privateKey = trimEnv(process.env.FIREBASE_PRIVATE_KEY);

  if (projectId && clientEmail && privateKey) {
    return {
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    };
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
      credential: admin.credential.cert(serviceAccount),
    });
  }

  return globalWithFirebase._firebaseAdminApp;
}

export async function verifyAuthToken(authHeader) {
  if (!isAuthConfigured()) return null;
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  if (!token) return null;

  try {
    getAdminApp();
    const decoded = await admin.auth().verifyIdToken(token);
    return decoded.uid;
  } catch (error) {
    console.warn('Token verification failed:', error.message);
    return null;
  }
}
