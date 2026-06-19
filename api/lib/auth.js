import admin from 'firebase-admin';

const globalWithFirebase = globalThis;

function getServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }

  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
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
