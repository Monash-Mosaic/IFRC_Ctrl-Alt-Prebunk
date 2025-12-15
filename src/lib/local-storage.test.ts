import { storage, STORAGE_KEYS } from './local-storage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

describe('local-storage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    // Replace global localStorage with mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('STORAGE_KEYS', () => {
    it('should export CHAT_ONBOARDING_STATE key', () => {
      expect(STORAGE_KEYS.CHAT_ONBOARDING_STATE).toBe('chat_onboarding_state');
    });
  });

  describe('getItem', () => {
    it('should return null when item does not exist', () => {
      const result = storage.getItem('non-existent-key');
      expect(result).toBeNull();
    });

    it('should return parsed value when item exists', () => {
      const testValue = { name: 'test', count: 42 };
      storage.setItem('test-key', testValue);
      const result = storage.getItem<typeof testValue>('test-key');
      expect(result).toEqual(testValue);
    });

    it('should return default value when item does not exist and default is provided', () => {
      const defaultValue = { default: true };
      const result = storage.getItem('non-existent-key', defaultValue);
      expect(result).toEqual(defaultValue);
    });

    it('should return stored value even when default is provided', () => {
      const storedValue = { stored: true };
      const defaultValue = { default: true };
      storage.setItem('test-key', storedValue);
      const result = storage.getItem('test-key', defaultValue);
      expect(result).toEqual(storedValue);
    });

    it('should handle string values', () => {
      storage.setItem('string-key', 'test-string');
      const result = storage.getItem<string>('string-key');
      expect(result).toBe('test-string');
    });

    it('should handle number values', () => {
      storage.setItem('number-key', 42);
      const result = storage.getItem<number>('number-key');
      expect(result).toBe(42);
    });

    it('should handle array values', () => {
      const arrayValue = [1, 2, 3];
      storage.setItem('array-key', arrayValue);
      const result = storage.getItem<number[]>('array-key');
      expect(result).toEqual(arrayValue);
    });

    it('should handle boolean values', () => {
      storage.setItem('bool-key', true);
      const result = storage.getItem<boolean>('bool-key');
      expect(result).toBe(true);
    });

    it('should return null in SSR environment (window undefined)', () => {
      const originalWindow = global.window;
      // @ts-expect-error - intentionally removing window for SSR test
      delete global.window;

      const result = storage.getItem('test-key');
      expect(result).toBeNull();

      global.window = originalWindow;
    });

    it('should return default value in SSR environment when provided', () => {
      const originalWindow = global.window;
      const defaultValue = { default: true };
      // @ts-expect-error - intentionally removing window for SSR test
      delete global.window;

      const result = storage.getItem('test-key', defaultValue);
      expect(result).toEqual(defaultValue);

      global.window = originalWindow;
    });
  });

  describe('setItem', () => {
    it('should store a value in localStorage', () => {
      const testValue = { name: 'test' };
      storage.setItem('test-key', testValue);
      const result = storage.getItem('test-key');
      expect(result).toEqual(testValue);
    });

    it('should overwrite existing value', () => {
      storage.setItem('test-key', 'old-value');
      storage.setItem('test-key', 'new-value');
      const result = storage.getItem<string>('test-key');
      expect(result).toBe('new-value');
    });

    it('should stringify complex objects', () => {
      const complexObject = {
        nested: {
          array: [1, 2, 3],
          value: 'test',
        },
      };
      storage.setItem('complex-key', complexObject);
      const result = storage.getItem<typeof complexObject>('complex-key');
      expect(result).toEqual(complexObject);
    });

    it('should not throw error in SSR environment', () => {
      const originalWindow = global.window;
      // @ts-expect-error - intentionally removing window for SSR test
      delete global.window;

      expect(() => {
        storage.setItem('test-key', 'value');
      }).not.toThrow();

      global.window = originalWindow;
    });
  });

  describe('removeItem', () => {
    it('should remove an item from localStorage', () => {
      storage.setItem('test-key', 'value');
      expect(storage.getItem('test-key')).toBe('value');

      storage.removeItem('test-key');
      expect(storage.getItem('test-key')).toBeNull();
    });

    it('should not throw error when removing non-existent key', () => {
      expect(() => {
        storage.removeItem('non-existent-key');
      }).not.toThrow();
    });

    it('should not throw error in SSR environment', () => {
      const originalWindow = global.window;
      // @ts-expect-error - intentionally removing window for SSR test
      delete global.window;

      expect(() => {
        storage.removeItem('test-key');
      }).not.toThrow();

      global.window = originalWindow;
    });
  });

  describe('clear', () => {
    it('should clear all items from localStorage', () => {
      storage.setItem('key1', 'value1');
      storage.setItem('key2', 'value2');
      storage.setItem('key3', 'value3');

      storage.clear();

      expect(storage.getItem('key1')).toBeNull();
      expect(storage.getItem('key2')).toBeNull();
      expect(storage.getItem('key3')).toBeNull();
    });

    it('should not throw error in SSR environment', () => {
      const originalWindow = global.window;
      // @ts-expect-error - intentionally removing window for SSR test
      delete global.window;

      expect(() => {
        storage.clear();
      }).not.toThrow();

      global.window = originalWindow;
    });
  });

  describe('hasItem', () => {
    it('should return true when item exists', () => {
      storage.setItem('test-key', 'value');
      expect(storage.hasItem('test-key')).toBe(true);
    });

    it('should return false when item does not exist', () => {
      expect(storage.hasItem('non-existent-key')).toBe(false);
    });

    it('should return false after removing an item', () => {
      storage.setItem('test-key', 'value');
      storage.removeItem('test-key');
      expect(storage.hasItem('test-key')).toBe(false);
    });

    it('should return false in SSR environment', () => {
      const originalWindow = global.window;
      // @ts-expect-error - intentionally removing window for SSR test
      delete global.window;

      expect(storage.hasItem('test-key')).toBe(false);

      global.window = originalWindow;
    });
  });
});
