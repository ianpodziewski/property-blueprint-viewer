import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, RefreshCw, ChevronDown, ChevronRight, GripVertical, AlertTriangle, Edit, Trash2, Plus, InfoIcon } from 'lucide-react';
import { Floor, FloorPlateTemplate, Product, NonRentableType } from '@/hooks/usePropertyState';
import { toast } from 'sonner';
import BuildingSummaryPanel from './BuildingSummaryPanel';
import BulkAddFloorsModal from './BulkAddFloorsModal';
import FloorUsageTemplates from './FloorUsageTemplates';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NonRentableAllocation } from '@/hooks/useSupabasePropertyData';
import NonRentableAllocationModal from './NonRentableAllocationModal';
import { useNonRentableAllocationUpdater } from '@/hooks/useNonRentableAllocationUpdater';
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

interface UnitAllocation {
  unitTypeId: string;
  quantity: number;
}

interface BuildingLayoutProps {
  floors: Floor[];
  templates: FloorPlateTemplate[];
  products: Product[];
  nonRentableTypes: NonRentableType[];
  onAddFloor: () => Promise<Floor>;
  onUpdateFloor: (id: string, updates: Partial<Floor>) => Promise<void>;
  onDeleteFloor: (id: string) => Promise<void>;
  onUpdateUnitAllocation: (floorId: string, unitTypeId: string, quantity: number) => Promise<void>;
  getUnitAllocation: (floorId: string, unitTypeId: string) => Promise<number>;
  getFloorTemplateById: (id: string) => FloorPlateTemplate | undefined;
  onRefreshData: () => Promise<void>;
  nonRentableAllocations: NonRentableAllocation[];
  addNonRentableAllocation: (allocation: Omit<NonRentableAllocation, 'id'>) => Promise<NonRentableAllocation | null>;
  updateNonRentableAllocation: (id: string, updates: Partial<Omit<NonRentableAllocation, 'id'>>) => Promise<boolean>;
  deleteNonRentableAllocation: (id: string) => Promise<boolean>;
  getNonRentableAllocationsForFloor: (floorId: string) => NonRentableAllocation[];
}

interface SortableFloorRowProps {
  floor: Floor;
  templates: FloorPlateTemplate[];
  products: Product[];
  nonRentableTypes: NonRentableType[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDeleteFloor: (id: string) => Promise<void>;
  onUpdateFloor: (id: string, updates: Partial<Floor>) => Promise<void>;
  onUpdateUnitAllocation: (floorId: string, unitTypeId: string, quantity: number) => Promise<void>;
  getUnitAllocation: (floorId: string, unitTypeId: string) => Promise<number>;
  getFloorTemplateById: (id: string) => FloorPlateTemplate | undefined;
  globalAllocations: Record<string, number>;
  onAllocationChange: (unitTypeId: string, quantity: number) => void;
  floorAllocationData?: FloorAllocationData;
  nonRentableAllocations: NonRentableAllocation[];
  addNonRentableAllocation: (allocation: Omit<NonRentableAllocation, 'id'>) => Promise<NonRentableAllocation | null>;
  updateNonRentableAllocation: (id: string, updates: Partial<Omit<NonRentableAllocation, 'id'>>) => Promise<boolean>;
  deleteNonRentableAllocation: (id: string) => Promise<boolean>;
  highlightedAllocations?: string[];
}

interface FloorAllocationData {
  floorId: string;
  allocatedArea: number;
  utilization: number;
}

const SortableFloorRow = ({
  floor,
  templates,
  products,
  nonRentableTypes,
  isExpanded,
  onToggleExpand,
  onDeleteFloor,
  onUpdateFloor,
  onUpdateUnitAllocation,
  getUnitAllocation,
  getFloorTemplateById,
  globalAllocations,
  onAllocationChange,
  floorAllocationData,
  nonRentableAllocations,
  addNonRentableAllocation,
  updateNonRentableAllocation,
  deleteNonRentableAllocation,
  highlightedAllocations = []
}: SortableFloorRowProps & { highlightedAllocations?: string[] }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: floor.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative' as const
  };

  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [isLoadingAllocations, setIsLoadingAllocations] = useState(false);
  const [showNonRentableModal, setShowNonRentableModal] = useState(false);
  const [editingNonRentableId, setEditingNonRentableId] = useState<string | null>(null);

