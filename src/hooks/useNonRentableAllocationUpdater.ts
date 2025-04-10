
import { useEffect, useState } from 'react';
import { NonRentableType, Floor } from '@/hooks/usePropertyState';
import { NonRentableAllocation } from '@/hooks/useSupabasePropertyData';

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
  // This hook now returns an empty object since we're removing the automatic allocation functionality
  return {};
};
