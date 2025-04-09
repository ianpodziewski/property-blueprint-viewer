
import { useState, useEffect } from "react";
import { safeNumberConversion } from "@/utils/modelValidation";

// Helper to safely retrieve saved values from localStorage
const getSavedValue = (key: string, defaultValue: string): string => {
  try {
    const savedModel = localStorage.getItem('realEstateModel');
    if (savedModel) {
      const parsedModel = JSON.parse(savedModel);
      if (parsedModel.property && parsedModel.property[key] !== undefined) {
        return parsedModel.property[key] || defaultValue;
      }
    }
  } catch (error) {
    console.error(`Error retrieving saved value for ${key}:`, error);
  }
  return defaultValue;
};

// Helper to safely retrieve numeric values from localStorage
const getSavedNumericValue = (key: string, defaultValue: number): number => {
  try {
    const savedModel = localStorage.getItem('realEstateModel');
    if (savedModel) {
      const parsedModel = JSON.parse(savedModel);
      if (parsedModel.property && parsedModel.property[key] !== undefined) {
        const value = Number(parsedModel.property[key]);
        return isNaN(value) ? defaultValue : value;
      }
    }
  } catch (error) {
    console.error(`Error retrieving saved numeric value for ${key}:`, error);
  }
  return defaultValue;
};

// Helper to safely retrieve array values from localStorage
const getSavedArrayValue = (key: string, defaultValue: any[]): any[] => {
  try {
    const savedModel = localStorage.getItem('realEstateModel');
    if (savedModel) {
      const parsedModel = JSON.parse(savedModel);
      if (parsedModel.property && Array.isArray(parsedModel.property[key])) {
        return parsedModel.property[key];
      }
    }
  } catch (error) {
    console.error(`Error retrieving saved array value for ${key}:`, error);
  }
  return defaultValue;
};

// Interface for floor plate template
export interface FloorPlateTemplate {
  id: string;
  name: string;
  width?: number;
  length?: number;
  grossArea: number;
}

// Interface for unit type
export interface UnitType {
  id: string;
  unitType: string;
  numberOfUnits: number;
  width?: number;
  length?: number;
  grossArea: number;
}

// Interface for product (container for unit types)
export interface Product {
  id: string;
  name: string;
  unitTypes: UnitType[];
}

