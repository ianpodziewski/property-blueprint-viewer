
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow
} from "@/components/ui/table";
import { 
  Trash, 
  ArrowUp, 
  ArrowDown, 
  PlusCircle, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  Copy, 
  MoreVertical,
  LayoutList 
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Floor, FloorPlateTemplate, Product } from "@/hooks/usePropertyState";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { duplicateFloor } from "@/utils/floorManagement";
import FloorDuplicateModal from "./FloorDuplicateModal";
import { toast } from "sonner";

const formatNumber = (num: number | undefined): string => {
  return num === undefined || isNaN(num) ? "0" : num.toLocaleString('en-US');
};

// Props interface for the component
interface BuildingLayoutProps {
  floors: Floor[];
  templates: FloorPlateTemplate[];
  products: Product[];
  onAddFloor: () => Promise<Floor | null>;
  onUpdateFloor: (id: string, updates: Partial<Omit<Floor, 'id'>>) => Promise<boolean>;
  onDeleteFloor: (id: string) => Promise<boolean>;
  onUpdateUnitAllocation: (floorId: string, unitTypeId: string, quantity: number) => Promise<boolean>;
  getUnitAllocation: (floorId: string, unitTypeId: string) => number;
  getFloorTemplateById: (templateId: string) => FloorPlateTemplate | undefined;
}

