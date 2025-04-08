
import { useState, useEffect, useCallback } from "react";
import { saveToLocalStorage, loadFromLocalStorage } from "../useLocalStoragePersistence";
import { 
  FloorConfiguration, 
  SpaceDefinition,
  BuildingSystemsConfig,
  FloorPlateTemplate
} from "@/types/propertyTypes";

const STORAGE_KEY = "realEstateModel_floorConfigurations";

const dispatchFloorConfigSavedEvent = () => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('floorConfigSaved');
    window.dispatchEvent(event);
  }
};

export const useFloorConfigurations = (floorTemplatesInput: FloorPlateTemplate[]) => {
  // Initialize directly with data from localStorage using a function
  const [floorConfigurations, setFloorConfigurations] = useState<FloorConfiguration[]>(() => {
    const storedFloorConfigurations = loadFromLocalStorage<FloorConfiguration[]>(STORAGE_KEY, []);
    
    if (storedFloorConfigurations.length > 0) {
      const migratedConfigs = storedFloorConfigurations.map(config => {
        if ('efficiencyFactor' in config) {
          const { efficiencyFactor, ...rest } = config as any;
          return rest;
        }
        return config;
      });
      
      console.log("Loaded floor configurations from localStorage:", migratedConfigs);
      return migratedConfigs;
    }
    
    // Return empty array if no configurations found - this is important!
    // Do NOT return a default floor here
    return [];
  });

  // Mark initialization as complete to prevent early saves
  const [isInitialized, setIsInitialized] = useState(true);

  // Save to localStorage whenever floorConfigurations changes
  useEffect(() => {
    if (isInitialized && floorConfigurations) {
      saveToLocalStorage(STORAGE_KEY, floorConfigurations);
      console.log("Saved floor configurations to localStorage:", floorConfigurations);
      dispatchFloorConfigSavedEvent();
    }
  }, [floorConfigurations, isInitialized]);

  const updateFloorConfiguration = useCallback((
    floorNumber: number, 
    field: keyof FloorConfiguration, 
    value: string | null | boolean | SpaceDefinition[] | BuildingSystemsConfig
  ) => {
    console.log(`Updating floor ${floorNumber}, field ${String(field)}`, value);
    
    setFloorConfigurations(
      floorConfigurations.map(floor => {
        if (floor.floorNumber === floorNumber) {
          const updatedFloor = { ...floor, [field]: value };
          return updatedFloor;
        }
        return floor;
      })
    );
    
    if (field === 'spaces' || field === 'buildingSystems') {
      const updatedConfigs = floorConfigurations.map(floor => 
        floor.floorNumber === floorNumber ? { ...floor, [field]: value } : floor
      );
      saveToLocalStorage(STORAGE_KEY, updatedConfigs);
      dispatchFloorConfigSavedEvent();
    }
  }, [floorConfigurations]);

  const copyFloorConfiguration = useCallback((sourceFloorNumber: number, targetFloorNumbers: number[]) => {
    const sourceFloor = floorConfigurations.find(floor => floor.floorNumber === sourceFloorNumber);
    
    if (sourceFloor && targetFloorNumbers.length > 0) {
      setFloorConfigurations(
        floorConfigurations.map(floor => 
          targetFloorNumbers.includes(floor.floorNumber)
            ? { 
                ...floor, 
                templateId: sourceFloor.templateId,
                customSquareFootage: sourceFloor.customSquareFootage,
                floorToFloorHeight: sourceFloor.floorToFloorHeight,
                corePercentage: sourceFloor.corePercentage,
                primaryUse: sourceFloor.primaryUse,
                secondaryUse: sourceFloor.secondaryUse,
                secondaryUsePercentage: sourceFloor.secondaryUsePercentage,
                spaces: sourceFloor.spaces ? [...sourceFloor.spaces] : undefined,
                buildingSystems: sourceFloor.buildingSystems ? {...sourceFloor.buildingSystems} : undefined
              } 
            : floor
        )
      );
    }
  }, [floorConfigurations]);

  const bulkEditFloorConfigurations = useCallback((
    floorNumbers: number[], 
    field: keyof FloorConfiguration, 
    value: string | null | boolean
  ) => {
    setFloorConfigurations(
      floorConfigurations.map(floor => 
        floorNumbers.includes(floor.floorNumber) ? { ...floor, [field]: value } : floor
      )
    );
  }, [floorConfigurations]);

  const addFloors = useCallback((
    count: number,
    isUnderground: boolean,
    templateId: string | null,
    position: "top" | "bottom" | "specific",
    specificPosition?: number,
    numberingPattern?: "consecutive" | "skip" | "custom",
    customNumbering?: number[]
  ) => {
    const aboveGroundFloors = floorConfigurations.filter(f => !f.isUnderground);
    const belowGroundFloors = floorConfigurations.filter(f => f.isUnderground);
    
    let newFloors: FloorConfiguration[] = [];
    let numberingStart: number;
    
    if (isUnderground) {
      const lowestBelowGround = belowGroundFloors.length > 0 
        ? Math.min(...belowGroundFloors.map(f => f.floorNumber)) 
        : 0;
      numberingStart = lowestBelowGround <= 0 ? lowestBelowGround - count : -1;
    } else {
      const highestAboveGround = aboveGroundFloors.length > 0 
        ? Math.max(...aboveGroundFloors.map(f => f.floorNumber)) 
        : 0;
      numberingStart = highestAboveGround >= 1 ? highestAboveGround + 1 : 1;
    }
    
    if (position === "specific" && specificPosition !== undefined) {
      numberingStart = specificPosition;
    }
    
    for (let i = 0; i < count; i++) {
      let floorNumber: number;
      
      if (numberingPattern === "consecutive" || !numberingPattern) {
        floorNumber = isUnderground ? numberingStart + i : numberingStart + i;
      } else if (numberingPattern === "skip") {
        floorNumber = isUnderground ? numberingStart + (i * 2) : numberingStart + (i * 2);
      } else if (numberingPattern === "custom" && customNumbering && customNumbering[i] !== undefined) {
        floorNumber = customNumbering[i];
      } else {
        floorNumber = isUnderground ? numberingStart + i : numberingStart + i;
      }
      
      newFloors.push({
        floorNumber: floorNumber,
        isUnderground: isUnderground,
        templateId: templateId,
        customSquareFootage: "",
        floorToFloorHeight: "12",
        corePercentage: "15",
        primaryUse: isUnderground ? "parking" : "office",
        secondaryUse: null,
        secondaryUsePercentage: "0"
      });
    }
    
    let updatedFloors: FloorConfiguration[];
    if (position === "top" && !isUnderground) {
      updatedFloors = [...floorConfigurations, ...newFloors];
    } else if (position === "bottom" && isUnderground) {
      updatedFloors = [...newFloors, ...floorConfigurations];
    } else if (position === "specific" && specificPosition !== undefined) {
      const sortedFloors = [...floorConfigurations].sort((a, b) => b.floorNumber - a.floorNumber);
      const insertIndex = sortedFloors.findIndex(f => 
        isUnderground ? f.floorNumber <= specificPosition : f.floorNumber >= specificPosition
      );
      
      if (insertIndex === -1) {
        updatedFloors = isUnderground
          ? [...sortedFloors, ...newFloors]
          : [...newFloors, ...sortedFloors];
      } else {
        updatedFloors = [
          ...sortedFloors.slice(0, insertIndex),
          ...newFloors,
          ...sortedFloors.slice(insertIndex)
        ];
      }
    } else {
      updatedFloors = isUnderground 
        ? [...newFloors, ...floorConfigurations]
        : [...floorConfigurations, ...newFloors];
    }
    
    setFloorConfigurations(updatedFloors);
  }, [floorConfigurations]);

  const removeFloors = useCallback((floorNumbers: number[]) => {
    if (floorNumbers.length > 0) {
      const remainingFloors = floorConfigurations.filter(
        floor => !floorNumbers.includes(floor.floorNumber)
      );
      
      setFloorConfigurations(remainingFloors);
    }
  }, [floorConfigurations]);

  const reorderFloor = useCallback((floorNumber: number, direction: "up" | "down") => {
    const sortedFloors = [...floorConfigurations].sort((a, b) => b.floorNumber - a.floorNumber);
    const currentIndex = sortedFloors.findIndex(f => f.floorNumber === floorNumber);
    
    if (currentIndex === -1) return;
    
    const targetIndex = direction === "up" 
      ? Math.max(0, currentIndex - 1) 
      : Math.min(sortedFloors.length - 1, currentIndex + 1);
    
    if (currentIndex === targetIndex) return;
    
    const targetFloor = sortedFloors[targetIndex];
    const currentFloor = sortedFloors[currentIndex];
    
    const tempFloorNumber = currentFloor.floorNumber;
    currentFloor.floorNumber = targetFloor.floorNumber;
    targetFloor.floorNumber = tempFloorNumber;
    
    setFloorConfigurations([...sortedFloors]);
  }, [floorConfigurations]);

  const updateFloorSpaces = useCallback((floorNumber: number, spaces: SpaceDefinition[]) => {
    const validatedSpaces = spaces.map(space => ({
      ...space,
      dimensions: space.dimensions || { width: "0", depth: "0" },
      subType: space.subType || null,
      percentage: typeof space.percentage === 'number' ? space.percentage : 0
    }));
    console.log(`Updating spaces for floor ${floorNumber}`, validatedSpaces);
    updateFloorConfiguration(floorNumber, 'spaces', validatedSpaces);
  }, [updateFloorConfiguration]);

  const updateFloorBuildingSystems = useCallback((floorNumber: number, systems: BuildingSystemsConfig) => {
    const validatedSystems = {
      ...systems,
      elevators: systems.elevators || {
        passenger: "0",
        service: "0",
        freight: "0"
      }
    };
    console.log(`Updating building systems for floor ${floorNumber}`, validatedSystems);
    updateFloorConfiguration(floorNumber, 'buildingSystems', validatedSystems);
  }, [updateFloorConfiguration]);

  const importFloorConfigurations = useCallback((configurations: FloorConfiguration[]) => {
    if (configurations && configurations.length > 0) {
      const cleanConfigs = configurations.map(config => {
        if ('efficiencyFactor' in config) {
          const { efficiencyFactor, ...rest } = config as any;
          return rest;
        }
        return config;
      });
      
      setFloorConfigurations(cleanConfigs);
    }
  }, []);

  const exportFloorConfigurations = useCallback(() => {
    return floorConfigurations;
  }, [floorConfigurations]);

  const getFloorArea = useCallback((floorNumber: number): number => {
    const floor = floorConfigurations.find(f => f.floorNumber === floorNumber);
    if (!floor) return 0;
    
    if (floor.customSquareFootage && floor.customSquareFootage !== "") {
      return parseInt(floor.customSquareFootage) || 0;
    }
    
    if (floor.templateId) {
      const template = floorTemplatesInput.find(t => t.id === floor.templateId);
      if (template) {
        return parseInt(template.squareFootage) || 0;
      }
    }
    
    return 0;
  }, [floorConfigurations, floorTemplatesInput]);

  const resetAllData = useCallback(() => {
    setFloorConfigurations([]);
  }, []);

  return {
    floorConfigurations,
    setFloorConfigurations,
    updateFloorConfiguration,
    copyFloorConfiguration,
    bulkEditFloorConfigurations,
    addFloors,
    removeFloors,
    reorderFloor,
    updateFloorSpaces,
    updateFloorBuildingSystems,
    importFloorConfigurations,
    exportFloorConfigurations,
    getFloorArea,
    resetAllData
  };
};
