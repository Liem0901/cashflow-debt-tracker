import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured, isAuthBypassed, requiresAuth } from '../lib/firebase';
import {
  readGuestSession,
  createGuestSession,
  clearGuestSession,
} from '../lib/guestAuth';

const AuthContext = createContext(null);

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

  const user = firebaseUser || guestUser;
  const isGuest = Boolean(!firebaseUser && guestUser);

  const signInWithGoogle = useCallback(async () => {
    if (!auth) {
      setError('Google sign-in is unavailable. Continue as Guest instead.');
      return;
    }

    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Sign in failed');
      }
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
      requiresAuth,
      signInWithGoogle,
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
