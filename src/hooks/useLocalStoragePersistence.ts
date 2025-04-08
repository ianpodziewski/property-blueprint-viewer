import { useState, useEffect, useRef } from 'react';
import { debounceStorage, safeLoadFromLocalStorage, safeSaveToLocalStorage } from '@/utils/storageUtils';

type StorageValue<T> = T | null;

/**
 * Custom hook for persisting and retrieving data from localStorage
 * with debouncing and circuit breaking to prevent infinite loops
 */
export const useLocalStoragePersistence = <T>(
  key: string, 
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] => {
  // Track first render to prevent initialization loops
  const isFirstRender = useRef(true);
  const previousValueRef = useRef<string | null>(null);
  
  // Create state and setter
  // Use a function to initialize state from localStorage immediately
  const [value, setValue] = useState<T>(() => {
    try {
      // Try to get value from localStorage on initial render
      if (typeof window === 'undefined' || !window.localStorage) {
        console.log(`localStorage not available during initialization for ${key}, using initial value`);
        return initialValue;
      }
      
      const storedValue = localStorage.getItem(key);
      if (storedValue !== null) {
        const parsedValue = JSON.parse(storedValue);
        // Store the initial JSON string to prevent unnecessary writes
        previousValueRef.current = storedValue;
        console.log(`Initialized state from localStorage (${key})`);
        return parsedValue;
      }
    } catch (error) {
      console.error(`Error loading data from localStorage (${key}) during initialization:`, error);
    }
    console.log(`No stored value found for ${key}, using initial value`);
    return initialValue;
  });
  
  // Save to localStorage whenever value changes, with debouncing
  useEffect(() => {
    // Skip the very first save to prevent initialization loops
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    try {
      // Serialize current value
      const valueJson = JSON.stringify(value);
      
      // Only save if the value has actually changed
      if (valueJson !== previousValueRef.current) {
        previousValueRef.current = valueJson;
        
        // Use debounced storage operation
        debounceStorage(key, () => {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(key, valueJson);
            console.log(`Data saved to localStorage (${key})`);
          }
        });
      }
    } catch (error) {
      console.error(`Error saving data to localStorage (${key}):`, error);
    }
  }, [key, value]);

  // Function to reset stored value
  const resetValue = () => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn(`Cannot reset localStorage (${key}) - not available`);
        return;
      }
      
      localStorage.removeItem(key);
      setValue(initialValue);
      console.log(`Reset data in localStorage (${key})`);
    } catch (error) {
      console.error(`Error resetting data in localStorage (${key}):`, error);
    }
  };

  return [value, setValue, resetValue];
};

/**
 * Helper to save arbitrary data to localStorage (with debouncing)
 */
export const saveToLocalStorage = <T>(key: string, data: T): void => {
  safeSaveToLocalStorage(key, data);
};

/**
 * Helper to load arbitrary data from localStorage (with circuit breaking)
 */
export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  return safeLoadFromLocalStorage(key, defaultValue);
};

/**
 * Helper to verify if a key exists in localStorage
 */
export const existsInLocalStorage = (key: string): boolean => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  return localStorage.getItem(key) !== null;
};

/**
 * Helper to clear all model data from localStorage
 */
export const clearAllModelData = (): void => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn(`Cannot clear model data - localStorage not available`);
      return;
    }
    
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
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    
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
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn(`Cannot export model data - localStorage not available`);
      return {};
    }
    
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
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn(`Cannot import model data - localStorage not available`);
      return;
    }
    
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
