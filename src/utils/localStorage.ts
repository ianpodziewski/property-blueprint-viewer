
/**
 * Utility functions for managing local storage operations
 */

/**
 * Save data to local storage with a given key
 */
export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
  } catch (error) {
    console.error(`Error saving to localStorage with key ${key}:`, error);
  }
};

/**
 * Retrieve data from local storage for a given key
 */
export const loadFromLocalStorage = <T>(key: string): T | null => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return null;
    }
    return JSON.parse(serializedData) as T;
  } catch (error) {
    console.error(`Error loading from localStorage with key ${key}:`, error);
    return null;
  }
};

/**
 * Remove data from local storage for a given key
 */
export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage with key ${key}:`, error);
  }
};

/**
 * Check if the browser supports localStorage
 */
export const isLocalStorageSupported = (): boolean => {
  try {
    const testKey = '___test___';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};
