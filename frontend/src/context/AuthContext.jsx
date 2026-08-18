import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  auth,
  googleProvider,
  isFirebaseConfigured,
  isAuthBypassed,
  isLocalOnly,
  requiresAuth,
} from '../lib/firebase';
import {
  readGuestSession,
  createGuestSession,
  clearGuestSession,
} from '../lib/guestAuth';

const AuthContext = createContext(null);

function mapAuthError(err) {
  switch (err?.code) {
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Sign in instead.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again later.';
    case 'auth/popup-closed-by-user':
      return null;
    default:
      return err?.message || 'Sign in failed';
  }
}

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [guestUser, setGuestUser] = useState(() => readGuestSession());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthBypassed) {
      setLoading(false);
      return undefined;
    }

    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        clearGuestSession();
        setGuestUser(null);
      }
      setFirebaseUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isAuthBypassed || !isFirebaseConfigured || !auth) return;

    getRedirectResult(auth).catch((err) => {
      const message = mapAuthError(err);
      if (message) setError(message);
    });
  }, []);

  const user = firebaseUser || guestUser;
  const isGuest = Boolean(!firebaseUser && guestUser);

  const signInWithGoogle = useCallback(async () => {
    if (!auth) {
      setError(
        isFirebaseConfigured
          ? 'Google sign-in failed to start. Restart the dev server and try again.'
          : 'Google sign-in is unavailable. Set VITE_FIREBASE_* in .env, or continue as Guest.'
      );
      return false;
    }

    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      return true;
    } catch (err) {
      if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/cancelled-popup-request') {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectErr) {
          const message = mapAuthError(redirectErr);
          if (message) setError(message);
        }
        return false;
      }

      const message = mapAuthError(err);
      if (message) setError(message);
      return false;
    }
  }, []);

  const signInWithEmail = useCallback(async (email, password) => {
    if (!auth) {
      setError('Email sign-in is unavailable. Check Firebase configuration.');
      return false;
    }

    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return true;
    } catch (err) {
      setError(mapAuthError(err));
      return false;
    }
  }, []);

  const signUpWithEmail = useCallback(async (email, password) => {
    if (!auth) {
      setError('Email sign-up is unavailable. Check Firebase configuration.');
      return false;
    }

    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      return true;
    } catch (err) {
      setError(mapAuthError(err));
      return false;
    }
  }, []);

  const signInAsGuest = useCallback((displayName) => {
    const name = displayName.trim();
    if (!name) {
      setError('Please enter your name.');
      return false;
    }

    setError(null);
    const session = createGuestSession(name);
    setGuestUser(session);
    setFirebaseUser(null);
    return true;
  }, []);

  const signOut = useCallback(async () => {
    clearGuestSession();
    setGuestUser(null);
    if (auth && firebaseUser) {
      await firebaseSignOut(auth);
    }
    setFirebaseUser(null);
  }, [firebaseUser]);

  const getIdToken = useCallback(async () => {
    if (!firebaseUser) return null;
    return firebaseUser.getIdToken();
  }, [firebaseUser]);

  const value = useMemo(
    () => ({
      user,
      isGuest,
      loading,
      error,
      isFirebaseConfigured,
      isAuthBypassed,
      isLocalOnly,
      requiresAuth,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signInAsGuest,
      signOut,
      getIdToken,
      setError,
    }),
    [
      user,
      isGuest,
      loading,
      error,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signInAsGuest,
      signOut,
      getIdToken,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
