
import React, { createContext, useState, useContext, useCallback, useEffect } from "react";
import { useModelState } from "@/hooks/useModelState";

// Define the type for the active tab - updated to include all tab values used in the navigation
export type ModelTabType = "property" | "devCosts" | "timeline" | "opex" | "oprev" | "capex" | "financing" | "disposition" | "sensitivity";

// Define the context type - adding missing properties
type ModelContextType = {
  activeTab: ModelTabType;
  setActiveTab: (tab: ModelTabType) => void;
  
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  
  isSaving: boolean;
  isAutoSaving?: boolean;
  lastSaved: Date | null;
  meta?: { version: string };
  
  saveModel: () => void;
  resetModel?: () => void;
  
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
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [meta, setMeta] = useState<{ version: string } | undefined>();
  
  // Create model state using all our hooks
  const modelState = useModelState();
  
  // Log initial state for debugging
  console.log("ModelProvider initializing with default activeTab:", activeTab);

  // Reset the model data
  const resetModel = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem("realEstateModel");
    
    // Reset all state
    // We'll just reload the page to get a fresh state
    window.location.reload();
  }, []);
  
  // Save the model state to localStorage
  const saveModel = useCallback(() => {
    try {
      // Ensure initial load is complete before saving to prevent overwriting data
      if (!modelState.property.initialLoadComplete) {
        console.log("Skipping save because initial load is not complete");
        return;
      }

      setIsSaving(true);
      setIsAutoSaving(true);
      
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
          expenseGrowthRate: modelState.expenses.expenseGrowthRate,
          operatingExpenseRatio: modelState.expenses.operatingExpenseRatio,
          replacementReserves: modelState.expenses.replacementReserves,
          propertyTaxes: modelState.expenses.propertyTaxes,
          propertyInsurance: modelState.expenses.propertyInsurance,
          utilitiesExpense: modelState.expenses.utilitiesExpense,
          gaExpense: modelState.expenses.gaExpense,
          payrollExpense: modelState.expenses.payrollExpense,
          repairsExpense: modelState.expenses.repairsExpense,
          landscapingExpense: modelState.expenses.landscapingExpense,
          marketingExpense: modelState.expenses.marketingExpense,
          otherExpense: modelState.expenses.otherExpense,
        },
        financing: {
          debtAmount: modelState.financing.debtAmount,
          loanToCost: modelState.financing.loanToCost,
          permanentInterestRate: modelState.financing.permanentInterestRate,
          permanentTerm: modelState.financing.permanentTerm,
          permanentAmortization: modelState.financing.permanentAmortization,
          permanentLoanFees: modelState.financing.permanentLoanFees,
          constructionLoanAmount: modelState.financing.constructionLoanAmount,
          constructionInterestRate: modelState.financing.constructionInterestRate,
          constructionTerm: modelState.financing.constructionTerm,
          constructionLoanFees: modelState.financing.constructionLoanFees,
        },
        timeline: {
          startDate: modelState.timeline.startDate?.toISOString(),
          completionDate: modelState.timeline.completionDate?.toISOString(),
          phaseCount: modelState.timeline.phaseCount,
          phaseDuration: modelState.timeline.phaseDuration,
          stabilizationPeriod: modelState.timeline.stabilizationPeriod,
          holdingPeriod: modelState.timeline.holdingPeriod,
        },
        developmentCosts: {
          purchasePrice: modelState.developmentCosts.purchasePrice,
          purchasePriceMetric: modelState.developmentCosts.purchasePriceMetric,
          hardCosts: modelState.developmentCosts.hardCosts, 
          softCosts: modelState.developmentCosts.softCosts,
          ffeCosts: modelState.developmentCosts.ffeCosts,
          contingency: modelState.developmentCosts.contingency,
          developerFee: modelState.developmentCosts.developerFee,
        },
        revenue: {
          annualRevenueGrowthRate: modelState.revenue.annualRevenueGrowthRate,
          stabilizedOccupancyRate: modelState.revenue.stabilizedOccupancyRate,
          vacancyAllowance: modelState.revenue.vacancyAllowance,
          badDebtAllowance: modelState.revenue.badDebtAllowance,
          concessionsAllowance: modelState.revenue.concessionsAllowance,
          rentalRateGrowth: modelState.revenue.rentalRateGrowth,
          absorptionPeriod: modelState.revenue.absorptionPeriod,
          absorptionRatePerMonth: modelState.revenue.absorptionRatePerMonth,
        },
        disposition: {
          exitCapRate: modelState.disposition.exitCapRate,
          salesExpenses: modelState.disposition.salesExpenses,
        },
        sensitivity: {
          sensitivityVariable1: modelState.sensitivity.sensitivityVariable1,
          sensitivityVariable2: modelState.sensitivity.sensitivityVariable2,
        },
      };
      
      // Save to localStorage
      localStorage.setItem("realEstateModel", JSON.stringify(modelToSave));
      
      // Update state to reflect save
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      setMeta({ version: "1.1.0" });
      
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
      // Turn off auto-saving indicator after a short delay
      setTimeout(() => {
        setIsAutoSaving(false);
      }, 800);
    }
  }, [
    modelState.developmentCosts.contingency,
    modelState.developmentCosts.developerFee,
    modelState.developmentCosts.ffeCosts,
    modelState.developmentCosts.hardCosts,
    modelState.developmentCosts.purchasePrice,
    modelState.developmentCosts.purchasePriceMetric,
    modelState.developmentCosts.softCosts,
    modelState.disposition.exitCapRate,
    modelState.disposition.salesExpenses,
    modelState.expenses.expenseGrowthRate,
    modelState.expenses.gaExpense,
    modelState.expenses.landscapingExpense,
    modelState.expenses.operatingExpenseRatio,
    modelState.expenses.marketingExpense,
    modelState.expenses.otherExpense,
    modelState.expenses.payrollExpense,
    modelState.expenses.propertyInsurance,
    modelState.expenses.propertyTaxes,
    modelState.expenses.repairsExpense,
    modelState.expenses.replacementReserves,
    modelState.expenses.utilitiesExpense,
    modelState.financing.constructionInterestRate,
    modelState.financing.constructionLoanAmount,
    modelState.financing.constructionLoanFees,
    modelState.financing.constructionTerm,
    modelState.financing.debtAmount,
    modelState.financing.loanToCost,
    modelState.financing.permanentAmortization,
    modelState.financing.permanentInterestRate,
    modelState.financing.permanentLoanFees,
    modelState.financing.permanentTerm,
    modelState.property.farAllowance,
    modelState.property.floorPlateTemplates,
    modelState.property.lotSize,
    modelState.property.projectLocation,
    modelState.property.projectName,
    modelState.property.projectType,
    modelState.property.products,
    modelState.property.initialLoadComplete,
    modelState.revenue.absorptionPeriod,
    modelState.revenue.absorptionRatePerMonth,
    modelState.revenue.annualRevenueGrowthRate,
    modelState.revenue.badDebtAllowance,
    modelState.revenue.concessionsAllowance,
    modelState.revenue.rentalRateGrowth,
    modelState.revenue.stabilizedOccupancyRate,
    modelState.revenue.vacancyAllowance,
    modelState.sensitivity.sensitivityVariable1,
    modelState.sensitivity.sensitivityVariable2,
    modelState.timeline.completionDate,
    modelState.timeline.holdingPeriod,
    modelState.timeline.phaseCount,
    modelState.timeline.phaseDuration,
    modelState.timeline.stabilizationPeriod,
    modelState.timeline.startDate,
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
    isAutoSaving,
    lastSaved,
    meta,
    
    saveModel,
    resetModel,
    
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
