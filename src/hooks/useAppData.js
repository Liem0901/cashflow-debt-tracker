import { useState, useEffect, useCallback, useRef } from 'react';
import { STORAGE_KEY, createInitialData } from '../data/initialData';
import { fetchAppData, saveAppData } from '../services/api';

const SAVE_DEBOUNCE_MS = 800;

function readLocalStorage() {
  try {
    const item = window.localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

function writeLocalStorage(data) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('localStorage write failed:', error);
  }
}

export function useAppData() {
  const [data, setDataState] = useState(() => readLocalStorage() || createInitialData());
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('loading');

  const saveTimerRef = useRef(null);
  const isHydratingRef = useRef(true);
  const latestDataRef = useRef(data);

  useEffect(() => {
    latestDataRef.current = data;
  }, [data]);

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
        writeLocalStorage(next);
        latestDataRef.current = next;
        persistToCloud(next, options.immediate);
        return next;
      });
    },
    [persistToCloud]
  );

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const local = readLocalStorage();

      try {
        const remote = await fetchAppData();

        if (cancelled) return;

        if (remote.offline) {
          setSyncStatus('local');
          if (local) setDataState(local);
        } else if (remote.data) {
          setDataState(remote.data);
          writeLocalStorage(remote.data);
          setSyncStatus('synced');
        } else if (local) {
          setDataState(local);
          setSyncStatus('synced');
          await saveAppData(local);
        } else {
          const initial = createInitialData();
          setDataState(initial);
          writeLocalStorage(initial);
          setSyncStatus('synced');
          await saveAppData(initial);
        }
      } catch (error) {
        console.warn('Cloud fetch failed, using localStorage:', error);
        if (local) setDataState(local);
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
  }, []);

  return { data, setData, loading, syncStatus };
}
