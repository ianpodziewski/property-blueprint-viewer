
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { saveToLocalStorage, loadFromLocalStorage } from "../useLocalStoragePersistence";
import { 
  FloorConfiguration, 
  SpaceDefinition,
  BuildingSystemsConfig,
  FloorPlateTemplate
} from "@/types/propertyTypes";

const STORAGE_KEY = "realEstateModel_floorConfigurations";

const dispatchFloorConfigSavedEvent = (() => {
  let timeout: number | undefined;
  
  return () => {
    if (typeof window !== 'undefined') {
      if (timeout) {
        clearTimeout(timeout);
      }
      
      timeout = window.setTimeout(() => {
        const event = new CustomEvent('floorConfigSaved');
        window.dispatchEvent(event);
        timeout = undefined;
      }, 100);
    }
  };
})();

export const useFloorConfigurations = (floorTemplatesInput: FloorPlateTemplate[]) => {
  const isFirstRender = useRef(true);
  const isUpdatingRef = useRef(false);
  // Add a cache for floor areas to prevent recalculation
  const floorAreaCache = useRef<Record<number, number>>({});
  // Track when templates or configurations change to invalidate cache
  const templateVersionRef = useRef<string>("");
  
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
    
    return [];
  });

  const prevFloorConfigurationsRef = useRef<string>("");
  
  // Update template version reference when templates change
  useEffect(() => {
    const newTemplateVersion = JSON.stringify(floorTemplatesInput);
    if (templateVersionRef.current !== newTemplateVersion) {
      templateVersionRef.current = newTemplateVersion;
      // Clear cache when templates change
      floorAreaCache.current = {};
    }
  }, [floorTemplatesInput]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevFloorConfigurationsRef.current = JSON.stringify(floorConfigurations);
      return;
    }
    
    if (isUpdatingRef.current) {
      isUpdatingRef.current = false;
      return;
    }
    
    const currentConfigString = JSON.stringify(floorConfigurations);
    
    if (currentConfigString !== prevFloorConfigurationsRef.current) {
      saveToLocalStorage(STORAGE_KEY, floorConfigurations);
      console.log("Saved floor configurations to localStorage:", floorConfigurations);
      
      prevFloorConfigurationsRef.current = currentConfigString;
      
      // Clear floor area cache when configurations change
      floorAreaCache.current = {};
      
      dispatchFloorConfigSavedEvent();
    }
  }, [floorConfigurations]);

  const updateFloorConfiguration = useCallback((
    floorNumber: number, 
    field: keyof FloorConfiguration, 
    value: string | null | boolean | SpaceDefinition[] | BuildingSystemsConfig
  ) => {
    console.log(`Updating floor ${floorNumber}, field ${String(field)}`, value);
    
    isUpdatingRef.current = true;
    
    setFloorConfigurations(prev => {
      const updated = prev.map(floor => {
        if (floor.floorNumber === floorNumber) {
          return { ...floor, [field]: value };
        }
        return floor;
      });
      
      return updated;
    });
    
    if (field === 'spaces' || field === 'buildingSystems') {
      const updatedConfigs = floorConfigurations.map(floor => 
        floor.floorNumber === floorNumber ? { ...floor, [field]: value } : floor
      );
      
      const updatedConfigsString = JSON.stringify(updatedConfigs);
      if (updatedConfigsString !== prevFloorConfigurationsRef.current) {
        saveToLocalStorage(STORAGE_KEY, updatedConfigs);
        prevFloorConfigurationsRef.current = updatedConfigsString;
        dispatchFloorConfigSavedEvent();
      }
    }
  }, [floorConfigurations]);

  const copyFloorConfiguration = useCallback((sourceFloorNumber: number, targetFloorNumbers: number[]) => {
    const sourceFloor = floorConfigurations.find(floor => floor.floorNumber === sourceFloorNumber);
    
    if (sourceFloor && targetFloorNumbers.length > 0) {
      isUpdatingRef.current = true;
      setFloorConfigurations(prev =>
        prev.map(floor => 
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
    isUpdatingRef.current = true;
    setFloorConfigurations(prev =>
      prev.map(floor => 
        floorNumbers.includes(floor.floorNumber) ? { ...floor, [field]: value } : floor
      )
    );
  }, []);

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
    
    isUpdatingRef.current = true;
    setFloorConfigurations(updatedFloors);
  }, [floorConfigurations]);

  const removeFloors = useCallback((floorNumbers: number[]) => {
    if (floorNumbers.length > 0) {
      isUpdatingRef.current = true;
      setFloorConfigurations(prev => prev.filter(
        floor => !floorNumbers.includes(floor.floorNumber)
      ));
    }
  }, []);

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
    
    isUpdatingRef.current = true;
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
      
      isUpdatingRef.current = true;
      setFloorConfigurations(cleanConfigs);
      // Clear floor area cache on import
      floorAreaCache.current = {};
    }
  }, []);

  const exportFloorConfigurations = useCallback(() => {
    return floorConfigurations;
  }, [floorConfigurations]);

  // Refactored getFloorArea to use caching and avoid console spam
  const getFloorArea = useCallback((floorNumber: number): number => {
    // Check if we already calculated this floor's area
    if (floorAreaCache.current[floorNumber] !== undefined) {
      return floorAreaCache.current[floorNumber];
    }
    
    const floor = floorConfigurations.find(f => f.floorNumber === floorNumber);
    if (!floor) {
      floorAreaCache.current[floorNumber] = 0;
      return 0;
    }
    
    let area = 0;
    
    if (floor.customSquareFootage && floor.customSquareFootage !== "") {
      area = parseInt(floor.customSquareFootage) || 0;
    } else if (floor.templateId) {
      const template = floorTemplatesInput.find(t => t.id === floor.templateId);
      if (template) {
        area = parseInt(template.squareFootage) || 0;
      }
    }
    
    // Cache the result
    floorAreaCache.current[floorNumber] = area;
    return area;
  }, [floorConfigurations, floorTemplatesInput]);

  const resetAllData = useCallback(() => {
    isUpdatingRef.current = true;
    setFloorConfigurations([]);
    // Clear floor area cache on reset
    floorAreaCache.current = {};
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
