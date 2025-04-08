
import { useState, useEffect, useCallback } from 'react';
import { saveToLocalStorage, loadFromLocalStorage } from './useLocalStoragePersistence';
import { useToast } from '@/components/ui/use-toast';

export interface StorageVersion<T> {
  data: T;
  timestamp: number;
  version: number;
}

/**
 * A more robust hook for persisting state to localStorage with versioning and error recovery
 */
export function useSafeStorage<T>(
  key: string,
  initialValue: T,
  validate?: (data: any) => boolean
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
  const [value, setValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedValue = localStorage.getItem(key);
      
      if (storedValue !== null) {
        // Try to parse as versioned data
        const parsed = JSON.parse(storedValue);
        
        // Check if the data is in versioned format
        if (parsed && parsed.data && parsed.version !== undefined) {
          // If we have validation, use it
          if (validate && !validate(parsed.data)) {
            console.warn(`Validation failed for stored data (${key}), using initial value`);
            setValue(initialValue);
          } else {
            setValue(parsed.data);
          }
        } else {
          // Legacy format - just use the data directly
          if (validate && !validate(parsed)) {
            console.warn(`Validation failed for stored data (${key}), using initial value`);
            setValue(initialValue);
          } else {
            setValue(parsed);
          }
        }
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error(`Error loading data from localStorage (${key}):`, error);
      toast({
        title: "Error",
        description: `Failed to load saved data. Starting with default values.`,
        variant: "destructive",
      });
      setIsInitialized(true);
    }
  }, [key, initialValue, toast, validate]);

  // Save to localStorage whenever value changes
  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      // Store as versioned data
      const versionedData: StorageVersion<T> = {
        data: value,
        timestamp: Date.now(),
        version: 1 // Increment this when we make breaking changes to the data structure
      };
      
      localStorage.setItem(key, JSON.stringify(versionedData));
    } catch (error) {
      console.error(`Error saving data to localStorage (${key}):`, error);
      toast({
        title: "Warning",
        description: "Failed to save your changes to local storage.",
        variant: "destructive",
      });
    }
  }, [key, value, isInitialized, toast]);

  // Function to reset stored value
  const resetValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setValue(initialValue);
    } catch (error) {
      console.error(`Error resetting data in localStorage (${key}):`, error);
    }
  }, [key, initialValue]);

  return [value, setValue, resetValue];
}

/**
 * Helper to safely save data to localStorage with versioning
 */
export const safeSaveToLocalStorage = <T,>(key: string, data: T): void => {
  try {
    const versionedData: StorageVersion<T> = {
      data,
      timestamp: Date.now(),
      version: 1
    };
    
    localStorage.setItem(key, JSON.stringify(versionedData));
  } catch (error) {
    console.error(`Error saving data to localStorage (${key}):`, error);
  }
};

/**
 * Helper to safely load data from localStorage with versioning
 */
export const safeLoadFromLocalStorage = <T,>(key: string, defaultValue: T, validate?: (data: any) => boolean): T => {
  try {
    const storedValue = localStorage.getItem(key);
    
    if (storedValue === null) {
      return defaultValue;
    }
    
    // Try to parse as versioned data
    const parsed = JSON.parse(storedValue);
    
    // Check if the data is in versioned format
    if (parsed && parsed.data && parsed.version !== undefined) {
      // If we have validation, use it
      if (validate && !validate(parsed.data)) {
        console.warn(`Validation failed for stored data (${key}), using default value`);
        return defaultValue;
      }
      return parsed.data;
    } else {
      // Legacy format - just use the data directly
      if (validate && !validate(parsed)) {
        console.warn(`Validation failed for stored data (${key}), using default value`);
        return defaultValue;
      }
      return parsed;
    }
  } catch (error) {
    console.error(`Error loading data from localStorage (${key}):`, error);
    return defaultValue;
  }
};
