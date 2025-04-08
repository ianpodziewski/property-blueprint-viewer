
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FloorConfiguration, FloorPlateTemplate } from "@/types/propertyTypes";
import { useUnitAllocations } from "@/hooks/property/useUnitAllocations";
import { useUnitTypes } from "@/hooks/property/useUnitTypes";

interface FloorData {
  floorNumber: number;
  isUnderground: boolean;
  name?: string;
  squareFootage: number;
  primaryUse?: string;
  secondaryUse?: string;
  spaces?: { name: string; type: string; squareFootage: number }[];
}

interface FloorStackingDiagramProps {
  floors: FloorData[];
  spaceTypeColors: Record<string, string>;
  floorTemplates: FloorPlateTemplate[];
  floorConfigurations: FloorConfiguration[];
  updateFloorConfiguration: (floorNumber: number, field: keyof FloorConfiguration, value: any) => void;
  reorderFloor: (floorNumber: number, direction: "up" | "down") => void;
}

const FloorStackingDiagram: React.FC<FloorStackingDiagramProps> = ({ 
  floors, 
  spaceTypeColors, 
  floorTemplates,
  floorConfigurations,
  updateFloorConfiguration,
  reorderFloor
}) => {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  
  const { getAllocationsByFloor, calculateAllocatedAreaByFloor } = useUnitAllocations();
  const { getUnitTypeById } = useUnitTypes();
  
  // Helper to get floor color based on primary use
  const getFloorColor = (primaryUse: string | undefined) => {
    switch (primaryUse) {
      case 'residential':
        return 'bg-blue-100 border-blue-300';
      case 'retail':
        return 'bg-green-100 border-green-300';
      case 'office':
        return 'bg-purple-100 border-purple-300';
      case 'parking':
        return 'bg-gray-100 border-gray-300';
      case 'hotel':
        return 'bg-pink-100 border-pink-300';
      case 'amenities':
        return 'bg-yellow-100 border-yellow-300';
      case 'storage':
        return 'bg-neutral-100 border-neutral-300';
      case 'mechanical':
        return 'bg-zinc-100 border-zinc-300';
      default:
        return 'bg-slate-100 border-slate-300';
    }
  };
  
  // Get primary use for a floor
  const getFloorPrimaryUse = (floorNumber: number): string => {
    const floorConfig = floorConfigurations.find(f => f.floorNumber === floorNumber);
    return floorConfig?.primaryUse || 'office';
  };
  
  // Calculate utilization ratio for floor
  const getFloorUtilization = (floorNumber: number): number => {
    const floorConfig = floorConfigurations.find(f => f.floorNumber === floorNumber);
    if (!floorConfig) return 0;
    
    const template = floorTemplates.find(t => t.id === floorConfig.templateId);
    const floorArea = floorConfig.customSquareFootage && floorConfig.customSquareFootage !== "" 
      ? parseInt(floorConfig.customSquareFootage)
      : template ? parseInt(template.squareFootage) : 0;
    
    if (floorArea === 0) return 0;
    
    const allocatedArea = calculateAllocatedAreaByFloor(floorNumber);
    return (allocatedArea / floorArea) * 100;
  };
  
  // Get unit allocation summary for tooltip
  const getFloorUnitSummary = (floorNumber: number) => {
    const allocations = getAllocationsByFloor(floorNumber);
    if (allocations.length === 0) return "No units allocated";
    
    // Group by category
    const categoryTotals: Record<string, {count: number, area: number}> = {};
    
    allocations.forEach(allocation => {
      const unitType = getUnitTypeById(allocation.unitTypeId);
      if (!unitType) return;
      
      const category = unitType.category;
      const count = parseInt(allocation.count as string) || 0;
      const area = count * (parseInt(allocation.squareFootage as string) || 0);
      
      if (!categoryTotals[category]) {
        categoryTotals[category] = { count: 0, area: 0 };
      }
      
      categoryTotals[category].count += count;
      categoryTotals[category].area += area;
    });
    
    return (
      <div className="space-y-2 w-56">
        <p className="font-medium text-sm mb-1">Unit Allocation</p>
        {Object.entries(categoryTotals).map(([category, data]) => (
          <div key={category} className="flex justify-between text-xs">
            <span>{category}:</span>
            <span>{data.count} units ({data.area.toLocaleString()} sf)</span>
          </div>
        ))}
      </div>
    );
  };

  // Function to get template name
  const getTemplateName = (floorNumber: number): string => {
    const floorConfig = floorConfigurations.find(f => f.floorNumber === floorNumber);
    if (!floorConfig || !floorConfig.templateId) return 'Custom';
    
    const template = floorTemplates.find(t => t.id === floorConfig.templateId);
    return template ? template.name : 'Unknown Template';
  };
  
  // Sort floors by number, with above-ground floors at the top
  const sortedFloors = [...floors].sort((a, b) => {
    if (a.isUnderground && b.isUnderground) {
      return a.floorNumber - b.floorNumber;
    } else if (!a.isUnderground && !b.isUnderground) {
      return b.floorNumber - a.floorNumber;
    } else {
      return a.isUnderground ? -1 : 1;
    }
  });
  
  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 95) return 'bg-red-400';
    if (utilization >= 80) return 'bg-amber-400';
    if (utilization >= 50) return 'bg-green-400';
    return 'bg-blue-200';
  };

  return (
    <Card className="h-full">
      <CardHeader className="border-b">
        <CardTitle className="text-lg font-medium">Floor Stacking Diagram</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2 max-h-[450px] overflow-y-auto py-2 pr-1">
          <TooltipProvider>
            {sortedFloors.map((floor) => {
              const isSelected = selectedFloor === floor.floorNumber;
              const floorColorClass = getFloorColor(getFloorPrimaryUse(floor.floorNumber));
              const utilization = getFloorUtilization(floor.floorNumber);
              const utilizationWidth = `${Math.min(utilization, 100)}%`;
              
              return (
                <div 
                  key={floor.floorNumber}
                  className={`relative border rounded-md transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className={`relative flex items-center cursor-pointer overflow-hidden ${floorColorClass} p-2`}
                        onClick={() => setSelectedFloor(isSelected ? null : floor.floorNumber)}
                      >
                        {/* Space Utilization Bar */}
                        <div 
                          className={`absolute left-0 top-0 h-full ${getUtilizationColor(utilization)} opacity-40 transition-all`} 
                          style={{ width: utilizationWidth }}
                        ></div>
                        
                        <div className="relative flex items-center justify-between w-full">
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={floor.isUnderground ? "outline" : "secondary"}
                              className={floor.isUnderground ? "bg-gray-100" : ""}
                            >
                              {floor.floorNumber}
                            </Badge>
                            <span className="text-sm font-medium">
                              {getTemplateName(floor.floorNumber)}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">
                              {Math.round(utilization)}% Used
                            </span>
                            <span className="text-xs">
                              {floor.squareFootage.toLocaleString()} sf
                            </span>
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {getFloorUnitSummary(floor.floorNumber)}
                    </TooltipContent>
                  </Tooltip>
                  
                  {/* Reorder buttons, only shown when floor is selected */}
                  {isSelected && (
                    <div className="absolute -right-10 top-0 h-full flex flex-col justify-center space-y-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => reorderFloor(floor.floorNumber, "up")}
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => reorderFloor(floor.floorNumber, "down")}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
};

export default FloorStackingDiagram;
