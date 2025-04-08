import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useProperty } from "@/contexts/PropertyContext";
import { useDevelopmentCosts } from "./useDevelopmentCosts";
import { useDevelopmentTimeline } from "./useDevelopmentTimeline";
import { useExpensesState } from "./useExpensesState";
import { useRevenueState } from "./useRevenueState";
import { useFinancingState } from "./useFinancingState";
import { useDispositionState } from "./useDispositionState";
import { useSensitivityState } from "./useSensitivityState";
import { clearAllModelData } from "./useLocalStoragePersistence";
import { useRenderDebugger } from "./useRenderDebugger";

// This is a master hook that combines all the section hooks
export const useModelState = () => {
  // Debug render cycles to catch infinite loops
  const { resetCount, isLoopDetected } = useRenderDebugger("useModelState", {}, 15, true);
  
  const [saveStatus, setSaveStatus] = useState<'saved' | 'error' | 'reset' | null>(null);
  const saveStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);
  const lastUpdateTime = useRef(Date.now());
  const debounceDelay = 500; // ms between allowed state updates
  const sectionStates = useRef<any>({});
  
  // Safe initialization of property state
  const propertyState = useMemo(() => {
    try {
      return useProperty();
    } catch (error) {
      console.error("Error initializing property state:", error);
      return {};
    }
  }, []);
  
  // Initialize other state sections only once to avoid re-renders
  useEffect(() => {
    try {
      sectionStates.current = {
        developmentCosts: useDevelopmentCosts(),
        timeline: useDevelopmentTimeline(),
        expenses: useExpensesState(),
        revenue: useRevenueState(),
        financing: useFinancingState(),
        disposition: useDispositionState(),
        sensitivity: useSensitivityState()
      };
    } catch (error) {
      console.error("Error initializing section states:", error);
    }
  }, []);
  
  // Set up cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (saveStatusTimeoutRef.current) {
        clearTimeout(saveStatusTimeoutRef.current);
      }
    };
  }, []); // Empty dependency array - run only on mount/unmount
  
  // Reset all data in localStorage with circuit breaker
  const resetAllData = useCallback(() => {
    // Implement a timeout to break potential loops
    setTimeout(() => {
      clearAllModelData();
      
      // Function to safely reset a section
      const safeReset = (section: string, delay: number) => {
        setTimeout(() => {
          try {
            const state = section === 'property' ? propertyState : sectionStates.current[section];
            if (state && typeof state.resetAllData === 'function') {
              state.resetAllData();
            }
          } catch (error) {
            console.error(`Error resetting ${section} state:`, error);
          }
        }, delay);
      };
      
      // Reset all sections with delays to prevent loop
      safeReset('property', 10);
      safeReset('developmentCosts', 20);
      safeReset('timeline', 30);
      safeReset('expenses', 40);
      safeReset('revenue', 50);
      safeReset('financing', 60);
      safeReset('disposition', 70);
      safeReset('sensitivity', 80);
      
      if (isMounted.current) {
        setSaveStatus('reset');
      }
      
      // Reset the render counter
      resetCount();
    }, 0);
  }, [resetCount]);
  
  // Clear save status notification with auto-clear timer
  const clearSaveStatus = useCallback(() => {
    if (isMounted.current) {
      setSaveStatus(null);
    }
  }, []);
  
  // Auto-clear save status after a delay
  useEffect(() => {
    if (saveStatus) {
      if (saveStatusTimeoutRef.current) {
        clearTimeout(saveStatusTimeoutRef.current);
      }
      
      saveStatusTimeoutRef.current = setTimeout(() => {
        if (isMounted.current) {
          setSaveStatus(null);
        }
      }, 3000);
    }
    
    return () => {
      if (saveStatusTimeoutRef.current) {
        clearTimeout(saveStatusTimeoutRef.current);
      }
    };
  }, [saveStatus]);

  // Helper function to check debounce
  const shouldDebounce = useCallback(() => {
    const now = Date.now();
    if (now - lastUpdateTime.current < debounceDelay) {
      return true;
    }
    lastUpdateTime.current = now;
    return false;
  }, []);
  
  // Break render loops if detected
  if (isLoopDetected) {
    console.warn("Loop detected in useModelState, cancelling render cycle");
    return {
      property: propertyState,
      developmentCosts: sectionStates.current.developmentCosts || {},
      timeline: sectionStates.current.timeline || {},
      expenses: sectionStates.current.expenses || {},
      revenue: sectionStates.current.revenue || {},
      financing: sectionStates.current.financing || {},
      disposition: sectionStates.current.disposition || {},
      sensitivity: sectionStates.current.sensitivity || {},
      
      // Provide safe dummy handlers that do nothing
      handleTextChange: () => {},
      handleNumberChange: () => {},
      handlePercentageChange: () => {},
      handleSelectChange: () => {},
      handleBooleanChange: () => {},
      handleDateChange: () => {},
      
      // Data persistence
      saveStatus,
      clearSaveStatus,
      resetAllData
    };
  }

  // Master handlers with strong debounce for state updates
  const handleTextChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, 
    setter: (value: string) => void
  ) => {
    // Skip updates during excessive re-renders
    if (shouldDebounce()) return;
    
    setter(e.target.value);
    if (isMounted.current) {
      setSaveStatus('saved');
    }
  }, [shouldDebounce]);
  
  const handleNumberChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement>, 
    setter: (value: string) => void, 
    min: number = 0, 
    max?: number
  ) => {
    // Skip updates during excessive re-renders
    if (shouldDebounce()) return;
    
    const value = e.target.value;
    // Allow empty string or valid numbers within range
    if (value === '') {
      setter(value);
      if (isMounted.current) {
        setSaveStatus('saved');
      }
    } else {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue >= min && (max === undefined || numValue <= max)) {
        setter(value);
        if (isMounted.current) {
          setSaveStatus('saved');
        }
      }
    }
  }, [shouldDebounce]);
  
  const handlePercentageChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void
  ) => {
    handleNumberChange(e, setter, 0, 100);
  }, [handleNumberChange]);
  
  const handleSelectChange = useCallback((
    value: string, 
    setter: (value: string) => void
  ) => {
    // Skip updates during excessive re-renders
    if (shouldDebounce()) return;
    
    setter(value);
    if (isMounted.current) {
      setSaveStatus('saved');
    }
  }, [shouldDebounce]);
  
  const handleBooleanChange = useCallback((
    value: boolean,
    setter: (value: boolean) => void
  ) => {
    // Skip updates during excessive re-renders
    if (shouldDebounce()) return;
    
    setter(value);
    if (isMounted.current) {
      setSaveStatus('saved');
    }
  }, [shouldDebounce]);
  
  const handleDateChange = useCallback((
    date: Date | undefined,
    setter: (date: Date | undefined) => void
  ) => {
    // Skip updates during excessive re-renders
    if (shouldDebounce()) return;
    
    setter(date);
    if (isMounted.current) {
      setSaveStatus('saved');
    }
  }, [shouldDebounce]);
  
  return {
    property: propertyState,
    developmentCosts: sectionStates.current.developmentCosts || {},
    timeline: sectionStates.current.timeline || {},
    expenses: sectionStates.current.expenses || {},
    revenue: sectionStates.current.revenue || {},
    financing: sectionStates.current.financing || {},
    disposition: sectionStates.current.disposition || {},
    sensitivity: sectionStates.current.sensitivity || {},
    
    // Common handlers
    handleTextChange,
    handleNumberChange,
    handlePercentageChange,
    handleSelectChange,
    handleBooleanChange,
    handleDateChange,
    
    // Data persistence
    saveStatus,
    clearSaveStatus,
    resetAllData
  };
};

function handleSelectChange(value: string, setter: (value: string) => void) {
  setter(value);
}

function handleBooleanChange(value: boolean, setter: (value: boolean) => void) {
  setter(value);
}

function handleDateChange(date: Date | undefined, setter: (date: Date | undefined) => void) {
  setter(date);
}
