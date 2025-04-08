
import { useState, useEffect, useCallback } from "react";
import { UnitAllocation } from "@/types/unitMixTypes";
import { saveToLocalStorage, loadFromLocalStorage } from "@/hooks/useLocalStoragePersistence";
import { useUnitTypes } from "./useUnitTypes";

const STORAGE_KEY = "realEstateModel_unitAllocations";

export const useUnitAllocations = () => {
  const [unitAllocations, setUnitAllocations] = useState<UnitAllocation[]>(() => {
    try {
      const storedAllocations = loadFromLocalStorage(STORAGE_KEY, []);
      console.log("Loaded unit allocations from localStorage:", storedAllocations);
      return storedAllocations;
    } catch (error) {
      console.error("Error loading unit allocations from localStorage:", error);
      return [];
    }
  });
  
  const { getUnitTypeById } = useUnitTypes();
  
  // Save data to localStorage whenever they change
  useEffect(() => {
    try {
      saveToLocalStorage(STORAGE_KEY, unitAllocations);
      console.log("Saved unit allocations to localStorage:", unitAllocations);
      
      if (typeof window !== 'undefined') {
        const event = new Event('floorConfigSaved');
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error("Error saving unit allocations to localStorage:", error);
    }
  }, [unitAllocations]);
  
  const addAllocation = useCallback((
    allocation: Omit<UnitAllocation, "id">, 
    forceAllocation: boolean = false
  ) => {
    // Check if there's enough space on the floor first, unless forced
    if (!forceAllocation) {
      const spaceCheck = checkEnoughSpaceForAllocation(
        allocation.floorNumber,
        parseInt(allocation.squareFootage) || 0,
        parseInt(allocation.count) || 0
      );
      
      if (!spaceCheck.hasEnoughSpace) {
        console.error("Not enough space for allocation", spaceCheck);
        return null;
      }
    }
    
    const newId = `allocation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    setUnitAllocations(prev => [
      ...prev,
      {
        id: newId,
        ...allocation
      }
    ]);
    
    return newId;
  }, []);
  
  const updateAllocation = useCallback((
    id: string, 
    field: keyof UnitAllocation, 
    value: any,
    forceUpdate: boolean = false
  ) => {
    const allocation = unitAllocations.find(a => a.id === id);
    
    if (!allocation) {
      console.error(`Cannot update allocation ${id}: not found`);
      return false;
    }
    
    // For count and squareFootage updates, check if there's enough space, unless forced
    if (!forceUpdate && (field === 'count' || field === 'squareFootage')) {
      const currentCount = parseInt(allocation.count as string) || 0;
      const currentSqFt = parseInt(allocation.squareFootage as string) || 0;
      
      const newCount = field === 'count' ? parseInt(value) || 0 : currentCount;
      const newSqFt = field === 'squareFootage' ? parseInt(value) || 0 : currentSqFt;
      
      // Only check if increasing space usage
      if (newCount * newSqFt > currentCount * currentSqFt) {
        const additionalSpace = (newCount * newSqFt) - (currentCount * currentSqFt);
        
        const spaceCheck = checkEnoughSpaceForAllocation(
          allocation.floorNumber,
          additionalSpace,
          1,
          undefined,
          id // Exclude current allocation from check
        );
        
        if (!spaceCheck.hasEnoughSpace) {
          console.error("Not enough space for allocation update", spaceCheck);
          return false;
        }
      }
    }
    
    setUnitAllocations(prev => prev.map(item => 
      item.id === id 
        ? { ...item, [field]: value } 
        : item
    ));
    
    return true;
  }, [unitAllocations]);
  
  const removeAllocation = useCallback((id: string) => {
    setUnitAllocations(prev => prev.filter(item => item.id !== id));
  }, []);
  
  const getAllocationsByFloor = useCallback((floorNumber: number) => {
    return unitAllocations.filter(allocation => allocation.floorNumber === floorNumber);
  }, [unitAllocations]);
  
  const getAllocationsByUnitType = useCallback((unitTypeId: string) => {
    return unitAllocations.filter(allocation => allocation.unitTypeId === unitTypeId);
  }, [unitAllocations]);
  
  const getAllocationsByUnitTypeId = useCallback((unitTypeId: string) => {
    return unitAllocations.filter(allocation => allocation.unitTypeId === unitTypeId);
  }, [unitAllocations]);
  
  const calculateAllocatedAreaByFloor = useCallback((floorNumber: number) => {
    const floorAllocations = getAllocationsByFloor(floorNumber);
    
    return floorAllocations.reduce((total, allocation) => {
      const count = parseInt(allocation.count as string) || 0;
      const squareFootage = parseInt(allocation.squareFootage as string) || 0;
      return total + (count * squareFootage);
    }, 0);
  }, [getAllocationsByFloor]);
  
  const calculateTotalAllocatedAreaByUnitType = useCallback((unitTypeId: string) => {
    const unitTypeAllocations = getAllocationsByUnitType(unitTypeId);
    
    return unitTypeAllocations.reduce((total, allocation) => {
      const count = parseInt(allocation.count as string) || 0;
      const squareFootage = parseInt(allocation.squareFootage as string) || 0;
      return total + (count * squareFootage);
    }, 0);
  }, [getAllocationsByUnitType]);
  
  const checkEnoughSpaceForAllocation = useCallback((
    floorNumber: number,
    requiredSquareFootage: number,
    count: number = 1,
    floorTotalArea?: number,
    excludeAllocationId?: string
  ) => {
    // Get all existing allocations for this floor
    const existingAllocations = unitAllocations.filter(allocation => 
      allocation.floorNumber === floorNumber && 
      (!excludeAllocationId || allocation.id !== excludeAllocationId)
    );
    
    // Calculate total area already allocated on this floor
    const currentAllocatedArea = existingAllocations.reduce((total, allocation) => {
      const allocationCount = parseInt(allocation.count as string) || 0;
      const allocationSquareFootage = parseInt(allocation.squareFootage as string) || 0;
      return total + (allocationCount * allocationSquareFootage);
    }, 0);
    
    // Calculate required additional space
    const requiredTotalArea = requiredSquareFootage * count;
    
    // Calculate remaining area on floor
    // If floorTotalArea is not provided, we can't determine if there's enough space
    if (floorTotalArea === undefined || floorTotalArea === 0) {
      return {
        hasEnoughSpace: false,
        floorNumber,
        currentAllocatedArea,
        requiredArea: requiredTotalArea,
        remainingArea: -1,
        floorTotalArea: -1,
        message: `Cannot determine if floor ${floorNumber} has enough space. Unknown floor size.`
      };
    }
    
    const remainingArea = floorTotalArea - currentAllocatedArea;
    const hasEnoughSpace = remainingArea >= requiredTotalArea;
    
    console.log(`Floor ${floorNumber} space check:`, {
      floorTotalArea,
      currentAllocatedArea,
      requiredArea: requiredTotalArea,
      remainingArea,
      hasEnoughSpace
    });
    
    return {
      hasEnoughSpace,
      floorNumber,
      currentAllocatedArea,
      requiredArea: requiredTotalArea,
      remainingArea,
      floorTotalArea,
      message: hasEnoughSpace 
        ? `Floor ${floorNumber} has enough space`
        : `Floor ${floorNumber} does not have enough space. Needs ${requiredTotalArea} sf, has ${remainingArea} sf available.`
    };
  }, [unitAllocations]);
  
  const bulkAddAllocations = useCallback((
    unitTypeId: string,
    floorNumbers: number[],
    count: number,
    forceAllocation: boolean = false
  ) => {
    const unitType = getUnitTypeById(unitTypeId);
    if (!unitType) return [];
    
    const newAllocationIds: string[] = [];
    
    // Create a copy of allocations to work with
    let updatedAllocations = [...unitAllocations];
    
    floorNumbers.forEach(floorNumber => {
      const newId = `allocation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${floorNumber}`;
      
      updatedAllocations.push({
        id: newId,
        unitTypeId,
        floorNumber,
        count: count.toString(),
        squareFootage: unitType.typicalSize,
        status: "planned",
        notes: `Bulk allocated ${new Date().toLocaleDateString()}`
      });
      
      newAllocationIds.push(newId);
    });
    
    setUnitAllocations(updatedAllocations);
    return newAllocationIds;
  }, [unitAllocations, getUnitTypeById]);
  
  const copyAllocations = useCallback((
    sourceFloorNumber: number, 
    targetFloorNumbers: number[]
  ) => {
    // Get source floor allocations
    const sourceAllocations = getAllocationsByFloor(sourceFloorNumber);
    
    if (sourceAllocations.length === 0) {
      console.log("No allocations to copy from floor", sourceFloorNumber);
      return [];
    }
    
    let newAllocations: UnitAllocation[] = [];
    
    // For each target floor, copy the allocations
    targetFloorNumbers.forEach(targetFloorNumber => {
      // Skip if source and target are the same
      if (targetFloorNumber === sourceFloorNumber) return;
      
      // Remove existing allocations on target floor
      const updatedAllocations = unitAllocations.filter(
        allocation => allocation.floorNumber !== targetFloorNumber
      );
      
      // Add new allocations based on source
      sourceAllocations.forEach(sourceAlloc => {
        const newId = `allocation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const newAllocation: UnitAllocation = {
          id: newId,
          unitTypeId: sourceAlloc.unitTypeId,
          floorNumber: targetFloorNumber,
          count: sourceAlloc.count,
          squareFootage: sourceAlloc.squareFootage,
          status: sourceAlloc.status,
          notes: `Copied from Floor ${sourceFloorNumber} on ${new Date().toLocaleDateString()}`
        };
        
        updatedAllocations.push(newAllocation);
        newAllocations.push(newAllocation);
      });
      
      setUnitAllocations(updatedAllocations);
    });
    
    return newAllocations;
  }, [unitAllocations, getAllocationsByFloor]);
  
  const getUnitCountByType = useCallback((unitTypeId: string) => {
    const allocations = getAllocationsByUnitType(unitTypeId);
    return allocations.reduce((total, allocation) => {
      return total + (parseInt(allocation.count as string) || 0);
    }, 0);
  }, [getAllocationsByUnitType]);
  
  const resetAllData = useCallback(() => {
    setUnitAllocations([]);
  }, []);

  return {
    unitAllocations,
    addAllocation,
    updateAllocation,
    removeAllocation,
    getAllocationsByFloor,
    getAllocationsByUnitType,
    getAllocationsByUnitTypeId,
    calculateAllocatedAreaByFloor,
    calculateTotalAllocatedAreaByUnitType,
    getUnitCountByType,
    checkEnoughSpaceForAllocation,
    bulkAddAllocations,
    copyAllocations,
    resetAllData
  };
};
