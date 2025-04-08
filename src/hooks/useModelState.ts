
import { useState, useCallback, useEffect, useRef } from "react";
import { useProperty } from "@/contexts/PropertyContext";
import { useDevelopmentCosts } from "./useDevelopmentCosts";
import { useDevelopmentTimeline } from "./useDevelopmentTimeline";
import { useExpensesState } from "./useExpensesState";
import { useRevenueState } from "./useRevenueState";
import { useFinancingState } from "./useFinancingState";
import { useDispositionState } from "./useDispositionState";
import { useSensitivityState } from "./useSensitivityState";
import { clearAllModelData } from "./useLocalStoragePersistence";

// This is a master hook that combines all the section hooks
export const useModelState = () => {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'error' | 'reset' | null>(null);
  const saveStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);
  
  const propertyState = useProperty();
  const developmentCostsState = useDevelopmentCosts();
  const timelineState = useDevelopmentTimeline();
  const expensesState = useExpensesState();
  const revenueState = useRevenueState();
  const financingState = useFinancingState();
  const dispositionState = useDispositionState();
  const sensitivityState = useSensitivityState();
  
  // Set up cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (saveStatusTimeoutRef.current) {
        clearTimeout(saveStatusTimeoutRef.current);
      }
    };
  }, []);
  
  // Reset all data in localStorage
  const resetAllData = useCallback(() => {
    clearAllModelData();
    // Reset all state objects that have resetAllData method
    if (propertyState.resetAllData) propertyState.resetAllData();
    if (developmentCostsState.resetAllData) developmentCostsState.resetAllData();
    if (timelineState.resetAllData) timelineState.resetAllData();
    if (expensesState.resetAllData) expensesState.resetAllData();
    if (revenueState.resetAllData) revenueState.resetAllData();
    if (financingState.resetAllData) financingState.resetAllData();
    if (dispositionState.resetAllData) dispositionState.resetAllData();
    if (sensitivityState.resetAllData) sensitivityState.resetAllData();
    
    setSaveStatus('reset');
  }, [
    propertyState, developmentCostsState, timelineState, expensesState, 
    revenueState, financingState, dispositionState, sensitivityState
  ]);
  
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

  // Master handlers with debounce for state updates
  const handleTextChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, 
    setter: (value: string) => void
  ) => {
    setter(e.target.value);
    if (isMounted.current) {
      setSaveStatus('saved');
    }
  }, []);
  
  const handleNumberChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement>, 
    setter: (value: string) => void, 
    min: number = 0, 
    max?: number
  ) => {
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
  }, []);
  
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
    setter(value);
    if (isMounted.current) {
      setSaveStatus('saved');
    }
  }, []);
  
  const handleBooleanChange = useCallback((
    value: boolean,
    setter: (value: boolean) => void
  ) => {
    setter(value);
    if (isMounted.current) {
      setSaveStatus('saved');
    }
  }, []);
  
  const handleDateChange = useCallback((
    date: Date | undefined,
    setter: (date: Date | undefined) => void
  ) => {
    setter(date);
    if (isMounted.current) {
      setSaveStatus('saved');
    }
  }, []);
  
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
