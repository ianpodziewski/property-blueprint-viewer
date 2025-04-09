import { useState, useEffect, useCallback, useRef } from "react";
import { saveToLocalStorage, loadFromLocalStorage } from "../useLocalStoragePersistence";
import { 
  FloorConfiguration, 
  SpaceDefinition,
  BuildingSystemsConfig,
  FloorPlateTemplate
} from "@/types/propertyTypes";

const STORAGE_KEY = "realEstateModel_floorConfigurations";

// Storage operation mutex to prevent parallel operations
const storageMutex = {
  locked: false,
  lastOperation: 0,
  MIN_OPERATION_INTERVAL: 2000, // 2 seconds minimum between operations
  
  canAcquire(): boolean {
    const now = Date.now();
    if (this.locked || (now - this.lastOperation < this.MIN_OPERATION_INTERVAL)) {
      return false;
    }
    return true;
  },
  
  acquire(): boolean {
    if (!this.canAcquire()) return false;
    
    this.locked = true;
    this.lastOperation = Date.now();
    console.log(`Storage mutex acquired at ${new Date().toISOString()}`);
    return true;
  },
  
  release(): void {
    this.locked = false;
    console.log(`Storage mutex released at ${new Date().toISOString()}`);
  }
};

// Enhanced dispatcher with suppressNotification flag
const dispatchFloorConfigSavedEvent = (options: { suppressNotification?: boolean } = {}) => {
  if (typeof window !== 'undefined') {
    console.log(`Dispatching floorConfigSaved event with options:`, options);
    const event = new CustomEvent('floorConfigSaved', { detail: options });
    window.dispatchEvent(event);
  }
};

// Generate a simple hash for object comparison
function generateSimpleHash(obj: any): string {
  try {
    return JSON.stringify(obj)
      .split('')
      .reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0)
      .toString(36);
  } catch (e) {
    return Math.random().toString(36);
  }
}

export const useFloorConfigurations = (floorTemplatesInput: FloorPlateTemplate[]) => {
  const isFirstRender = useRef(true);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const operationCountRef = useRef(0);
  const lastHashRef = useRef<string | null>(null);
  const expandedFloorRef = useRef<Set<number>>(new Set());
  const MAX_OPS_PER_MINUTE = 10;
  const lastOpTimesRef = useRef<number[]>([]);
  
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
      
      // Generate initial hash
      lastHashRef.current = generateSimpleHash(migratedConfigs);
      console.log("Loaded floor configurations from localStorage:", migratedConfigs);
      return migratedConfigs;
    }
    
    return [];
  });

  const [isInitialized, setIsInitialized] = useState(true);
  
  // Enhanced localStorage persistence with strong rate limiting and version check
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    // Skip if not initialized
    if (!isInitialized) return;
    
    // Generate hash for current state to compare with previous
    const currentHash = generateSimpleHash(floorConfigurations);
    
    // Skip if hash hasn't changed (data is the same)
    if (currentHash === lastHashRef.current) {
      console.log('Floor configurations unchanged, skipping save');
      return;
    }
    
    // Clear any existing save timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    
    // Record operation count and time for rate limiting
    const now = Date.now();
    lastOpTimesRef.current.push(now);
    
    // Only keep operations from the last minute
    lastOpTimesRef.current = lastOpTimesRef.current.filter(time => now - time < 60000);
    
    // Check if we're exceeding rate limits
    if (lastOpTimesRef.current.length > MAX_OPS_PER_MINUTE) {
      console.warn(`Excessive floor configuration saves: ${lastOpTimesRef.current.length} in the last minute`);
      console.log('Rate limiting storage operations');
      
      // Don't completely block operations, but extend debounce significantly
      saveTimerRef.current = setTimeout(() => {
        performSaveOperation(currentHash);
      }, 3000);
      
      return;
    }
    
    // Normal operation - debounced save
    saveTimerRef.current = setTimeout(() => {
      performSaveOperation(currentHash);
    }, 2000);
    
  }, [floorConfigurations, isInitialized]);
  
  // Separated save logic for better control
  const performSaveOperation = useCallback((newHash: string) => {
    // Try to acquire mutex
    if (!storageMutex.acquire()) {
      console.log('Another storage operation is in progress, deferring save');
      
      // Retry after delay
      setTimeout(() => {
        if (storageMutex.acquire()) {
          try {
            console.log('Storage mutex acquired on retry, saving floor configurations');
            saveToLocalStorage(STORAGE_KEY, floorConfigurations);
            lastHashRef.current = newHash;
            
            // Dispatch event with suppressNotification flag if this is frequent
            const suppressNotification = operationCountRef.current > 3;
            dispatchFloorConfigSavedEvent({ suppressNotification });
            
            // Reset operation count after some time
            setTimeout(() => {
              operationCountRef.current = 0;
            }, 30000);
            
            operationCountRef.current++;
          } finally {
            storageMutex.release();
          }
        }
      }, 2500);
      
      return;
    }
    
    try {
      console.log('Saving floor configurations to localStorage');
      saveToLocalStorage(STORAGE_KEY, floorConfigurations);
      lastHashRef.current = newHash;
      
      // Dispatch event with suppressNotification flag if this is frequent
      const suppressNotification = operationCountRef.current > 3;
      dispatchFloorConfigSavedEvent({ suppressNotification });
      
      operationCountRef.current++;
    } finally {
      storageMutex.release();
    }
  }, [floorConfigurations]);

  const updateFloorConfiguration = useCallback((
    floorNumber: number, 
    field: keyof FloorConfiguration, 
    value: string | null | boolean | SpaceDefinition[] | BuildingSystemsConfig,
    options: { suppressNotification?: boolean } = {}
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
    
    // Special case for spaces and buildingSystems - trigger immediate save
    if (field === 'spaces' || field === 'buildingSystems') {
      if (storageMutex.acquire()) {
        try {
          const updatedConfigs = floorConfigurations.map(floor => 
            floor.floorNumber === floorNumber ? { ...floor, [field]: value } : floor
          );
          
          saveToLocalStorage(STORAGE_KEY, updatedConfigs);
          const newHash = generateSimpleHash(updatedConfigs);
          lastHashRef.current = newHash;
          
          dispatchFloorConfigSavedEvent(options);
        } finally {
          storageMutex.release();
        }
      }
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

  const updateFloorSpaces = useCallback((floorNumber: number, spaces: SpaceDefinition[], options: { suppressNotification?: boolean } = {}) => {
    const validatedSpaces = spaces.map(space => ({
      ...space,
      dimensions: space.dimensions || { width: "0", depth: "0" },
      subType: space.subType || null,
      percentage: typeof space.percentage === 'number' ? space.percentage : 0
    }));
    console.log(`Updating spaces for floor ${floorNumber}`, validatedSpaces);
    updateFloorConfiguration(floorNumber, 'spaces', validatedSpaces, options);
  }, [updateFloorConfiguration]);

  const updateFloorBuildingSystems = useCallback((floorNumber: number, systems: BuildingSystemsConfig, options: { suppressNotification?: boolean } = {}) => {
    const validatedSystems = {
      ...systems,
      elevators: systems.elevators || {
        passenger: "0",
        service: "0",
        freight: "0"
      }
    };
    console.log(`Updating building systems for floor ${floorNumber}`, validatedSystems);
    updateFloorConfiguration(floorNumber, 'buildingSystems', validatedSystems, options);
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
