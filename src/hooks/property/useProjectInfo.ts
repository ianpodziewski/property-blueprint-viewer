
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { 
  safeLoadFromLocalStorage, 
  safeSaveToLocalStorage 
} from "../useSafeStorage";

const STORAGE_KEY = "realEstateModel_extendedProjectInfo";

// Validation function for project info
const validateProjectInfo = (data: any): boolean => {
  // Simple validation to ensure the object has the expected properties
  return data && 
    typeof data === 'object' && 
    'projectName' in data && 
    'projectLocation' in data && 
    'projectType' in data;
};

export const useProjectInfo = () => {
  const [projectName, setProjectName] = useState<string>("");
  const [projectLocation, setProjectLocation] = useState<string>("");
  const [projectType, setProjectType] = useState<string>("");
  const { toast } = useToast();

  // Load project information from localStorage on mount
  useEffect(() => {
    try {
      const storedProjectInfo = safeLoadFromLocalStorage(
        STORAGE_KEY, 
        {
          projectName: "",
          projectLocation: "",
          projectType: ""
        },
        validateProjectInfo
      );

      setProjectName(storedProjectInfo.projectName);
      setProjectLocation(storedProjectInfo.projectLocation);
      setProjectType(storedProjectInfo.projectType);
    } catch (error) {
      console.error("Failed to load project info:", error);
      toast({
        title: "Error",
        description: "Failed to load project information. Using default values.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Save project information to localStorage whenever it changes
  useEffect(() => {
    try {
      safeSaveToLocalStorage(STORAGE_KEY, {
        projectName,
        projectLocation,
        projectType
      });
    } catch (error) {
      console.error("Failed to save project info:", error);
      toast({
        title: "Warning",
        description: "Failed to save project information to local storage.",
        variant: "destructive",
      });
    }
  }, [projectName, projectLocation, projectType, toast]);

  // Add a reset function
  const resetProjectInfo = useCallback(() => {
    setProjectName("");
    setProjectLocation("");
    setProjectType("");
  }, []);

  return {
    projectName, setProjectName,
    projectLocation, setProjectLocation,
    projectType, setProjectType,
    resetProjectInfo
  };
};
