
import { useEffect, useState } from 'react';
import { NonRentableType, Floor } from '@/hooks/usePropertyState';
import { NonRentableAllocation } from '@/hooks/useSupabasePropertyData';
import { toast } from 'sonner';

interface UseNonRentableAllocationUpdaterProps {
  floors: Floor[];
  nonRentableTypes: NonRentableType[];
  nonRentableAllocations: NonRentableAllocation[];
  getFloorTemplateById: (id: string) => any;
  updateNonRentableAllocation: (id: string, updates: Partial<Omit<NonRentableAllocation, 'id'>>) => Promise<boolean>;
  addNonRentableAllocation: (allocation: Omit<NonRentableAllocation, 'id'>) => Promise<NonRentableAllocation | null>;
  getNonRentableAllocationsForFloor: (floorId: string) => NonRentableAllocation[];
}

export const useNonRentableAllocationUpdater = ({
  floors,
  nonRentableTypes,
  nonRentableAllocations,
  getFloorTemplateById,
  updateNonRentableAllocation,
  addNonRentableAllocation,
  getNonRentableAllocationsForFloor,
}: UseNonRentableAllocationUpdaterProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdatedAllocationIds, setLastUpdatedAllocationIds] = useState<string[]>([]);

  // Track changes to nonRentableTypes to detect when they're updated
  useEffect(() => {
    if (nonRentableTypes.length === 0 || floors.length === 0 || isUpdating) return;

    const updateDynamicAllocations = async () => {
      setIsUpdating(true);
      const updatedIds: string[] = [];
      
      try {
        // Process each non-rentable type that uses percentage-based or uniform allocation
        for (const nonRentableType of nonRentableTypes) {
          if (nonRentableType.allocationMethod === 'specific') continue;

          // For percentage-based allocations
          if (nonRentableType.isPercentageBased && nonRentableType.percentage !== undefined) {
            for (const floor of floors) {
              const template = getFloorTemplateById(floor.templateId);
              if (!template) continue;

              const floorArea = template.grossArea;
              const targetSquareFootage = (floorArea * nonRentableType.percentage) / 100;
              
              // Find existing allocation for this floor and non-rentable type
              const existingAllocation = nonRentableAllocations.find(
                alloc => alloc.floorId === floor.id && alloc.nonRentableTypeId === nonRentableType.id
              );

              if (existingAllocation) {
                // Update if square footage is different (with a small tolerance for floating point)
                if (Math.abs(existingAllocation.squareFootage - targetSquareFootage) > 0.01) {
                  await updateNonRentableAllocation(existingAllocation.id, {
                    squareFootage: targetSquareFootage
                  });
                  updatedIds.push(existingAllocation.id);
                }
              } else {
                // Create new allocation if doesn't exist
                const newAllocation = await addNonRentableAllocation({
                  floorId: floor.id,
                  nonRentableTypeId: nonRentableType.id,
                  squareFootage: targetSquareFootage
                });
                if (newAllocation) {
                  updatedIds.push(newAllocation.id);
                }
              }
            }
          }
          
          // For uniform allocations (distribute evenly across floors)
          else if (nonRentableType.allocationMethod === 'uniform' && !nonRentableType.isPercentageBased) {
            const totalSquareFootage = nonRentableType.squareFootage;
            const floorCount = floors.length;
            
            if (floorCount > 0) {
              const squareFootagePerFloor = totalSquareFootage / floorCount;
              
              for (const floor of floors) {
                // Find existing allocation
                const existingAllocation = nonRentableAllocations.find(
                  alloc => alloc.floorId === floor.id && alloc.nonRentableTypeId === nonRentableType.id
                );
                
                if (existingAllocation) {
                  // Update if different
                  if (Math.abs(existingAllocation.squareFootage - squareFootagePerFloor) > 0.01) {
                    await updateNonRentableAllocation(existingAllocation.id, {
                      squareFootage: squareFootagePerFloor
                    });
                    updatedIds.push(existingAllocation.id);
                  }
                } else {
                  // Create new allocation
                  const newAllocation = await addNonRentableAllocation({
                    floorId: floor.id,
                    nonRentableTypeId: nonRentableType.id,
                    squareFootage: squareFootagePerFloor
                  });
                  if (newAllocation) {
                    updatedIds.push(newAllocation.id);
                  }
                }
              }
            }
          }
        }
        
        if (updatedIds.length > 0) {
          toast.success(`Updated ${updatedIds.length} non-rentable space allocations`);
          setLastUpdatedAllocationIds(updatedIds);
        }
      } catch (error) {
        console.error("Error updating non-rentable allocations:", error);
        toast.error("Failed to update non-rentable space allocations");
      } finally {
        setIsUpdating(false);
      }
    };

    updateDynamicAllocations();
  }, [
    nonRentableTypes, 
    floors, 
    nonRentableAllocations, 
    getFloorTemplateById, 
    updateNonRentableAllocation, 
    addNonRentableAllocation
  ]);

  return {
    isUpdating,
    lastUpdatedAllocationIds,
    highlightedAllocations: lastUpdatedAllocationIds
  };
};
