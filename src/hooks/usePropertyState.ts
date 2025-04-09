
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
  product: string;
  unitType: string;
  width?: number;
  length?: number;
  grossArea: number;
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
  // Important: Don't load templates directly in useState initialization to avoid duplication
  const [floorPlateTemplates, setFloorPlateTemplates] = useState<FloorPlateTemplate[]>([]);
  
  // Project Configuration - Unit Mix
  const [unitMix, setUnitMix] = useState<UnitType[]>([]);
  
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
  
  // Add a new unit type
  const addUnitType = (unit: Omit<UnitType, 'id'>) => {
    const newUnit: UnitType = {
      ...unit,
      id: crypto.randomUUID(),
      width: unit.width !== undefined ? safeNumberConversion(unit.width) : undefined,
      length: unit.length !== undefined ? safeNumberConversion(unit.length) : undefined,
      grossArea: safeNumberConversion(unit.grossArea)
    };
    console.log("Adding new unit type:", newUnit);
    setUnitMix(prev => [...prev, newUnit]);
  };
  
  // Update an existing unit type
  const updateUnitType = (id: string, updates: Partial<Omit<UnitType, 'id'>>) => {
    console.log(`Updating unit type ${id} with:`, updates);
    setUnitMix(
      unitMix.map(unit => 
        unit.id === id ? { 
          ...unit, 
          ...updates,
          width: updates.width !== undefined ? safeNumberConversion(updates.width) : unit.width,
          length: updates.length !== undefined ? safeNumberConversion(updates.length) : unit.length,
          grossArea: updates.grossArea !== undefined ? safeNumberConversion(updates.grossArea) : unit.grossArea
        } : unit
      )
    );
  };
  
  // Delete a unit type
  const deleteUnitType = (id: string) => {
    console.log(`Deleting unit type ${id}`);
    setUnitMix(unitMix.filter(unit => unit.id !== id));
  };
  
  // Set all unit types at once (used during initial load)
  const setAllUnitTypes = (units: UnitType[]) => {
    console.log("Setting all unit types:", units);
    setUnitMix(units);
  };
  
  // Log state changes for debugging
  useEffect(() => {
    console.log("Property state updated:", {
      projectName, projectLocation, projectType, 
      farAllowance, lotSize, maxBuildableArea,
      floorPlateTemplates,
      unitMix
    });
  }, [projectName, projectLocation, projectType, farAllowance, lotSize, maxBuildableArea, floorPlateTemplates, unitMix]);
  
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
    
    // Project Configuration - Unit Mix
    unitMix,
    addUnitType,
    updateUnitType,
    deleteUnitType,
    setAllUnitTypes
  };
};
