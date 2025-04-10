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

// Simplified allocation method to just percentage or fixed
export type AllocationMethod = 'percentage' | 'fixed';

// Interface for non-rentable space type - simplified
export interface NonRentableType {
  id: string;
  name: string;
  squareFootage: number;
  percentage?: number;
  allocationMethod: AllocationMethod;
  isPercentageBased?: boolean; // Kept for backward compatibility
  floorConstraints?: any; // Kept for backward compatibility
}

// Interface for floor - kept unchanged
export interface Floor {
  id: string;
  label: string;
  position: number;
  templateId: string;
  projectId?: string;
  floorType?: 'aboveground' | 'underground';
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
  
  // Project Configuration - Non-Rentable Space Types
  const [nonRentableTypes, setNonRentableTypes] = useState<NonRentableType[]>(
    getSavedArrayValue('nonRentableTypes', [])
  );
  
  // Project Configuration - Building Layout
  const [floors, setFloors] = useState<Floor[]>([]);
  
  // Calculate maximum buildable area
  const maxBuildableArea = farAllowance > 0 && lotSize > 0 ? (lotSize * farAllowance / 100) : 0;
  
  // Floor plate template functions
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
  
  const deleteFloorPlateTemplate = (id: string) => {
    console.log(`Deleting template ${id}`);
    setFloorPlateTemplates(floorPlateTemplates.filter(template => template.id !== id));
  };
  
  const setAllFloorPlateTemplates = (templates: FloorPlateTemplate[]) => {
    console.log("Setting all floor plate templates:", templates);
    setFloorPlateTemplates(templates);
  };
  
  // Product and unit type functions
  const addProduct = (name: string) => {
    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: name.trim(),
      unitTypes: []
    };
    console.log("Adding new product:", newProduct);
    setProducts(prev => [...prev, newProduct]);
  };
  
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
  
  const deleteProduct = (id: string) => {
    console.log(`Deleting product ${id}`);
    setProducts(products.filter(product => product.id !== id));
  };
  
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
  
  const setAllProducts = (newProducts: Product[]) => {
    console.log("Setting all products:", newProducts);
    setProducts(newProducts);
  };
  
  // Add a new non-rentable space type - simplified
  const addNonRentableType = (nonRentable: Omit<NonRentableType, 'id'>) => {
    const isPercentageBased = nonRentable.allocationMethod === 'percentage';
    
    const newNonRentable: NonRentableType = {
      ...nonRentable,
      id: crypto.randomUUID(),
      squareFootage: isPercentageBased ? 0 : safeNumberConversion(nonRentable.squareFootage),
      percentage: isPercentageBased ? safeNumberConversion(nonRentable.percentage || 0) : undefined,
      allocationMethod: nonRentable.allocationMethod,
      isPercentageBased: isPercentageBased, // For backward compatibility
      floorConstraints: nonRentable.floorConstraints || {} // For backward compatibility
    };
    
    console.log("Adding new non-rentable space type:", newNonRentable);
    setNonRentableTypes(prev => [...prev, newNonRentable]);
  };
  
  // Update an existing non-rentable space type - simplified
  const updateNonRentableType = (id: string, updates: Partial<Omit<NonRentableType, 'id'>>) => {
    console.log(`Updating non-rentable space type ${id} with:`, updates);
    
    const isPercentageBased = updates.allocationMethod === 'percentage';
    
    setNonRentableTypes(
      nonRentableTypes.map(type => 
        type.id === id ? { 
          ...type, 
          ...updates,
          squareFootage: isPercentageBased ? 0 : 
                      (updates.squareFootage !== undefined ? safeNumberConversion(updates.squareFootage) : type.squareFootage),
          percentage: isPercentageBased ? 
                   (updates.percentage !== undefined ? safeNumberConversion(updates.percentage) : type.percentage) : undefined,
          isPercentageBased: isPercentageBased // For backward compatibility
        } : type
      )
    );
  };
  
  // Delete a non-rentable space type
  const deleteNonRentableType = (id: string) => {
    console.log(`Deleting non-rentable space type ${id}`);
    setNonRentableTypes(nonRentableTypes.filter(type => type.id !== id));
  };
  
  // Set all non-rentable space types at once (used during initial load)
  const setAllNonRentableTypes = (types: NonRentableType[]) => {
    console.log("Setting all non-rentable space types:", types);
    setNonRentableTypes(types);
  };
  
  // Floor management functions
  const addFloor = () => {
    const newPosition = floors.length > 0 
      ? Math.max(...floors.map(floor => floor.position)) + 1 
      : 1;
    
    const newFloor: Floor = {
      id: crypto.randomUUID(),
      label: `Floor ${newPosition}`,
      position: newPosition,
      templateId: floorPlateTemplates.length > 0 ? floorPlateTemplates[0].id : "",
      projectId: crypto.randomUUID(),
      floorType: 'aboveground'
    };
    
    console.log("Adding new floor:", newFloor);
    setFloors(prev => [...prev, newFloor]);
    return newFloor;
  };
  
  const updateFloor = (id: string, updates: Partial<Omit<Floor, 'id'>>) => {
    console.log(`Updating floor ${id} with:`, updates);
    setFloors(
      floors.map(floor => 
        floor.id === id ? { ...floor, ...updates } : floor
      )
    );
  };
  
  const deleteFloor = (id: string) => {
    console.log(`Deleting floor ${id}`);
    setFloors(floors.filter(floor => floor.id !== id));
  };
  
  const setAllFloors = (newFloors: Floor[]) => {
    console.log("Setting all floors:", newFloors);
    setFloors(newFloors);
  };
  
  // Get floor template by ID
  const getFloorTemplateById = (templateId: string): FloorPlateTemplate | undefined => {
    return floorPlateTemplates.find(template => template.id === templateId);
  };
  
  // Log state changes for debugging
  useEffect(() => {
    console.log("Property state updated:", {
      projectName, projectLocation, projectType, 
      farAllowance, lotSize, maxBuildableArea,
      floorPlateTemplates,
      products,
      nonRentableTypes,
      floors
    });
  }, [projectName, projectLocation, projectType, farAllowance, lotSize, maxBuildableArea, floorPlateTemplates, products, nonRentableTypes, floors]);
  
  useEffect(() => {
    console.log("NonRentableTypes updated in usePropertyState:", nonRentableTypes);
  }, [nonRentableTypes]);
  
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
    
    // Project Configuration - Non-Rentable Space
    nonRentableTypes,
    addNonRentableType,
    updateNonRentableType,
    deleteNonRentableType,
    setAllNonRentableTypes,
    
    // Project Configuration - Building Layout
    floors,
    addFloor,
    updateFloor,
    deleteFloor,
    setAllFloors,
    getFloorTemplateById
  };
};
