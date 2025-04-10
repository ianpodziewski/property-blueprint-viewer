import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, RefreshCw, ChevronDown, ChevronRight, GripVertical, AlertTriangle } from 'lucide-react';
import { Floor, FloorPlateTemplate, Product } from '@/hooks/usePropertyState';
import { toast } from 'sonner';
import BuildingSummaryPanel from './BuildingSummaryPanel';
import BulkAddFloorsModal from './BulkAddFloorsModal';
import FloorUsageTemplates from './FloorUsageTemplates';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BuildingComponent } from '@/hooks/useBuildingComponents';
import FloorComponentsPanel from './FloorComponentsPanel';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';

interface SortableFloorRowProps {
  floor: Floor;
  templates: FloorPlateTemplate[];
  products: Product[];
  buildingComponents: BuildingComponent[];
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onDeleteFloor: (id: string) => void;
  onUpdateFloor: (id: string, updates: Partial<Floor>) => void;
  onUpdateUnitAllocation: (floorId: string, unitTypeId: string, quantity: number) => void;
  getUnitAllocation: (floorId: string, unitTypeId: string) => Promise<number>;
  getFloorTemplateById: (id: string) => FloorPlateTemplate | undefined;
  getComponentsByFloorId: (floorId: string | null) => BuildingComponent[];
  calculateComponentArea: (component: BuildingComponent, floorArea: number) => number;
  globalAllocations: Record<string, Record<string, number>>;
  onAllocationChange: (unitTypeId: string, value: string) => void;
  floorAllocationData: any;
}

const SortableFloorRow = ({
  floor,
  templates,
  products,
  buildingComponents,
  isExpanded,
  onToggleExpand,
  onDeleteFloor,
  onUpdateFloor,
  onUpdateUnitAllocation,
  getUnitAllocation,
  getFloorTemplateById,
  getComponentsByFloorId,
  calculateComponentArea,
  globalAllocations,
  onAllocationChange,
  floorAllocationData
}: SortableFloorRowProps) => {
  const [isLoadingAllocations, setIsLoadingAllocations] = useState(false);
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const floorTemplate = getFloorTemplateById(floor.templateId);
  const floorArea = floorTemplate?.grossArea || 0;
  const floorComponents = getComponentsByFloorId(floor.id);

  const getUnitAvailability = (unitType: any) => {
    return {
      available: 0,
      total: 0,
      hasAllocationOnThisFloor: false
    };
  };

  const handleAllocationChange = (unitTypeId: string, value: string) => {
    const numericValue = value === '' ? 0 : parseInt(value, 10);
    setAllocations(prev => ({ ...prev, [unitTypeId]: numericValue }));
    onAllocationChange(unitTypeId, value);
  };

  return (
    <>
      {isExpanded && (
        <TableRow className="bg-gray-50/70 border-b-0">
          <TableCell colSpan={7} className="p-0">
            <div className="p-4">
              <div className="text-sm font-medium mb-2">Unit Allocation</div>
              {isLoadingAllocations ? (
                <div className="py-4 text-center">
                  <RefreshCw className="h-5 w-5 animate-spin text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-500 mt-1">Loading allocations...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map(product => (
                    <div key={product.id} className="mt-3 first:mt-0">
                      <div className="text-sm font-medium text-gray-700 mb-2">{product.name}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {product.unitTypes.map(unitType => {
                          const { available, total, hasAllocationOnThisFloor } = getUnitAvailability(unitType);
                          const isFullyAllocated = available <= 0;
                          const shouldDisableInput = isFullyAllocated && !hasAllocationOnThisFloor;
                          
                          return (
                            <div key={unitType.id} className="flex flex-col h-full p-3 bg-white border rounded shadow-sm">
                              <div className="mb-2">
                                <div className="font-medium text-sm">
                                  {unitType.unitType}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {available} available / {total} total
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {unitType.grossArea.toLocaleString()} sf
                                </div>
                              </div>
                              <div className="mt-auto pt-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div>
                                        <Input
                                          type="number"
                                          min="0"
                                          max={shouldDisableInput ? "0" : total}
                                          value={allocations[unitType.id] || 0}
                                          onChange={(e) => handleAllocationChange(unitType.id, e.target.value)}
                                          className={`w-full text-right ${shouldDisableInput ? 'bg-gray-100 opacity-60' : ''}`}
                                          disabled={shouldDisableInput}
                                        />
                                      </div>
                                    </TooltipTrigger>
                                    {shouldDisableInput && (
                                      <TooltipContent>
                                        <p className="text-xs">This unit type is fully allocated across the building. Modify existing allocations on other floors to make units available.</p>
                                      </TooltipContent>
                                    )}
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  
                  {floorComponents.length > 0 && (
                    <FloorComponentsPanel
                      floorComponents={floorComponents}
                      floorArea={floorArea}
                      calculateComponentArea={calculateComponentArea}
                    />
                  )}
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

const BuildingLayout = ({
  // ... keep existing props
}) => {
  // ... keep existing code
};

export { BuildingLayout };