  useEffect(() => {
    const loadAllocations = async () => {
      if (isExpanded && products.length > 0) {
        setIsLoadingAllocations(true);
        try {
          const alloc: Record<string, number> = {};
          for (const product of products) {
            for (const unitType of product.unitTypes) {
              const quantity = await getUnitAllocation(floor.id, unitType.id);
              alloc[unitType.id] = quantity;
            }
          }
          setAllocations(alloc);
        } catch (error) {
          console.error(`Error loading allocations for floor ${floor.id}:`, error);
          toast.error("Failed to load unit allocations");
        } finally {
          setIsLoadingAllocations(false);
        }
      }
    };
    
    loadAllocations();
  }, [floor.id, isExpanded, products, getUnitAllocation]);
  
  const handleTemplateChange = useCallback(async (templateId: string) => {
    try {
      await onUpdateFloor(floor.id, { templateId });
    } catch (error) {
      console.error(`Error updating floor ${floor.id} template:`, error);
      toast.error("Failed to update floor template");
    }
  }, [floor.id, onUpdateFloor]);
  
  const handleAllocationChange = useCallback(async (unitTypeId: string, value: string) => {
    const quantity = parseInt(value) || 0;
    const currentQuantity = allocations[unitTypeId] || 0;
    const difference = quantity - currentQuantity;
    
    let unitType;
    for (const product of products) {
      const found = product.unitTypes.find(u => u.id === unitTypeId);
      if (found) {
        unitType = found;
        break;
      }
    }
    
    if (!unitType) return;
    
    const totalAllocated = globalAllocations[unitTypeId] || 0;
    const totalAvailable = unitType.numberOfUnits;
    
    if (totalAllocated + difference > totalAvailable) {
      toast.error(`Cannot allocate more than ${totalAvailable} units of this type`);
      return;
    }
    
    try {
      await onUpdateUnitAllocation(floor.id, unitTypeId, quantity);
      setAllocations(prev => ({
        ...prev,
        [unitTypeId]: quantity
      }));
      
      onAllocationChange(unitTypeId, difference);
      
    } catch (error) {
      console.error(`Error updating allocation for floor ${floor.id}, unit ${unitTypeId}:`, error);
      toast.error("Failed to update unit allocation");
    }
  }, [floor.id, onUpdateUnitAllocation, allocations, products, globalAllocations, onAllocationChange]);
  
  const handleDeleteFloor = useCallback(async () => {
    try {
      await onDeleteFloor(floor.id);
      toast.success("Floor deleted successfully");
    } catch (error) {
      console.error(`Error deleting floor ${floor.id}:`, error);
      toast.error("Failed to delete floor");
    }
  }, [floor.id, onDeleteFloor]);
  
  const handleAddNonRentableAllocation = async (nonRentableTypeId: string, squareFootage: number) => {
    try {
      await addNonRentableAllocation({
        floorId: floor.id,
        nonRentableTypeId,
        squareFootage
      });
      toast.success("Non-rentable space added successfully");
    } catch (error) {
      console.error("Error adding non-rentable allocation:", error);
      toast.error("Failed to add non-rentable space");
    }
  };

  const handleUpdateNonRentableAllocation = async (id: string, squareFootage: number) => {
    try {
      await updateNonRentableAllocation(id, { squareFootage });
      toast.success("Non-rentable space updated successfully");
      setEditingNonRentableId(null);
    } catch (error) {
      console.error("Error updating non-rentable allocation:", error);
      toast.error("Failed to update non-rentable space");
    }
  };

  const handleDeleteNonRentableAllocation = async (id: string) => {
    try {
      await deleteNonRentableAllocation(id);
      toast.success("Non-rentable space removed successfully");
    } catch (error) {
      console.error("Error deleting non-rentable allocation:", error);
      toast.error("Failed to remove non-rentable space");
    }
  };

  const floorTemplate = getFloorTemplateById(floor.templateId);
  const floorArea = floorTemplate?.grossArea || 0;
  
  const nonRentableArea = useMemo(() => {
    return nonRentableAllocations.reduce((total, allocation) => {
      return total + allocation.squareFootage;
    }, 0);
  }, [nonRentableAllocations]);

