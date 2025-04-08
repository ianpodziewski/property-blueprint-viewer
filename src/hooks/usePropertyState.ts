
import { useState, useEffect, useCallback } from "react";
import { saveToLocalStorage, loadFromLocalStorage } from "./useLocalStoragePersistence";

interface SpaceType {
  id: string;
  type: string;
  squareFootage: string;
  units: string;
  phase: string;
  floorAllocation: Record<number, string>;
}

interface UnitMix {
  id: string;
  type: string;
  count: string;
  squareFootage: string;
}

const STORAGE_KEYS = {
  PROJECT_INFO: "realEstateModel_projectInfo",
  SPACE_TYPES: "realEstateModel_spaceTypes",
  UNIT_MIX: "realEstateModel_unitMix",
  TOTAL_LAND_AREA: "realEstateModel_totalLandArea"
};

export const usePropertyState = () => {
  // Project Information
  const [projectName, setProjectName] = useState<string>("");
  const [projectLocation, setProjectLocation] = useState<string>("");
  const [projectType, setProjectType] = useState<string>("");
  const [totalLandArea, setTotalLandArea] = useState<string>("");
  
  // Space Types
  const [spaceTypes, setSpaceTypes] = useState<SpaceType[]>([
    { 
      id: "space-1", 
      type: "", 
      squareFootage: "", 
      units: "", 
      phase: "",
      floorAllocation: {}
    }
  ]);
  
  // Unit Mix
  const [unitMixes, setUnitMixes] = useState<UnitMix[]>([
    { id: "unit-1", type: "Studio", count: "", squareFootage: "" }
  ]);
  
  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      const storedProjectInfo = loadFromLocalStorage(STORAGE_KEYS.PROJECT_INFO, {
        projectName: "",
        projectLocation: "",
        projectType: ""
      });
      
      setProjectName(storedProjectInfo.projectName);
      setProjectLocation(storedProjectInfo.projectLocation);
      setProjectType(storedProjectInfo.projectType);
      
      const storedTotalLandArea = loadFromLocalStorage(STORAGE_KEYS.TOTAL_LAND_AREA, "");
      setTotalLandArea(storedTotalLandArea);
      
      const storedSpaceTypes = loadFromLocalStorage(STORAGE_KEYS.SPACE_TYPES, [
        { 
          id: "space-1", 
          type: "", 
          squareFootage: "", 
          units: "", 
          phase: "",
          floorAllocation: {}
        }
      ]);
      
      // Migrate old data structure if needed
      const migratedSpaceTypes = storedSpaceTypes.map(space => {
        // If the old data has efficiencyFactor, create a new object without it
        if ('efficiencyFactor' in space) {
          const { efficiencyFactor, ...restSpace } = space as any;
          return restSpace;
        }
        return space;
      });
      
      setSpaceTypes(migratedSpaceTypes);
      
      const storedUnitMix = loadFromLocalStorage(STORAGE_KEYS.UNIT_MIX, [
        { id: "unit-1", type: "Studio", count: "", squareFootage: "" }
      ]);
      setUnitMixes(storedUnitMix);

      console.log("Successfully loaded data from localStorage");
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
    }
  }, []);
  
  // Save project info to localStorage whenever it changes
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.PROJECT_INFO, {
      projectName,
      projectLocation,
      projectType
    });
  }, [projectName, projectLocation, projectType]);
  
  // Save total land area to localStorage whenever it changes
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.TOTAL_LAND_AREA, totalLandArea);
  }, [totalLandArea]);
  
  // Save space types to localStorage whenever they change
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.SPACE_TYPES, spaceTypes);
  }, [spaceTypes]);
  
  // Save unit mix to localStorage whenever it changes
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.UNIT_MIX, unitMixes);
  }, [unitMixes]);
  
  // Text field handlers
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
    setter(e.target.value);
  };
  
  // Number field handlers
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
    const value = e.target.value;
    // Allow empty string or valid numbers
    if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
      setter(value);
    }
  };
  
  // Select field handlers
  const handleSelectChange = (value: string, setter: (value: string) => void) => {
    setter(value);
  };
  
  const addSpaceType = () => {
    const newId = `space-${spaceTypes.length + 1}`;
    setSpaceTypes([
      ...spaceTypes,
      { 
        id: newId, 
        type: "", 
        squareFootage: "", 
        units: "", 
        phase: "",
        floorAllocation: {}
      }
    ]);
  };

  const removeSpaceType = (id: string) => {
    if (spaceTypes.length > 1) {
      setSpaceTypes(spaceTypes.filter(space => space.id !== id));
    }
  };

  const updateSpaceType = (id: string, field: keyof SpaceType, value: string) => {
    // For number fields, validate to ensure non-negative values
    if ((field === "squareFootage" || field === "units") && value !== "") {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue < 0) return;
    }

    setSpaceTypes(
      spaceTypes.map(space => 
        space.id === id ? { ...space, [field]: value } : space
      )
    );
  };

  const updateSpaceTypeFloorAllocation = (id: string, floor: number, value: string) => {
    // Validate the percentage value
    if (value !== "") {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue < 0 || numValue > 100) return;
    }
    
    setSpaceTypes(
      spaceTypes.map(space => {
        if (space.id === id) {
          return { 
            ...space, 
            floorAllocation: { 
              ...space.floorAllocation, 
              [floor]: value 
            } 
          };
        }
        return space;
      })
    );
  };

  const addUnitMix = () => {
    const newId = `unit-${unitMixes.length + 1}`;
    setUnitMixes([
      ...unitMixes,
      { id: newId, type: "", count: "", squareFootage: "" }
    ]);
  };

  const removeUnitMix = (id: string) => {
    if (unitMixes.length > 1) {
      setUnitMixes(unitMixes.filter(unit => unit.id !== id));
    }
  };

  const updateUnitMix = (id: string, field: keyof UnitMix, value: string) => {
    // For number fields, validate to ensure non-negative values
    if ((field === "count" || field === "squareFootage") && value !== "") {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue < 0) return;
    }

    setUnitMixes(
      unitMixes.map(unit => 
        unit.id === id ? { ...unit, [field]: value } : unit
      )
    );
  };
  
  // Reset all data
  const resetAllData = useCallback(() => {
    setProjectName("");
    setProjectLocation("");
    setProjectType("");
    setTotalLandArea("");
    setSpaceTypes([{ 
      id: "space-1", 
      type: "", 
      squareFootage: "", 
      units: "", 
      phase: "",
      floorAllocation: {} 
    }]);
    setUnitMixes([{ id: "unit-1", type: "Studio", count: "", squareFootage: "" }]);
  }, []);

  return {
    // Project Information
    projectName, setProjectName,
    projectLocation, setProjectLocation,
    projectType, setProjectType,
    totalLandArea, setTotalLandArea,
    
    // Space Types
    spaceTypes, 
    addSpaceType,
    removeSpaceType,
    updateSpaceType,
    updateSpaceTypeFloorAllocation,
    
    // Unit Mix
    unitMixes,
    addUnitMix,
    removeUnitMix,
    updateUnitMix,
    
    // Event handlers
    handleTextChange,
    handleNumberChange,
    handleSelectChange,
    
    // Data persistence
    resetAllData
  };
};
