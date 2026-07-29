import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

function trimEnv(value) {
  return typeof value === 'string' ? value.trim() : value;
}

/** Parse VITE_* booleans; strips trailing inline `#` comments from .env values. */
function parseEnvBool(value) {
  const trimmed = trimEnv(value);
  if (!trimmed) return null;
  const normalized = trimmed.split(/\s+#/)[0].trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return null;
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

const localOnlySetting = parseEnvBool(import.meta.env.VITE_LOCAL_ONLY);

/** localStorage only — no MongoDB /api sync (default in dev unless VITE_LOCAL_ONLY=false). */
export const isLocalOnly =
  localOnlySetting === true ||
  (import.meta.env.DEV && localOnlySetting !== false);

export const requiresAuth = isFirebaseConfigured && !isAuthBypassed;

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

export const auth = app ? getAuth(app) : null;
export const googleProvider = new GoogleAuthProvider();
