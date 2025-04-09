
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

export const usePropertyState = () => {
  // Project Information with initial values from localStorage
  const [projectName, setProjectName] = useState<string>(getSavedValue('projectName', ""));
  const [projectLocation, setProjectLocation] = useState<string>(getSavedValue('projectLocation', ""));
  const [projectType, setProjectType] = useState<string>(getSavedValue('projectType', ""));
  
  // Log state changes for debugging
  useEffect(() => {
    console.log("Property state updated:", {
      projectName, projectLocation, projectType
    });
  }, [projectName, projectLocation, projectType]);
  
  return {
    // Project Information
    projectName, setProjectName,
    projectLocation, setProjectLocation,
    projectType, setProjectType
  };
};
