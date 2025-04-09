
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePropertyState } from '@/hooks/usePropertyState';
import { useDevelopmentCosts } from '@/hooks/useDevelopmentCosts';
import { useDevelopmentTimeline } from '@/hooks/useDevelopmentTimeline';
import { useExpensesState } from '@/hooks/useExpensesState';
import { useRevenueState } from '@/hooks/useRevenueState';
import { useFinancingState } from '@/hooks/useFinancingState';
import { useDispositionState } from '@/hooks/useDispositionState';
import { useSensitivityState } from '@/hooks/useSensitivityState';
import { toast } from "sonner";

// Type definitions
type ModelContextType = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  saveModel: () => void;
  resetModel: () => void;
  property: ReturnType<typeof usePropertyState>;
  developmentCosts: ReturnType<typeof useDevelopmentCosts>;
  timeline: ReturnType<typeof useDevelopmentTimeline>;
  expenses: ReturnType<typeof useExpensesState>;
  revenue: ReturnType<typeof useRevenueState>;
  financing: ReturnType<typeof useFinancingState>;
  disposition: ReturnType<typeof useDispositionState>;
  sensitivity: ReturnType<typeof useSensitivityState>;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
  lastSaved: Date | null;
  isAutoSaving: boolean;
};

// Create the context with a default value of null
const ModelContext = createContext<ModelContextType | null>(null);

// Storage key constant
const STORAGE_KEY = 'realEstateModel';

