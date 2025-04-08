
import { useState, useEffect, useCallback } from "react";
import { saveToLocalStorage, loadFromLocalStorage } from "../useLocalStoragePersistence";
import { SpaceType } from "@/types/propertyTypes";
import { v4 as uuidv4 } from 'uuid';

// Add missing uuid dependency if needed
// <lov-add-dependency>uuid@9.0.1</lov-add-dependency>

const STORAGE_KEY = "realEstateModel_extendedSpaceTypes";

export const useSpaceTypes = () => {
  const [spaceTypes, setSpaceTypes] = useState<SpaceType[]>([
    { 
      id: "space-1", 
      type: "office", 
      squareFootage: "0",
      units: "0", 
      phase: "1",
      efficiencyFactor: "85",
      floorAllocation: {}
    }
  ]);

  // Load space types from localStorage on mount
  useEffect(() => {
    const storedSpaceTypes = loadFromLocalStorage(STORAGE_KEY, [
      { 
        id: "space-1", 
        type: "office", 
        squareFootage: "0",
        units: "0", 
        phase: "1",
        efficiencyFactor: "85",
        floorAllocation: {}
      }
    ]);
    setSpaceTypes(storedSpaceTypes);
  }, []);

  // Save space types to localStorage whenever they change
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEY, spaceTypes);
  }, [spaceTypes]);

  const addSpaceType = useCallback(() => {
    const newId = `space-${uuidv4()}`;
    setSpaceTypes([
      ...spaceTypes,
      { 
        id: newId, 
        type: "", 
        squareFootage: "0", 
        units: "0", 
        phase: "1",
        efficiencyFactor: "85",
        floorAllocation: {} 
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
          const updatedAllocation = { ...space.floorAllocation };
          updatedAllocation[floor] = value;
          return { ...space, floorAllocation: updatedAllocation };
        }
        return space;
      })
    );
  }, [spaceTypes]);

  // Add a function to reset space types to default
  const resetSpaceTypes = useCallback(() => {
    const defaultSpaceType: SpaceType = { 
      id: "space-1", 
      type: "office", 
      squareFootage: "0",
      units: "0", 
      phase: "1",
      efficiencyFactor: "85",
      floorAllocation: {}
    };
    setSpaceTypes([defaultSpaceType]);
  }, []);

  // Calculate total space allocation
  const totalAllocatedArea = spaceTypes.reduce((total, space) => {
    return total + (parseFloat(space.squareFootage) || 0);
  }, 0);

  return {
    spaceTypes,
    addSpaceType,
    removeSpaceType,
    updateSpaceType,
    updateSpaceTypeFloorAllocation,
    resetSpaceTypes,
    totalAllocatedArea
  };
};
