'use client';

import { useEffect, useState } from 'react';
import { storage, StorageKey } from './local-storage';

export const useLocalStorage = <T = unknown>(key: StorageKey, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    return storage.getItem(key, initialValue);
  });

  useEffect(() => {
    storage.setItem(key, storedValue);
  }, [storedValue, key]);
  return [storedValue, setStoredValue] as const;
};