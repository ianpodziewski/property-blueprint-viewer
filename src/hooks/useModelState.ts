
import { useState, useCallback } from "react";
import { usePropertyState } from "./usePropertyState";
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
  
  const propertyState = usePropertyState();
  const developmentCostsState = useDevelopmentCosts();
  const timelineState = useDevelopmentTimeline();
  const expensesState = useExpensesState();
  const revenueState = useRevenueState();
  const financingState = useFinancingState();
  const dispositionState = useDispositionState();
  const sensitivityState = useSensitivityState();
  
  // Reset all data in localStorage
  const resetAllData = useCallback(() => {
    clearAllModelData();
    // Reset all state objects
    propertyState.resetAllData && propertyState.resetAllData();
    developmentCostsState.resetAllData && developmentCostsState.resetAllData();
    timelineState.resetAllData && timelineState.resetAllData();
    expensesState.resetAllData && expensesState.resetAllData();
    revenueState.resetAllData && revenueState.resetAllData();
    financingState.resetAllData && financingState.resetAllData();
    dispositionState.resetAllData && dispositionState.resetAllData();
    sensitivityState.resetAllData && sensitivityState.resetAllData();
    
    setSaveStatus('reset');
  }, [
    propertyState, developmentCostsState, timelineState, expensesState, 
    revenueState, financingState, dispositionState, sensitivityState
  ]);
  
  // Clear save status notification
  const clearSaveStatus = useCallback(() => {
    setSaveStatus(null);
  }, []);

  // Master handlers
  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, 
    setter: (value: string) => void
  ) => {
    setter(e.target.value);
    setSaveStatus('saved');
  };
  
  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    setter: (value: string) => void, 
    min: number = 0, 
    max?: number
  ) => {
    const value = e.target.value;
    // Allow empty string or valid numbers within range
    if (value === '') {
      setter(value);
      setSaveStatus('saved');
    } else {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue >= min && (max === undefined || numValue <= max)) {
        setter(value);
        setSaveStatus('saved');
      }
    }
  };
  
  const handlePercentageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void
  ) => {
    handleNumberChange(e, setter, 0, 100);
  };
  
  const handleSelectChange = (
    value: string, 
    setter: (value: string) => void
  ) => {
    setter(value);
    setSaveStatus('saved');
  };
  
  const handleBooleanChange = (
    value: boolean,
    setter: (value: boolean) => void
  ) => {
    setter(value);
    setSaveStatus('saved');
  };
  
  const handleDateChange = (
    date: Date | undefined,
    setter: (date: Date | undefined) => void
  ) => {
    setter(date);
    setSaveStatus('saved');
  };
  
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
