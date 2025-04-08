
import { useState, useCallback } from "react";
import { usePropertyState } from "./usePropertyState";
import { useDevelopmentCosts } from "./useDevelopmentCosts";
import { useDevelopmentTimeline } from "./useDevelopmentTimeline";
import { useExpensesState } from "./useExpensesState";
import { useRevenueState } from "./useRevenueState";
import { useFinancingState } from "./useFinancingState";
import { useDispositionState } from "./useDispositionState";
import { useSensitivityState } from "./useSensitivityState";
import { clearAllModelData, exportAllModelData, importAllModelData } from "./useLocalStoragePersistence";

// This is a master hook that combines all the section hooks
export const useModelState = () => {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'error' | 'reset' | 'exported' | 'imported' | null>(null);
  
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
    
    // Force page refresh to ensure all components reload with the reset data
    window.location.reload();
  }, [
    propertyState, developmentCostsState, timelineState, expensesState, 
    revenueState, financingState, dispositionState, sensitivityState
  ]);
  
  // Export all data from localStorage
  const exportAllData = useCallback(() => {
    const data = exportAllModelData();
    const dataStr = JSON.stringify(data, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `real-estate-model-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSaveStatus('exported');
    setTimeout(() => clearSaveStatus(), 3000);
  }, []);
  
  // Import data to localStorage
  const importAllData = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        importAllModelData(data);
        setSaveStatus('imported');
        
        // Force page refresh to reload with the imported data
        window.location.reload();
      } catch (error) {
        console.error('Error parsing import data:', error);
        setSaveStatus('error');
      }
    };
    reader.readAsText(file);
  }, []);
  
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
    resetAllData,
    exportAllData,
    importAllData
  };
};
