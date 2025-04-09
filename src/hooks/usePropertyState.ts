
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

export const usePropertyState = () => {
  // Project Information with initial values from localStorage
  const [projectName, setProjectName] = useState<string>(getSavedValue('projectName', ""));
  const [projectLocation, setProjectLocation] = useState<string>(getSavedValue('projectLocation', ""));
  const [projectType, setProjectType] = useState<string>(getSavedValue('projectType', ""));
  
  // Building Parameters
  const [farAllowance, setFarAllowance] = useState<number>(getSavedNumericValue('farAllowance', 0));
  const [lotSize, setLotSize] = useState<number>(getSavedNumericValue('lotSize', 0));
  
  // Calculate maximum buildable area
  const maxBuildableArea = farAllowance > 0 && lotSize > 0 ? (lotSize * farAllowance / 100) : 0;
  
  // Log state changes for debugging
  useEffect(() => {
    console.log("Property state updated:", {
      projectName, projectLocation, projectType, 
      farAllowance, lotSize, maxBuildableArea
    });
  }, [projectName, projectLocation, projectType, farAllowance, lotSize, maxBuildableArea]);
  
  return {
    // Project Information
    projectName, setProjectName,
    projectLocation, setProjectLocation,
    projectType, setProjectType,
    
    // Building Parameters
    farAllowance, setFarAllowance,
    lotSize, setLotSize,
    maxBuildableArea
  };
};
