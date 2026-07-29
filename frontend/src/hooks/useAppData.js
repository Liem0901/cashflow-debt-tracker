import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createInitialData, getStorageKey } from '../data/initialData';
import { fetchUserData, saveUserData } from '../services/apiData';
import { useAuth } from '../context/AuthContext';
import { isLocalOnly } from '../lib/firebase';

const SAVE_DEBOUNCE_MS = 800;
const LOCAL_SAVED_FLASH_MS = 2500;

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

export function useAppData() {
  const { user, isFirebaseConfigured, isGuest, getIdToken } = useAuth();
  const userId = user?.uid || 'default-user';
  const cloudEnabled =
    isFirebaseConfigured && !isLocalOnly && !isGuest && Boolean(user);

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

  const [data, setDataState] = useState(() => readLocalStorage(userId) || createInitialData());
  const [loading, setLoading] = useState(true);
  const [hasCachedData, setHasCachedData] = useState(() => readLocalStorage(userId) !== null);
  const [refreshing, setRefreshing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('loading');
  const [syncError, setSyncError] = useState('');

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
          const result = await saveUserData(userId, payload, getIdToken);
          if (result.offline) {
            flashLocalSaved();
          } else {
            setSyncStatus('synced');
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
    [cloudEnabled, flashLocalSaved, getIdToken, userId]
  );

  const setData = useCallback(
    (value, options = {}) => {
      setDataState((prev) => {
        const next = typeof value === 'function' ? value(prev) : value;
        if (next === prev) return prev;
        writeLocalStorage(userId, next);
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
      const result = await loadRemoteData(userId, cloudEnabled, getIdToken);
      setDataState(result.data);
      setSyncStatus(result.syncStatus);
      setSyncError(result.syncError || '');
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  }, [cloudEnabled, getIdToken, userId]);

  useEffect(() => {
    let cancelled = false;
    isHydratingRef.current = true;
    setLoading(true);
    setHasCachedData(readLocalStorage(userId) !== null);
    setSyncStatus('loading');
    setSyncError('');

    async function hydrate() {
      const result = await loadRemoteData(userId, cloudEnabled, getIdToken);

      if (cancelled) return;

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
  }, [userId, cloudEnabled, getIdToken]);

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
