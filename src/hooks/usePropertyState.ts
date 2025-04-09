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

// Interface for unit allocation on a floor
export interface UnitAllocation {
  unitTypeId: string;
  productId: string;
  quantity: number;
}

// Interface for a building floor
export interface BuildingFloor {
  id: string;
  label: string;
  position: number;
  templateId: string;
  units: UnitAllocation[];
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
  
  // Project Configuration - Building Layout
  const [buildingFloors, setBuildingFloors] = useState<BuildingFloor[]>([]);
  
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

  // Building Layout Functions
  
  // Add a new floor to the building
  const addBuildingFloor = () => {
    const newPosition = buildingFloors.length > 0 
      ? Math.max(...buildingFloors.map(floor => floor.position)) + 1 
      : 1;
    
    const newFloor: BuildingFloor = {
      id: crypto.randomUUID(),
      label: `Floor ${newPosition}`,
      position: newPosition,
      templateId: floorPlateTemplates.length > 0 ? floorPlateTemplates[0].id : "",
      units: []
    };
    
    console.log("Adding new floor:", newFloor);
    setBuildingFloors(prev => [...prev, newFloor]);
  };
  
  // Update an existing floor
  const updateBuildingFloor = (id: string, updates: Partial<Omit<BuildingFloor, 'id'>>) => {
    console.log(`Updating floor ${id} with:`, updates);
    setBuildingFloors(
      buildingFloors.map(floor => 
        floor.id === id ? { ...floor, ...updates } : floor
      )
    );
  };
  
  // Delete a floor
  const deleteBuildingFloor = (id: string) => {
    console.log(`Deleting floor ${id}`);
    setBuildingFloors(buildingFloors.filter(floor => floor.id !== id));
  };
  
  // Reorder floors
  const reorderBuildingFloors = (floorId: string, newPosition: number) => {
    console.log(`Reordering floor ${floorId} to position ${newPosition}`);
    
    const floorToMove = buildingFloors.find(floor => floor.id === floorId);
    if (!floorToMove) return;
    
    const updatedFloors = buildingFloors
      .filter(floor => floor.id !== floorId)
      .map(floor => {
        if (floorToMove.position < newPosition) {
          // Moving up: decrease position of floors in between
          if (floor.position > floorToMove.position && floor.position <= newPosition) {
            return { ...floor, position: floor.position - 1 };
          }
        } else if (floorToMove.position > newPosition) {
          // Moving down: increase position of floors in between
          if (floor.position >= newPosition && floor.position < floorToMove.position) {
            return { ...floor, position: floor.position + 1 };
          }
        }
        return floor;
      });
    
    // Add the moved floor with its new position
    updatedFloors.push({ ...floorToMove, position: newPosition });
    
    // Sort by position for display
    setBuildingFloors(updatedFloors.sort((a, b) => a.position - b.position));
  };
  
  // Update unit allocation on a floor
  const updateUnitAllocation = (floorId: string, productId: string, unitTypeId: string, quantity: number) => {
    console.log(`Updating unit allocation for floor ${floorId}, product ${productId}, unit type ${unitTypeId} to ${quantity}`);
    
    setBuildingFloors(
      buildingFloors.map(floor => {
        if (floor.id === floorId) {
          const existingUnitIndex = floor.units.findIndex(
            unit => unit.unitTypeId === unitTypeId && unit.productId === productId
          );
          
          let updatedUnits;
          if (existingUnitIndex >= 0) {
            // Update existing unit allocation
            if (quantity <= 0) {
              // Remove unit allocation if quantity is zero or negative
              updatedUnits = floor.units.filter((_, index) => index !== existingUnitIndex);
            } else {
              // Update quantity
              updatedUnits = [...floor.units];
              updatedUnits[existingUnitIndex] = { ...updatedUnits[existingUnitIndex], quantity };
            }
          } else if (quantity > 0) {
            // Add new unit allocation
            updatedUnits = [...floor.units, { unitTypeId, productId, quantity }];
          } else {
            // No change needed for quantity <= 0 on non-existing allocation
            return floor;
          }
          
          return { ...floor, units: updatedUnits };
        }
        return floor;
      })
    );
  };
  
  // Set all building floors at once (used during initial load)
  const setAllBuildingFloors = (floors: BuildingFloor[]) => {
    console.log("Setting all building floors:", floors);
    setBuildingFloors(floors);
  };
  
  // Calculate total building area
  const calculateTotalBuildingArea = (): number => {
    return buildingFloors.reduce((total, floor) => {
      const template = floorPlateTemplates.find(t => t.id === floor.templateId);
      return total + (template ? template.grossArea : 0);
    }, 0);
  };
  
  // Calculate total units by type
  const calculateTotalUnitsByType = (): Record<string, number> => {
    const totals: Record<string, number> = {};
    
    buildingFloors.forEach(floor => {
      floor.units.forEach(unit => {
        const key = unit.unitTypeId;
        totals[key] = (totals[key] || 0) + unit.quantity;
      });
    });
    
    return totals;
  };
  
  // Calculate used area on a floor
  const calculateUsedFloorArea = (floorId: string): number => {
    const floor = buildingFloors.find(f => f.id === floorId);
    if (!floor) return 0;
    
    return floor.units.reduce((total, unitAllocation) => {
      // Find the unit type for this allocation
      let unitType: UnitType | undefined;
      
      for (const product of products) {
        unitType = product.unitTypes.find(ut => ut.id === unitAllocation.unitTypeId);
        if (unitType) break;
      }
      
      if (!unitType) return total;
      
      return total + (unitType.grossArea * unitAllocation.quantity);
    }, 0);
  };
  
  // Log state changes for debugging
  useEffect(() => {
    console.log("Property state updated:", {
      projectName, projectLocation, projectType, 
      farAllowance, lotSize, maxBuildableArea,
      floorPlateTemplates,
      products,
      buildingFloors
    });
  }, [projectName, projectLocation, projectType, farAllowance, lotSize, maxBuildableArea, floorPlateTemplates, products, buildingFloors]);
  
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
    
    // Project Configuration - Building Layout
    buildingFloors,
    addBuildingFloor,
    updateBuildingFloor,
    deleteBuildingFloor,
    reorderBuildingFloors,
    updateUnitAllocation,
    setAllBuildingFloors,
    calculateTotalBuildingArea,
    calculateTotalUnitsByType,
    calculateUsedFloorArea
  };
};
