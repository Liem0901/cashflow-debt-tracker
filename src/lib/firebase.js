import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

function trimEnv(value) {
  return typeof value === 'string' ? value.trim() : value;
}

const firebaseConfig = {
  apiKey: trimEnv(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: trimEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: trimEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: trimEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: trimEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: trimEnv(import.meta.env.VITE_FIREBASE_APP_ID),
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

/** Skip login screen entirely (optional dev shortcut). */
export const isAuthBypassed = import.meta.env.VITE_AUTH_BYPASS === 'true';

/** localStorage only — no MongoDB /api sync (default in dev). */
export const isLocalOnly =
  import.meta.env.VITE_LOCAL_ONLY === 'true' ||
  (import.meta.env.DEV && import.meta.env.VITE_LOCAL_ONLY !== 'false');

export const requiresAuth = isFirebaseConfigured && !isAuthBypassed;

const app = isFirebaseConfigured && !isAuthBypassed ? initializeApp(firebaseConfig) : null;

export const auth = app ? getAuth(app) : null;
export const googleProvider = new GoogleAuthProvider();
