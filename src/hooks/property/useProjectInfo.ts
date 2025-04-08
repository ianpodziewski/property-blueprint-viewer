
import { useState, useEffect, useCallback } from "react";
import { saveToLocalStorage, loadFromLocalStorage } from "../useLocalStoragePersistence";

const STORAGE_KEY = "realEstateModel_extendedProjectInfo";

export const useProjectInfo = () => {
  const [projectName, setProjectName] = useState<string>("");
  const [projectLocation, setProjectLocation] = useState<string>("");
  const [projectType, setProjectType] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Load project information from localStorage on mount
  useEffect(() => {
    const storedProjectInfo = loadFromLocalStorage(STORAGE_KEY, {
      projectName: "",
      projectLocation: "",
      projectType: ""
    });

    setProjectName(storedProjectInfo.projectName);
    setProjectLocation(storedProjectInfo.projectLocation);
    setProjectType(storedProjectInfo.projectType);
    setIsInitialized(true);
  }, []);

  // Save project information to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      saveToLocalStorage(STORAGE_KEY, {
        projectName,
        projectLocation,
        projectType
      });
    }
  }, [projectName, projectLocation, projectType, isInitialized]);

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
