
import { useState, useEffect } from "react";

// Helper to safely retrieve saved values from localStorage
const getSavedValue = (key: string, defaultValue: string): string => {
  try {
    const savedModel = localStorage.getItem('realEstateModel');
    if (savedModel) {
      const parsedModel = JSON.parse(savedModel);
      if (parsedModel.property && parsedModel.property[key] !== undefined) {
        return parsedModel.property[key];
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

export const usePropertyState = () => {
  // Project Information with initial values from localStorage
  const [projectName, setProjectName] = useState<string>(getSavedValue('projectName', ""));
  const [projectLocation, setProjectLocation] = useState<string>(getSavedValue('projectLocation', ""));
  const [projectType, setProjectType] = useState<string>(getSavedValue('projectType', ""));
  
  // Building Parameters
  const [farAllowance, setFarAllowance] = useState<number>(getSavedNumericValue('farAllowance', 0));
  const [lotSize, setLotSize] = useState<number>(getSavedNumericValue('lotSize', 0));
  
  // Project Configuration - Floor Plate Templates
  const [floorPlateTemplates, setFloorPlateTemplates] = useState<FloorPlateTemplate[]>(
    getSavedArrayValue('floorPlateTemplates', [])
  );
  
  // Calculate maximum buildable area
  const maxBuildableArea = farAllowance > 0 && lotSize > 0 ? (lotSize * farAllowance / 100) : 0;
  
  // Add a new floor plate template
  const addFloorPlateTemplate = (template: Omit<FloorPlateTemplate, 'id'>) => {
    const newTemplate: FloorPlateTemplate = {
      ...template,
      id: crypto.randomUUID()
    };
    setFloorPlateTemplates([...floorPlateTemplates, newTemplate]);
  };
  
  // Update an existing floor plate template
  const updateFloorPlateTemplate = (id: string, updates: Partial<Omit<FloorPlateTemplate, 'id'>>) => {
    setFloorPlateTemplates(
      floorPlateTemplates.map(template => 
        template.id === id ? { ...template, ...updates } : template
      )
    );
  };
  
  // Delete a floor plate template
  const deleteFloorPlateTemplate = (id: string) => {
    setFloorPlateTemplates(floorPlateTemplates.filter(template => template.id !== id));
  };
  
  // Log state changes for debugging
  useEffect(() => {
    console.log("Property state updated:", {
      projectName, projectLocation, projectType, 
      farAllowance, lotSize, maxBuildableArea,
      floorPlateTemplates
    });
  }, [projectName, projectLocation, projectType, farAllowance, lotSize, maxBuildableArea, floorPlateTemplates]);
  
  return {
    // Project Information
    projectName, setProjectName,
    projectLocation, setProjectLocation,
    projectType, setProjectType,
    
    // Building Parameters
    farAllowance, setFarAllowance,
    lotSize, setLotSize,
    maxBuildableArea,
    
    // Project Configuration
    floorPlateTemplates,
    addFloorPlateTemplate,
    updateFloorPlateTemplate,
    deleteFloorPlateTemplate
  };
};
