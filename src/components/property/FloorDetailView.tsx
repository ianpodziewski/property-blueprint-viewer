
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings, Plus, ArrowRight, Edit } from "lucide-react";
import { FloorConfiguration, FloorPlateTemplate, SpaceDefinition } from "@/types/propertyTypes";
import FloorEditor from "./FloorEditor";
import { useUnitTypes } from "@/hooks/property/useUnitTypes";
import { useUnitAllocations } from "@/hooks/property/useUnitAllocations";
import { UnitAllocation } from "@/types/unitMixTypes";

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
  const { unitTypes, getUnitTypeById } = useUnitTypes();
  const { 
    unitAllocations, 
    addAllocation, 
    updateAllocation, 
    removeAllocation,
    getAllocationsByFloor,
    calculateAllocatedAreaByFloor
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
    
    addAllocation({
      unitTypeId: unitTypeId,
      floorNumber: floor.floorNumber,
      count: "1",
      squareFootage: unitType.typicalSize,
      status: "planned"
    });
  };
  
  const handleRemoveAllocation = (allocationId: string) => {
    removeAllocation(allocationId);
  };
  
  const handleUpdateAllocationCount = (allocationId: string, value: string) => {
    updateAllocation(allocationId, "count", value);
  };
  
  const handleOpenDetailEditor = () => {
    setDetailsDialogOpen(true);
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
                      {unitTypes.map(unitType => (
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
                          </div>
                        </SelectItem>
                      ))}
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
    </div>
  );
};

export default FloorDetailView;
