
import { useState, useMemo } from "react";
import { useModel } from "@/context/ModelContext";
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
import { Trash, ArrowUp, ArrowDown, PlusCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Interface for unit allocation
interface UnitAllocation {
  floorId: string;
  unitTypeId: string;
  quantity: number;
}

const formatNumber = (num: number | undefined): string => {
  return num === undefined || isNaN(num) ? "0" : num.toLocaleString('en-US');
};

const BuildingLayout = () => {
  const { property, setHasUnsavedChanges } = useModel();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedFloors, setExpandedFloors] = useState<string[]>([]);
  const [unitAllocations, setUnitAllocations] = useState<UnitAllocation[]>([]);
  
  const handleAddFloor = () => {
    property.addFloor();
    setHasUnsavedChanges(true);
  };
  
  const handleDeleteFloor = (id: string) => {
    property.deleteFloor(id);
    setHasUnsavedChanges(true);
    // Remove from expanded floors if it was expanded
    setExpandedFloors(prev => prev.filter(floorId => floorId !== id));
    // Remove unit allocations for this floor
    setUnitAllocations(prev => prev.filter(allocation => allocation.floorId !== id));
  };
  
  const handleMoveFloor = (id: string, direction: 'up' | 'down') => {
    const floorIndex = property.floors.findIndex(f => f.id === id);
    if (floorIndex === -1) return;
    
    const newFloors = [...property.floors];
    const currentPosition = newFloors[floorIndex].position;
    
    if (direction === 'up' && floorIndex < property.floors.length - 1) {
      // Swap positions with the floor above
      const nextFloorIndex = floorIndex + 1;
      const nextPosition = newFloors[nextFloorIndex].position;
      
      property.updateFloor(id, { position: nextPosition });
      property.updateFloor(newFloors[nextFloorIndex].id, { position: currentPosition });
    } else if (direction === 'down' && floorIndex > 0) {
      // Swap positions with the floor below
      const prevFloorIndex = floorIndex - 1;
      const prevPosition = newFloors[prevFloorIndex].position;
      
      property.updateFloor(id, { position: prevPosition });
      property.updateFloor(newFloors[prevFloorIndex].id, { position: currentPosition });
    }
    
    setHasUnsavedChanges(true);
  };
  
  const handleTemplateChange = (floorId: string, templateId: string) => {
    property.updateFloor(floorId, { templateId });
    setHasUnsavedChanges(true);
  };
  
  const handleLabelChange = (floorId: string, label: string) => {
    property.updateFloor(floorId, { label });
    setHasUnsavedChanges(true);
  };
  
  const toggleFloorExpansion = (floorId: string) => {
    setExpandedFloors(prev => {
      const isExpanded = prev.includes(floorId);
      return isExpanded 
        ? prev.filter(id => id !== floorId) 
        : [...prev, floorId];
    });
  };
  
  const handleUnitAllocationChange = (floorId: string, unitTypeId: string, quantity: number) => {
    setUnitAllocations(prev => {
      const existingIndex = prev.findIndex(
        allocation => allocation.floorId === floorId && allocation.unitTypeId === unitTypeId
      );
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity };
        return updated;
      } else {
        return [...prev, { floorId, unitTypeId, quantity }];
      }
    });
    
    setHasUnsavedChanges(true);
  };
  
  // Get unit allocation for a specific floor and unit type
  const getUnitAllocation = (floorId: string, unitTypeId: string): number => {
    const allocation = unitAllocations.find(
      a => a.floorId === floorId && a.unitTypeId === unitTypeId
    );
    return allocation?.quantity || 0;
  };
  
  // Calculate remaining space for a floor
  const calculateRemainingSpace = (floorId: string): number => {
    const floor = property.floors.find(f => f.id === floorId);
    if (!floor) return 0;
    
    const template = property.getFloorTemplateById(floor.templateId);
    const totalFloorArea = template?.grossArea || 0;
    
    const allocatedSpace = unitAllocations
      .filter(allocation => allocation.floorId === floorId)
      .reduce((total, allocation) => {
        const unitType = findUnitTypeById(allocation.unitTypeId);
        return total + (unitType?.grossArea || 0) * allocation.quantity;
      }, 0);
    
    return totalFloorArea - allocatedSpace;
  };
  
  // Find a unit type by ID across all products
  const findUnitTypeById = (unitTypeId: string) => {
    for (const product of property.products) {
      const unitType = product.unitTypes.find(ut => ut.id === unitTypeId);
      if (unitType) return unitType;
    }
    return undefined;
  };
  
  // Group products and unit types for display
  const groupedProducts = useMemo(() => {
    return property.products.map(product => ({
      ...product,
      unitTypes: [...product.unitTypes].sort((a, b) => 
        a.unitType.localeCompare(b.unitType)
      )
    }));
  }, [property.products]);
  
  // Sort floors by position
  const sortedFloors = [...property.floors].sort((a, b) => b.position - a.position);
  
  // Calculate total units by type
  const totalUnitsByType = useMemo(() => {
    const totals = new Map<string, number>();
    
    unitAllocations.forEach(allocation => {
      const unitType = findUnitTypeById(allocation.unitTypeId);
      if (unitType) {
        const key = unitType.id;
        totals.set(key, (totals.get(key) || 0) + allocation.quantity);
      }
    });
    
    return totals;
  }, [unitAllocations, property.products]);
  
  // Calculate total building area and total units
  const buildingTotals = useMemo(() => {
    let area = 0;
    let units = 0;
    
    // Sum floor areas
    sortedFloors.forEach(floor => {
      const template = property.getFloorTemplateById(floor.templateId);
      area += template?.grossArea || 0;
    });
    
    // Sum unit counts
    unitAllocations.forEach(allocation => {
      units += allocation.quantity;
    });
    
    return { totalArea: area, totalUnits: units };
  }, [sortedFloors, property.floorPlateTemplates, unitAllocations]);
  
  const { totalArea, totalUnits } = buildingTotals;
  
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
                <Button variant="outline" size="sm" onClick={handleAddFloor}>
                  <PlusCircle className="h-4 w-4 mr-1" /> Add your first floor
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
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor={`floor-template-${floor.id}`} className="text-sm">Template</Label>
                              <Select 
                                value={floor.templateId} 
                                onValueChange={(value) => handleTemplateChange(floor.id, value)}
                              >
                                <SelectTrigger id={`floor-template-${floor.id}`} className="mt-1">
                                  <SelectValue placeholder="Select a template" />
                                </SelectTrigger>
                                <SelectContent>
                                  {property.floorPlateTemplates.map((template) => (
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
                                {formatNumber(property.getFloorTemplateById(floor.templateId)?.grossArea)} sf
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 ml-2 mt-6">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleMoveFloor(floor.id, 'up')}
                              disabled={floor.position === Math.max(...property.floors.map(f => f.position))}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleMoveFloor(floor.id, 'down')}
                              disabled={floor.position === Math.min(...property.floors.map(f => f.position))}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteFloor(floor.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => toggleFloorExpansion(floor.id)}
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
                                          
                                          return (
                                            <TableRow key={unitType.id}>
                                              <TableCell>{unitType.unitType}</TableCell>
                                              <TableCell>{formatNumber(unitType.grossArea)}</TableCell>
                                              <TableCell>
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
                                                  className="w-20 h-8"
                                                />
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
          >
            <PlusCircle className="h-4 w-4 mr-1" /> Add Floor
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
    </>
  );
};

export default BuildingLayout;
