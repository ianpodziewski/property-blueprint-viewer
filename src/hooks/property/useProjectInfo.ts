
import { useState, useEffect, useCallback } from "react";
import { saveToLocalStorage, loadFromLocalStorage } from "../useLocalStoragePersistence";

const STORAGE_KEY = "realEstateModel_extendedProjectInfo";

export const useProjectInfo = () => {
  // Initialize state directly with data from localStorage
  const [projectName, setProjectName] = useState<string>(() => {
    const storedProjectInfo = loadFromLocalStorage(STORAGE_KEY, {
      projectName: "",
      projectLocation: "",
      projectType: ""
    });
    return storedProjectInfo.projectName;
  });
  
  const [projectLocation, setProjectLocation] = useState<string>(() => {
    const storedProjectInfo = loadFromLocalStorage(STORAGE_KEY, {
      projectName: "",
      projectLocation: "",
      projectType: ""
    });
    return storedProjectInfo.projectLocation;
  });
  
  const [projectType, setProjectType] = useState<string>(() => {
    const storedProjectInfo = loadFromLocalStorage(STORAGE_KEY, {
      projectName: "",
      projectLocation: "",
      projectType: ""
    });
    return storedProjectInfo.projectType;
  });

  // Save project information to localStorage whenever it changes
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEY, {
      projectName,
      projectLocation,
      projectType
    });
  }, [projectName, projectLocation, projectType]);

  // Reset all project info data
  const resetAllData = useCallback(() => {
    setProjectName("");
    setProjectLocation("");
    setProjectType("");
  }, []);

  return {
    projectName, setProjectName,
    projectLocation, setProjectLocation,
    projectType, setProjectType,
    resetAllData
  };
};
