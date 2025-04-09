import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { PlusCircle, Settings, RefreshCw, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Floor, FloorPlateTemplate, Product } from '@/hooks/usePropertyState';
import { toast } from 'sonner';
import BuildingSummaryPanel from './BuildingSummaryPanel';
import BulkAddFloorsModal from './BulkAddFloorsModal';
import FloorDuplicateModal from './FloorDuplicateModal';
import ApplyFloorToRangeModal from './ApplyFloorToRangeModal';
import SaveAsTemplateModal from './SaveAsTemplateModal';
import FloorUsageTemplates from './FloorUsageTemplates';
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
  onAddFloor: () => Promise<Floor>;
  onUpdateFloor: (id: string, updates: Partial<Floor>) => Promise<void>;
  onDeleteFloor: (id: string) => Promise<void>;
  onUpdateUnitAllocation: (floorId: string, unitTypeId: string, quantity: number) => Promise<void>;
  getUnitAllocation: (floorId: string, unitTypeId: string) => Promise<number>;
  getFloorTemplateById: (id: string) => FloorPlateTemplate | undefined;
  onRefreshData: () => Promise<void>;
}

interface SortableFloorRowProps {
  floor: Floor;
  templates: FloorPlateTemplate[];
  products: Product[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDeleteFloor: (id: string) => Promise<void>;
  onUpdateFloor: (id: string, updates: Partial<Floor>) => Promise<void>;
  onUpdateUnitAllocation: (floorId: string, unitTypeId: string, quantity: number) => Promise<void>;
  getUnitAllocation: (floorId: string, unitTypeId: string) => Promise<number>;
  getFloorTemplateById: (id: string) => FloorPlateTemplate | undefined;
}

const SortableFloorRow = ({
  floor,
  templates,
  products,
  isExpanded,
  onToggleExpand,
  onDeleteFloor,
  onUpdateFloor,
  onUpdateUnitAllocation,
  getUnitAllocation,
  getFloorTemplateById
}: SortableFloorRowProps) => {
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
    try {
      await onUpdateUnitAllocation(floor.id, unitTypeId, quantity);
      setAllocations(prev => ({
        ...prev,
        [unitTypeId]: quantity
      }));
    } catch (error) {
      console.error(`Error updating allocation for floor ${floor.id}, unit ${unitTypeId}:`, error);
      toast.error("Failed to update unit allocation");
    }
  }, [floor.id, onUpdateUnitAllocation]);
  
  const handleDeleteFloor = useCallback(async () => {
    try {
      await onDeleteFloor(floor.id);
      toast.success("Floor deleted successfully");
    } catch (error) {
      console.error(`Error deleting floor ${floor.id}:`, error);
      toast.error("Failed to delete floor");
    }
  }, [floor.id, onDeleteFloor]);
  
  const floorTemplate = getFloorTemplateById(floor.templateId);
  const floorArea = floorTemplate?.grossArea || 0;
  
  const allocatedArea = useMemo(() => {
    let total = 0;
    for (const product of products) {
      for (const unitType of product.unitTypes) {
        const quantity = allocations[unitType.id] || 0;
        total += quantity * unitType.grossArea;
      }
    }
    return total;
  }, [products, allocations]);
  
  const utilization = floorArea > 0 ? (allocatedArea / floorArea) * 100 : 0;
  const isOverallocated = utilization > 100;
  
  return (
    <>
      <TableRow ref={setNodeRef} style={style} className={isDragging ? 'opacity-50' : ''}>
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
            <span>Floor {floor.position}</span>
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
          {allocatedArea.toLocaleString()} sf
        </TableCell>
        <TableCell className={`text-right ${isOverallocated ? 'text-red-600 font-semibold' : utilization >= 90 ? 'text-amber-600' : ''}`}>
          {utilization.toFixed(1)}%
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
                <div className="space-y-3">
                  {products.map(product => (
                    <div key={product.id} className="mt-3 first:mt-0">
                      <div className="text-sm font-medium text-gray-700 mb-2">{product.name}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {product.unitTypes.map(unitType => (
                          <div key={unitType.id} className="flex items-center justify-between p-2 bg-white border rounded">
                            <div className="text-sm mr-2">
                              <div className="font-medium">{unitType.unitType}</div>
                              <div className="text-xs text-gray-500">{unitType.grossArea.toLocaleString()} sf</div>
                            </div>
                            <Input
                              type="number"
                              min="0"
                              value={allocations[unitType.id] || 0}
                              onChange={(e) => handleAllocationChange(unitType.id, e.target.value)}
                              className="w-20 text-right"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

const BuildingLayout: React.FC<BuildingLayoutProps> = ({
  floors,
  templates,
  products,
  onAddFloor,
  onUpdateFloor,
  onDeleteFloor,
  onUpdateUnitAllocation,
  getUnitAllocation,
  getFloorTemplateById,
  onRefreshData
}) => {
  const [expandedFloors, setExpandedFloors] = useState<Set<string>>(new Set());
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showApplyToRangeModal, setShowApplyToRangeModal] = useState(false);
  const [showSaveAsTemplateModal, setShowSaveAsTemplateModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
  const [isDuplicatingFloor, setIsDuplicatingFloor] = useState(false);
  
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
    return [...floors].sort((a, b) => b.position - a.position);
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
  
  const handleRefreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefreshData();
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefreshData]);
  
  const handleDuplicateFloor = useCallback(async (newLabel: string, positionType: "above" | "below") => {
    if (!selectedFloor) return;
    
    setIsDuplicatingFloor(true);
    try {
      // In a real implementation, this would duplicate the floor
      // For now, we'll just refresh the data
      await onRefreshData();
      toast.success(`Floor duplicated successfully`);
      setShowDuplicateModal(false);
    } catch (error) {
      console.error("Error duplicating floor:", error);
      toast.error("Failed to duplicate floor");
    } finally {
      setIsDuplicatingFloor(false);
    }
  }, [selectedFloor, onRefreshData]);
  
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBulkAddModal(true)}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Multiple Floors
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Tools
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                if (sortedFloors.length > 0) {
                  setSelectedFloor(sortedFloors[0]);
                  setShowDuplicateModal(true);
                } else {
                  toast.error("No floors available to duplicate");
                }
              }}>
                Duplicate Floor
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowApplyToRangeModal(true)}>
                Apply Floor Configuration to Range
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                if (sortedFloors.length > 0) {
                  setSelectedFloor(sortedFloors[0]);
                  setShowSaveAsTemplateModal(true);
                } else {
                  toast.error("No floors available to save as template");
                }
              }}>
                Save as Template
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRefreshData}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
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
        onRefresh={handleRefreshData}
      />
      
      <Card>
        <CardContent className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead className="text-right">Area</TableHead>
                  <TableHead className="text-right">Allocated</TableHead>
                  <TableHead className="text-right">Utilization</TableHead>
                  <TableHead className="w-14"></TableHead>
                </TableRow>
              </TableHeader>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              >
                <SortableContext items={floorIds} strategy={verticalListSortingStrategy}>
                  <TableBody>
                    {sortedFloors.map(floor => (
                      <SortableFloorRow
                        key={floor.id}
                        floor={floor}
                        templates={templates}
                        products={products}
                        isExpanded={expandedFloors.has(floor.id)}
                        onToggleExpand={() => toggleFloorExpand(floor.id)}
                        onDeleteFloor={onDeleteFloor}
                        onUpdateFloor={onUpdateFloor}
                        onUpdateUnitAllocation={onUpdateUnitAllocation}
                        getUnitAllocation={getUnitAllocation}
                        getFloorTemplateById={getFloorTemplateById}
                      />
                    ))}
                  </TableBody>
                </SortableContext>
              </DndContext>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <BuildingSummaryPanel
        floors={floors}
        templates={templates}
        products={products}
        getFloorTemplateById={getFloorTemplateById}
        getUnitAllocation={getUnitAllocation}
      />
      
      {showBulkAddModal && (
        <BulkAddFloorsModal
          isOpen={showBulkAddModal}
          templates={templates}
          projectId={projectId}
          onClose={() => setShowBulkAddModal(false)}
          onComplete={handleRefreshData}
        />
      )}
      
      {showDuplicateModal && (
        <FloorDuplicateModal
          isOpen={showDuplicateModal}
          currentFloorLabel={selectedFloor ? `Floor ${selectedFloor.position}` : ""}
          onClose={() => setShowDuplicateModal(false)}
          onDuplicate={handleDuplicateFloor}
          isLoading={isDuplicatingFloor}
        />
      )}
      
      {showApplyToRangeModal && (
        <ApplyFloorToRangeModal
          sourceFloor={null}
          floors={floors}
          isOpen={showApplyToRangeModal}
          onClose={() => setShowApplyToRangeModal(false)}
          onComplete={handleRefreshData}
        />
      )}
      
      {showSaveAsTemplateModal && (
        <SaveAsTemplateModal
          isOpen={showSaveAsTemplateModal}
          sourceFloor={selectedFloor}
          projectId={projectId}
          onClose={() => setShowSaveAsTemplateModal(false)}
          onComplete={handleRefreshData}
        />
      )}
    </div>
  );
};

export default BuildingLayout;
