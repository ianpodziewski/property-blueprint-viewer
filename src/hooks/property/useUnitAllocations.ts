
import { useState, useEffect, useCallback } from "react";
import { UnitAllocation } from "@/types/unitMixTypes";
import { saveToLocalStorage, loadFromLocalStorage } from "@/hooks/useLocalStoragePersistence";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "realEstateModel_unitAllocations";

export const useUnitAllocations = () => {
  const { toast } = useToast();
  
  // Initialize state directly with data from localStorage
  const [unitAllocations, setUnitAllocations] = useState<UnitAllocation[]>(() => {
    const storedAllocations = loadFromLocalStorage<UnitAllocation[]>(STORAGE_KEY, []);
    console.log("Initialized unit allocations from localStorage:", storedAllocations);
    return storedAllocations;
  });

  // Save to localStorage when updated
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEY, unitAllocations);
    console.log("Saved unit allocations to localStorage:", unitAllocations);
  }, [unitAllocations]);

  const addAllocation = useCallback((allocation: Omit<UnitAllocation, "id">, forceAllocate: boolean = false) => {
    console.log("Adding allocation:", allocation, "Force allocate:", forceAllocate);
    
    // Check if already exists, if so update it instead
    const existingAllocation = unitAllocations.find(
      a => a.unitTypeId === allocation.unitTypeId && a.floorNumber === allocation.floorNumber
    );
    
    if (existingAllocation) {
      // Update existing allocation
      const numExisting = parseInt(existingAllocation.count) || 0;
      const numToAdd = parseInt(allocation.count as string) || 0;
      const newCount = numExisting + numToAdd;
      
      setUnitAllocations(prev => 
        prev.map(a => 
          a.id === existingAllocation.id 
            ? { ...a, count: newCount.toString() } 
            : a
        )
      );
      
      return existingAllocation.id;
    }
    
    // Create new allocation
    const newAllocation: UnitAllocation = {
      ...allocation,
      id: `allocation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    setUnitAllocations(prev => [...prev, newAllocation]);
    return newAllocation.id;
  }, [unitAllocations]);

  const updateAllocation = useCallback((id: string, field: keyof UnitAllocation, value: string | number) => {
    setUnitAllocations(prev => 
      prev.map(allocation => 
        allocation.id === id 
          ? { ...allocation, [field]: field === 'floorNumber' ? Number(value) : value } 
          : allocation
      )
    );
  }, []);

  const removeAllocation = useCallback((id: string) => {
    setUnitAllocations(prev => prev.filter(allocation => allocation.id !== id));
  }, []);

  const removeAllocationsByFloor = useCallback((floorNumber: number) => {
    setUnitAllocations(prev => {
      const filtered = prev.filter(allocation => allocation.floorNumber !== floorNumber);
      
      // If allocations were removed, show a toast
      const removedCount = prev.length - filtered.length;
      if (removedCount > 0) {
        toast({
          title: "Allocations removed",
          description: `${removedCount} unit allocations were removed from floor ${floorNumber}.`,
        });
      }
      
      return filtered;
    });
  }, [toast]);

  const removeAllocationsByUnitType = useCallback((unitTypeId: string) => {
    setUnitAllocations(prev => prev.filter(allocation => allocation.unitTypeId !== unitTypeId));
  }, []);

  const getAllocationsByFloor = useCallback((floorNumber: number) => {
    return unitAllocations.filter(allocation => allocation.floorNumber === floorNumber);
  }, [unitAllocations]);

  const bulkUpdateAllocations = useCallback((allocations: UnitAllocation[]) => {
    setUnitAllocations(prev => {
      // Remove allocations matching IDs in the update batch
      const filteredAllocations = prev.filter(
        allocation => !allocations.some(a => a.id === allocation.id)
      );
      // Add the updated allocations
      return [...filteredAllocations, ...allocations];
    });
  }, []);

  const copyAllocations = useCallback((sourceFloorNumber: number, targetFloorNumbers: number[]) => {
    const sourceAllocations = unitAllocations.filter(
      allocation => allocation.floorNumber === sourceFloorNumber
    );
    
    if (sourceAllocations.length === 0) {
      toast({
        title: "No allocations to copy",
        description: `Floor ${sourceFloorNumber} does not have any unit allocations to copy.`,
        variant: "destructive"
      });
      return;
    }
    
    const newAllocations: UnitAllocation[] = [];
    
    targetFloorNumbers.forEach(targetFloorNumber => {
      // If target already has allocations, remove them first
      if (targetFloorNumber !== sourceFloorNumber) {
        setUnitAllocations(prev => 
          prev.filter(allocation => allocation.floorNumber !== targetFloorNumber)
        );
      }
      
      // Create new allocations based on source floor
      sourceAllocations.forEach(sourceAllocation => {
        if (targetFloorNumber !== sourceFloorNumber) {
          newAllocations.push({
            id: `allocation-${Date.now()}-${Math.random().toString(36).substr(2, 5)}-${targetFloorNumber}`,
            unitTypeId: sourceAllocation.unitTypeId,
            floorNumber: targetFloorNumber,
            count: sourceAllocation.count,
            squareFootage: sourceAllocation.squareFootage,
            notes: sourceAllocation.notes,
            status: sourceAllocation.status
          });
        }
      });
    });
    
    if (newAllocations.length > 0) {
      setUnitAllocations(prev => [...prev, ...newAllocations]);
      
      toast({
        title: "Allocations copied",
        description: `Copied ${sourceAllocations.length} allocations to ${targetFloorNumbers.length} floor(s).`
      });
    }
  }, [unitAllocations, toast]);

  const calculateAllocatedAreaByFloor = useCallback((floorNumber: number) => {
    return unitAllocations
      .filter(allocation => allocation.floorNumber === floorNumber)
      .reduce((total, allocation) => {
        const count = parseInt(allocation.count as string) || 0;
        const size = parseInt(allocation.squareFootage as string) || 0;
        return total + (count * size);
      }, 0);
  }, [unitAllocations]);

  const calculateTotalAllocatedArea = useCallback(() => {
    return unitAllocations.reduce((total, allocation) => {
      const count = parseInt(allocation.count as string) || 0;
      const size = parseInt(allocation.squareFootage as string) || 0;
      return total + (count * size);
    }, 0);
  }, [unitAllocations]);

  const calculateAllocationStats = useCallback((unitTypeId: string) => {
    const allocations = unitAllocations.filter(a => a.unitTypeId === unitTypeId);
    const totalAllocated = allocations.reduce((sum, a) => sum + (parseInt(a.count as string) || 0), 0);
    const allocatedFloors = new Set(allocations.map(a => a.floorNumber));
    
    return {
      totalAllocated,
      floorCount: allocatedFloors.size,
      floors: Array.from(allocatedFloors)
    };
  }, [unitAllocations]);

  const suggestAllocations = useCallback((unitTypeId: string, targetCount: number, availableFloors: number[]) => {
    // Filter floors that already have this unit type
    const existingAllocations = unitAllocations.filter(a => a.unitTypeId === unitTypeId);
    const allocatedFloors = new Set(existingAllocations.map(a => a.floorNumber));
    
    // Calculate how many are already allocated
    const alreadyAllocated = existingAllocations.reduce(
      (sum, a) => sum + (parseInt(a.count as string) || 0), 
      0
    );
    
    // Calculate how many remain to be allocated
    const remainingToAllocate = targetCount - alreadyAllocated;
    
    if (remainingToAllocate <= 0) return [];
    
    // Find floors that don't have this unit type yet
    const unallocatedFloors = availableFloors.filter(f => !allocatedFloors.has(f));
    
    if (unallocatedFloors.length === 0) return [];
    
    // Calculate how many units to allocate per floor
    const unitsPerFloor = Math.ceil(remainingToAllocate / unallocatedFloors.length);
    
    let remaining = remainingToAllocate;
    const suggestions: { floorNumber: number, count: number }[] = [];
    
    // Distribute units across floors
    unallocatedFloors.forEach(floorNumber => {
      if (remaining > 0) {
        const count = Math.min(unitsPerFloor, remaining);
        suggestions.push({ floorNumber, count });
        remaining -= count;
      }
    });
    
    return suggestions;
  }, [unitAllocations]);

  const getFloorUtilization = useCallback((floorNumber: number, totalFloorArea: number) => {
    if (!totalFloorArea) return 0;
    const allocatedArea = calculateAllocatedAreaByFloor(floorNumber);
    return (allocatedArea / totalFloorArea) * 100;
  }, [calculateAllocatedAreaByFloor]);

  const checkEnoughSpaceForAllocation = useCallback((
    floorNumber: number, 
    unitSize: number,
    unitCount: number, 
    totalFloorArea: number,
    existingAllocationToUpdateId?: string
  ) => {
    console.log(`Checking space for floor ${floorNumber}:`, {
      unitSize,
      unitCount,
      totalFloorArea,
      existingAllocationToUpdateId
    });

    // Calculate already allocated area on this floor, excluding the allocation being updated
    const currentAllocatedArea = unitAllocations
      .filter(a => a.floorNumber === floorNumber && a.id !== existingAllocationToUpdateId)
      .reduce((sum, a) => {
        const count = parseInt(a.count as string) || 0;
        const size = parseInt(a.squareFootage as string) || 0;
        return sum + (count * size);
      }, 0);

    // Calculate space needed for the new allocation
    const spaceNeeded = unitSize * unitCount;
    
    // Calculate available space
    const availableSpace = Math.max(0, totalFloorArea - currentAllocatedArea);
    
    console.log(`Floor ${floorNumber} allocation check:`, {
      currentAllocatedArea,
      spaceNeeded,
      availableSpace,
      hasEnoughSpace: availableSpace >= spaceNeeded
    });
    
    return {
      hasEnoughSpace: availableSpace >= spaceNeeded,
      availableSpace,
      spaceNeeded,
      currentAllocatedArea
    };
  }, [unitAllocations]);

  const resetAllData = useCallback(() => {
    setUnitAllocations([]);
  }, []);

  return {
    unitAllocations,
    addAllocation,
    updateAllocation,
    removeAllocation,
    removeAllocationsByFloor,
    removeAllocationsByUnitType,
    getAllocationsByFloor,
    bulkUpdateAllocations,
    copyAllocations,
    calculateAllocatedAreaByFloor,
    calculateTotalAllocatedArea,
    calculateAllocationStats,
    suggestAllocations,
    getFloorUtilization,
    checkEnoughSpaceForAllocation,
    resetAllData
  };
};