  const allocatedArea = floorAllocationData ? floorAllocationData.allocatedArea : useMemo(() => {
    let unitArea = 0;
    for (const product of products) {
      for (const unitType of product.unitTypes) {
        const quantity = allocations[unitType.id] || 0;
        unitArea += quantity * unitType.grossArea;
      }
    }
    return unitArea + nonRentableArea;
  }, [products, allocations, nonRentableArea, floorAllocationData]);
  
  const utilization = floorAllocationData 
    ? floorAllocationData.utilization 
    : (floorArea > 0 ? (allocatedArea / floorArea) * 100 : 0);
    
  const isOverallocated = utilization > 100;
  
  const getUtilizationVariant = () => {
    if (utilization > 100) return "red";
    if (utilization >= 67) return "green";
    if (utilization >= 34) return "yellow";
    return "red";
  };
  
  const getUnitAvailability = (unitType) => {
    const globallyAllocated = globalAllocations[unitType.id] || 0;
    const total = unitType.numberOfUnits;
    const available = total - globallyAllocated;
    
    const hasAllocationOnThisFloor = (allocations[unitType.id] || 0) > 0;
    
    return { available, total, hasAllocationOnThisFloor };
  };
  
  const floorType = floor.floorType || 'aboveground';

  const getNonRentableTypeName = (typeId: string) => {
    const type = nonRentableTypes.find(t => t.id === typeId);
    return type ? type.name : 'Unknown';
  };

  const hasHighlightedAllocations = useMemo(() => {
    return nonRentableAllocations.some(alloc => 
      highlightedAllocations.includes(alloc.id)
    );
  }, [nonRentableAllocations, highlightedAllocations]);

