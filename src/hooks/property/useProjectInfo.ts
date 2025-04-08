
import { useState, useEffect, useCallback } from "react";
import { saveToLocalStorage, loadFromLocalStorage } from "../useLocalStoragePersistence";

const STORAGE_KEY = "realEstateModel_extendedProjectInfo";

export const useProjectInfo = () => {
  const [projectName, setProjectName] = useState<string>("");
  const [projectLocation, setProjectLocation] = useState<string>("");
  const [projectType, setProjectType] = useState<string>("");

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
  }, []);

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
