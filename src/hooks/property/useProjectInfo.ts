
import { useState, useEffect, useCallback } from "react";
import { saveToLocalStorage, loadFromLocalStorage } from "../useLocalStoragePersistence";

const STORAGE_KEY = "realEstateModel_extendedProjectInfo";

export const useProjectInfo = () => {
  const [projectName, setProjectName] = useState<string>("");
  const [projectLocation, setProjectLocation] = useState<string>("");
  const [projectType, setProjectType] = useState<string>("");

  // Load project information from localStorage on mount with debounce
  useEffect(() => {
    let isMounted = true;
    
    // Use setTimeout to break potential infinite loops
    setTimeout(() => {
      if (!isMounted) return;
      
      try {
        const storedProjectInfo = loadFromLocalStorage(STORAGE_KEY, {
          projectName: "",
          projectLocation: "",
          projectType: ""
        });

        setProjectName(prevName => {
          if (prevName !== storedProjectInfo.projectName) {
            return storedProjectInfo.projectName;
          }
          return prevName;
        });
        
        setProjectLocation(prevLocation => {
          if (prevLocation !== storedProjectInfo.projectLocation) {
            return storedProjectInfo.projectLocation;
          }
          return prevLocation;
        });
        
        setProjectType(prevType => {
          if (prevType !== storedProjectInfo.projectType) {
            return storedProjectInfo.projectType;
          }
          return prevType;
        });
      } catch (error) {
        console.error("Error loading project info:", error);
      }
    }, 100);
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Save project information to localStorage with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        saveToLocalStorage(STORAGE_KEY, {
          projectName,
          projectLocation,
          projectType
        });
      } catch (error) {
        console.error("Error saving project info:", error);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [projectName, projectLocation, projectType]);

  return {
    projectName, setProjectName,
    projectLocation, setProjectLocation,
    projectType, setProjectType
  };
};
