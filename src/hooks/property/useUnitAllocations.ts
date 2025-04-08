import { useState, useEffect, useCallback, useMemo } from "react";
import { UnitAllocation } from "@/types/unitMixTypes";
import { saveToLocalStorage, loadFromLocalStorage } from "@/hooks/useLocalStoragePersistence";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "realEstateModel_unitAllocations";

// Helper function to dispatch a custom event when unit allocations change
const dispatchUnitAllocationChangedEvent = () => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('unitAllocationChanged');
    window.dispatchEvent(event);
  }
};

export const useUnitAllocations = () => {
  const { toast } = useToast();
  
  // Initialize state directly with data from localStorage
  const [unitAllocations, setUnitAllocations] = useState<UnitAllocation[]>(() => {
    const storedAllocations = loadFromLocalStorage<UnitAllocation[]>(STORAGE_KEY, []);
    console.log("Initialized unit allocations from localStorage:", storedAllocations);
    return storedAllocations;
  });

  // Track previous allocation state to prevent unnecessary updates
  const [prevUnitAllocations, setPrevUnitAllocations] = useState<string>("");

  // Save to localStorage when updated - with deep comparison to prevent loops
  useEffect(() => {
    // Create a string representation of the current allocations for comparison
    const currentAllocations = JSON.stringify(unitAllocations);
    
    // Only save if allocations have actually changed
    if (currentAllocations !== prevUnitAllocations) {
      saveToLocalStorage(STORAGE_KEY, unitAllocations);
      console.log("Saved unit allocations to localStorage:", unitAllocations);
      
      // Update previous state reference
      setPrevUnitAllocations(currentAllocations);
      
      // Dispatch an event to notify other components that allocations have changed
      dispatchUnitAllocationChangedEvent();
    }
  }, [unitAllocations, prevUnitAllocations]);

  const addAllocation = useCallback((allocation: Omit<UnitAllocation, "id">) => {
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
    console.log("Added new unit allocation:", newAllocation);
    
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

  // Memoize allocation stats to prevent infinite calculation loops
  const allocationStatsCache = useMemo(() => {
    const cache = new Map<string, { totalAllocated: number, floorCount: number, floors: number[] }>();
    
    return {
      get: (unitTypeId: string) => cache.get(unitTypeId),
      set: (unitTypeId: string, stats: { totalAllocated: number, floorCount: number, floors: number[] }) => 
        cache.set(unitTypeId, stats),
      clear: () => cache.clear()
    };
  }, []);

  // Clear the cache when allocations change
  useEffect(() => {
    allocationStatsCache.clear();
  }, [unitAllocations, allocationStatsCache]);

  const calculateAllocationStats = useCallback((unitTypeId: string) => {
    // First check if we have cached results
    const cachedStats = allocationStatsCache.get(unitTypeId);
    if (cachedStats) {
      return cachedStats;
    }
    
    console.log(`Calculating allocation stats for unit type ${unitTypeId}`);
    
    const allocations = unitAllocations.filter(a => a.unitTypeId === unitTypeId);
    console.log(`Found ${allocations.length} allocations for this unit type`);
    
    const totalAllocated = allocations.reduce((sum, a) => {
      const count = parseInt(a.count as string) || 0;
      console.log(`Allocation on floor ${a.floorNumber} has count: ${count}`);
      return sum + count;
    }, 0);
    
    console.log(`Total allocated: ${totalAllocated}`);
    
    const allocatedFloors = new Set(allocations.map(a => a.floorNumber));
    console.log(`Allocated on ${allocatedFloors.size} floors: ${Array.from(allocatedFloors).join(', ')}`);
    
    // Cache the results
    const stats = {
      totalAllocated,
      floorCount: allocatedFloors.size,
      floors: Array.from(allocatedFloors)
    };
    
    allocationStatsCache.set(unitTypeId, stats);
    return stats;
  }, [unitAllocations, allocationStatsCache]);

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
    resetAllData
  };
};
