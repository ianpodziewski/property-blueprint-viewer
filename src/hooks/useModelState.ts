
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
  
  // Get property state just once, avoid dependency
  const propertyState = useProperty();
  
  // Safely get other state without creating re-render dependencies
  const developmentCostsState = useMemo(() => useDevelopmentCosts(), []);
  const timelineState = useMemo(() => useDevelopmentTimeline(), []);
  const expensesState = useMemo(() => useExpensesState(), []);
  const revenueState = useMemo(() => useRevenueState(), []);
  const financingState = useMemo(() => useFinancingState(), []);
  const dispositionState = useMemo(() => useDispositionState(), []);
  const sensitivityState = useMemo(() => useSensitivityState(), []);
  
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
      
      // Reset all state objects that have resetAllData method using setTimeout
      // to break any potential render loops
      setTimeout(() => {
        if (propertyState.resetAllData) propertyState.resetAllData();
      }, 10);
      
      setTimeout(() => {
        if (developmentCostsState.resetAllData) developmentCostsState.resetAllData();
      }, 20);
      
      setTimeout(() => {
        if (timelineState.resetAllData) timelineState.resetAllData();
      }, 30);
      
      setTimeout(() => {
        if (expensesState.resetAllData) expensesState.resetAllData();
      }, 40);
      
      setTimeout(() => {
        if (revenueState.resetAllData) revenueState.resetAllData();
      }, 50);
      
      setTimeout(() => {
        if (financingState.resetAllData) financingState.resetAllData();
      }, 60);
      
      setTimeout(() => {
        if (dispositionState.resetAllData) dispositionState.resetAllData();
      }, 70);
      
      setTimeout(() => {
        if (sensitivityState.resetAllData) sensitivityState.resetAllData();
      }, 80);
      
      if (isMounted.current) {
        setSaveStatus('reset');
      }
      
      // Reset the render counter
      resetCount();
    }, 0);
  }, []);
  
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
      developmentCosts: developmentCostsState,
      timeline: timelineState,
      expenses: expensesState,
      revenue: revenueState,
      financing: financingState,
      disposition: dispositionState,
      sensitivity: sensitivityState,
      
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
    developmentCosts: developmentCostsState,
    timeline: timelineState,
    expenses: expensesState,
    revenue: revenueState,
    financing: financingState,
    disposition: dispositionState,
    sensitivity: sensitivityState,
    
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
