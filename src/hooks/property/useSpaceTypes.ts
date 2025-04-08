
import { useState, useEffect, useCallback } from "react";
import { saveToLocalStorage, loadFromLocalStorage } from "../useLocalStoragePersistence";
import { SpaceType } from "@/types/propertyTypes";

const STORAGE_KEY = "realEstateModel_extendedSpaceTypes";

export const useSpaceTypes = () => {
  const [spaceTypes, setSpaceTypes] = useState<SpaceType[]>([
    { 
      id: "space-1", 
      type: "", 
      squareFootage: "0", 
      units: "", 
      phase: "phase1",
      floorAllocation: { 1: "100" }
    }
  ]);
  
  const [totalAllocatedArea, setTotalAllocatedArea] = useState<number>(0);

  // Load space types from localStorage on mount
  useEffect(() => {
    const storedSpaceTypes = loadFromLocalStorage(STORAGE_KEY, [
      { 
        id: "space-1", 
        type: "", 
        squareFootage: "0", 
        units: "", 
        phase: "phase1",
        floorAllocation: { 1: "100" }
      }
    ]);
    
    // Migrate stored data to remove efficiency factor if it exists
    const migratedSpaceTypes = storedSpaceTypes.map(space => {
      const spaceData = space as any;
      if ('efficiencyFactor' in spaceData) {
        const { efficiencyFactor, ...rest } = spaceData;
        return rest;
      }
      return space;
    });
    
    setSpaceTypes(migratedSpaceTypes);
  }, []);

  // Save space types to localStorage whenever they change
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEY, spaceTypes);
  }, [spaceTypes]);
  
  // Calculate total allocated area whenever space types change
  useEffect(() => {
    const total = spaceTypes.reduce((sum, space) => {
      return sum + (parseFloat(space.squareFootage) || 0);
    }, 0);
    setTotalAllocatedArea(total);
  }, [spaceTypes]);

  const addSpaceType = useCallback(() => {
    const newId = `space-${spaceTypes.length + 1}`;
    const floorAllocation: Record<number, string> = {};
    
    // Default to allocating to floor 1
    floorAllocation[1] = "100";
    
    setSpaceTypes([
      ...spaceTypes,
      { 
        id: newId, 
        type: "", 
        squareFootage: "0", 
        units: "", 
        phase: "phase1",
        floorAllocation
      }
    ]);
  }, [spaceTypes]);

  const removeSpaceType = useCallback((id: string) => {
    if (spaceTypes.length > 1) {
      setSpaceTypes(spaceTypes.filter(space => space.id !== id));
    }
  }, [spaceTypes]);

  const updateSpaceType = useCallback((id: string, field: keyof SpaceType, value: string) => {
    setSpaceTypes(
      spaceTypes.map(space => 
        space.id === id ? { ...space, [field]: value } : space
      )
    );
  }, [spaceTypes]);

  const updateSpaceTypeFloorAllocation = useCallback((id: string, floor: number, value: string) => {
    setSpaceTypes(
      spaceTypes.map(space => {
        if (space.id === id) {
          const newFloorAllocation = { ...space.floorAllocation };
          newFloorAllocation[floor] = value;
          return { ...space, floorAllocation: newFloorAllocation };
        }
        return space;
      })
    );
  }, [spaceTypes]);

  // Reset all space types
  const resetAllData = useCallback(() => {
    setSpaceTypes([{ 
      id: "space-1", 
      type: "", 
      squareFootage: "0", 
      units: "", 
      phase: "phase1",
      floorAllocation: { 1: "100" }
    }]);
  }, []);

  return {
    spaceTypes,
    addSpaceType,
    removeSpaceType,
    updateSpaceType,
    updateSpaceTypeFloorAllocation,
    totalAllocatedArea,
    resetAllData
  };
};
