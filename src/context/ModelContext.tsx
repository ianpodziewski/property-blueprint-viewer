import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useModelState } from "@/hooks/useModelState";
import { BuildingFloor, FloorPlateTemplate, Product, UnitType } from "@/hooks/usePropertyState";

// Define the tab types for the model
export type ModelTabType = 
  | "property" 
  | "devCosts" 
  | "timeline" 
  | "opex" 
  | "oprev" 
  | "capex" 
  | "financing" 
  | "disposition" 
  | "sensitivity";

// Define the model meta information type
export interface ModelMeta {
  version?: string;
}

// Create a context to hold the model state
interface ModelContextType {
  activeTab: ModelTabType;
  setActiveTab: (tab: ModelTabType) => void;
  property: any;
  developmentCosts: any;
  timeline: any;
  expenses: any;
  revenue: any;
  financing: any;
  disposition: any;
  sensitivity: any;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
  isAutoSaving: boolean;
  saveModel: () => void;
  resetModel: () => Promise<void>;
  lastSaved?: Date | null;
  meta?: ModelMeta;
}

// Initialize the context with default values
const ModelContext = createContext<ModelContextType>({
  activeTab: "property",
  setActiveTab: () => {},
  property: {},
  developmentCosts: {},
  timeline: {},
  expenses: {},
  revenue: {},
  financing: {},
  disposition: {},
  sensitivity: {},
  hasUnsavedChanges: false,
  setHasUnsavedChanges: () => {},
  isAutoSaving: false,
  saveModel: () => {},
  resetModel: async () => {},
  lastSaved: null,
  meta: { version: "1.0.0" }
});

