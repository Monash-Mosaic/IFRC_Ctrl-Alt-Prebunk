/**
 * LocalStorage keys used throughout the application
 */
export const STORAGE_KEYS = {
  CHAT_ONBOARDING_STATE: 'chat_onboarding_state',
  ONBOARDING_COMPLETED: 'onboarding_completed',
} as const;

/**
 * Type for valid storage keys
 */
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * Get an item from localStorage
 * @param key - The storage key
 * @param defaultValue - Default value to return if item is not found
 * @returns The parsed value, default value, or null if not found and no default provided
 */
function getItem<T = unknown>(key: StorageKey): T | null;
function getItem<T = unknown>(key: StorageKey, defaultValue: T): T;
function getItem<T = unknown>(key: StorageKey, defaultValue?: T): T | null {
  if (typeof window === 'undefined') return defaultValue ?? null;

  const item = localStorage.getItem(key);
  if (item) {
    return JSON.parse(item) as T;
  }
  return defaultValue ?? null;
}

/**
 * Type-safe localStorage utility functions
 */
export const storage = {
  getItem,

  /**
   * Set an item in localStorage
   * @param key - The storage key
   * @param value - The value to store (will be JSON stringified)
   */
  setItem<T = unknown>(key: StorageKey, value: T): void {
    if (typeof window === 'undefined' || value === undefined) return;

    localStorage.setItem(key, JSON.stringify(value));
  },

  /**
   * Remove an item from localStorage
   * @param key - The storage key
   */
  removeItem(key: StorageKey): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(key);
  },

  /**
   * Clear all items from localStorage
   */
  clear(): void {
    if (typeof window === 'undefined') return;

    localStorage.clear();
  },

  /**
   * Check if a key exists in localStorage
   * @param key - The storage key
   * @returns true if the key exists, false otherwise
   */
  hasItem(key: StorageKey): boolean {
    if (typeof window === 'undefined') return false;

    return !!localStorage.getItem(key);
  },
};

export const getStorage = <T = unknown>(key: StorageKey) => {
  function getItem(): T | null;
  function getItem(defaultValue: T): T;
  function getItem(defaultValue?: T): T | null {
    return storage.getItem<T>(key, defaultValue as T);
  }
  return {
    getItem,
    setItem: (value: T): void => storage.setItem<T>(key, value),
    removeItem: (): void => storage.removeItem(key),
    hasItem: (): boolean => storage.hasItem(key),
  };
};
