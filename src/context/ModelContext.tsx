import React, { createContext, useState, useContext, useCallback, useEffect } from "react";
import { useModelState } from "@/hooks/useModelState";

// Define the type for the active tab
export type ModelTabType = "property" | "development" | "timeline" | "expenses" | "revenue" | "financing" | "disposition" | "sensitivity";

// Define the context type
type ModelContextType = {
  activeTab: ModelTabType;
  setActiveTab: (tab: ModelTabType) => void;
  
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  
  isSaving: boolean;
  lastSaved: Date | null;
  
  saveModel: () => void;
  
  // Model state from hooks
  property: ReturnType<typeof useModelState>["property"];
  developmentCosts: ReturnType<typeof useModelState>["developmentCosts"];
  timeline: ReturnType<typeof useModelState>["timeline"];
  expenses: ReturnType<typeof useModelState>["expenses"];
  revenue: ReturnType<typeof useModelState>["revenue"];
  financing: ReturnType<typeof useModelState>["financing"];
  disposition: ReturnType<typeof useModelState>["disposition"];
  sensitivity: ReturnType<typeof useModelState>["sensitivity"];
};

// Create the context with a default value
export const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ModelTabType>("property");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Create model state using all our hooks
  const modelState = useModelState();
  
  // Log initial state for debugging
  console.log("ModelProvider initializing with default activeTab:", activeTab);
  
  // Save the model state to localStorage
  const saveModel = useCallback(() => {
    try {
      // Ensure initial load is complete before saving to prevent overwriting data
      if (!modelState.property.initialLoadComplete) {
        console.log("Skipping save because initial load is not complete");
        return;
      }

      setIsSaving(true);
      
      // Create the model object to save
      const modelToSave = {
        meta: {
          lastSaved: new Date().toISOString(),
          version: "1.1.0",
        },
        property: {
          projectName: modelState.property.projectName,
          projectLocation: modelState.property.projectLocation,
          projectType: modelState.property.projectType,
          farAllowance: modelState.property.farAllowance,
          lotSize: modelState.property.lotSize,
          maxBuildableArea: modelState.property.maxBuildableArea,
          floorPlateTemplates: modelState.property.floorPlateTemplates,
          products: modelState.property.products, // Save the products array with unit types
        },
        expenses: {
          operatingExpenses: modelState.expenses.operatingExpenses,
          expenseGrowth: modelState.expenses.expenseGrowth,
          managementFeePercent: modelState.expenses.managementFeePercent,
          replacementReservePerUnit: modelState.expenses.replacementReservePerUnit,
          propertyTaxRate: modelState.expenses.propertyTaxRate,
          propertyInsuranceRate: modelState.expenses.propertyInsuranceRate,
          utilities: modelState.expenses.utilities,
          generalAndAdministrative: modelState.expenses.generalAndAdministrative,
          payroll: modelState.expenses.payroll,
          repairs: modelState.expenses.repairs,
          landscaping: modelState.expenses.landscaping,
          marketing: modelState.expenses.marketing,
          other: modelState.expenses.other,
        },
        financing: {
          loanAmount: modelState.financing.loanAmount,
          loanToValue: modelState.financing.loanToValue,
          interestRate: modelState.financing.interestRate,
          amortizationYears: modelState.financing.amortizationYears,
          loanTerm: modelState.financing.loanTerm,
          loanFees: modelState.financing.loanFees,
          constructionLoanAmount: modelState.financing.constructionLoanAmount,
          constructionLoanInterestRate: modelState.financing.constructionLoanInterestRate,
          constructionLoanTerm: modelState.financing.constructionLoanTerm,
          constructionLoanFees: modelState.financing.constructionLoanFees,
        },
        timeline: {
          constructionStartDate: modelState.timeline.constructionStartDate?.toISOString(),
          constructionDuration: modelState.timeline.constructionDuration,
          leaseupStartDate: modelState.timeline.leaseupStartDate?.toISOString(),
          leaseupDuration: modelState.timeline.leaseupDuration,
          stabilizedStartDate: modelState.timeline.stabilizedStartDate?.toISOString(),
          stabilizedDuration: modelState.timeline.stabilizedDuration,
          holdPeriod: modelState.timeline.holdPeriod,
        },
        developmentCosts: {
          landCost: modelState.developmentCosts.landCost,
          hardCostsPerSF: modelState.developmentCosts.hardCostsPerSF,
          softCostsPerSF: modelState.developmentCosts.softCostsPerSF,
          ffeCostsPerSF: modelState.developmentCosts.ffeCostsPerSF,
          contingencyPercentage: modelState.developmentCosts.contingencyPercentage,
          developerFeePercentage: modelState.developmentCosts.developerFeePercentage,
        },
        revenue: {
          rentalRates: modelState.revenue.rentalRates,
          otherIncome: modelState.revenue.otherIncome,
          vacancyRate: modelState.revenue.vacancyRate,
          badDebtRate: modelState.revenue.badDebtRate,
          concessions: modelState.revenue.concessions,
          rentalGrowth: modelState.revenue.rentalGrowth,
          leaseupPeriod: modelState.revenue.leaseupPeriod,
          leaseupPerMonth: modelState.revenue.leaseupPerMonth,
        },
        disposition: {
          capRate: modelState.disposition.capRate,
          salesCosts: modelState.disposition.salesCosts,
        },
        sensitivity: {
          variables: modelState.sensitivity.variables,
          ranges: modelState.sensitivity.ranges,
        },
      };
      
      // Save to localStorage
      localStorage.setItem("realEstateModel", JSON.stringify(modelToSave));
      
      // Update state to reflect save
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      
      console.log("Model saved successfully:", modelToSave);
      
      // Verify data was saved correctly (for debugging)
      const savedData = localStorage.getItem("realEstateModel");
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log("Verification successful: Data saved correctly to localStorage", parsedData);
      }
    } catch (error) {
      console.error("Error saving model:", error);
    } finally {
      setIsSaving(false);
    }
  }, [
    modelState.developmentCosts.contingencyPercentage,
    modelState.developmentCosts.developerFeePercentage,
    modelState.developmentCosts.ffeCostsPerSF,
    modelState.developmentCosts.hardCostsPerSF,
    modelState.developmentCosts.landCost,
    modelState.developmentCosts.softCostsPerSF,
    modelState.disposition.capRate,
    modelState.disposition.salesCosts,
    modelState.expenses.expenseGrowth,
    modelState.expenses.generalAndAdministrative,
    modelState.expenses.landscaping,
    modelState.expenses.managementFeePercent,
    modelState.expenses.marketing,
    modelState.expenses.operatingExpenses,
    modelState.expenses.other,
    modelState.expenses.payroll,
    modelState.expenses.propertyInsuranceRate,
    modelState.expenses.propertyTaxRate,
    modelState.expenses.repairs,
    modelState.expenses.replacementReservePerUnit,
    modelState.expenses.utilities,
    modelState.financing.amortizationYears,
    modelState.financing.constructionLoanAmount,
    modelState.financing.constructionLoanFees,
    modelState.financing.constructionLoanInterestRate,
    modelState.financing.constructionLoanTerm,
    modelState.financing.interestRate,
    modelState.financing.loanAmount,
    modelState.financing.loanFees,
    modelState.financing.loanTerm,
    modelState.financing.loanToValue,
    modelState.property.farAllowance,
    modelState.property.floorPlateTemplates,
    modelState.property.lotSize,
    modelState.property.projectLocation,
    modelState.property.projectName,
    modelState.property.projectType,
    modelState.property.products,
    modelState.property.initialLoadComplete,
    modelState.revenue.badDebtRate,
    modelState.revenue.concessions,
    modelState.revenue.leaseupPeriod,
    modelState.revenue.leaseupPerMonth,
    modelState.revenue.otherIncome,
    modelState.revenue.rentalGrowth,
    modelState.revenue.rentalRates,
    modelState.revenue.vacancyRate,
    modelState.sensitivity.ranges,
    modelState.sensitivity.variables,
    modelState.timeline.constructionDuration,
    modelState.timeline.constructionStartDate,
    modelState.timeline.holdPeriod,
    modelState.timeline.leaseupDuration,
    modelState.timeline.leaseupStartDate,
    modelState.timeline.stabilizedDuration,
    modelState.timeline.stabilizedStartDate,
  ]);
  
  // Auto-save whenever the model state changes
  useEffect(() => {
    console.log("ModelProvider: Setting up auto-save effect");
    
    if (hasUnsavedChanges && !isSaving) {
      const timer = setTimeout(() => {
        console.log("Auto-saving model due to unsaved changes");
        saveModel();
      }, 2000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [hasUnsavedChanges, isSaving, saveModel]);
  
  // Expose the context value
  const contextValue = {
    activeTab,
    setActiveTab,
    
    hasUnsavedChanges,
    setHasUnsavedChanges,
    
    isSaving,
    lastSaved,
    
    saveModel,
    
    // Expose all the model state
    property: modelState.property,
    developmentCosts: modelState.developmentCosts,
    timeline: modelState.timeline,
    expenses: modelState.expenses,
    revenue: modelState.revenue,
    financing: modelState.financing,
    disposition: modelState.disposition,
    sensitivity: modelState.sensitivity,
  };
  
  return (
    <ModelContext.Provider value={contextValue}>{children}</ModelContext.Provider>
  );
};

// Custom hook to use the model context
export const useModel = () => {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error("useModel must be used within a ModelProvider");
  }
  return context;
};
