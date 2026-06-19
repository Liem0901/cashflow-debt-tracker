import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

function isValidAppData(data) {
  return data && Array.isArray(data.transactions) && Array.isArray(data.debts);
}

export async function fetchUserData(userId) {
  if (!db || !userId) {
    return { data: null, offline: true };
  }

  try {
    const ref = doc(db, 'users', userId);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      return { data: null, updatedAt: null, offline: false };
    }

    const payload = snapshot.data();
    if (!isValidAppData(payload?.data)) {
      return { data: null, updatedAt: null, offline: false };
    }

    return {
      data: payload.data,
      updatedAt: payload.updatedAt ?? null,
      offline: false,
    };
  } catch (error) {
    console.warn('Firestore fetch failed:', error);
    throw error;
  }
}

export async function saveUserData(userId, data) {
  if (!db || !userId) {
    return { ok: false, offline: true };
  }

  if (!isValidAppData(data)) {
    throw new Error('Invalid data format');
  }

  try {
    const ref = doc(db, 'users', userId);
    const updatedAt = new Date().toISOString();
    await setDoc(
      ref,
      {
        data,
        updatedAt,
      },
      { merge: true }
    );

    return { ok: true, updatedAt, offline: false };
  } catch (error) {
    console.warn('Firestore save failed:', error);
    throw error;
  }
}
