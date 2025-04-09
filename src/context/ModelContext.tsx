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
import { validateModelData, findInvalidValues } from '@/utils/modelValidation';

const STORAGE_KEY = 'realEstateModel';
const MODEL_VERSION = '1.1.0'; // Add versioning for future compatibility

interface ModelMeta {
  version: string;
  lastSaved?: string;
}

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
  meta?: ModelMeta;
};

const ModelContext = createContext<ModelContextType | null>(null);

export const ModelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>("property");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false);
  
  const property = usePropertyState();
  const developmentCosts = useDevelopmentCosts();
  const timeline = useDevelopmentTimeline();
  const expenses = useExpensesState();
  const revenue = useRevenueState();
  const financing = useFinancingState();
  const disposition = useDispositionState();
  const sensitivity = useSensitivityState();

  const handleTabChange = (tab: string) => {
    // Auto-save when changing tabs
    saveToLocalStorage(false);
    setActiveTab(tab);
  };

  console.log("ModelProvider initializing with default activeTab:", activeTab);

  useEffect(() => {
    console.log("ModelProvider: Running initial localStorage load effect");
    loadFromLocalStorage();
    setInitialLoadComplete(true);
  }, []);

  const debouncedSave = debounce(() => {
    if (hasUnsavedChanges && initialLoadComplete) {
      console.log("Debounced save triggered due to unsaved changes");
      saveToLocalStorage(true);
    }
  }, 2000);

  useEffect(() => {
    console.log("ModelProvider: Setting up auto-save effect");
    
    debouncedSave();
    
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges && initialLoadComplete) {
        console.log("Auto-save triggered due to unsaved changes");
        saveToLocalStorage(true);
      }
    }, 30000); // Auto-save every 30 seconds
    
    return () => {
      clearInterval(autoSaveInterval);
      debouncedSave.cancel();
    };
  }, [hasUnsavedChanges, initialLoadComplete]);

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
      
      if (parsedModel.meta && parsedModel.meta.lastSaved) {
        setLastSaved(new Date(parsedModel.meta.lastSaved));
      }
      
      // Load property section data
      if (parsedModel.property) {
        console.log("Loading property section data:", parsedModel.property);
        if (parsedModel.property.projectName !== undefined) {
          property.setProjectName(parsedModel.property.projectName);
          console.log("Loaded projectName:", parsedModel.property.projectName);
        }
        
        if (parsedModel.property.projectLocation !== undefined) {
          property.setProjectLocation(parsedModel.property.projectLocation);
          console.log("Loaded projectLocation:", parsedModel.property.projectLocation);
        }
        
        if (parsedModel.property.projectType !== undefined) {
          property.setProjectType(parsedModel.property.projectType);
          console.log("Loaded projectType:", parsedModel.property.projectType);
        }
        
        // Load numeric building parameters with proper type conversion
        if (parsedModel.property.farAllowance !== undefined) {
          const farValue = Number(parsedModel.property.farAllowance);
          if (!isNaN(farValue)) {
            property.setFarAllowance(farValue);
            console.log("Loaded farAllowance:", farValue);
          }
        }
        
        if (parsedModel.property.lotSize !== undefined) {
          const lotSizeValue = Number(parsedModel.property.lotSize);
          if (!isNaN(lotSizeValue)) {
            property.setLotSize(lotSizeValue);
            console.log("Loaded lotSize:", lotSizeValue);
          }
        }
        
        // Load floor plate templates with validation - FIXED to prevent duplication
        if (Array.isArray(parsedModel.property.floorPlateTemplates)) {
          console.log("Loading floorPlateTemplates, count before:", property.floorPlateTemplates.length);
          
          // Process and clean templates from localStorage
          const validTemplates = parsedModel.property.floorPlateTemplates
            .filter(template => template && template.id && template.name)
            .map(template => {
              // Process each template to ensure proper structure
              return {
                id: template.id,
                name: template.name,
                width: typeof template.width === 'number' ? template.width : 
                      (template.width && typeof template.width === 'object' ? undefined : template.width),
                length: typeof template.length === 'number' ? template.length : 
                       (template.length && typeof template.length === 'object' ? undefined : template.length),
                grossArea: Number(template.grossArea || 0)
              };
            });
          
          console.log("Processed templates for loading:", validTemplates);
          
          // Set all templates at once instead of adding them one by one
          property.setAllFloorPlateTemplates(validTemplates);
          console.log("FloorPlateTemplates loaded, count after:", validTemplates.length);
        }
      }
      
      // Load financing section
      if (parsedModel.financing) {
        console.log("Loading financing section data");
        const financingFields = [
          'totalProjectCost', 'debtAmount', 'equityAmount', 'loanToCost', 
          'loanToValue', 'dscr', 'constructionLoanAmount', 'constructionInterestRate',
          'constructionTerm', 'constructionLoanFees', 'constructionDrawdownSchedule',
          'constructionInterestReserve', 'constructionRecourse'
        ];
        
        financingFields.forEach(field => {
          if (parsedModel.financing[field] !== undefined) {
            const setter = `set${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof typeof financing;
            if (typeof financing[setter] === 'function') {
              try {
                (financing[setter] as Function)(parsedModel.financing[field]);
                console.log(`Loaded financing.${field}:`, parsedModel.financing[field]);
              } catch (err) {
                console.error(`Error setting financing.${field}:`, err);
              }
            }
          }
        });
      }
      
      // Load expenses section
      if (parsedModel.expenses) {
        console.log("Loading expenses section data");
        const expenseFields = [
          'expenseGrowthRate', 'operatingExpenseRatio', 'fixedExpensePercentage',
          'variableExpensePercentage', 'replacementReserves', 'reservesUnit',
          'expensesBeforeStabilization'
        ];
        
        expenseFields.forEach(field => {
          if (parsedModel.expenses[field] !== undefined) {
            const setter = `set${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof typeof expenses;
            if (typeof expenses[setter] === 'function') {
              try {
                (expenses[setter] as Function)(parsedModel.expenses[field]);
                console.log(`Loaded expenses.${field}:`, parsedModel.expenses[field]);
              } catch (err) {
                console.error(`Error setting expenses.${field}:`, err);
              }
            }
          }
        });
        
        // Load expense categories
        if (Array.isArray(parsedModel.expenses.expenseCategories)) {
          console.log("Loading expense categories:", parsedModel.expenses.expenseCategories);
          
          parsedModel.expenses.expenseCategories.forEach((expense: any, index: number) => {
            if (index < expenses.expenseCategories.length) {
              // Update existing expense category
              Object.keys(expense).forEach(key => {
                if (key !== 'id' && expenses.expenseCategories[index]) {
                  try {
                    expenses.updateExpenseCategory(expenses.expenseCategories[index].id, key as any, expense[key]);
                  } catch (err) {
                    console.error(`Error updating expense category ${index}.${key}:`, err);
                  }
                }
              });
            } else {
              // Add new expense category
              try {
                expenses.addExpenseCategory();
                if (expenses.expenseCategories[index]) {
                  Object.keys(expense).forEach(key => {
                    if (key !== 'id') {
                      expenses.updateExpenseCategory(expenses.expenseCategories[index].id, key as any, expense[key]);
                    }
                  });
                }
              } catch (err) {
                console.error(`Error adding expense category at index ${index}:`, err);
              }
            }
          });
        }
      }
      
      // Load sensitivity section
      if (parsedModel.sensitivity) {
        console.log("Loading sensitivity section data");
        const sensitivityFields = [
          'sensitivityVariable1', 'variable1MinRange', 'variable1MaxRange',
          'sensitivityVariable2', 'variable2MinRange', 'variable2MaxRange', 
          'outputMetric'
        ];
        
        sensitivityFields.forEach(field => {
          if (parsedModel.sensitivity[field] !== undefined) {
            const setter = `set${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof typeof sensitivity;
            if (typeof sensitivity[setter] === 'function') {
              try {
                (sensitivity[setter] as Function)(parsedModel.sensitivity[field]);
                console.log(`Loaded sensitivity.${field}:`, parsedModel.sensitivity[field]);
              } catch (err) {
                console.error(`Error setting sensitivity.${field}:`, err);
              }
            }
          }
        });
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

  const saveToLocalStorage = (isAuto: boolean = false) => {
    if (!initialLoadComplete && isAuto) {
      console.log("Skipping auto-save as initial load is not complete");
      return false;
    }
    
    try {
      setIsAutoSaving(isAuto);
      const now = new Date();
      
      // Create the model data structure with all sections
      const modelData = {
        meta: {
          lastSaved: now.toISOString(),
          version: MODEL_VERSION
        },
        // Property section with all fields
        property: {
          projectName: property.projectName,
          projectLocation: property.projectLocation,
          projectType: property.projectType,
          farAllowance: property.farAllowance,
          lotSize: property.lotSize,
          maxBuildableArea: property.maxBuildableArea,
          floorPlateTemplates: property.floorPlateTemplates.map(template => ({
            id: template.id,
            name: template.name,
            width: template.width,
            length: template.length,
            grossArea: template.grossArea
          }))
        },
        // Expenses section
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
        // Financing section
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
        // Timeline section
        timeline: {
          // Add timeline fields here as needed
        },
        // Development costs section 
        developmentCosts: {
          // Add development costs fields here as needed
        },
        // Revenue section
        revenue: {
          // Add revenue fields here as needed
        },
        // Disposition section
        disposition: {
          // Add disposition fields here as needed
        },
        // Sensitivity section
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
      
      // Log template count before saving
      console.log("Template count before saving:", property.floorPlateTemplates.length, property.floorPlateTemplates);
      
      // Validate model structure before saving
      const validationResult = validateModelData(modelData);
      if (!validationResult.valid) {
        console.warn("Model validation warnings:", validationResult.errors);
      }
      
      // Check for invalid values (null/undefined)
      const invalidValues = findInvalidValues(modelData);
      if (invalidValues.length > 0) {
        console.warn("Found invalid values in model:", invalidValues);
      }
      
      console.log("Saving complete model data to localStorage:", modelData);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(modelData));
        console.log(`Data successfully saved to localStorage with key: ${STORAGE_KEY}`, modelData);
      } catch (storageError) {
        console.error("Error saving to localStorage:", storageError);
        if (storageError instanceof DOMException && storageError.name === 'QuotaExceededError') {
          toast.error("Storage quota exceeded. Try reducing the model size.");
          return false;
        }
        throw storageError;
      }
      
      setLastSaved(now);
      setHasUnsavedChanges(false);
      
      const verifySave = verifyLocalStorageSave();
      
      console.log(`Model ${isAuto ? "auto-saved" : "saved"} successfully:`, modelData);
      
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

  const verifyLocalStorageSave = () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (!savedData) {
        console.error("Verification failed: No data found in localStorage");
        return false;
      }
      
      const parsedData = JSON.parse(savedData);
      
      // Check that all required sections exist
      if (!parsedData.meta || !parsedData.property || !parsedData.expenses || !parsedData.sensitivity) {
        console.error("Verification failed: Saved data is missing required sections");
        return false;
      }
      
      // Verify property section has required data
      if (!parsedData.property.projectName && parsedData.property.projectName !== "") {
        console.error("Verification failed: Property section missing projectName");
        return false;
      }
      
      if (!Array.isArray(parsedData.property.floorPlateTemplates)) {
        console.error("Verification failed: Property section floorPlateTemplates is not an array");
        return false;
      }
      
      console.log("Verification successful: Data saved correctly to localStorage", parsedData);
      return true;
    } catch (error) {
      console.error("Verification failed: Data in localStorage is invalid", error);
      return false;
    }
  };

  const resetModel = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log("Model data cleared from localStorage");
      
      // Reset property section
      property.setProjectName("");
      property.setProjectLocation("");
      property.setProjectType("");
      property.setFarAllowance(0);
      property.setLotSize(0);
      property.floorPlateTemplates = [];
      
      // Reset other sections as needed
      
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

  const saveModel = () => {
    return saveToLocalStorage(false);
  };

  // Track changes to important state properties
  useEffect(() => {
    // Only mark as having unsaved changes if initial load is complete
    if (initialLoadComplete) {
      setHasUnsavedChanges(true);
      console.log("Marked as having unsaved changes");
    }
  }, [
    property.projectName, 
    property.projectLocation,
    property.projectType,
    property.farAllowance,
    property.lotSize,
    property.floorPlateTemplates,
    expenses.expenseGrowthRate,
    expenses.operatingExpenseRatio,
    expenses.expenseCategories,
    financing.totalProjectCost,
    financing.debtAmount,
    financing.equityAmount,
    sensitivity.sensitivityVariable1,
    sensitivity.variable1MinRange,
    sensitivity.outputMetric,
    initialLoadComplete
  ]);

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
    isAutoSaving,
    meta: {
      version: MODEL_VERSION,
    }
  };

  return (
    <ModelContext.Provider value={contextValue}>
      {children}
    </ModelContext.Provider>
  );
};

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
