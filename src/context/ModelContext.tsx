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
};

// Create the context
const ModelContext = createContext<ModelContextType | null>(null);

// Create the provider component
export const ModelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>("property");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
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
    saveToLocalStorage();
    setActiveTab(tab);
  };

  // Load data from localStorage on initial load
  useEffect(() => {
    const savedModel = localStorage.getItem('realEstateModel');
    if (savedModel) {
      try {
        const parsedModel = JSON.parse(savedModel);
        
        // Load property state
        if (parsedModel.property) {
          if (parsedModel.property.projectName) property.setProjectName(parsedModel.property.projectName);
          if (parsedModel.property.projectLocation) property.setProjectLocation(parsedModel.property.projectLocation);
          if (parsedModel.property.projectType) property.setProjectType(parsedModel.property.projectType);
          if (parsedModel.property.totalLandArea) property.setTotalLandArea(parsedModel.property.totalLandArea);
          if (parsedModel.property.spaceTypes) {
            // Instead of using setSpaceTypes, we need to properly update each space type
            // This is a workaround since setSpaceTypes isn't available directly
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
          
          if (parsedModel.property.unitMixes) {
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
        
        // Similar loading for other state sections would go here
        // This is just a starting point - full implementation would load all state
        
        setLastSaved(new Date());
        toast.success("Model loaded from local storage");
      } catch (error) {
        console.error("Failed to load model from local storage", error);
        toast.error("Failed to load saved model");
      }
    }
  }, []);

  // Save to localStorage
  const saveToLocalStorage = () => {
    try {
      const modelData = {
        property: {
          projectName: property.projectName,
          projectLocation: property.projectLocation,
          projectType: property.projectType,
          totalLandArea: property.totalLandArea,
          spaceTypes: property.spaceTypes,
          unitMixes: property.unitMixes
        },
        // Add other state sections here in a similar pattern
        developmentCosts: {
          // Relevant properties here
        },
        // Other sections following the same pattern
      };
      
      localStorage.setItem('realEstateModel', JSON.stringify(modelData));
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      return true;
    } catch (error) {
      console.error("Failed to save model", error);
      return false;
    }
  };

  // Explicit save function
  const saveModel = () => {
    if (saveToLocalStorage()) {
      toast.success("Model saved successfully");
    } else {
      toast.error("Failed to save model");
    }
  };

  // Set hasUnsavedChanges to true when any relevant state changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [
    property.projectName, 
    property.projectLocation,
    property.projectType,
    property.totalLandArea,
    // Add more state dependencies here as needed
    // This effect will run whenever any of these values change
  ]);

  // Aggregate value to provide
  const contextValue: ModelContextType = {
    activeTab,
    setActiveTab: handleTabChange,
    saveModel,
    property,
    developmentCosts,
    timeline,
    expenses,
    revenue,
    financing,
    disposition,
    sensitivity,
    hasUnsavedChanges,
    setHasUnsavedChanges
  };

  return (
    <ModelContext.Provider value={contextValue}>
      {children}
    </ModelContext.Provider>
  );
};

// Create and export the hook
export const useModel = (): ModelContextType => {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error("useModel must be used within a ModelProvider");
  }
  return context;
};
