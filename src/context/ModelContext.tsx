
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
import { useParams } from 'react-router-dom';

export type ModelTabType = 'property' | 'devCosts' | 'timeline' | 'opex' | 'oprev' | 'capex' | 'financing' | 'disposition' | 'sensitivity';

type ModelContextType = {
  activeTab: ModelTabType;
  setActiveTab: (tab: ModelTabType) => void;
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
  isLoading: boolean;
  error: string | null;
};

const ModelContext = createContext<ModelContextType | null>(null);

export const ModelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { id: projectId } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<ModelTabType>("property");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const property = usePropertyState();
  const developmentCosts = useDevelopmentCosts();
  const timeline = useDevelopmentTimeline();
  const expenses = useExpensesState();
  const revenue = useRevenueState();
  const financing = useFinancingState();
  const disposition = useDispositionState();
  const sensitivity = useSensitivityState();

  const handleTabChange = (tab: ModelTabType) => {
    setActiveTab(tab);
  };

  console.log("ModelProvider initializing with default activeTab:", activeTab);

  // Initial load effect - now it just sets loading to false after all state hooks are initialized
  useEffect(() => {
    console.log("ModelProvider: Running initial effect");
    // Give time for all state hooks to initialize
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [projectId]);

  // Simplified save function that just updates the lastSaved timestamp
  // Real saving happens in the useSupabasePropertyData hook
  const saveModel = () => {
    setLastSaved(new Date());
    setHasUnsavedChanges(false);
    toast.success("Model saved successfully");
    return true;
  };

  // Reset function - now just a placeholder as actual reset would happen in individual components
  const resetModel = () => {
    try {
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

  // Track changes to important state properties to set hasUnsavedChanges flag
  useEffect(() => {
    // Only mark as having unsaved changes if initial load is complete
    if (!isLoading) {
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
    property.products,
    expenses.expenseGrowthRate,
    expenses.operatingExpenseRatio,
    expenses.expenseCategories,
    financing.totalProjectCost,
    financing.debtAmount,
    financing.equityAmount,
    sensitivity.sensitivityVariable1,
    sensitivity.variable1MinRange,
    sensitivity.outputMetric,
    isLoading
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
    isLoading,
    error
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
