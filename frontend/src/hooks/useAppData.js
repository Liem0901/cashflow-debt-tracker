import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createInitialData, getStorageKey } from '../data/initialData';
import { fetchUserData, saveUserData } from '../services/apiData';
import { useAuth } from '../context/AuthContext';
import { isLocalOnly } from '../lib/firebase';

const SAVE_DEBOUNCE_MS = 800;
const LOCAL_SAVED_FLASH_MS = 2500;
const REMOTE_CACHE_TTL_MS = 5 * 60 * 1000;

/** Survives in-app navigation so returning to dashboard does not re-fetch immediately. */
const sessionCache = new Map();

function readLocalStorage(userId) {
  try {
    const item = window.localStorage.getItem(getStorageKey(userId));
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

function writeLocalStorage(userId, data) {
  try {
    window.localStorage.setItem(getStorageKey(userId), JSON.stringify(data));
  } catch (error) {
    console.warn('localStorage write failed:', error);
  }
}

function readSessionCache(userId) {
  return sessionCache.get(userId);
}

function isSessionCacheFresh(entry) {
  return Boolean(entry && Date.now() - entry.fetchedAt < REMOTE_CACHE_TTL_MS);
}

function writeSessionCache(userId, data, syncStatus, syncError = '') {
  sessionCache.set(userId, {
    data,
    syncStatus,
    syncError,
    fetchedAt: Date.now(),
  });
}

function patchSessionCacheData(userId, data) {
  const existing = sessionCache.get(userId);
  if (existing) {
    sessionCache.set(userId, { ...existing, data });
    return;
  }
  writeSessionCache(userId, data, 'local');
}

async function loadRemoteData(userId, cloudEnabled, getIdToken) {
  const local = readLocalStorage(userId);

  if (!cloudEnabled) {
    return {
      data: local || createInitialData(),
      syncStatus: 'local',
    };
  }

  try {
    const remote = await fetchUserData(userId, getIdToken);

    if (remote.offline) {
      return {
        data: local || createInitialData(),
        syncStatus: 'local',
      };
    }

    if (remote.data) {
      writeLocalStorage(userId, remote.data);
      return {
        data: remote.data,
        syncStatus: 'synced',
      };
    }

    if (local) {
      await saveUserData(userId, local, getIdToken);
      return {
        data: local,
        syncStatus: 'synced',
      };
    }

    const initial = createInitialData();
    writeLocalStorage(userId, initial);
    await saveUserData(userId, initial, getIdToken);
    return {
      data: initial,
      syncStatus: 'synced',
    };
  } catch (error) {
    console.warn('Cloud fetch failed, using localStorage:', error);
    return {
      data: local || createInitialData(),
      syncStatus: 'error',
      syncError: error.message || 'Sync failed',
    };
  }
}

function getInitialDataState(userId) {
  const cached = readSessionCache(userId);
  if (isSessionCacheFresh(cached)) return cached.data;
  return readLocalStorage(userId) || createInitialData();
}

function getInitialLoadingState(userId) {
  const cached = readSessionCache(userId);
  if (isSessionCacheFresh(cached)) return false;
  return readLocalStorage(userId) === null;
}

export function useAppData() {
  const { user, isFirebaseConfigured, isGuest, getIdToken } = useAuth();
  const userId = user?.uid || 'default-user';
  const cloudEnabled =
    isFirebaseConfigured && !isLocalOnly && !isGuest && Boolean(user);

  const getIdTokenRef = useRef(getIdToken);
  getIdTokenRef.current = getIdToken;

  const cloudSyncHint = useMemo(() => {
    if (cloudEnabled) return '';
    if (!isFirebaseConfigured) return 'Add VITE_FIREBASE_* keys to .env and restart dev:full.';
    if (isLocalOnly) {
      return 'Cloud sync is off. Set VITE_LOCAL_ONLY=false in .env, restart dev:full, hard-refresh.';
    }
    if (isGuest) return 'Guest mode — sign in with Google or email on Profile to sync.';
    if (!user) return 'Sign in to sync across devices.';
    return '';
  }, [cloudEnabled, isFirebaseConfigured, isGuest, isLocalOnly, user]);

  const [data, setDataState] = useState(() => getInitialDataState(userId));
  const [loading, setLoading] = useState(() => getInitialLoadingState(userId));
  const [hasCachedData, setHasCachedData] = useState(
    () => readLocalStorage(userId) !== null || isSessionCacheFresh(readSessionCache(userId))
  );
  const [refreshing, setRefreshing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(() => {
    const cached = readSessionCache(userId);
    if (isSessionCacheFresh(cached)) return cached.syncStatus;
    return readLocalStorage(userId) ? 'local' : 'loading';
  });
  const [syncError, setSyncError] = useState(() => {
    const cached = readSessionCache(userId);
    return isSessionCacheFresh(cached) ? cached.syncError || '' : '';
  });

  const saveTimerRef = useRef(null);
  const localSavedTimerRef = useRef(null);
  const localSaveFlashRef = useRef(null);
  const isHydratingRef = useRef(true);
  const refreshingRef = useRef(false);

  const flashLocalSaved = useCallback(() => {
    setSyncStatus('saved-local');
    clearTimeout(localSavedTimerRef.current);
    localSavedTimerRef.current = setTimeout(() => {
      setSyncStatus((current) => (current === 'saved-local' ? 'local' : current));
    }, LOCAL_SAVED_FLASH_MS);
  }, []);

  const scheduleLocalSaveFlash = useCallback(() => {
    clearTimeout(localSaveFlashRef.current);
    localSaveFlashRef.current = setTimeout(() => flashLocalSaved(), SAVE_DEBOUNCE_MS);
  }, [flashLocalSaved]);

  const persistToCloud = useCallback(
    async (payload, immediate = false) => {
      if (isHydratingRef.current || !cloudEnabled) return;

      const runSave = async () => {
        setSyncStatus('syncing');
        setSyncError('');
        try {
          const result = await saveUserData(userId, payload, getIdTokenRef.current);
          if (result.offline) {
            flashLocalSaved();
          } else {
            setSyncStatus('synced');
            patchSessionCacheData(userId, payload);
            const cached = readSessionCache(userId);
            if (cached) {
              writeSessionCache(userId, payload, 'synced', '');
            }
          }
        } catch (error) {
          console.warn('Cloud save failed:', error);
          flashLocalSaved();
          setSyncError(error.message || 'Sync failed');
        }
      };

      if (immediate) {
        clearTimeout(saveTimerRef.current);
        await runSave();
        return;
      }

      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(runSave, SAVE_DEBOUNCE_MS);
    },
    [cloudEnabled, flashLocalSaved, userId]
  );

  const setData = useCallback(
    (value, options = {}) => {
      setDataState((prev) => {
        const next = typeof value === 'function' ? value(prev) : value;
        if (next === prev) return prev;
        writeLocalStorage(userId, next);
        patchSessionCacheData(userId, next);
        if (!cloudEnabled) {
          scheduleLocalSaveFlash();
        } else {
          persistToCloud(next, options.immediate);
        }
        return next;
      });
    },
    [cloudEnabled, persistToCloud, scheduleLocalSaveFlash, userId]
  );

  const refreshData = useCallback(async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    setSyncStatus(cloudEnabled ? 'syncing' : 'local');
    setSyncError('');

    try {
      const result = await loadRemoteData(userId, cloudEnabled, () => getIdTokenRef.current());
      writeSessionCache(userId, result.data, result.syncStatus, result.syncError || '');
      setDataState(result.data);
      setSyncStatus(result.syncStatus);
      setSyncError(result.syncError || '');
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  }, [cloudEnabled, userId]);

  useEffect(() => {
    let cancelled = false;
    const local = readLocalStorage(userId);
    const cached = readSessionCache(userId);

    if (isSessionCacheFresh(cached)) {
      isHydratingRef.current = false;
      setDataState(cached.data);
      setSyncStatus(cached.syncStatus);
      setSyncError(cached.syncError || '');
      setHasCachedData(true);
      setLoading(false);
      return () => {
        cancelled = true;
        clearTimeout(saveTimerRef.current);
        clearTimeout(localSavedTimerRef.current);
        clearTimeout(localSaveFlashRef.current);
      };
    }

    isHydratingRef.current = true;
    setHasCachedData(local !== null);
    setSyncError('');

    if (local) {
      setDataState(local);
      setLoading(false);
      setSyncStatus(cloudEnabled ? 'local' : 'local');
    } else {
      setLoading(true);
      setSyncStatus('loading');
    }

    async function hydrate() {
      const result = await loadRemoteData(userId, cloudEnabled, () => getIdTokenRef.current());

      if (cancelled) return;

      writeSessionCache(userId, result.data, result.syncStatus, result.syncError || '');
      setDataState(result.data);
      setSyncStatus(result.syncStatus);
      setSyncError(result.syncError || '');
      isHydratingRef.current = false;
      setLoading(false);
    }

    hydrate();

    return () => {
      cancelled = true;
      clearTimeout(saveTimerRef.current);
      clearTimeout(localSavedTimerRef.current);
      clearTimeout(localSaveFlashRef.current);
    };
  }, [userId, cloudEnabled]);

  return {
    data,
    setData,
    loading,
    hasCachedData,
    refreshing,
    refreshData,
    syncStatus,
    syncError,
    cloudEnabled,
    cloudSyncHint,
  };
}