const BuildingLayout = ({
  floors,
  templates,
  products,
  onAddFloor,
  onUpdateFloor,
  onDeleteFloor,
  onUpdateUnitAllocation,
  getUnitAllocation,
  getFloorTemplateById
}: BuildingLayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedFloors, setExpandedFloors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingAllocationUpdates, setPendingAllocationUpdates] = useState<Record<string, boolean>>({});
  
  // State for floor duplication
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [selectedFloorForDuplicate, setSelectedFloorForDuplicate] = useState<Floor | null>(null);
  const [isDuplicating, setIsDuplicating] = useState(false);
  
  const handleAddFloor = async () => {
    setIsSubmitting(true);
    await onAddFloor();
    setIsSubmitting(false);
  };
  
  const handleDeleteFloor = async (id: string) => {
    setIsSubmitting(true);
    const success = await onDeleteFloor(id);
    setIsSubmitting(false);
    
    if (success) {
      // Remove from expanded floors if it was expanded
      setExpandedFloors(prev => prev.filter(floorId => floorId !== id));
    }
  };
  
  const handleMoveFloor = async (id: string, direction: 'up' | 'down') => {
    const floorIndex = floors.findIndex(f => f.id === id);
    if (floorIndex === -1) return;
    
    const currentPosition = floors[floorIndex].position;
    
    if (direction === 'up' && floorIndex < floors.length - 1) {
      // Swap positions with the floor above
      const nextFloorIndex = floorIndex + 1;
      const nextPosition = floors[nextFloorIndex].position;
      
      setIsSubmitting(true);
      await Promise.all([
        onUpdateFloor(id, { position: nextPosition }),
        onUpdateFloor(floors[nextFloorIndex].id, { position: currentPosition })
      ]);
      setIsSubmitting(false);
    } else if (direction === 'down' && floorIndex > 0) {
      // Swap positions with the floor below
      const prevFloorIndex = floorIndex - 1;
      const prevPosition = floors[prevFloorIndex].position;
      
      setIsSubmitting(true);
      await Promise.all([
        onUpdateFloor(id, { position: prevPosition }),
        onUpdateFloor(floors[prevFloorIndex].id, { position: currentPosition })
      ]);
      setIsSubmitting(false);
    }
  };
  
  const handleTemplateChange = async (floorId: string, templateId: string) => {
    setIsSubmitting(true);
    await onUpdateFloor(floorId, { templateId });
    setIsSubmitting(false);
  };
  
  const handleLabelChange = async (floorId: string, label: string) => {
    setIsSubmitting(true);
    await onUpdateFloor(floorId, { label });
    setIsSubmitting(false);
  };
  
  const toggleFloorExpansion = (floorId: string) => {
    setExpandedFloors(prev => {
      const isExpanded = prev.includes(floorId);
      return isExpanded 
        ? prev.filter(id => id !== floorId) 
        : [...prev, floorId];
    });
  };
  
  const handleUnitAllocationChange = async (floorId: string, unitTypeId: string, quantity: number) => {
    const allocationKey = `${floorId}-${unitTypeId}`;
    setPendingAllocationUpdates(prev => ({
      ...prev,
      [allocationKey]: true
    }));
    
    await onUpdateUnitAllocation(floorId, unitTypeId, quantity);
    
    setPendingAllocationUpdates(prev => ({
      ...prev,
      [allocationKey]: false
    }));
  };

  // Handle opening the duplicate modal
  const handleOpenDuplicateModal = (floor: Floor) => {
    setSelectedFloorForDuplicate(floor);
    setDuplicateModalOpen(true);
  };

  // Handle the duplicate operation
  const handleDuplicateFloor = async (newLabel: string, positionType: "above" | "below") => {
    if (!selectedFloorForDuplicate) return;

    setIsDuplicating(true);
    try {
      // Find floor positions for placement
      const sortedFloors = [...floors].sort((a, b) => b.position - a.position);
      const floorIndex = sortedFloors.findIndex(f => f.id === selectedFloorForDuplicate.id);
      
      let newPosition: number;
      if (positionType === "above") {
        // Position it above the current floor (which means a higher position value)
        newPosition = sortedFloors[floorIndex].position + 1;
        
        // If there's already a floor above, position it between them
        if (floorIndex > 0) {
          newPosition = (sortedFloors[floorIndex].position + sortedFloors[floorIndex - 1].position) / 2;
        }
      } else {
        // Position it below the current floor (which means a lower position value)
        newPosition = sortedFloors[floorIndex].position - 1;
        
        // If there's already a floor below, position it between them
        if (floorIndex < sortedFloors.length - 1) {
          newPosition = (sortedFloors[floorIndex].position + sortedFloors[floorIndex + 1].position) / 2;
        }
      }
      
      // Call the duplicate function
      const newFloorId = await duplicateFloor(
        selectedFloorForDuplicate.id,
        newLabel,
        newPosition
      );
      
      if (newFloorId) {
        toast.success(`Floor "${newLabel}" created successfully`);
        // Automatically expand the new floor
        setExpandedFloors(prev => [...prev, newFloorId]);
      } else {
        toast.error("Failed to duplicate floor");
      }
    } catch (error) {
      console.error("Error duplicating floor:", error);
      toast.error("An error occurred while duplicating the floor");
    } finally {
      setIsDuplicating(false);
      setDuplicateModalOpen(false);
    }
  };
  
  // Calculate remaining space for a floor
  const calculateRemainingSpace = (floorId: string): number => {
    const floor = floors.find(f => f.id === floorId);
    if (!floor) return 0;
    
    const template = getFloorTemplateById(floor.templateId);
    const totalFloorArea = template?.grossArea || 0;
    
    // Calculate allocated space for this floor
    let allocatedSpace = 0;
    
    products.forEach(product => {
      product.unitTypes.forEach(unitType => {
        const allocation = getUnitAllocation(floorId, unitType.id);
        allocatedSpace += (unitType.grossArea || 0) * allocation;
      });
    });
    
    return totalFloorArea - allocatedSpace;
  };
  
  // Sort floors by position
  const sortedFloors = useMemo(() => {
    return [...floors].sort((a, b) => b.position - a.position);
  }, [floors]);
  
  // Calculate total units by type
  const totalUnitsByType = useMemo(() => {
    const totals = new Map<string, number>();
    
    products.forEach(product => {
      product.unitTypes.forEach(unitType => {
        let total = 0;
        
        floors.forEach(floor => {
          total += getUnitAllocation(floor.id, unitType.id);
        });
        
        if (total > 0) {
          totals.set(unitType.id, total);
        }
      });
    });
    
    return totals;
  }, [floors, products, getUnitAllocation]);
  
  // Calculate total building area and total units
  const buildingTotals = useMemo(() => {
    let area = 0;
    let units = 0;
    
    // Sum floor areas
    sortedFloors.forEach(floor => {
      const template = getFloorTemplateById(floor.templateId);
      area += template?.grossArea || 0;
    });
    
    // Sum unit counts
    products.forEach(product => {
      product.unitTypes.forEach(unitType => {
        floors.forEach(floor => {
          units += getUnitAllocation(floor.id, unitType.id);
        });
      });
    });
    
    return { totalArea: area, totalUnits: units };
  }, [sortedFloors, products, floors, getFloorTemplateById, getUnitAllocation]);
  
  const { totalArea, totalUnits } = buildingTotals;
  
  // Group products and unit types for display
  const groupedProducts = useMemo(() => {
    return products.map(product => ({
      ...product,
      unitTypes: [...product.unitTypes].sort((a, b) => 
        a.unitType.localeCompare(b.unitType)
      )
    }));
  }, [products]);
  
  // Find a unit type by ID across all products
  const findUnitTypeById = (unitTypeId: string) => {
    for (const product of products) {
      const unitType = product.unitTypes.find(ut => ut.id === unitTypeId);
      if (unitType) return unitType;
    }
    return undefined;
  };
  
  return (
    <>
      <Collapsible
        open={!isCollapsed}
        onOpenChange={setIsCollapsed}
        className="w-full space-y-2 mt-8"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Building Layout</h3>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
              {isCollapsed ? "+" : "-"}
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent className="pt-2">
          <div className="text-sm text-gray-500 mb-4">
            Configure your building's floors and assign units
          </div>
          
          {sortedFloors.length === 0 ? (
            <Card className="bg-gray-50 border border-dashed border-gray-200">
              <CardContent className="py-6 flex flex-col items-center justify-center text-center">
                <p className="text-gray-500 mb-4">No floors added yet</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddFloor} 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Adding...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-4 w-4 mr-1" /> Add your first floor
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 mb-4">
              {sortedFloors.map((floor) => {
                const remainingSpace = calculateRemainingSpace(floor.id);
                const isOverAllocated = remainingSpace < 0;
                
                return (
                  <Card key={floor.id} className="bg-white">
                    <CardContent className="py-4 px-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center justify-between">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                            <div>
                              <Label htmlFor={`floor-label-${floor.id}`} className="text-sm">Floor Label</Label>
                              <Input
                                id={`floor-label-${floor.id}`}
                                value={floor.label}
                                onChange={(e) => handleLabelChange(floor.id, e.target.value)}
                                placeholder="Enter floor label"
                                className="mt-1"
                                disabled={isSubmitting}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor={`floor-template-${floor.id}`} className="text-sm">Template</Label>
                              <Select 
                                value={floor.templateId} 
                                onValueChange={(value) => handleTemplateChange(floor.id, value)}
                                disabled={isSubmitting}
                              >
                                <SelectTrigger id={`floor-template-${floor.id}`} className="mt-1">
                                  <SelectValue placeholder="Select a template" />
                                </SelectTrigger>
                                <SelectContent>
                                  {templates.map((template) => (
                                    <SelectItem key={template.id} value={template.id}>
                                      {template.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label className="text-sm">Floor Area</Label>
                              <div className="h-10 px-4 flex items-center border rounded-md mt-1 bg-gray-50">
                                {formatNumber(getFloorTemplateById(floor.templateId)?.grossArea)} sf
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 ml-2 mt-6">
                            {/* New dropdown menu for floor actions */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  disabled={isSubmitting}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenDuplicateModal(floor)}>
                                  <Copy className="h-4 w-4 mr-2" /> Duplicate Floor
                                </DropdownMenuItem>
                                <DropdownMenuItem disabled>
                                  <LayoutList className="h-4 w-4 mr-2" /> Apply to Range...
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleMoveFloor(floor.id, 'up')}
                              disabled={isSubmitting || floor.position === Math.max(...floors.map(f => f.position))}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleMoveFloor(floor.id, 'down')}
                              disabled={isSubmitting || floor.position === Math.min(...floors.map(f => f.position))}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteFloor(floor.id)}
                              disabled={isSubmitting}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => toggleFloorExpansion(floor.id)}
                              disabled={isSubmitting}
                            >
                              {expandedFloors.includes(floor.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        {expandedFloors.includes(floor.id) && (
                          <div className="mt-4 border-t pt-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-medium">Unit Allocation</h4>
                              <div className={`text-sm font-medium ${isOverAllocated ? 'text-red-500' : 'text-blue-600'}`}>
                                Remaining: {formatNumber(remainingSpace)} sf
                              </div>
                            </div>
                            
                            {groupedProducts.length === 0 ? (
                              <p className="text-sm text-gray-500">No product units available. Add products in the Unit Mix section.</p>
                            ) : (
                              <div className="space-y-4">
                                {groupedProducts.map((product) => (
                                  <div key={product.id} className="space-y-2">
                                    <h5 className="text-sm font-medium">{product.name}</h5>
                                    
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead className="w-[180px]">Unit Type</TableHead>
                                          <TableHead className="w-[100px]">Size (sf)</TableHead>
                                          <TableHead className="w-[120px]">Quantity</TableHead>
                                          <TableHead className="w-[120px] text-right">Total Area (sf)</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {product.unitTypes.map((unitType) => {
                                          const quantity = getUnitAllocation(floor.id, unitType.id);
                                          const totalArea = unitType.grossArea * quantity;
                                          const allocationKey = `${floor.id}-${unitType.id}`;
                                          const isPending = pendingAllocationUpdates[allocationKey];
                                          
                                          return (
                                            <TableRow key={unitType.id}>
                                              <TableCell>{unitType.unitType}</TableCell>
                                              <TableCell>{formatNumber(unitType.grossArea)}</TableCell>
                                              <TableCell>
                                                <div className="flex items-center">
                                                  <Input
                                                    type="number"
                                                    min="0"
                                                    value={quantity || 0}
                                                    onChange={(e) => {
                                                      const value = parseInt(e.target.value) || 0;
                                                      if (value >= 0) {
                                                        handleUnitAllocationChange(floor.id, unitType.id, value);
                                                      }
                                                    }}
                                                    className="w-20 h-8 mr-2"
                                                    disabled={isPending}
                                                  />
                                                  {isPending && (
                                                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                                  )}
                                                </div>
                                              </TableCell>
                                              <TableCell className="text-right">
                                                {formatNumber(totalArea)}
                                              </TableCell>
                                            </TableRow>
                                          );
                                        })}
                                      </TableBody>
                                    </Table>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddFloor}
            className="mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Adding...
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4 mr-1" /> Add Floor
              </>
            )}
          </Button>
          
          {sortedFloors.length > 0 && (
            <Card className="mt-4 bg-blue-50">
              <CardContent className="py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Total Floors</Label>
                    <p className="mt-1">{sortedFloors.length}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Total Units</Label>
                    <p className="mt-1">{totalUnits}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Total Building Area</Label>
                    <p className="mt-1">{formatNumber(totalArea)} sf</p>
                  </div>
                </div>
                
                {/* Units by type summary */}
                {Array.from(totalUnitsByType.entries()).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-blue-100">
                    <Label className="text-sm font-medium">Units by Type</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                      {Array.from(totalUnitsByType.entries()).map(([unitTypeId, count]) => {
                        const unitType = findUnitTypeById(unitTypeId);
                        if (!unitType) return null;
                        
                        return (
                          <div key={unitTypeId} className="text-sm">
                            <span className="font-medium">{unitType.unitType}:</span> {count}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Floor Duplication Modal */}
      {selectedFloorForDuplicate && (
        <FloorDuplicateModal
          isOpen={duplicateModalOpen}
          onClose={() => setDuplicateModalOpen(false)}
          onDuplicate={handleDuplicateFloor}
          currentFloorLabel={selectedFloorForDuplicate.label}
          isLoading={isDuplicating}
        />
      )}
    </>
  );
};

export default BuildingLayout;
