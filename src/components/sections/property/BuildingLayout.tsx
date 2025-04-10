
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

// Define BulkAddFloorsModalProps interface to match the component's expected props
interface BulkAddFloorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFloors: (count: number) => Promise<void>;
  templates: FloorPlateTemplate[];
  projectId: string;
  onComplete: () => Promise<void>;
}

interface SortableFloorRowProps {
  floor: Floor;
  templates: FloorPlateTemplate[];
  products: Product[];
  buildingComponents: BuildingComponent[];
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onDeleteFloor: (id: string) => void;
  onUpdateFloor: (id: string, updates: Partial<Floor>) => Promise<void>;
  onUpdateUnitAllocation: (floorId: string, unitTypeId: string, quantity: number) => Promise<void>;
  getUnitAllocation: (floorId: string, unitTypeId: string) => Promise<number>;
  getFloorTemplateById: (id: string) => FloorPlateTemplate | undefined;
  getComponentsByFloorId: (floorId: string | null) => BuildingComponent[];
  calculateComponentArea: (component: BuildingComponent, floorArea: number) => number;
  globalAllocations?: Record<string, Record<string, number>>;
  onAllocationChange?: (unitTypeId: string, value: string) => void;
  floorAllocationData?: any;
}

const SortableFloorRow: React.FC<SortableFloorRowProps> = ({
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
}) => {
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
    if (onAllocationChange) {
      onAllocationChange(unitTypeId, value);
    }
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

interface BuildingLayoutProps {
  floors: Floor[];
  templates: FloorPlateTemplate[];
  products: Product[];
  buildingComponents: BuildingComponent[];
  onAddFloor: () => Promise<Floor | null>;
  onUpdateFloor: (id: string, updates: Partial<Floor>) => Promise<void>;
  onDeleteFloor: (id: string) => Promise<void>;
  onUpdateUnitAllocation: (floorId: string, unitTypeId: string, quantity: number) => Promise<void>;
  getUnitAllocation: (floorId: string, unitTypeId: string) => Promise<number>;
  getFloorTemplateById: (id: string) => FloorPlateTemplate | undefined;
  getComponentsByFloorId: (floorId: string | null) => BuildingComponent[];
  calculateComponentArea: (component: BuildingComponent, floorArea: number) => number;
  onRefreshData: () => Promise<void>;
}

const BuildingLayout: React.FC<BuildingLayoutProps> = ({
  floors,
  templates,
  products,
  buildingComponents,
  onAddFloor,
  onUpdateFloor,
  onDeleteFloor,
  onUpdateUnitAllocation,
  getUnitAllocation,
  getFloorTemplateById,
  getComponentsByFloorId,
  calculateComponentArea,
  onRefreshData
}) => {
  const [expandedFloorId, setExpandedFloorId] = useState<string | null>(null);
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [floorOrder, setFloorOrder] = useState<string[]>(floors.map(f => f.id));
  
  useEffect(() => {
    setFloorOrder(floors.map(f => f.id));
  }, [floors]);

  const toggleExpand = (id: string) => {
    setExpandedFloorId(prevId => (prevId === id ? null : id));
  };

  const handleUpdateFloor = async (id: string, updates: Partial<Floor>) => {
    try {
      await onUpdateFloor(id, updates);
      toast.success("Floor updated successfully");
    } catch (error) {
      console.error("Error updating floor:", error);
      toast.error("Failed to update floor");
    }
  };

  const handleDeleteFloor = async (id: string) => {
    try {
      await onDeleteFloor(id);
      toast.success("Floor deleted successfully");
    } catch (error) {
      console.error("Error deleting floor:", error);
      toast.error("Failed to delete floor");
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = floorOrder.indexOf(active.id as string);
      const newIndex = floorOrder.indexOf(over.id as string);

      const updatedOrder = arrayMove(floorOrder, oldIndex, newIndex);
      setFloorOrder(updatedOrder);

      // Optimistically update the order in the UI
      const updatedFloors = [...floors];
      
      // Map floor IDs to their original index
      const floorIdToIndex = floors.reduce((acc: Record<string, number>, floor, index) => {
        acc[floor.id] = index;
        return acc;
      }, {});
      
      // Apply the new order based on the updatedOrder array
      const orderedFloors = updatedOrder.map(floorId => {
        const originalIndex = floorIdToIndex[floorId];
        return updatedFloors[originalIndex];
      });
      
      // Update the position of each floor based on its new index
      orderedFloors.forEach((floor, index) => {
        const originalIndex = floorIdToIndex[floor.id];
        updatedFloors[originalIndex] = { ...floor, position: index + 1 };
      });

      // Persist the changes to the database
      updatedFloors.forEach(async (floor) => {
        await onUpdateFloor(floor.id, { position: floor.position });
      });
    }
  }, [floors, floorOrder, onUpdateFloor]);

  // Helper function to move an item in an array
  const arrayMove = (arr: string[], fromIndex: number, toIndex: number) => {
    const newArr = [...arr];
    const element = newArr.splice(fromIndex, 1)[0];
    newArr.splice(toIndex, 0, element);
    return newArr;
  };

  const reorderedFloors = useMemo(() => {
    const floorIdToIndex = floors.reduce((acc: Record<string, number>, floor, index) => {
      acc[floor.id] = index;
      return acc;
    }, {});
    
    return floorOrder.map(floorId => floors[floorIdToIndex[floorId]]);
  }, [floors, floorOrder]);

  const buildingSummaryProps = {
    floors: reorderedFloors,
    templates,
    products,
    buildingComponents,
    getFloorTemplateById,
    calculateComponentArea
  };

  const globalAllocations = useMemo(() => {
    return products.reduce((acc, product) => {
      product.unitTypes.forEach(unitType => {
        acc[unitType.id] = {};
      });
      return acc;
    }, {} as Record<string, Record<string, number>>);
  }, [products]);

  const [floorAllocationData, setFloorAllocationData] = useState({});

  const handleAllocationChange = (unitTypeId: string, value: string) => {
    setFloorAllocationData(prev => ({
      ...prev,
    }));
  };

  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Building Layout</CardTitle>
          <CardDescription>Define the floors and unit allocation of your building</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <BuildingSummaryPanel {...buildingSummaryProps} />
          
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold">Floors</h4>
            <div>
              <Button variant="outline" size="sm" onClick={onRefreshData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsBulkAddModalOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Bulk Add Floors
              </Button>
              <Button size="sm" onClick={onAddFloor}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Floor
              </Button>
            </div>
          </div>

          <BulkAddFloorsModal
            isOpen={isBulkAddModalOpen}
            onClose={() => setIsBulkAddModalOpen(false)}
            templates={templates}
            projectId={''}
            onComplete={onRefreshData}
            onAddFloors={async (count: number) => {
              for (let i = 0; i < count; i++) {
                await onAddFloor();
              }
            }}
          />

          {reorderedFloors.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No floors added yet.</div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              onDragEnd={handleDragEnd}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Gross Area</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    <TableHead className="w-[20px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext
                    items={floorOrder}
                    strategy={verticalListSortingStrategy}
                  >
                    {reorderedFloors.map((floor) => {
                      const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: floor.id });
                      const style = {
                        transform: CSS.Transform.toString(transform),
                        transition,
                      };
                      
                      const floorTemplate = getFloorTemplateById(floor.templateId);
                      
                      return (
                        <React.Fragment key={floor.id}>
                          <TableRow ref={setNodeRef} style={style} {...attributes} className="cursor-move">
                            <TableCell>
                              <Button variant="ghost" size="icon" {...listeners}>
                                <GripVertical className="h-4 w-4" />
                              </Button>
                            </TableCell>
                            <TableCell>{floor.label}</TableCell>
                            <TableCell>{floorTemplate?.name || 'None'}</TableCell>
                            <TableCell>{floor.floorType}</TableCell>
                            <TableCell className="text-right">{floorTemplate?.grossArea ? floorTemplate.grossArea.toLocaleString() + ' sf' : 'N/A'}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => toggleExpand(floor.id)}>
                                  {expandedFloorId === floor.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteFloor(floor.id)}>
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                          <SortableFloorRow
                            key={`expanded-${floor.id}`}
                            floor={floor}
                            templates={templates}
                            products={products}
                            buildingComponents={buildingComponents}
                            isExpanded={expandedFloorId === floor.id}
                            onToggleExpand={toggleExpand}
                            onDeleteFloor={handleDeleteFloor}
                            onUpdateFloor={handleUpdateFloor}
                            onUpdateUnitAllocation={onUpdateUnitAllocation}
                            getUnitAllocation={getUnitAllocation}
                            getFloorTemplateById={getFloorTemplateById}
                            getComponentsByFloorId={getComponentsByFloorId}
                            calculateComponentArea={calculateComponentArea}
                            globalAllocations={globalAllocations}
                            onAllocationChange={handleAllocationChange}
                            floorAllocationData={floorAllocationData}
                          />
                        </React.Fragment>
                      );
                    })}
                  </SortableContext>
                </TableBody>
              </Table>
            </DndContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export { BuildingLayout };
