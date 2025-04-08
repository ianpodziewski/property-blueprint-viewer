
import { useState, useRef, useEffect } from 'react';

/**
 * Debouncer utility for localStorage operations
 * Prevents excessive writes by delaying operations
 */
export const debounceStorage = (() => {
  const timers: Record<string, NodeJS.Timeout> = {};
  const lastValues: Record<string, string> = {}; // Track last saved values
  const DEBOUNCE_DELAY = 500; // 500ms debounce
  
  return (key: string, operation: () => void, value?: any): void => {
    // Clear existing timer if any
    if (timers[key]) {
      clearTimeout(timers[key]);
    }
    
    // If value is provided, check if it's the same as the last saved value
    if (value !== undefined) {
      const valueString = JSON.stringify(value);
      if (lastValues[key] === valueString) {
        // Skip operation if value hasn't changed
        return;
      }
      lastValues[key] = valueString;
    }
    
    // Set new timer
    timers[key] = setTimeout(() => {
      operation();
      delete timers[key];
    }, DEBOUNCE_DELAY);
  };
})();

/**
 * Circuit breaker to prevent excessive localStorage operations
 */
const circuitBreaker = (() => {
  const operations: Record<string, { count: number, lastReset: number }> = {};
  const MAX_OPS_PER_SECOND = 5;
  const CIRCUIT_RESET_TIME = 1000; // 1 second
  
  return (key: string): boolean => {
    const now = Date.now();
    
    // Initialize if needed
    if (!operations[key]) {
      operations[key] = { count: 0, lastReset: now };
    }
    
    // Reset counter if more than reset time has passed
    if (now - operations[key].lastReset > CIRCUIT_RESET_TIME) {
      operations[key].count = 0;
      operations[key].lastReset = now;
    }
    
    // Increment counter and check threshold
    operations[key].count++;
    
    if (operations[key].count > MAX_OPS_PER_SECOND) {
      console.warn(`Circuit breaker triggered for key: ${key} - too many operations`);
      return false;
    }
    
    return true;
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
  const valueRef = useRef<T>(initialValue);
  const prevValueStringRef = useRef<string | null>(null);
  
  // Use a function to initialize state from localStorage only once
  const [value, setValueInternal] = useState<T>(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return initialValue;
      }
      
      const storedValue = localStorage.getItem(key);
      if (storedValue !== null) {
        const parsed = JSON.parse(storedValue);
        valueRef.current = parsed;
        prevValueStringRef.current = storedValue;
        return parsed;
      }
    } catch (error) {
      console.error(`Error loading data from localStorage (${key}):`, error);
    }
    return initialValue;
  });
  
  // Custom setter that applies debouncing
  const setValue = (newValue: React.SetStateAction<T>) => {
    setValueInternal(prevValue => {
      const resolvedValue = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(prevValue)
        : newValue;
      
      valueRef.current = resolvedValue;
      pendingValue.current = resolvedValue;
      return resolvedValue;
    });
  };

  // Circuit breaker to prevent excessive localStorage operations
  const checkCircuitBreaker = (): boolean => {
    return circuitBreaker(key);
  };
  
  // Save to localStorage with debouncing
  useEffect(() => {
    // Skip first render and if circuit breaker is triggered
    if (isInitializing.current) {
      isInitializing.current = false;
      return;
    }
    
    // Convert current value to string for comparison
    const valueString = JSON.stringify(value);
    
    // Skip if value hasn't changed
    if (prevValueStringRef.current === valueString) {
      return;
    }
    
    prevValueStringRef.current = valueString;
    
    // Use debounced storage with value comparison
    debounceStorage(key, () => {
      if (checkCircuitBreaker()) {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(key, valueString);
            console.log(`[Debounced] Saved to localStorage (${key})`);
          }
        } catch (error) {
          console.error(`Error saving to localStorage (${key}):`, error);
        }
      }
    }, value);
  }, [key, value]);

  // Function to reset stored value
  const resetValue = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
        setValueInternal(initialValue);
        valueRef.current = initialValue;
        prevValueStringRef.current = null;
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
  const dataString = JSON.stringify(data);
  const storageKey = `lastValue_${key}`;
  
  // Check if we're trying to save the same value
  if (typeof window !== 'undefined' && window.localStorage) {
    const lastValue = localStorage.getItem(storageKey);
    if (lastValue === dataString) {
      return; // Skip saving the same value
    }
    
    // Update last value tracking
    try {
      localStorage.setItem(storageKey, dataString);
    } catch (e) {
      // If we can't track last value, just continue
    }
  }
  
  debounceStorage(key, () => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }
      
      if (data === undefined) {
        console.warn(`Attempted to save undefined data to localStorage (${key})`);
        return;
      }
      
      if (circuitBreaker(key)) {
        localStorage.setItem(key, dataString);
      }
    } catch (error) {
      console.error(`Error saving data to localStorage (${key}):`, error);
    }
  });
};

