
import { useState, useEffect, useCallback } from "react";
import { UnitAllocation } from "@/types/unitMixTypes";
import { saveToLocalStorage, loadFromLocalStorage } from "@/hooks/useLocalStoragePersistence";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "realEstateModel_unitAllocations";

export const useUnitAllocations = () => {
  const [unitAllocations, setUnitAllocations] = useState<UnitAllocation[]>([]);
  const { toast } = useToast();

  // Load from localStorage on mount
  useEffect(() => {
    const storedAllocations = loadFromLocalStorage(STORAGE_KEY, []);
    setUnitAllocations(storedAllocations);
  }, []);

  // Save to localStorage when updated
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEY, unitAllocations);
  }, [unitAllocations]);

  const addAllocation = useCallback((allocation: Omit<UnitAllocation, "id">) => {
    const newAllocation: UnitAllocation = {
      ...allocation,
      id: `allocation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    setUnitAllocations(prev => [...prev, newAllocation]);
    return newAllocation.id;
  }, []);

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
    setUnitAllocations(prev => prev.filter(allocation => allocation.floorNumber !== floorNumber));
  }, []);

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
      // Remove existing allocations for the target floor
      setUnitAllocations(prev => 
        prev.filter(allocation => allocation.floorNumber !== targetFloorNumber)
      );
      
      // Create new allocations based on source floor
      sourceAllocations.forEach(sourceAllocation => {
        newAllocations.push({
          id: `allocation-${Date.now()}-${Math.random().toString(36).substr(2, 5)}-${targetFloorNumber}`,
          unitTypeId: sourceAllocation.unitTypeId,
          floorNumber: targetFloorNumber,
          count: sourceAllocation.count,
          squareFootage: sourceAllocation.squareFootage,
          notes: sourceAllocation.notes,
          status: sourceAllocation.status
        });
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
    
    return {
      totalAllocated,
      floorCount: new Set(allocations.map(a => a.floorNumber)).size
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
    suggestAllocations
  };
};