// Create the provider component
export const ModelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>("property");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);
  
  // Initialize all section states
  const property = usePropertyState();
  const developmentCosts = useDevelopmentCosts();
  const timeline = useDevelopmentTimeline();
  const expenses = useExpensesState();
  const revenue = useRevenueState();
  const financing = useFinancingState();
  const disposition = useDispositionState();
  const sensitivity = useSensitivityState();

  // Create a function to change tabs
  const handleTabChange = (tab: string) => {
    // Auto-save when changing tabs
    saveToLocalStorage(false);
    setActiveTab(tab);
  };

  // Diagnostic logging - log when the context is first created
  console.log("ModelProvider initializing with default activeTab:", activeTab);

  // Load data from localStorage on initial load
  useEffect(() => {
    console.log("ModelProvider: Running initial localStorage load effect");
    loadFromLocalStorage();
  }, []);

  // Auto-save timer
  useEffect(() => {
    console.log("ModelProvider: Setting up auto-save effect");
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges) {
        console.log("Auto-save triggered due to unsaved changes");
        saveToLocalStorage(true);
      }
    }, 30000); // Auto-save every 30 seconds
    
    return () => clearInterval(autoSaveInterval);
  }, [hasUnsavedChanges]);

  // Load from localStorage
  const loadFromLocalStorage = () => {
    try {
      console.log("Attempting to load model data from localStorage");
      const savedModel = localStorage.getItem(STORAGE_KEY);
      if (!savedModel) {
        console.log("No saved model found in localStorage");
        return false;
      }
      
      const parsedModel = JSON.parse(savedModel);
      console.log("Loading model data:", parsedModel);
      
      // Set last saved time if available
      if (parsedModel.meta && parsedModel.meta.lastSaved) {
        setLastSaved(new Date(parsedModel.meta.lastSaved));
      }
      
      // Load property state
      if (parsedModel.property) {
        if (parsedModel.property.projectName) property.setProjectName(parsedModel.property.projectName);
        if (parsedModel.property.projectLocation) property.setProjectLocation(parsedModel.property.projectLocation);
        if (parsedModel.property.projectType) property.setProjectType(parsedModel.property.projectType);
        if (parsedModel.property.totalLandArea) property.setTotalLandArea(parsedModel.property.totalLandArea);
        
        if (parsedModel.property.spaceTypes && Array.isArray(parsedModel.property.spaceTypes)) {
          // First, clear any existing space types by recreating only what's in the saved data
          // We need to handle this differently since we don't have a direct setter
          parsedModel.property.spaceTypes.forEach((space: any, index: number) => {
            if (index === 0 && property.spaceTypes[0]) {
              // Update the first item if it exists
              Object.keys(space).forEach(key => {
                if (key !== 'id') {
                  property.updateSpaceType(property.spaceTypes[0].id, key as any, space[key]);
                }
              });
            } else {
              // Add new items as needed
              property.addSpaceType();
              if (property.spaceTypes[index]) {
                Object.keys(space).forEach(key => {
                  if (key !== 'id') {
                    property.updateSpaceType(property.spaceTypes[index].id, key as any, space[key]);
                  }
                });
              }
            }
          });
        }
        
        if (parsedModel.property.unitMixes && Array.isArray(parsedModel.property.unitMixes)) {
          // Similar approach for unit mixes
          parsedModel.property.unitMixes.forEach((unit: any, index: number) => {
            if (index === 0 && property.unitMixes[0]) {
              // Update the first item if it exists
              Object.keys(unit).forEach(key => {
                if (key !== 'id') {
                  property.updateUnitMix(property.unitMixes[0].id, key as any, unit[key]);
                }
              });
            } else {
              // Add new items as needed
              property.addUnitMix();
              if (property.unitMixes[index]) {
                Object.keys(unit).forEach(key => {
                  if (key !== 'id') {
                    property.updateUnitMix(property.unitMixes[index].id, key as any, unit[key]);
                  }
                });
              }
            }
          });
        }
      }
      
      // Load expenses data
      if (parsedModel.expenses) {
        if (parsedModel.expenses.expenseGrowthRate) expenses.setExpenseGrowthRate(parsedModel.expenses.expenseGrowthRate);
        if (parsedModel.expenses.operatingExpenseRatio) expenses.setOperatingExpenseRatio(parsedModel.expenses.operatingExpenseRatio);
        if (parsedModel.expenses.fixedExpensePercentage) expenses.setFixedExpensePercentage(parsedModel.expenses.fixedExpensePercentage);
        if (parsedModel.expenses.variableExpensePercentage) expenses.setVariableExpensePercentage(parsedModel.expenses.variableExpensePercentage);
        if (parsedModel.expenses.replacementReserves) expenses.setReplacementReserves(parsedModel.expenses.replacementReserves);
        if (parsedModel.expenses.reservesUnit) expenses.setReservesUnit(parsedModel.expenses.reservesUnit);
        if (parsedModel.expenses.expensesBeforeStabilization) expenses.setExpensesBeforeStabilization(parsedModel.expenses.expensesBeforeStabilization);
        
        if (parsedModel.expenses.expenseCategories && Array.isArray(parsedModel.expenses.expenseCategories)) {
          parsedModel.expenses.expenseCategories.forEach((expense: any, index: number) => {
            if (index === 0 && expenses.expenseCategories[0]) {
              Object.keys(expense).forEach(key => {
                if (key !== 'id') {
                  expenses.updateExpenseCategory(expenses.expenseCategories[0].id, key as any, expense[key]);
                }
              });
            } else {
              expenses.addExpenseCategory();
              if (expenses.expenseCategories[index]) {
                Object.keys(expense).forEach(key => {
                  if (key !== 'id') {
                    expenses.updateExpenseCategory(expenses.expenseCategories[index].id, key as any, expense[key]);
                  }
                });
              }
            }
          });
        }
      }
      
      // Load sensitivity data
      if (parsedModel.sensitivity) {
        if (parsedModel.sensitivity.sensitivityVariable1) sensitivity.setSensitivityVariable1(parsedModel.sensitivity.sensitivityVariable1);
        if (parsedModel.sensitivity.variable1MinRange) sensitivity.setVariable1MinRange(parsedModel.sensitivity.variable1MinRange);
        if (parsedModel.sensitivity.variable1MaxRange) sensitivity.setVariable1MaxRange(parsedModel.sensitivity.variable1MaxRange);
        if (parsedModel.sensitivity.sensitivityVariable2) sensitivity.setSensitivityVariable2(parsedModel.sensitivity.sensitivityVariable2);
        if (parsedModel.sensitivity.variable2MinRange) sensitivity.setVariable2MinRange(parsedModel.sensitivity.variable2MinRange);
        if (parsedModel.sensitivity.variable2MaxRange) sensitivity.setVariable2MaxRange(parsedModel.sensitivity.variable2MaxRange);
        if (parsedModel.sensitivity.outputMetric) sensitivity.setOutputMetric(parsedModel.sensitivity.outputMetric);
      }
      
      setHasUnsavedChanges(false);
      toast.success("Model loaded from local storage");
      console.log("Model successfully loaded from localStorage");
      
      return true;
    } catch (error) {
      console.error("Failed to load model from local storage", error);
      toast.error("Failed to load saved model");
      return false;
    }
  };

  // Save to localStorage
  const saveToLocalStorage = (isAuto: boolean = false) => {
    try {
      setIsAutoSaving(isAuto);
      const now = new Date();
      
      const modelData = {
        meta: {
          lastSaved: now.toISOString(),
          version: "1.0.0"
        },
        property: {
          projectName: property.projectName,
          projectLocation: property.projectLocation,
          projectType: property.projectType,
          totalLandArea: property.totalLandArea,
          spaceTypes: property.spaceTypes,
          unitMixes: property.unitMixes
        },
        expenses: {
          expenseGrowthRate: expenses.expenseGrowthRate,
          operatingExpenseRatio: expenses.operatingExpenseRatio,
          fixedExpensePercentage: expenses.fixedExpensePercentage,
          variableExpensePercentage: expenses.variableExpensePercentage,
          expenseCategories: expenses.expenseCategories,
          replacementReserves: expenses.replacementReserves,
          reservesUnit: expenses.reservesUnit,
          expensesBeforeStabilization: expenses.expensesBeforeStabilization
        },
        sensitivity: {
          sensitivityVariable1: sensitivity.sensitivityVariable1,
          variable1MinRange: sensitivity.variable1MinRange,
          variable1MaxRange: sensitivity.variable1MaxRange,
          sensitivityVariable2: sensitivity.sensitivityVariable2,
          variable2MinRange: sensitivity.variable2MinRange,
          variable2MaxRange: sensitivity.variable2MaxRange,
          outputMetric: sensitivity.outputMetric
        }
      };
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(modelData));
      
      // Update last saved time
      setLastSaved(now);
      setHasUnsavedChanges(false);
      
      // Verify save was successful
      const verifySave = verifyLocalStorageSave();
      
      console.log(`Model ${isAuto ? "auto-saved" : "saved"} successfully:`, modelData);
      
      // Only show toast for manual saves, not auto-saves
      if (!isAuto) {
        toast.success("Model saved successfully");
      }
      
      setTimeout(() => {
        setIsAutoSaving(false);
      }, 1000);
      
      return verifySave;
    } catch (error) {
      console.error("Failed to save model", error);
      if (!isAuto) {
        toast.error("Failed to save model");
      }
      setIsAutoSaving(false);
      return false;
    }
  };

  // Verify localStorage save was successful
  const verifyLocalStorageSave = () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (!savedData) {
        console.error("Verification failed: No data found in localStorage");
        return false;
      }
      
      // Parse the data to verify it's valid JSON
      JSON.parse(savedData);
      console.log("Verification successful: Data saved correctly to localStorage");
      return true;
    } catch (error) {
      console.error("Verification failed: Data in localStorage is invalid", error);
      return false;
    }
  };

  // Reset model data
  const resetModel = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      // Reload the page to reset all state
      window.location.reload();
      return true;
    } catch (error) {
      console.error("Failed to reset model", error);
      toast.error("Failed to reset model");
      return false;
    }
  };

  // Explicit save function
  const saveModel = () => {
    return saveToLocalStorage(false);
  };

  // Set hasUnsavedChanges to true when any relevant state changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [
    property.projectName, 
    property.projectLocation,
    property.projectType,
    property.totalLandArea,
    property.spaceTypes,
    property.unitMixes,
    expenses.expenseGrowthRate,
    expenses.operatingExpenseRatio,
    expenses.expenseCategories,
    sensitivity.sensitivityVariable1,
    sensitivity.variable1MinRange,
    sensitivity.outputMetric
    // Add more dependencies as needed
  ]);

  // Aggregate value to provide
  const contextValue: ModelContextType = {
    activeTab,
    setActiveTab: handleTabChange,
    saveModel,
    resetModel,
    property,
    developmentCosts,
    timeline,
    expenses,
    revenue,
    financing,
    disposition,
    sensitivity,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    lastSaved,
    isAutoSaving
  };

  return (
    <ModelContext.Provider value={contextValue}>
      {children}
    </ModelContext.Provider>
  );
};

// Create and export the hook with robust error handling
export const useModel = (): ModelContextType => {
  const context = useContext(ModelContext);
  if (context === null) {
    throw new Error(
      "useModel must be used within a ModelProvider. " + 
      "Make sure the ModelProvider is correctly wrapping your component tree."
    );
  }
  return context;
};