export const usePropertyState = () => {
  console.log("Initializing usePropertyState hook");
  
  // Project Information with initial values from localStorage
  const [projectName, setProjectName] = useState<string>(getSavedValue('projectName', ""));
  const [projectLocation, setProjectLocation] = useState<string>(getSavedValue('projectLocation', ""));
  const [projectType, setProjectType] = useState<string>(getSavedValue('projectType', ""));
  
  // Building Parameters
  const [farAllowance, setFarAllowance] = useState<number>(getSavedNumericValue('farAllowance', 0));
  const [lotSize, setLotSize] = useState<number>(getSavedNumericValue('lotSize', 0));
  
  // Project Configuration - Floor Plate Templates
  const [floorPlateTemplates, setFloorPlateTemplates] = useState<FloorPlateTemplate[]>([]);
  
  // Project Configuration - Unit Mix (Products)
  const [products, setProducts] = useState<Product[]>([]);
  
  // Flag to track initial load completion
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Load saved data on initial render
  useEffect(() => {
    try {
      console.log("Loading saved property data from localStorage");
      
      // Load floor plate templates
      const savedTemplates = getSavedArrayValue('floorPlateTemplates', []);
      if (savedTemplates.length > 0) {
        console.log(`Loading ${savedTemplates.length} floor plate templates from localStorage`);
        setFloorPlateTemplates(savedTemplates);
      }
      
      // Load products and unit mix
      const savedProducts = getSavedArrayValue('products', []);
      if (savedProducts.length > 0) {
        console.log(`Loading ${savedProducts.length} products with unit types from localStorage`);
        setProducts(savedProducts);
      }
      
      setInitialLoadComplete(true);
      console.log("Initial property data load complete");
    } catch (error) {
      console.error("Error loading saved property data:", error);
      setInitialLoadComplete(true);
    }
  }, []);
  
  // Calculate maximum buildable area
  const maxBuildableArea = farAllowance > 0 && lotSize > 0 ? (lotSize * farAllowance / 100) : 0;
  
  // Add a new floor plate template
  const addFloorPlateTemplate = (template: Omit<FloorPlateTemplate, 'id'>) => {
    const newTemplate: FloorPlateTemplate = {
      ...template,
      id: crypto.randomUUID(),
      width: template.width !== undefined ? safeNumberConversion(template.width) : undefined,
      length: template.length !== undefined ? safeNumberConversion(template.length) : undefined,
      grossArea: safeNumberConversion(template.grossArea)
    };
    console.log("Adding new template:", newTemplate);
    setFloorPlateTemplates(prev => [...prev, newTemplate]);
  };
  
  // Update an existing floor plate template
  const updateFloorPlateTemplate = (id: string, updates: Partial<Omit<FloorPlateTemplate, 'id'>>) => {
    console.log(`Updating template ${id} with:`, updates);
    setFloorPlateTemplates(
      floorPlateTemplates.map(template => 
        template.id === id ? { 
          ...template, 
          ...updates,
          width: updates.width !== undefined ? safeNumberConversion(updates.width) : template.width,
          length: updates.length !== undefined ? safeNumberConversion(updates.length) : template.length,
          grossArea: updates.grossArea !== undefined ? safeNumberConversion(updates.grossArea) : template.grossArea
        } : template
      )
    );
  };
  
  // Delete a floor plate template
  const deleteFloorPlateTemplate = (id: string) => {
    console.log(`Deleting template ${id}`);
    setFloorPlateTemplates(floorPlateTemplates.filter(template => template.id !== id));
  };
  
  // Set all floor plate templates at once (used during initial load)
  const setAllFloorPlateTemplates = (templates: FloorPlateTemplate[]) => {
    console.log("Setting all floor plate templates:", templates);
    setFloorPlateTemplates(templates);
  };
  
  // Add a new product
  const addProduct = (name: string) => {
    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: name.trim(),
      unitTypes: []
    };
    console.log("Adding new product:", newProduct);
    setProducts(prev => [...prev, newProduct]);
  };
  
  // Update an existing product
  const updateProduct = (id: string, name: string) => {
    console.log(`Updating product ${id} with name:`, name);
    setProducts(
      products.map(product => 
        product.id === id ? { 
          ...product, 
          name: name.trim()
        } : product
      )
    );
  };
  
  // Delete a product
  const deleteProduct = (id: string) => {
    console.log(`Deleting product ${id}`);
    setProducts(products.filter(product => product.id !== id));
  };
  
  // Add a new unit type to a product
  const addUnitType = (productId: string, unit: Omit<UnitType, 'id'>) => {
    const newUnit: UnitType = {
      ...unit,
      id: crypto.randomUUID(),
      unitType: unit.unitType.trim(),
      numberOfUnits: safeNumberConversion(unit.numberOfUnits),
      width: unit.width !== undefined ? safeNumberConversion(unit.width) : undefined,
      length: unit.length !== undefined ? safeNumberConversion(unit.length) : undefined,
      grossArea: safeNumberConversion(unit.grossArea)
    };
    
    console.log(`Adding new unit type to product ${productId}:`, newUnit);
    
    setProducts(
      products.map(product => 
        product.id === productId ? {
          ...product,
          unitTypes: [...product.unitTypes, newUnit]
        } : product
      )
    );
  };
  
  // Update an existing unit type
  const updateUnitType = (productId: string, unitId: string, updates: Partial<Omit<UnitType, 'id'>>) => {
    console.log(`Updating unit type ${unitId} in product ${productId} with:`, updates);
    
    setProducts(
      products.map(product => 
        product.id === productId ? {
          ...product,
          unitTypes: product.unitTypes.map(unit => 
            unit.id === unitId ? { 
              ...unit, 
              ...updates,
              unitType: updates.unitType !== undefined ? updates.unitType.trim() : unit.unitType,
              numberOfUnits: updates.numberOfUnits !== undefined ? safeNumberConversion(updates.numberOfUnits) : unit.numberOfUnits,
              width: updates.width !== undefined ? safeNumberConversion(updates.width) : unit.width,
              length: updates.length !== undefined ? safeNumberConversion(updates.length) : unit.length,
              grossArea: updates.grossArea !== undefined ? safeNumberConversion(updates.grossArea) : unit.grossArea
            } : unit
          )
        } : product
      )
    );
  };
  
  // Delete a unit type
  const deleteUnitType = (productId: string, unitId: string) => {
    console.log(`Deleting unit type ${unitId} from product ${productId}`);
    
    setProducts(
      products.map(product => 
        product.id === productId ? {
          ...product,
          unitTypes: product.unitTypes.filter(unit => unit.id !== unitId)
        } : product
      )
    );
  };
  
  // Set all products at once (used during initial load)
  const setAllProducts = (newProducts: Product[]) => {
    console.log("Setting all products:", newProducts);
    setProducts(newProducts);
  };
  
  // Log state changes for debugging
  useEffect(() => {
    if (initialLoadComplete) {
      console.log("Property state updated after initial load:", {
        projectName, projectLocation, projectType, 
        farAllowance, lotSize, maxBuildableArea,
        floorPlateTemplates,
        products
      });
    }
  }, [initialLoadComplete, projectName, projectLocation, projectType, farAllowance, lotSize, maxBuildableArea, floorPlateTemplates, products]);
  
  return {
    // Project Information
    projectName, setProjectName,
    projectLocation, setProjectLocation,
    projectType, setProjectType,
    
    // Building Parameters
    farAllowance, setFarAllowance,
    lotSize, setLotSize,
    maxBuildableArea,
    
    // Project Configuration - Floor Plate Templates
    floorPlateTemplates,
    addFloorPlateTemplate,
    updateFloorPlateTemplate,
    deleteFloorPlateTemplate,
    setAllFloorPlateTemplates,
    
    // Project Configuration - Unit Mix (Products)
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    addUnitType,
    updateUnitType,
    deleteUnitType,
    setAllProducts,
    
    // Loading state
    initialLoadComplete
  };
};
