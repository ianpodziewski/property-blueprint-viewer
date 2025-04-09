
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
import { debounce } from 'lodash';

// Storage key constant
const STORAGE_KEY = 'realEstateModel';

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

  // Create a debounced save function
  const debouncedSave = debounce(() => {
    if (hasUnsavedChanges) {
      console.log("Debounced save triggered due to unsaved changes");
      saveToLocalStorage(true);
    }
  }, 2000);

  // Auto-save timer
  useEffect(() => {
    console.log("ModelProvider: Setting up auto-save effect");
    
    // Call debounced save when hasUnsavedChanges changes
    debouncedSave();
    
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges) {
        console.log("Auto-save triggered due to unsaved changes");
        saveToLocalStorage(true);
      }
    }, 30000); // Auto-save every 30 seconds
    
    return () => {
      clearInterval(autoSaveInterval);
      debouncedSave.cancel();
    };
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
          // First clear any existing space types beyond the first one
          while (property.spaceTypes.length > 1) {
            property.removeSpaceType(property.spaceTypes[property.spaceTypes.length - 1].id);
          }
          
          // Update the first item if it exists
          if (property.spaceTypes[0] && parsedModel.property.spaceTypes[0]) {
            property.updateSpaceType(property.spaceTypes[0].id, "type", parsedModel.property.spaceTypes[0].type || "");
            property.updateSpaceType(property.spaceTypes[0].id, "squareFootage", parsedModel.property.spaceTypes[0].squareFootage || "");
            property.updateSpaceType(property.spaceTypes[0].id, "units", parsedModel.property.spaceTypes[0].units || "");
            property.updateSpaceType(property.spaceTypes[0].id, "phase", parsedModel.property.spaceTypes[0].phase || "");
          }
          
          // Add additional items
          for (let i = 1; i < parsedModel.property.spaceTypes.length; i++) {
            const space = parsedModel.property.spaceTypes[i];
            property.addSpaceType();
            const newSpace = property.spaceTypes[property.spaceTypes.length - 1];
            if (newSpace) {
              property.updateSpaceType(newSpace.id, "type", space.type || "");
              property.updateSpaceType(newSpace.id, "squareFootage", space.squareFootage || "");
              property.updateSpaceType(newSpace.id, "units", space.units || "");
              property.updateSpaceType(newSpace.id, "phase", space.phase || "");
            }
          }
        }
        
        if (parsedModel.property.unitMixes && Array.isArray(parsedModel.property.unitMixes)) {
          // First clear any existing unit mixes beyond the first one
          while (property.unitMixes.length > 1) {
            property.removeUnitMix(property.unitMixes[property.unitMixes.length - 1].id);
          }
          
          // Update the first item if it exists
          if (property.unitMixes[0] && parsedModel.property.unitMixes[0]) {
            property.updateUnitMix(property.unitMixes[0].id, "type", parsedModel.property.unitMixes[0].type || "");
            property.updateUnitMix(property.unitMixes[0].id, "count", parsedModel.property.unitMixes[0].count || "");
            property.updateUnitMix(property.unitMixes[0].id, "squareFootage", parsedModel.property.unitMixes[0].squareFootage || "");
          }
          
          // Add additional items
          for (let i = 1; i < parsedModel.property.unitMixes.length; i++) {
            const unit = parsedModel.property.unitMixes[i];
            property.addUnitMix();
            const newUnit = property.unitMixes[property.unitMixes.length - 1];
            if (newUnit) {
              property.updateUnitMix(newUnit.id, "type", unit.type || "");
              property.updateUnitMix(newUnit.id, "count", unit.count || "");
              property.updateUnitMix(newUnit.id, "squareFootage", unit.squareFootage || "");
            }
          }
        }
      }
      
      // Load financing data
      if (parsedModel.financing) {
        if (parsedModel.financing.totalProjectCost) financing.setTotalProjectCost(parsedModel.financing.totalProjectCost);
        if (parsedModel.financing.debtAmount) financing.setDebtAmount(parsedModel.financing.debtAmount);
        if (parsedModel.financing.equityAmount) financing.setEquityAmount(parsedModel.financing.equityAmount);
        if (parsedModel.financing.loanToCost) financing.setLoanToCost(parsedModel.financing.loanToCost);
        if (parsedModel.financing.loanToValue) financing.setLoanToValue(parsedModel.financing.loanToValue);
        if (parsedModel.financing.dscr) financing.setDscr(parsedModel.financing.dscr);
        
        // Construction loan data
        if (parsedModel.financing.constructionLoanAmount) financing.setConstructionLoanAmount(parsedModel.financing.constructionLoanAmount);
        if (parsedModel.financing.constructionInterestRate) financing.setConstructionInterestRate(parsedModel.financing.constructionInterestRate);
        if (parsedModel.financing.constructionTerm) financing.setConstructionTerm(parsedModel.financing.constructionTerm);
        if (parsedModel.financing.constructionLoanFees) financing.setConstructionLoanFees(parsedModel.financing.constructionLoanFees);
        if (parsedModel.financing.constructionDrawdownSchedule) financing.setConstructionDrawdownSchedule(parsedModel.financing.constructionDrawdownSchedule);
        if (parsedModel.financing.constructionInterestReserve) financing.setConstructionInterestReserve(parsedModel.financing.constructionInterestReserve);
        if (parsedModel.financing.constructionRecourse) financing.setConstructionRecourse(parsedModel.financing.constructionRecourse);
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
            if (index < expenses.expenseCategories.length) {
              // Update existing expense categories
              Object.keys(expense).forEach(key => {
                if (key !== 'id') {
                  expenses.updateExpenseCategory(expenses.expenseCategories[index].id, key as any, expense[key]);
                }
              });
            } else {
              // Add new expense categories
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
        financing: {
          totalProjectCost: financing.totalProjectCost,
          debtAmount: financing.debtAmount,
          equityAmount: financing.equityAmount,
          loanToCost: financing.loanToCost,
          loanToValue: financing.loanToValue,
          dscr: financing.dscr,
          constructionLoanAmount: financing.constructionLoanAmount,
          constructionInterestRate: financing.constructionInterestRate,
          constructionTerm: financing.constructionTerm,
          constructionLoanFees: financing.constructionLoanFees,
          constructionDrawdownSchedule: financing.constructionDrawdownSchedule,
          constructionInterestReserve: financing.constructionInterestReserve,
          constructionRecourse: financing.constructionRecourse
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
      
      // Save to localStorage with proper handling
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(modelData));
        console.log(`Data successfully saved to localStorage with key: ${STORAGE_KEY}`);
      } catch (storageError) {
        console.error("Error saving to localStorage:", storageError);
        if (storageError instanceof DOMException && storageError.name === 'QuotaExceededError') {
          toast.error("Storage quota exceeded. Try reducing the model size.");
          return false;
        }
        throw storageError;
      }
      
      // Update last saved time
      setLastSaved(now);
      setHasUnsavedChanges(false);
      
      // Verify save was successful
      const verifySave = verifyLocalStorageSave();
      
      console.log(`Model ${isAuto ? "auto-saved" : "saved"} successfully:`, modelData);
      
      // Only show toast for manual saves, not auto-saves
      if (!isAuto && verifySave) {
        toast.success("Model saved successfully");
      } else if (!isAuto && !verifySave) {
        toast.error("Failed to verify saved data");
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
      const parsedData = JSON.parse(savedData);
      
      // Verify the data structure has the required properties
      if (!parsedData.meta || !parsedData.property || !parsedData.expenses || !parsedData.sensitivity) {
        console.error("Verification failed: Saved data is missing required sections");
        return false;
      }
      
      console.log("Verification successful: Data saved correctly to localStorage", parsedData);
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
      console.log("Model data cleared from localStorage");
      
      // Reset all state values
      property.setProjectName("");
      property.setProjectLocation("");
      property.setProjectType("");
      property.setTotalLandArea("");
      
      // Reset space types to initial value
      while (property.spaceTypes.length > 1) {
        property.removeSpaceType(property.spaceTypes[property.spaceTypes.length - 1].id);
      }
      if (property.spaceTypes[0]) {
        property.updateSpaceType(property.spaceTypes[0].id, "type", "");
        property.updateSpaceType(property.spaceTypes[0].id, "squareFootage", "");
        property.updateSpaceType(property.spaceTypes[0].id, "units", "");
        property.updateSpaceType(property.spaceTypes[0].id, "phase", "");
      }
      
      // Reset unit mixes to initial value
      while (property.unitMixes.length > 1) {
        property.removeUnitMix(property.unitMixes[property.unitMixes.length - 1].id);
      }
      if (property.unitMixes[0]) {
        property.updateUnitMix(property.unitMixes[0].id, "type", "Studio");
        property.updateUnitMix(property.unitMixes[0].id, "count", "");
        property.updateUnitMix(property.unitMixes[0].id, "squareFootage", "");
      }
      
      // Reset other states as needed
      
      toast.success("Model data reset successfully");
      setLastSaved(null);
      setHasUnsavedChanges(false);
      
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
    console.log("Marked as having unsaved changes");
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
    financing.totalProjectCost,
    financing.debtAmount,
    financing.equityAmount,
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
