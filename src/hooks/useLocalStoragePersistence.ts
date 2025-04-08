
import { useState, useEffect, useRef } from 'react';

type StorageValue<T> = T | null;

// Centralized storage manager to batch operations
const StorageManager = {
  operationQueue: [] as Array<{ key: string, value: any, operation: 'set' | 'remove' }>,
  lastOperationTime: 0,
  minOperationDelay: 2000, // Minimum 2 seconds between storage write batches
  isProcessing: false,
  
  // Queue a storage operation
  queueOperation(key: string, value: any, operation: 'set' | 'remove') {
    // Replace any existing operations for the same key
    this.operationQueue = this.operationQueue.filter(op => op.key !== key);
    this.operationQueue.push({ key, value, operation });
    this.processQueue();
  },
  
  // Set value with batching
  setItem(key: string, value: any) {
    this.queueOperation(key, value, 'set');
  },
  
  // Remove value with batching
  removeItem(key: string) {
    this.queueOperation(key, null, 'remove');
  },
  
  // Get item (not batched/queued)
  getItem<T>(key: string, defaultValue: T): T {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
      console.error(`Error loading data from localStorage (${key}):`, error);
      return defaultValue;
    }
  },
  
  // Process the operation queue with throttling
  processQueue() {
    if (this.isProcessing || this.operationQueue.length === 0) {
      return;
    }
    
    const now = Date.now();
    const timeSinceLastOperation = now - this.lastOperationTime;
    
    if (timeSinceLastOperation < this.minOperationDelay) {
      // Schedule processing for later
      setTimeout(() => this.processQueue(), this.minOperationDelay - timeSinceLastOperation);
      return;
    }
    
    this.isProcessing = true;
    
    try {
      console.log(`Processing ${this.operationQueue.length} storage operations`);
      
      // Execute all queued operations
      this.operationQueue.forEach(({ key, value, operation }) => {
        try {
          if (operation === 'set') {
            localStorage.setItem(key, JSON.stringify(value));
          } else if (operation === 'remove') {
            localStorage.removeItem(key);
          }
        } catch (error) {
          console.error(`Error in storage operation for key ${key}:`, error);
        }
      });
      
      // Clear the queue
      this.operationQueue = [];
      this.lastOperationTime = now;
    } catch (error) {
      console.error("Error processing storage queue:", error);
    } finally {
      this.isProcessing = false;
    }
  },
  
  // Clear all operations for a specific key pattern
  clearOperationsForPattern(pattern: string) {
    this.operationQueue = this.operationQueue.filter(op => !op.key.includes(pattern));
  }
};

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
  const isMounted = useRef(true);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Load from localStorage on mount only once
  useEffect(() => {
    isMounted.current = true;
    
    // Use setTimeout to break potential render loops
    setTimeout(() => {
      try {
        // Synchronously load from localStorage once on mount
        const loadedValue = StorageManager.getItem<T>(key, initialValue);
        if (isMounted.current && JSON.stringify(loadedValue) !== JSON.stringify(initialValue)) {
          setValue(loadedValue);
        }
        if (isMounted.current) {
          setIsInitialized(true);
        }
      } catch (error) {
        console.error(`Error loading data from localStorage (${key}):`, error);
        if (isMounted.current) {
          setIsInitialized(true);
        }
      }
    }, 0);
    
    return () => {
      isMounted.current = false;
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, []); // Only run on mount
  
  // Save to localStorage with heavy debouncing
  useEffect(() => {
    // Skip first render and initializing state
    if (!isInitialized) {
      return;
    }
    
    // Clear any pending save timer
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }
    
    // Set a new save timer with significant debounce
    saveTimer.current = setTimeout(() => {
      if (isMounted.current) {
        try {
          StorageManager.setItem(key, value);
        } catch (error) {
          console.error(`Error saving data to localStorage (${key}):`, error);
        }
      }
    }, 1000); // Substantial debounce period
    
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [key, value, isInitialized]);

  // Function to reset stored value
  const resetValue = () => {
    try {
      StorageManager.removeItem(key);
      setValue(initialValue);
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
  StorageManager.setItem(key, data);
};

/**
 * Helper to load arbitrary data from localStorage
 */
export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  return StorageManager.getItem(key, defaultValue);
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
    modelKeys.forEach(key => StorageManager.removeItem(key));
    
    // Also clear any pending operations for model keys
    StorageManager.clearOperationsForPattern('realEstateModel_');
    
    console.log('All model data cleared from localStorage');
  } catch (error) {
    console.error('Error clearing model data from localStorage:', error);
  }
};
