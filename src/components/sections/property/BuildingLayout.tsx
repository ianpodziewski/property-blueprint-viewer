
import React, { useState } from "react";
import { useModel } from "@/context/ModelContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Plus, Trash2, Move, ArrowUp, ArrowDown } from "lucide-react";
import { BuildingFloor, FloorPlateTemplate, Product, UnitType } from "@/hooks/usePropertyState";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";

const formatNumber = (num: number | undefined): string => {
  return num === undefined || isNaN(num) ? "" : num.toLocaleString('en-US');
};

const BuildingLayout: React.FC = () => {
  const { property, setHasUnsavedChanges } = useModel();
  const [expandedFloors, setExpandedFloors] = useState<Record<string, boolean>>({});
  
  // Calculate the total building area
  const totalBuildingArea = property.calculateTotalBuildingArea();
  const percentOfMaxUtilized = property.maxBuildableArea > 0 
    ? (totalBuildingArea / property.maxBuildableArea) * 100 
    : 0;
  const totalUnitsByType = property.calculateTotalUnitsByType();
  
  // Sort floors by position (bottom to top)
  const sortedFloors = [...property.buildingFloors].sort((a, b) => a.position - b.position);
  
  // Find a unit type by ID
  const findUnitType = (unitTypeId: string): { unitType: UnitType | undefined, product: Product | undefined } => {
    for (const product of property.products) {
      const unitType = product.unitTypes.find(ut => ut.id === unitTypeId);
      if (unitType) {
        return { unitType, product };
      }
    }
    return { unitType: undefined, product: undefined };
  };
  
  // Toggle floor expansion
  const toggleFloorExpansion = (floorId: string) => {
    setExpandedFloors(prev => ({
      ...prev,
      [floorId]: !prev[floorId]
    }));
  };
  
  // Add a new floor
  const handleAddFloor = () => {
    property.addBuildingFloor();
    setHasUnsavedChanges(true);
    
    // Auto-expand the newly added floor
    setTimeout(() => {
      const newFloorId = property.buildingFloors[property.buildingFloors.length - 1]?.id;
      if (newFloorId) {
        setExpandedFloors(prev => ({
          ...prev,
          [newFloorId]: true
        }));
      }
    }, 100);
  };
  
  // Handle floor update
  const handleFloorUpdate = (id: string, updates: Partial<Omit<BuildingFloor, 'id'>>) => {
    property.updateBuildingFloor(id, updates);
    setHasUnsavedChanges(true);
  };
  
  // Handle floor delete
  const handleDeleteFloor = (id: string) => {
    property.deleteBuildingFloor(id);
    setHasUnsavedChanges(true);
    
    // Remove from expanded state
    setExpandedFloors(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };
  
  // Handle unit allocation update
  const handleUnitAllocationUpdate = (
    floorId: string,
    productId: string,
    unitTypeId: string,
    currentQuantity: number,
    change: number
  ) => {
    const newQuantity = Math.max(0, currentQuantity + change);
    property.updateUnitAllocation(floorId, productId, unitTypeId, newQuantity);
    setHasUnsavedChanges(true);
  };
  
  // Move floor up (decrease position)
  const handleMoveUp = (floor: BuildingFloor) => {
    if (floor.position <= 1) return;
    property.reorderBuildingFloors(floor.id, floor.position - 1);
    setHasUnsavedChanges(true);
  };
  
  // Move floor down (increase position)
  const handleMoveDown = (floor: BuildingFloor) => {
    const maxPosition = Math.max(...property.buildingFloors.map(f => f.position));
    if (floor.position >= maxPosition) return;
    property.reorderBuildingFloors(floor.id, floor.position + 1);
    setHasUnsavedChanges(true);
  };
  
  // Get unit allocation for a specific floor and unit type
  const getUnitAllocation = (floor: BuildingFloor, productId: string, unitTypeId: string): number => {
    const allocation = floor.units.find(
      unit => unit.unitTypeId === unitTypeId && unit.productId === productId
    );
    return allocation ? allocation.quantity : 0;
  };
  
  // Calculate remaining space on a floor
  const calculateRemainingSpace = (floor: BuildingFloor): number => {
    const template = property.floorPlateTemplates.find(t => t.id === floor.templateId);
    if (!template) return 0;
    
    const usedSpace = property.calculateUsedFloorArea(floor.id);
    return template.grossArea - usedSpace;
  };
  
  // Check if a floor is overallocated (used more space than available)
  const isFloorOverallocated = (floor: BuildingFloor): boolean => {
    return calculateRemainingSpace(floor) < 0;
  };
  
  // Render the floor list
  const renderFloorList = () => {
    if (sortedFloors.length === 0) {
      return (
        <Card className="bg-gray-50 border border-dashed border-gray-200">
          <CardContent className="py-6 flex flex-col items-center justify-center text-center">
            <p className="text-gray-500 mb-4">Add floors to your building to begin</p>
            <Button onClick={handleAddFloor}>
              <Plus className="h-4 w-4 mr-1" /> Add First Floor
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="space-y-3">
        {sortedFloors.map((floor) => {
          const template = property.floorPlateTemplates.find(t => t.id === floor.templateId);
          const remainingSpace = calculateRemainingSpace(floor);
          const isOverallocated = remainingSpace < 0;
          const usedPercentage = template ? 
            Math.min(100, Math.max(0, ((template.grossArea - remainingSpace) / template.grossArea) * 100)) : 0;
          
          return (
            <Card 
              key={floor.id} 
              className={`relative ${isOverallocated ? "border-red-300" : ""}`}
            >
              <div className="flex items-start p-4">
                {/* Position indicator and move controls */}
                <div className="flex flex-col items-center justify-center mr-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0" 
                    onClick={() => handleMoveUp(floor)}
                    disabled={floor.position <= 1}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <div className="text-lg font-bold my-1">{floor.position}</div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0" 
                    onClick={() => handleMoveDown(floor)}
                    disabled={floor.position >= Math.max(...property.buildingFloors.map(f => f.position))}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Floor information */}
                <div className="flex-grow">
                  <div className="flex items-center mb-2 gap-2">
                    <Input
                      value={floor.label}
                      onChange={(e) => handleFloorUpdate(floor.id, { label: e.target.value })}
                      className="w-40 mr-2"
                      placeholder="Floor Label"
                    />
                    
                    <Select
                      value={floor.templateId}
                      onValueChange={(value) => handleFloorUpdate(floor.id, { templateId: value })}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select Template" />
                      </SelectTrigger>
                      <SelectContent>
                        {property.floorPlateTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} ({formatNumber(template.grossArea)} sf)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="text-sm ml-2">
                      <span className="font-medium">Total Area:</span> {formatNumber(template?.grossArea || 0)} sf
                    </div>
                    
                    <div className={`text-sm ml-2 ${isOverallocated ? "text-red-600 font-bold" : "text-gray-600"}`}>
                      <span className="font-medium">Remaining:</span> {formatNumber(remainingSpace)} sf
                    </div>
                  </div>
                  
                  <Progress value={usedPercentage} className="h-2 my-1" />
                </div>
                
                {/* Controls */}
                <div className="flex items-center gap-1">
                  {/* This is where the error is happening - wrapping with Collapsible */}
                  <Collapsible open={expandedFloors[floor.id]}>
                    <CollapsibleTrigger 
                      onClick={() => toggleFloorExpansion(floor.id)}
                      className="hover:bg-gray-100 h-8 w-8 rounded-md flex items-center justify-center"
                    >
                      {expandedFloors[floor.id] ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </CollapsibleTrigger>
                    {/* CollapsibleContent is already properly placed within Collapsible below */}
                  </Collapsible>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleDeleteFloor(floor.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Collapsible open={expandedFloors[floor.id]}>
                <CollapsibleContent className="px-4 pb-4">
                  {isOverallocated && (
                    <Alert variant="destructive" className="mb-3">
                      <AlertDescription>
                        Warning: Allocated space exceeds floor template area by {formatNumber(Math.abs(remainingSpace))} sf
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Unit allocation section */}
                  <div className="border rounded-md p-3 bg-gray-50">
                    <h4 className="text-sm font-medium mb-3">Unit Allocation</h4>
                    
                    {property.products.length === 0 && (
                      <p className="text-sm text-gray-500">No unit types defined. Create unit types in the Unit Mix section.</p>
                    )}
                    
                    {property.products.map((product) => (
                      <div key={product.id} className="mb-4">
                        <h5 className="text-sm font-semibold mb-2">{product.name}</h5>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                          {product.unitTypes.map((unitType) => {
                            const currentQuantity = getUnitAllocation(floor, product.id, unitType.id);
                            const totalArea = unitType.grossArea * currentQuantity;
                            
                            return (
                              <div key={unitType.id} className="flex items-center justify-between p-2 border rounded-md bg-white">
                                <div className="flex-grow">
                                  <div className="font-medium text-sm">{unitType.unitType}</div>
                                  <div className="text-xs text-gray-600">{formatNumber(unitType.grossArea)} sf each</div>
                                </div>
                                
                                <div className="flex items-center">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 w-7 p-0 rounded-r-none"
                                    onClick={() => handleUnitAllocationUpdate(floor.id, product.id, unitType.id, currentQuantity, -1)}
                                    disabled={currentQuantity <= 0}
                                  >
                                    -
                                  </Button>
                                  
                                  <div className="h-7 min-w-[40px] flex items-center justify-center border-y">
                                    {currentQuantity}
                                  </div>
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 w-7 p-0 rounded-l-none"
                                    onClick={() => handleUnitAllocationUpdate(floor.id, product.id, unitType.id, currentQuantity, 1)}
                                  >
                                    +
                                  </Button>
                                </div>
                                
                                <div className="ml-3 text-sm min-w-[80px] text-right">
                                  {formatNumber(totalArea)} sf
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    );
  };
  
  // Calculate totals for each unit type across all floors
  const renderUnitTotals = () => {
    // Group units by product
    const productUnitTotals: Record<string, Record<string, number>> = {};
    
    // Initialize with zero counts
    property.products.forEach(product => {
      productUnitTotals[product.id] = {};
      product.unitTypes.forEach(unitType => {
        productUnitTotals[product.id][unitType.id] = 0;
      });
    });
    
    // Calculate totals from all floors
    property.buildingFloors.forEach(floor => {
      floor.units.forEach(unit => {
        if (productUnitTotals[unit.productId]) {
          productUnitTotals[unit.productId][unit.unitTypeId] = 
            (productUnitTotals[unit.productId][unit.unitTypeId] || 0) + unit.quantity;
        }
      });
    });
    
    // Only show if we have any products
    if (property.products.length === 0) return null;
    
    return (
      <div className="mt-4 border rounded-md p-4 bg-gray-50">
        <h4 className="font-medium mb-3">Unit Totals</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {property.products.map(product => (
            <div key={product.id} className="border rounded-md bg-white p-3">
              <h5 className="font-medium mb-2">{product.name}</h5>
              <div className="space-y-1">
                {product.unitTypes.map(unitType => {
                  const total = productUnitTotals[product.id][unitType.id] || 0;
                  return (
                    <div key={unitType.id} className="flex justify-between">
                      <span className="text-sm">{unitType.unitType}:</span>
                      <span className="text-sm font-medium">{total} units</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium">Building Layout</h3>
          <p className="text-sm text-gray-500">Configure your building's floors and assign units</p>
        </div>
        <Button onClick={handleAddFloor}>
          <Plus className="h-4 w-4 mr-1" /> Add Floor
        </Button>
      </div>
      
      {renderFloorList()}
      
      {sortedFloors.length > 0 && (
        <div className="mt-6 bg-white rounded-md border p-4">
          <h4 className="font-medium mb-3">Building Summary</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <Label className="text-sm">Total Floors</Label>
              <div className="text-2xl font-bold">{sortedFloors.length}</div>
            </div>
            
            <div>
              <Label className="text-sm">Total Building Area</Label>
              <div className="text-2xl font-bold">{formatNumber(totalBuildingArea)} sf</div>
            </div>
            
            <div>
              <Label className="text-sm">Maximum Buildable Area</Label>
              <div className="text-2xl font-bold">{formatNumber(property.maxBuildableArea)} sf</div>
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Label className="text-sm">FAR Utilization</Label>
                    <div className={`text-2xl font-bold ${
                      percentOfMaxUtilized > 95 ? "text-amber-600" : 
                      percentOfMaxUtilized > 100 ? "text-red-600" : ""
                    }`}>
                      {percentOfMaxUtilized.toFixed(1)}%
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="max-w-xs text-xs">
                    {percentOfMaxUtilized > 100
                      ? "Warning: Building exceeds maximum buildable area"
                      : percentOfMaxUtilized > 95
                      ? "Approaching maximum buildable area"
                      : "Building area as percentage of maximum allowed FAR"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <Progress 
            value={percentOfMaxUtilized} 
            className={`h-2 mb-2 ${
              percentOfMaxUtilized > 100 ? "bg-red-200" : 
              percentOfMaxUtilized > 95 ? "bg-amber-200" : ""
            }`}
          />
          
          {renderUnitTotals()}
        </div>
      )}
    </div>
  );
};

export default BuildingLayout;
