import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

/** Skip Google login in local dev; required on production builds only. */
export const isAuthBypassed = import.meta.env.DEV;

export const requiresAuth = isFirebaseConfigured && !isAuthBypassed;

const app = isFirebaseConfigured && !isAuthBypassed ? initializeApp(firebaseConfig) : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const googleProvider = new GoogleAuthProvider();