// Provider component to wrap the app with
export const ModelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ModelTabType>("property");
  const modelState = useModelState();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [meta, setMeta] = useState<ModelMeta>({ version: "1.0.0" });
  
  // Validate and load floor plate templates from localStorage
  const validateAndLoadFloorPlateTemplates = (templates: any[]): FloorPlateTemplate[] => {
    if (!Array.isArray(templates)) return [];
    
    return templates.filter(template => {
      // Basic validation of template properties
      return (
        template && 
        typeof template === 'object' && 
        typeof template.id === 'string' &&
        typeof template.name === 'string' &&
        typeof template.grossArea === 'number'
      );
    });
  };
  
  // Validate and load unit types from localStorage
  const validateAndLoadUnitTypes = (unitTypes: any[]): UnitType[] => {
    if (!Array.isArray(unitTypes)) return [];
    
    return unitTypes.filter(unitType => {
      // Basic validation of unit type properties
      return (
        unitType && 
        typeof unitType === 'object' && 
        typeof unitType.id === 'string' &&
        typeof unitType.unitType === 'string' &&
        typeof unitType.numberOfUnits === 'number' &&
        typeof unitType.grossArea === 'number'
      );
    });
  };
  
  // Validate and load products from localStorage
  const validateAndLoadProducts = (products: any[]): Product[] => {
    if (!Array.isArray(products)) return [];
    
    return products.filter(product => {
      // Basic validation of product properties
      if (
        product && 
        typeof product === 'object' && 
        typeof product.id === 'string' &&
        typeof product.name === 'string'
      ) {
        // Validate unit types
        product.unitTypes = validateAndLoadUnitTypes(product.unitTypes || []);
        return true;
      }
      return false;
    });
  };
  
  // Validate and load building floors from localStorage
  const validateAndLoadBuildingFloors = (floors: any[]): BuildingFloor[] => {
    if (!Array.isArray(floors)) return [];
    
    return floors.filter(floor => {
      // Basic validation of floor properties
      if (
        floor && 
        typeof floor === 'object' && 
        typeof floor.id === 'string' &&
        typeof floor.label === 'string' &&
        typeof floor.position === 'number' &&
        typeof floor.templateId === 'string'
      ) {
        // Validate units array
        if (Array.isArray(floor.units)) {
          floor.units = floor.units.filter((unit: any) => {
            return (
              unit &&
              typeof unit === 'object' &&
              typeof unit.unitTypeId === 'string' &&
              typeof unit.productId === 'string' &&
              typeof unit.quantity === 'number' &&
              unit.quantity > 0
            );
          });
        } else {
          floor.units = [];
        }
        
        return true;
      }
      return false;
    });
  };
  
  // Load model data from localStorage
  const loadFromLocalStorage = useCallback(() => {
    try {
      console.log("Loading model from localStorage");
      
      const savedModel = localStorage.getItem('realEstateModel');
      if (!savedModel) {
        console.log("No saved model found in localStorage");
        return;
      }
      
      const parsedModel = JSON.parse(savedModel);
      console.log("Parsed model from localStorage:", parsedModel);
      
      // Load meta information
      if (parsedModel.meta) {
        setMeta(parsedModel.meta);
      }
      
      // Load lastSaved timestamp
      if (parsedModel.lastSaved) {
        setLastSaved(new Date(parsedModel.lastSaved));
      }
      
      // Load property section data
      if (parsedModel.property) {
        const property = parsedModel.property;
        
        // Load basic property values
        if (typeof property.projectName === 'string') {
          modelState.property.setProjectName(property.projectName);
        }
        
        if (typeof property.projectLocation === 'string') {
          modelState.property.setProjectLocation(property.projectLocation);
        }
        
        if (typeof property.projectType === 'string') {
          modelState.property.setProjectType(property.projectType);
        }
        
        if (typeof property.farAllowance === 'number') {
          modelState.property.setFarAllowance(property.farAllowance);
        }
        
        if (typeof property.lotSize === 'number') {
          modelState.property.setLotSize(property.lotSize);
        }
        
        // Load floor plate templates
        if (Array.isArray(property.floorPlateTemplates)) {
          const validTemplates = validateAndLoadFloorPlateTemplates(property.floorPlateTemplates);
          modelState.property.setAllFloorPlateTemplates(validTemplates);
          console.log("Loaded floor plate templates:", validTemplates);
        }
        
        // Load products (unit mix)
        if (Array.isArray(property.products)) {
          const validProducts = validateAndLoadProducts(property.products);
          modelState.property.setAllProducts(validProducts);
          console.log("Loaded products:", validProducts);
        } else if (Array.isArray(property.unitMix)) {
          // Legacy support for old format
          console.log("Found legacy unitMix format, converting to products");
          const defaultProduct: Product = {
            id: crypto.randomUUID(),
            name: "Default Product",
            unitTypes: validateAndLoadUnitTypes(property.unitMix)
          };
          
          if (defaultProduct.unitTypes.length > 0) {
            modelState.property.setAllProducts([defaultProduct]);
          }
        }
        
        // Load building layout
        if (Array.isArray(property.buildingFloors)) {
          const validFloors = validateAndLoadBuildingFloors(property.buildingFloors);
          modelState.property.setAllBuildingFloors(validFloors);
          console.log("Loaded building floors:", validFloors);
        }
      }
      
      // Load development costs data
      // Implementation for other sections
      
    } catch (error) {
      console.error("Error loading model from localStorage:", error);
    }
  }, [modelState]);
  
  // Save model data to localStorage
  const saveModel = useCallback(() => {
    try {
      setIsAutoSaving(true);
      console.log("Saving model to localStorage");
      
      const currentTime = new Date();
      setLastSaved(currentTime);
      
      // Construct the model object
      const modelToSave = {
        property: {
          projectName: modelState.property.projectName,
          projectLocation: modelState.property.projectLocation,
          projectType: modelState.property.projectType,
          farAllowance: modelState.property.farAllowance,
          lotSize: modelState.property.lotSize,
          floorPlateTemplates: modelState.property.floorPlateTemplates,
          products: modelState.property.products,
          buildingFloors: modelState.property.buildingFloors
        },
        lastSaved: currentTime.toISOString(),
        meta: meta
        // Other sections will be added here
      };
      
      // Save to localStorage
      localStorage.setItem('realEstateModel', JSON.stringify(modelToSave));
      console.log("Model saved to localStorage");
      
      setHasUnsavedChanges(false);
      setTimeout(() => setIsAutoSaving(false), 500);
    } catch (error) {
      console.error("Error saving model to localStorage:", error);
      setIsAutoSaving(false);
    }
  }, [
    modelState.property.projectName,
    modelState.property.projectLocation,
    modelState.property.projectType,
    modelState.property.farAllowance,
    modelState.property.lotSize,
    modelState.property.floorPlateTemplates,
    modelState.property.products,
    modelState.property.buildingFloors,
    meta
    // Dependencies for other sections will be added here
  ]);
  
  // Debounced auto-save
  useEffect(() => {
    if (hasUnsavedChanges) {
      console.log("Changes detected, setting up auto-save");
      const timer = setTimeout(() => {
        saveModel();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [
    saveModel,
    hasUnsavedChanges
  ]);
  
  // Auto-save on interval
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (hasUnsavedChanges) {
        console.log("Auto-saving on interval");
        saveModel();
      }
    }, 30000);
    
    return () => clearInterval(saveInterval);
  }, [saveModel, hasUnsavedChanges]);
  
  // Load model on mount
  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);
  
  // Reset model function
  const resetModel = async (): Promise<void> => {
    try {
      // Clear localStorage
      localStorage.removeItem('realEstateModel');
      console.log("Model reset: localStorage cleared");
      
      // Reset state
      if (modelState.property.setProjectName) modelState.property.setProjectName("");
      if (modelState.property.setProjectLocation) modelState.property.setProjectLocation("");
      if (modelState.property.setProjectType) modelState.property.setProjectType("");
      if (modelState.property.setFarAllowance) modelState.property.setFarAllowance(0);
      if (modelState.property.setLotSize) modelState.property.setLotSize(0);
      if (modelState.property.setAllFloorPlateTemplates) modelState.property.setAllFloorPlateTemplates([]);
      if (modelState.property.setAllProducts) modelState.property.setAllProducts([]);
      if (modelState.property.setAllBuildingFloors) modelState.property.setAllBuildingFloors([]);
      
      // Reset other sections as needed
      
      console.log("Model reset: state cleared");
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error during model reset:", error);
      return Promise.reject(error);
    }
  };
  
  // Create context value
  const contextValue: ModelContextType = {
    activeTab,
    setActiveTab,
    property: modelState.property,
    developmentCosts: modelState.developmentCosts,
    timeline: modelState.timeline,
    expenses: modelState.expenses,
    revenue: modelState.revenue,
    financing: modelState.financing,
    disposition: modelState.disposition,
    sensitivity: modelState.sensitivity,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    isAutoSaving,
    saveModel,
    resetModel,
    lastSaved,
    meta
  };
  
  return (
    <ModelContext.Provider value={contextValue}>
      {children}
    </ModelContext.Provider>
  );
};

// Hook to use the model context
export const useModel = () => {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error("useModel must be used within a ModelProvider");
  }
  return context;
};
