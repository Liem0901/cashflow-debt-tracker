import { useState, useEffect, useCallback, useRef } from 'react';
import { STORAGE_KEY, createInitialData, getStorageKey } from '../data/initialData';
import { fetchAppData, saveAppData, setAuthTokenProvider } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { isAuthBypassed } from '../lib/firebase';

const SAVE_DEBOUNCE_MS = 800;

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

export function useAppData() {
  const { user, getIdToken, isFirebaseConfigured } = useAuth();
  const userId = user?.uid || 'default-user';

  const [data, setDataState] = useState(() => readLocalStorage(userId) || createInitialData());
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('loading');

  const saveTimerRef = useRef(null);
  const isHydratingRef = useRef(true);
  const latestDataRef = useRef(data);

  useEffect(() => {
    latestDataRef.current = data;
  }, [data]);

  useEffect(() => {
    if (isFirebaseConfigured && !isAuthBypassed) {
      setAuthTokenProvider(getIdToken);
    } else {
      setAuthTokenProvider(null);
    }
  }, [getIdToken, isFirebaseConfigured]);

  const persistToCloud = useCallback(async (payload, immediate = false) => {
    if (isHydratingRef.current) return;

    const runSave = async () => {
      setSyncStatus('syncing');
      try {
        const result = await saveAppData(payload);
        if (result.offline) {
          setSyncStatus('local');
        } else {
          setSyncStatus('synced');
        }
      } catch (error) {
        console.warn('Cloud save failed:', error);
        setSyncStatus('error');
      }
    };

    if (immediate) {
      clearTimeout(saveTimerRef.current);
      await runSave();
      return;
    }

    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(runSave, SAVE_DEBOUNCE_MS);
  }, []);

  const setData = useCallback(
    (value, options = {}) => {
      setDataState((prev) => {
        const next = typeof value === 'function' ? value(prev) : value;
        if (next === prev) return prev;
        writeLocalStorage(userId, next);
        latestDataRef.current = next;
        persistToCloud(next, options.immediate);
        return next;
      });
    },
    [persistToCloud, userId]
  );

  useEffect(() => {
    let cancelled = false;
    isHydratingRef.current = true;
    setLoading(true);
    setSyncStatus('loading');

    async function hydrate() {
      const local = readLocalStorage(userId);

      try {
        const remote = await fetchAppData();

        if (cancelled) return;

        if (remote.offline) {
          setSyncStatus('local');
          setDataState(local || createInitialData());
        } else if (remote.data) {
          setDataState(remote.data);
          writeLocalStorage(userId, remote.data);
          setSyncStatus('synced');
        } else if (local) {
          setDataState(local);
          setSyncStatus('synced');
          await saveAppData(local);
        } else {
          const initial = createInitialData();
          setDataState(initial);
          writeLocalStorage(userId, initial);
          setSyncStatus('synced');
          await saveAppData(initial);
        }
      } catch (error) {
        console.warn('Cloud fetch failed, using localStorage:', error);
        setDataState(local || createInitialData());
        setSyncStatus('local');
      } finally {
        if (!cancelled) {
          isHydratingRef.current = false;
          setLoading(false);
        }
      }
    }

    hydrate();

    return () => {
      cancelled = true;
      clearTimeout(saveTimerRef.current);
    };
  }, [userId]);

  return { data, setData, loading, syncStatus };
}
