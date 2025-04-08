import { useState, useEffect } from 'react';

type StorageValue<T> = T | null;

/**
 * Custom hook for persisting and retrieving data from localStorage
 */
export const useLocalStoragePersistence = <T>(
  key: string, 
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] => {
  // Create state and setter
  const [value, setValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue !== null) {
        const parsedValue = JSON.parse(storedValue);
        setValue(parsedValue);
        console.log(`Loaded data from localStorage (${key}):`, parsedValue);
      } else {
        console.log(`No data found in localStorage for key (${key}), using default value:`, initialValue);
      }
      setIsInitialized(true);
    } catch (error) {
      console.error(`Error loading data from localStorage (${key}):`, error);
      setIsInitialized(true);
    }
  }, [key, initialValue]);

  // Save to localStorage whenever value changes
  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
      console.log(`Data saved to localStorage (${key}):`, value);
    } catch (error) {
      console.error(`Error saving data to localStorage (${key}):`, error);
    }
  }, [key, value, isInitialized]);

  // Function to reset stored value
  const resetValue = () => {
    try {
      localStorage.removeItem(key);
      setValue(initialValue);
      console.log(`Reset data in localStorage (${key}) to:`, initialValue);
    } catch (error) {
      console.error(`Error resetting data in localStorage (${key}):`, error);
    }
  };

  return [value, setValue, resetValue];
};

/**
 * Helper to save arbitrary data to localStorage
 */
export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    if (data === undefined) {
      console.warn(`Attempted to save undefined data to localStorage (${key})`);
      return;
    }
    
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`Data saved to localStorage (${key})`, data);
  } catch (error) {
    console.error(`Error saving data to localStorage (${key}):`, error);
  }
};

/**
 * Helper to load arbitrary data from localStorage
 */
export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const storedValue = localStorage.getItem(key);
    if (storedValue === null) {
      console.log(`No data found in localStorage for key (${key}), using default value:`, defaultValue);
      return defaultValue;
    }
    
    const parsedValue = JSON.parse(storedValue);
    console.log(`Data loaded from localStorage (${key}):`, parsedValue);
    return parsedValue;
  } catch (error) {
    console.error(`Error loading data from localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Helper to verify if a key exists in localStorage
 */
export const existsInLocalStorage = (key: string): boolean => {
  return localStorage.getItem(key) !== null;
};

/**
 * Helper to clear all model data from localStorage
 */
export const clearAllModelData = (): void => {
  try {
    // Get all localStorage keys
    const keys = Object.keys(localStorage);
    
    // Filter keys that belong to our model
    const modelKeys = keys.filter(key => key.startsWith('realEstateModel_'));
    
    // Remove each model key
    modelKeys.forEach(key => localStorage.removeItem(key));
    
    console.log('All model data cleared from localStorage. Removed keys:', modelKeys);
  } catch (error) {
    console.error('Error clearing model data from localStorage:', error);
  }
};

/**
 * Helper to check if localStorage is available
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__test_storage__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Helper to export all model data from localStorage
 */
export const exportAllModelData = (): Record<string, any> => {
  try {
    const keys = Object.keys(localStorage);
    const modelKeys = keys.filter(key => key.startsWith('realEstateModel_'));
    
    const exportData: Record<string, any> = {};
    modelKeys.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          exportData[key] = JSON.parse(value);
        }
      } catch (e) {
        console.error(`Error exporting data for key ${key}:`, e);
      }
    });
    
    return exportData;
  } catch (error) {
    console.error('Error exporting model data from localStorage:', error);
    return {};
  }
};

/**
 * Helper to import model data into localStorage
 */
export const importAllModelData = (data: Record<string, any>): void => {
  try {
    Object.entries(data).forEach(([key, value]) => {
      if (key.startsWith('realEstateModel_')) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    });
    console.log('All model data imported to localStorage');
  } catch (error) {
    console.error('Error importing model data to localStorage:', error);
  }
};
