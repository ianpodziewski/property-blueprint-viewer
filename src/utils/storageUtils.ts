
import { useState, useRef, useEffect } from 'react';

/**
 * Debouncer utility for localStorage operations
 * Prevents excessive writes by delaying operations
 */
export const debounceStorage = (() => {
  const timers: Record<string, NodeJS.Timeout> = {};
  const DEBOUNCE_DELAY = 500; // 500ms debounce
  
  return (key: string, operation: () => void): void => {
    // Clear existing timer if any
    if (timers[key]) {
      clearTimeout(timers[key]);
    }
    
    // Set new timer
    timers[key] = setTimeout(() => {
      operation();
      delete timers[key];
    }, DEBOUNCE_DELAY);
  };
})();

/**
 * Hook for debounced localStorage persistence with circuit breaker
 */
export const useDebouncedLocalStorage = <T>(
  key: string, 
  initialValue: T,
  debounceTime = 500
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] => {
  // Track initialization to prevent initial save
  const isInitializing = useRef(true);
  const lastSaveTime = useRef(0);
  const pendingValue = useRef<T | null>(null);
  const operationCount = useRef(0);
  const MAX_OPS_PER_SECOND = 5;
  
  // Use a function to initialize state from localStorage only once
  const [value, setValueInternal] = useState<T>(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return initialValue;
      }
      
      const storedValue = localStorage.getItem(key);
      if (storedValue !== null) {
        return JSON.parse(storedValue);
      }
    } catch (error) {
      console.error(`Error loading data from localStorage (${key}):`, error);
    }
    return initialValue;
  });
  
  // Custom setter that applies debouncing
  const setValue = (newValue: React.SetStateAction<T>) => {
    setValueInternal(newValue);
    pendingValue.current = typeof newValue === 'function' 
      ? null // Can't predict function result
      : newValue;
  };

  // Circuit breaker to prevent excessive localStorage operations
  const checkCircuitBreaker = (): boolean => {
    const now = Date.now();
    // Reset counter if more than a second has passed
    if (now - lastSaveTime.current > 1000) {
      operationCount.current = 0;
      lastSaveTime.current = now;
      return true;
    }
    
    // Increment counter and check threshold
    operationCount.current++;
    if (operationCount.current > MAX_OPS_PER_SECOND) {
      console.warn(`Circuit breaker triggered for key: ${key} - too many operations`);
      return false;
    }
    
    lastSaveTime.current = now;
    return true;
  };
  
  // Save to localStorage with debouncing
  useEffect(() => {
    // Skip first render and if circuit breaker is triggered
    if (isInitializing.current) {
      isInitializing.current = false;
      return;
    }
    
    // Prevent writing the same value multiple times
    if (pendingValue.current !== null && JSON.stringify(pendingValue.current) === JSON.stringify(value)) {
      return;
    }
    
    debounceStorage(key, () => {
      if (checkCircuitBreaker()) {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(key, JSON.stringify(value));
            console.log(`[Debounced] Saved to localStorage (${key})`);
          }
        } catch (error) {
          console.error(`Error saving to localStorage (${key}):`, error);
        }
      }
    });
  }, [key, value]);

  // Function to reset stored value
  const resetValue = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
        setValueInternal(initialValue);
      }
    } catch (error) {
      console.error(`Error resetting localStorage (${key}):`, error);
    }
  };

  return [value, setValue, resetValue];
};

/**
 * Enhanced localStorage getter with error handling and circuit breaker
 */
export const safeLoadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaultValue;
    }
    
    const storedValue = localStorage.getItem(key);
    if (storedValue === null) {
      return defaultValue;
    }
    
    return JSON.parse(storedValue);
  } catch (error) {
    console.error(`Error loading data from localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Enhanced localStorage setter with error handling and debouncing
 */
export const safeSaveToLocalStorage = <T>(key: string, data: T): void => {
  debounceStorage(key, () => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }
      
      if (data === undefined) {
        console.warn(`Attempted to save undefined data to localStorage (${key})`);
        return;
      }
      
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving data to localStorage (${key}):`, error);
    }
  });
};
