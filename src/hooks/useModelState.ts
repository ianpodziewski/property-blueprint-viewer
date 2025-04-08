
import { useState, useCallback, useRef, useEffect } from "react";
import { usePropertyState } from "./usePropertyState";
import { useDevelopmentCosts } from "./useDevelopmentCosts";
import { useDevelopmentTimeline } from "./useDevelopmentTimeline";
import { useExpensesState } from "./useExpensesState";
import { useRevenueState } from "./useRevenueState";
import { useFinancingState } from "./useFinancingState";
import { useDispositionState } from "./useDispositionState";
import { useSensitivityState } from "./useSensitivityState";
import { clearAllModelData, exportAllModelData, importAllModelData } from "./useLocalStoragePersistence";
import { unstable_batchedUpdates } from "react-dom";
import { useToast } from "@/hooks/use-toast";

// This is a master hook that combines all the section hooks
export const useModelState = () => {
  // Use a ref to track save operations to prevent notification spam
  const saveOperationRef = useRef<{timeout: NodeJS.Timeout | null, lastOperation: string | null}>({
    timeout: null,
    lastOperation: null
  });
  
  const [saveStatus, setSaveStatus] = useState<'saved' | 'error' | 'reset' | 'exported' | 'imported' | null>(null);
  const { toast } = useToast();
  
  // Create stable refs to all state objects to prevent recursive updates
  const propertyState = usePropertyState();
  const developmentCostsState = useDevelopmentCosts();
  const timelineState = useDevelopmentTimeline();
  const expensesState = useExpensesState();
  const revenueState = useRevenueState();
  const financingState = useFinancingState();
  const dispositionState = useDispositionState();
  const sensitivityState = useSensitivityState();
  
  // Centralized save status management with debouncing
  const updateSaveStatus = useCallback((status: 'saved' | 'error' | 'reset' | 'exported' | 'imported') => {
    // Prevent duplicate notifications for the same operation
    if (saveOperationRef.current.lastOperation === status) {
      // Just extend the timeout
      if (saveOperationRef.current.timeout) {
        clearTimeout(saveOperationRef.current.timeout);
      }
    } else {
      // Show notification for new operation
      setSaveStatus(status);
      
      // Track last operation
      saveOperationRef.current.lastOperation = status;
      
      // Show toast for important operations
      if (status === 'exported' || status === 'imported' || status === 'reset') {
        const messages = {
          exported: "Data successfully exported",
          imported: "Data successfully imported",
          reset: "All data has been reset"
        };
        
        toast({
          title: messages[status],
          duration: 3000,
        });
      }
    }
    
    // Set timeout to clear status
    saveOperationRef.current.timeout = setTimeout(() => {
      setSaveStatus(null);
      saveOperationRef.current.lastOperation = null;
      saveOperationRef.current.timeout = null;
    }, 3000);
  }, [toast]);
  
  // Clear notification on component unmount
  useEffect(() => {
    return () => {
      if (saveOperationRef.current.timeout) {
        clearTimeout(saveOperationRef.current.timeout);
      }
    };
  }, []);
  
  // Reset all data in localStorage
  const resetAllData = useCallback(() => {
    clearAllModelData();
    
    // Batch updates to prevent cascading re-renders
    unstable_batchedUpdates(() => {
      // Reset all state objects that have resetAllData method
      if (propertyState.resetAllData) propertyState.resetAllData();
      if (developmentCostsState.resetAllData) developmentCostsState.resetAllData();
      if (timelineState.resetAllData) timelineState.resetAllData();
      if (expensesState.resetAllData) expensesState.resetAllData();
      if (revenueState.resetAllData) revenueState.resetAllData();
      if (financingState.resetAllData) financingState.resetAllData();
      if (dispositionState.resetAllData) dispositionState.resetAllData();
      if (sensitivityState.resetAllData) sensitivityState.resetAllData();
      
      updateSaveStatus('reset');
    });
    
    // Force page refresh to ensure all components reload with the reset data
    window.location.reload();
  }, [
    propertyState, developmentCostsState, timelineState, expensesState, 
    revenueState, financingState, dispositionState, sensitivityState,
    updateSaveStatus
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
    
    updateSaveStatus('exported');
  }, [updateSaveStatus]);
  
  // Import data to localStorage
  const importAllData = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        importAllModelData(data);
        updateSaveStatus('imported');
        
        // Force page refresh to reload with the imported data
        window.location.reload();
      } catch (error) {
        console.error('Error parsing import data:', error);
        updateSaveStatus('error');
        
        toast({
          title: "Import Error",
          description: "Failed to import data. The file may be corrupted.",
          variant: "destructive",
          duration: 5000,
        });
      }
    };
    reader.readAsText(file);
  }, [updateSaveStatus, toast]);
  
  // Clear save status notification
  const clearSaveStatus = useCallback(() => {
    setSaveStatus(null);
    if (saveOperationRef.current.timeout) {
      clearTimeout(saveOperationRef.current.timeout);
      saveOperationRef.current.timeout = null;
    }
    saveOperationRef.current.lastOperation = null;
  }, []);

  // Debounced version of setSaveStatus
  const debouncedSetSaveStatus = useCallback((status: 'saved') => {
    // Skip if we're already showing a more important status
    if (saveStatus === 'error' || saveStatus === 'reset' || 
        saveStatus === 'exported' || saveStatus === 'imported') {
      return;
    }
    
    updateSaveStatus(status);
  }, [saveStatus, updateSaveStatus]);

  // Master handlers with batched updates
  const handleTextChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, 
    setter: (value: string) => void
  ) => {
    setter(e.target.value);
    debouncedSetSaveStatus('saved');
  }, [debouncedSetSaveStatus]);
  
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
      debouncedSetSaveStatus('saved');
    } else {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue >= min && (max === undefined || numValue <= max)) {
        setter(value);
        debouncedSetSaveStatus('saved');
      }
    }
  }, [debouncedSetSaveStatus]);
  
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
    debouncedSetSaveStatus('saved');
  }, [debouncedSetSaveStatus]);
  
  const handleBooleanChange = useCallback((
    value: boolean,
    setter: (value: boolean) => void
  ) => {
    setter(value);
    debouncedSetSaveStatus('saved');
  }, [debouncedSetSaveStatus]);
  
  const handleDateChange = useCallback((
    date: Date | undefined,
    setter: (date: Date | undefined) => void
  ) => {
    setter(date);
    debouncedSetSaveStatus('saved');
  }, [debouncedSetSaveStatus]);
  
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
