import { useState, useEffect, useCallback, useRef } from 'react';
import { createInitialData, getStorageKey } from '../data/initialData';
import { fetchUserData, saveUserData } from '../services/firestore';
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
  const { user, isFirebaseConfigured, isGuest } = useAuth();
  const userId = user?.uid || 'default-user';
  const cloudEnabled =
    isFirebaseConfigured && !isAuthBypassed && !isGuest && Boolean(user);

  const [data, setDataState] = useState(() => readLocalStorage(userId) || createInitialData());
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('loading');

  const saveTimerRef = useRef(null);
  const isHydratingRef = useRef(true);

  const persistToCloud = useCallback(
    async (payload, immediate = false) => {
      if (isHydratingRef.current || !cloudEnabled) return;

      const runSave = async () => {
        setSyncStatus('syncing');
        try {
          const result = await saveUserData(userId, payload);
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
    },
    [cloudEnabled, userId]
  );

  const setData = useCallback(
    (value, options = {}) => {
      setDataState((prev) => {
        const next = typeof value === 'function' ? value(prev) : value;
        if (next === prev) return prev;
        writeLocalStorage(userId, next);
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

      if (!cloudEnabled) {
        if (!cancelled) {
          setDataState(local || createInitialData());
          setSyncStatus('local');
          isHydratingRef.current = false;
          setLoading(false);
        }
        return;
      }

      try {
        const remote = await fetchUserData(userId);

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
          await saveUserData(userId, local);
        } else {
          const initial = createInitialData();
          setDataState(initial);
          writeLocalStorage(userId, initial);
          setSyncStatus('synced');
          await saveUserData(userId, initial);
        }
      } catch (error) {
        console.warn('Cloud fetch failed, using localStorage:', error);
        setDataState(local || createInitialData());
        setSyncStatus('error');
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
  }, [userId, cloudEnabled]);

  return { data, setData, loading, syncStatus };
}