  return (
    <>
      <TableRow ref={setNodeRef} style={style} className={`${isDragging ? 'opacity-50' : ''} ${hasHighlightedAllocations ? 'bg-yellow-50 transition-colors duration-1000' : ''}`}>
        
        <TableCell className="w-8">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 flex justify-center">
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
        </TableCell>
        <TableCell className="font-medium">
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleExpand}
              className="p-1 rounded-sm hover:bg-gray-100"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              )}
            </button>
            <span>{floor.label}</span>
          </div>
        </TableCell>
        <TableCell>
          <Select
            value={floor.templateId}
            onValueChange={handleTemplateChange}
          >
            <SelectTrigger className="w-60">
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map(template => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell className="text-right">
          {floorArea.toLocaleString()} sf
        </TableCell>
        <TableCell className="text-right">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center justify-end w-full cursor-help">
                <span className="mr-1">{allocatedArea.toLocaleString()} sf</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Total allocated space includes:</p>
                <ul className="mt-1 text-xs">
                  <li>• Unit allocations: {(allocatedArea - nonRentableArea).toLocaleString()} sf</li>
                  <li>• Non-rentable space: {nonRentableArea.toLocaleString()} sf</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>
        <TableCell className="w-32">
          <Progress 
            value={isOverallocated ? 100 : utilization} 
            variant={getUtilizationVariant()}
            showValue={true}
            size="sm"
            className={`${isOverallocated ? "opacity-80" : ""} ${hasHighlightedAllocations ? 'animate-pulse' : ''}`}
          />
          {isOverallocated && (
            <div className="text-xs text-red-600 text-center font-semibold mt-1">
              {utilization.toFixed(1)}%
            </div>
          )}
        </TableCell>
        <TableCell className="text-right">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteFloor}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 hover:text-red-500">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </Button>
        </TableCell>
      </TableRow>
      
      {isExpanded && (
        <TableRow className={`bg-gray-50/70 border-b-0 ${hasHighlightedAllocations ? 'bg-yellow-50/50' : ''}`}>
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
                </div>
              )}
              
              <div className="mt-8">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-sm font-medium">Non-Rentable Allocations</div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowNonRentableModal(true)}
                    className="h-8"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Non-Rentable Space
                  </Button>
                </div>
                
                {nonRentableAllocations.length === 0 ? (
                  <div className="text-sm text-gray-500 py-3 border rounded text-center bg-white">
                    No non-rentable spaces allocated to this floor
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {nonRentableAllocations.map(allocation => {
                      const isHighlighted = highlightedAllocations.includes(allocation.id);
                      return (
                        <div 
                          key={allocation.id} 
                          className={`p-3 bg-white border rounded shadow-sm flex justify-between items-center transition-all duration-1000 ${isHighlighted ? 'bg-yellow-50 border-yellow-400' : ''}`}
                        >
                          <div>
                            <div className="font-medium text-sm">
                              {getNonRentableTypeName(allocation.nonRentableTypeId)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {allocation.squareFootage.toLocaleString()} sf
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setEditingNonRentableId(allocation.id);
                                setShowNonRentableModal(true);
                              }}
                            >
                              <Edit className="h-4 w-4 text-gray-500 hover:text-blue-500" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDeleteNonRentableAllocation(allocation.id)}
                            >
                              <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
      
      {showNonRentableModal && (
        <NonRentableAllocationModal
          isOpen={showNonRentableModal}
          onClose={() => {
            setShowNonRentableModal(false);
            setEditingNonRentableId(null);
          }}
          onSave={editingNonRentableId 
            ? (_, squareFootage) => handleUpdateNonRentableAllocation(editingNonRentableId, squareFootage)
            : handleAddNonRentableAllocation
          }
          nonRentableTypes={nonRentableTypes}
          floor={floor}
          floorArea={floorArea}
          existingAllocationIds={editingNonRentableId 
            ? nonRentableAllocations.filter(a => a.id !== editingNonRentableId).map(a => a.nonRentableTypeId)
            : nonRentableAllocations.map(a => a.nonRentableTypeId)
          }
        />
      )}
    </>
  );
};

const BuildingLayout: React.FC<BuildingLayoutProps> = ({
  floors,
  templates,
  products,
  nonRentableTypes,
  onAddFloor,
  onUpdateFloor,
  onDeleteFloor,
  onUpdateUnitAllocation,
  getUnitAllocation,
  getFloorTemplateById,
  onRefreshData,
  nonRentableAllocations,
  addNonRentableAllocation,
  updateNonRentableAllocation,
  deleteNonRentableAllocation,
  getNonRentableAllocationsForFloor
}) => {
  const [expandedFloors, setExpandedFloors] = useState<Set<string>>(new Set());
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [isLoadingInitialAllocations, setIsLoadingInitialAllocations] = useState(true);
  const [globalAllocations, setGlobalAllocations] = useState<Record<string, number>>({});
  const [floorAllocations, setFloorAllocations] = useState<Record<string, FloorAllocationData>>({});

  const { highlightedAllocations, isUpdating } = useNonRentableAllocationUpdater({
    floors,
    nonRentableTypes,
    nonRentableAllocations,
    getFloorTemplateById,
    updateNonRentableAllocation,
    addNonRentableAllocation,
    getNonRentableAllocationsForFloor
  });
  
  useEffect(() => {
    const calculateGlobalAllocations = async () => {
      if (floors.length === 0 || products.length === 0) return;
      
      try {
        const allocs: Record<string, number> = {};
        
        for (const product of products) {
          for (const unitType of product.unitTypes) {
            let totalAllocated = 0;
            
            for (const floor of floors) {
              const allocation = await getUnitAllocation(floor.id, unitType.id);
              totalAllocated += allocation;
            }
            
            allocs[unitType.id] = totalAllocated;
          }
        }
        
        setGlobalAllocations(allocs);
      } catch (error) {
        console.error("Error calculating global allocations:", error);
        toast.error("Failed to calculate unit availability");
      }
    };
    
    calculateGlobalAllocations();
  }, [floors, products, getUnitAllocation]);
  
  useEffect(() => {
    const calculateAllFloorAllocations = async () => {
      if (floors.length === 0 || products.length === 0 || !getFloorTemplateById) {
        setIsLoadingInitialAllocations(false);
        return;
      }
      
      setIsLoadingInitialAllocations(true);
      
      try {
        const allocData: Record<string, FloorAllocationData> = {};
        
        for (const floor of floors) {
          let unitAllocatedArea = 0;
          
          for (const product of products) {
            for (const unitType of product.unitTypes) {
              const quantity = await getUnitAllocation(floor.id, unitType.id);
              unitAllocatedArea += quantity * unitType.grossArea;
            }
          }
          
          const floorNonRentableAllocations = getNonRentableAllocationsForFloor(floor.id);
          
          const nonRentableArea = floorNonRentableAllocations.reduce((total, allocation) => {
            return total + allocation.squareFootage;
          }, 0);
          
          const totalAllocatedArea = unitAllocatedArea + nonRentableArea;
          
          const floorTemplate = getFloorTemplateById(floor.templateId);
          const floorArea = floorTemplate?.grossArea || 0;
          const utilizationPercentage = floorArea > 0 ? (totalAllocatedArea / floorArea) * 100 : 0;
          
          allocData[floor.id] = {
            floorId: floor.id,
            allocatedArea: totalAllocatedArea,
            utilization: utilizationPercentage
          };
        }
        
        setFloorAllocations(allocData);
      } catch (error) {
        console.error("Error pre-calculating floor allocations:", error);
      } finally {
        setIsLoadingInitialAllocations(false);
      }
    };
    
    calculateAllFloorAllocations();
  }, [floors, products, getUnitAllocation, getFloorTemplateById, getNonRentableAllocationsForFloor]);
  
  const handleAllocationChange = useCallback((unitTypeId: string, difference: number) => {
    setGlobalAllocations(prev => ({
      ...prev,
      [unitTypeId]: (prev[unitTypeId] || 0) + difference
    }));
  }, []);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const sortedFloors = useMemo(() => {
    const abovegroundFloors = floors.filter(f => (f.floorType || 'aboveground') === 'aboveground');
    const undergroundFloors = floors.filter(f => f.floorType === 'underground');
    
    const sortedAboveground = [...abovegroundFloors].sort((a, b) => b.position - a.position);
    const sortedUnderground = [...undergroundFloors].sort((a, b) => a.position - b.position);
    
    return [...sortedAboveground, ...sortedUnderground];
  }, [floors]);
  
  const floorIds = useMemo(() => 
    sortedFloors.map(floor => floor.id),
    [sortedFloors]
  );
  
  const toggleFloorExpand = useCallback((floorId: string) => {
    setExpandedFloors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(floorId)) {
        newSet.delete(floorId);
      } else {
        newSet.add(floorId);
      }
      return newSet;
    });
  }, []);
  
  const handleAddFloor = useCallback(async () => {
    try {
      await onAddFloor();
      toast.success("New floor added");
    } catch (error) {
      console.error("Error adding floor:", error);
      toast.error("Failed to add floor");
    }
  }, [onAddFloor]);
  
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const activeIndex = sortedFloors.findIndex(f => f.id === active.id);
      const overIndex = sortedFloors.findIndex(f => f.id === over.id);
      
      if (activeIndex !== -1 && overIndex !== -1) {
        const activeFloor = sortedFloors[activeIndex];
        const overFloor = sortedFloors[overIndex];
        
        try {
          await onUpdateFloor(activeFloor.id, { position: overFloor.position });
          
          const direction = activeIndex < overIndex ? 1 : -1;
          for (let i = activeIndex + direction; i !== overIndex + direction; i += direction) {
            const floorToUpdate = sortedFloors[i];
            const newPosition = i === overIndex 
              ? activeFloor.position
              : sortedFloors[i - direction].position;
              
            await onUpdateFloor(floorToUpdate.id, { position: newPosition });
          }
          
          await onRefreshData();
        } catch (error) {
          console.error("Error updating floor positions:", error);
          toast.error("Failed to reorder floors");
        }
      }
    }
  }, [sortedFloors, onUpdateFloor, onRefreshData]);
  
  const projectId = useMemo(() => 
    floors.length > 0 ? floors[0].projectId || "" : "", 
    [floors]
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-blue-700">Building Layout</h3>
          <p className="text-sm text-gray-500">Configure floor layouts and unit allocations</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {isUpdating && (
            <div className="flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Updating allocations...
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBulkAddModal(true)}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Multiple Floors
          </Button>
          
          <Button
            size="sm"
            onClick={handleAddFloor}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Floor
          </Button>
        </div>
      </div>
      
      <FloorUsageTemplates
        floors={floors}
        templates={templates}
        projectId={projectId}
        onRefresh={onRefreshData}
      />
      
      <Card>
        <CardContent className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            {isLoadingInitialAllocations ? (
              <div className="py-8 text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
                <p className="text-gray-600 mt-4">Loading floor allocation data...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className
