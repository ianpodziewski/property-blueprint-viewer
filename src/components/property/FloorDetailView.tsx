
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Settings, Plus, ArrowRight, Edit, AlertTriangle, Check, Info } from "lucide-react";
import { FloorConfiguration, FloorPlateTemplate, SpaceDefinition } from "@/types/propertyTypes";
import FloorEditor from "./FloorEditor";
import { useUnitTypes } from "@/hooks/property/useUnitTypes";
import { useUnitAllocations } from "@/hooks/property/useUnitAllocations";
import { UnitAllocation } from "@/types/unitMixTypes";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface FloorDetailViewProps {
  floor: FloorConfiguration;
  floorTemplates: FloorPlateTemplate[];
  updateFloorConfiguration: (floorNumber: number, field: keyof FloorConfiguration, value: any) => void;
}

const FloorDetailView: React.FC<FloorDetailViewProps> = ({ 
  floor, 
  floorTemplates,
  updateFloorConfiguration
}) => {
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [overrideConfirmOpen, setOverrideConfirmOpen] = useState(false);
  const [pendingAllocation, setPendingAllocation] = useState<{
    unitTypeId: string;
    count: string;
    squareFootage: string;
  } | null>(null);
  
  const { unitTypes, getUnitTypeById } = useUnitTypes();
  const { 
    unitAllocations, 
    addAllocation, 
    updateAllocation, 
    removeAllocation,
    getAllocationsByFloor,
    calculateAllocatedAreaByFloor,
    checkEnoughSpaceForAllocation
  } = useUnitAllocations();
  
  // Get the floor template
  const template = floorTemplates.find(t => t.id === floor.templateId);
  
  // Calculate floor area
  const floorArea = parseInt(
    floor.customSquareFootage && floor.customSquareFootage !== "" 
    ? floor.customSquareFootage 
    : template?.squareFootage || "0"
  );
  
  // Get allocations for this floor
  const floorAllocations = useMemo(() => 
    getAllocationsByFloor(floor.floorNumber),
    [getAllocationsByFloor, floor.floorNumber]
  );
  
  // Calculate total allocated area
  const allocatedArea = useMemo(() => 
    calculateAllocatedAreaByFloor(floor.floorNumber),
    [calculateAllocatedAreaByFloor, floor.floorNumber]
  );
  
  const remainingArea = floorArea - allocatedArea;
  const utilization = floorArea > 0 ? (allocatedArea / floorArea) * 100 : 0;
  
  const handleTemplateChange = (templateId: string) => {
    updateFloorConfiguration(floor.floorNumber, "templateId", templateId);
    
    // Update floor area with template's default if template changes
    const selectedTemplate = floorTemplates.find(t => t.id === templateId);
    if (selectedTemplate) {
      updateFloorConfiguration(floor.floorNumber, "customSquareFootage", "");
      updateFloorConfiguration(floor.floorNumber, "floorToFloorHeight", selectedTemplate.floorToFloorHeight);
      updateFloorConfiguration(floor.floorNumber, "corePercentage", selectedTemplate.corePercentage);
      updateFloorConfiguration(floor.floorNumber, "primaryUse", selectedTemplate.primaryUse || "office");
    }
  };
  
  const handleAddUnit = (unitTypeId: string) => {
    const unitType = getUnitTypeById(unitTypeId);
    if (!unitType) return;
    
    const unitSize = parseInt(unitType.typicalSize) || 0;
    
    // Validate space before allocation
    const spaceCheck = checkEnoughSpaceForAllocation(
      floor.floorNumber,
      unitSize,
      1,
      floorArea
    );
    
    console.log(`Adding unit type ${unitTypeId} to floor ${floor.floorNumber}:`, spaceCheck);

    if (!spaceCheck.hasEnoughSpace) {
      setPendingAllocation({
        unitTypeId,
        count: "1",
        squareFootage: unitType.typicalSize
      });
      setOverrideConfirmOpen(true);
      return;
    }
    
    addAllocation({
      unitTypeId: unitTypeId,
      floorNumber: floor.floorNumber,
      count: "1",
      squareFootage: unitType.typicalSize,
      status: "planned",
      notes: `Allocated ${new Date().toLocaleDateString()}`
    });
  };
  
  const handleForceAddUnit = () => {
    if (!pendingAllocation) return;
    
    addAllocation({
      unitTypeId: pendingAllocation.unitTypeId,
      floorNumber: floor.floorNumber,
      count: pendingAllocation.count,
      squareFootage: pendingAllocation.squareFootage,
      status: "planned",
      notes: `Force allocated ${new Date().toLocaleDateString()} (exceeded floor space)`
    }, true);
    
    setOverrideConfirmOpen(false);
    setPendingAllocation(null);
  };
  
  const handleRemoveAllocation = (allocationId: string) => {
    removeAllocation(allocationId);
  };
  
  const handleUpdateAllocationCount = (allocationId: string, value: string) => {
    const allocation = floorAllocations.find(a => a.id === allocationId);
    if (!allocation) return;
    
    const newCount = parseInt(value) || 0;
    const oldCount = parseInt(allocation.count as string) || 0;
    const unitSize = parseInt(allocation.squareFootage as string) || 0;
    
    // Only validate if increasing count
    if (newCount > oldCount) {
      // Validate space for the additional units
      const additionalUnits = newCount - oldCount;
      const spaceCheck = checkEnoughSpaceForAllocation(
        floor.floorNumber,
        unitSize,
        additionalUnits,
        floorArea,
        allocationId // Exclude this allocation from the calculation
      );
      
      if (!spaceCheck.hasEnoughSpace) {
        setPendingAllocation({
          unitTypeId: allocation.unitTypeId,
          count: value,
          squareFootage: allocation.squareFootage as string
        });
        setOverrideConfirmOpen(true);
        return;
      }
    }
    
    updateAllocation(allocationId, "count", value);
  };
  
  const handleOpenDetailEditor = () => {
    setDetailsDialogOpen(true);
  };

  const getSpaceColor = (remainingPercent: number) => {
    if (remainingPercent < 0) return "bg-red-500";
    if (remainingPercent < 10) return "bg-amber-500";
    return "bg-green-500";
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Floor Basics */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-4">Floor Basics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`floor-template-${floor.floorNumber}`}>Template</Label>
                <Select 
                  value={floor.templateId || undefined} 
                  onValueChange={handleTemplateChange}
                >
                  <SelectTrigger id={`floor-template-${floor.floorNumber}`}>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Custom</SelectItem>
                    {floorTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor={`floor-area-${floor.floorNumber}`}>Floor Area (sq ft)</Label>
                <Input
                  id={`floor-area-${floor.floorNumber}`}
                  type="number"
                  value={floor.customSquareFootage}
                  placeholder={template?.squareFootage || "0"}
                  onChange={(e) => updateFloorConfiguration(floor.floorNumber, "customSquareFootage", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor={`floor-height-${floor.floorNumber}`}>Floor Height (ft)</Label>
                <Input
                  id={`floor-height-${floor.floorNumber}`}
                  type="number"
                  value={floor.floorToFloorHeight}
                  placeholder="12"
                  onChange={(e) => updateFloorConfiguration(floor.floorNumber, "floorToFloorHeight", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor={`floor-use-${floor.floorNumber}`}>Primary Use</Label>
                <Select 
                  value={floor.primaryUse || "office"} 
                  onValueChange={(value) => updateFloorConfiguration(floor.floorNumber, "primaryUse", value)}
                >
                  <SelectTrigger id={`floor-use-${floor.floorNumber}`}>
                    <SelectValue placeholder="Select use" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="parking">Parking</SelectItem>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="amenities">Amenities</SelectItem>
                    <SelectItem value="storage">Storage</SelectItem>
                    <SelectItem value="mechanical">Mechanical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor={`floor-core-${floor.floorNumber}`}>Core Percentage (%)</Label>
                <Input
                  id={`floor-core-${floor.floorNumber}`}
                  type="number"
                  value={floor.corePercentage}
                  placeholder="15"
                  min="0"
                  max="100"
                  onChange={(e) => updateFloorConfiguration(floor.floorNumber, "corePercentage", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor={`floor-rentable-${floor.floorNumber}`}>Rentable Area (sq ft)</Label>
                <Input
                  id={`floor-rentable-${floor.floorNumber}`}
                  type="text"
                  value={Math.round(floorArea * (1 - (parseInt(floor.corePercentage || "15") / 100))).toString()}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenDetailEditor}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure Details
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Space Allocation */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Space Allocation</h3>
              
              <div className="text-sm">
                <span className={utilization > 95 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                  {Math.round(utilization)}% allocated
                </span>
                <span className="mx-1 text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {remainingArea.toLocaleString()} sf available
                </span>
              </div>
            </div>

            {/* Space utilization indicator */}
            <div className="mb-4">
              <Progress 
                value={utilization} 
                className="h-2" 
                indicatorClassName={getSpaceColor(100 - utilization)}
              />
              <div className="flex justify-between text-xs mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {floorAllocations.length > 0 ? (
                floorAllocations.map(allocation => {
                  const unitType = getUnitTypeById(allocation.unitTypeId);
                  if (!unitType) return null;
                  
                  const allocationArea = parseInt(allocation.count as string) * parseInt(allocation.squareFootage as string) || 0;
                  
                  return (
                    <div 
                      key={allocation.id} 
                      className="flex items-center p-2 border rounded-md"
                      style={{ borderLeftWidth: 4, borderLeftColor: unitType.color }}
                    >
                      <div className="flex-grow">
                        <div className="flex items-center">
                          <span className="font-medium">{unitType.name}</span>
                          <Badge variant="outline" className="ml-2">{unitType.category}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {parseInt(allocation.squareFootage as string).toLocaleString()} sf per unit
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleUpdateAllocationCount(allocation.id, String(Math.max(0, parseInt(allocation.count as string) - 1)))}
                            disabled={parseInt(allocation.count as string) <= 1}
                          >
                            -
                          </Button>
                          <Input
                            className="w-16 h-7 text-center"
                            value={allocation.count}
                            onChange={(e) => handleUpdateAllocationCount(allocation.id, e.target.value)}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleUpdateAllocationCount(allocation.id, String(parseInt(allocation.count as string) + 1))}
                          >
                            +
                          </Button>
                        </div>
                        
                        <div className="text-sm font-medium w-24 text-right">
                          {allocationArea.toLocaleString()} sf
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemoveAllocation(allocation.id)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 border border-dashed rounded-md">
                  <p className="text-muted-foreground text-sm">No spaces assigned to this floor</p>
                </div>
              )}
              
              {unitTypes.length > 0 && (
                <div className="mt-4">
                  <Label className="mb-2 block text-sm">Add Unit Type</Label>
                  <Select onValueChange={handleAddUnit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a unit type to add..." />
                    </SelectTrigger>
                    <SelectContent>
                      {unitTypes.map(unitType => {
                        const unitSize = parseInt(unitType.typicalSize) || 0;
                        const hasSpace = remainingArea >= unitSize;
                        
                        return (
                          <SelectItem key={unitType.id} value={unitType.id}>
                            <div className="flex items-center">
                              <div 
                                className="w-2 h-2 rounded-full mr-2" 
                                style={{ backgroundColor: unitType.color }}
                              ></div>
                              <span>{unitType.name}</span>
                              <span className="ml-2 text-muted-foreground text-xs">
                                ({unitType.typicalSize} sf)
                              </span>
                              {!hasSpace && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <span className="ml-2">
                                        <AlertTriangle className="h-3 w-3 text-amber-500 inline" />
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Insufficient floor space: {unitType.typicalSize} sf needed, {remainingArea} sf available</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Advanced Configuration Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure Floor Details</DialogTitle>
          </DialogHeader>
          <FloorEditor
            floorNumber={floor.floorNumber}
            floorConfiguration={floor}
            floorTemplates={floorTemplates}
            updateFloorConfiguration={updateFloorConfiguration}
            updateFloorSpaces={() => {}} // We're not using this in the simplified view
          />
        </DialogContent>
      </Dialog>

      {/* Space Override Confirmation */}
      <AlertDialog open={overrideConfirmOpen} onOpenChange={setOverrideConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Insufficient Space Warning</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              {pendingAllocation && (
                <>
                  <p>
                    <span className="font-semibold">Not enough space available on Floor {floor.floorNumber}</span>
                  </p>
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-md text-sm space-y-1">
                    <p>
                      <span className="font-medium">Required:</span> {
                        (parseInt(pendingAllocation.count) * parseInt(pendingAllocation.squareFootage)).toLocaleString()
                      } sq ft
                    </p>
                    <p><span className="font-medium">Available:</span> {remainingArea.toLocaleString()} sq ft</p>
                    <p><span className="font-medium">Deficit:</span> {
                      Math.abs(remainingArea - (parseInt(pendingAllocation.count) * parseInt(pendingAllocation.squareFootage))).toLocaleString()
                    } sq ft</p>
                  </div>
                  <p>Do you want to force this allocation anyway? This will exceed the available space on this floor.</p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setOverrideConfirmOpen(false);
              setPendingAllocation(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleForceAddUnit} className="bg-amber-500 hover:bg-amber-600">
              Force Allocate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FloorDetailView;
