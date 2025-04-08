
import React, { useState, useMemo, memo, useCallback } from "react";
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

// Memoized floor item component to prevent unnecessary re-renders
const FloorItem = memo(({
  floor,
  isSelected,
  floorColorClass,
  utilization,
  utilizationWidth,
  floorSqFt,
  templateName,
  unitSummary,
  showReorderButtons,
  onFloorClick,
  onReorderUp,
  onReorderDown,
}: {
  floor: FloorData;
  isSelected: boolean;
  floorColorClass: string;
  utilization: number;
  utilizationWidth: string;
  floorSqFt: number | undefined;
  templateName: string;
  unitSummary: React.ReactNode;
  showReorderButtons: boolean;
  onFloorClick: () => void;
  onReorderUp: () => void;
  onReorderDown: () => void;
}) => {
  // Helper for utilization color
  const getUtilizationColor = useCallback((utilization: number) => {
    if (utilization >= 95) return 'bg-red-400';
    if (utilization >= 80) return 'bg-amber-400';
    if (utilization >= 50) return 'bg-green-400';
    return 'bg-blue-200';
  }, []);

  return (
    <div 
      className={`relative border rounded-md transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`relative flex items-center cursor-pointer overflow-hidden ${floorColorClass} p-2`}
            onClick={onFloorClick}
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
                  {templateName}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">
                  {Math.round(utilization)}% Used
                </span>
                <span className="text-xs">
                  {/* Safe handling of undefined values */}
                  {typeof floorSqFt === 'number' ? floorSqFt.toLocaleString() : '0'} sf
                </span>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          {unitSummary}
        </TooltipContent>
      </Tooltip>
      
      {/* Reorder buttons, only shown when floor is selected */}
      {showReorderButtons && (
        <div className="absolute -right-10 top-0 h-full flex flex-col justify-center space-y-1">
          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7"
            onClick={onReorderUp}
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7"
            onClick={onReorderDown}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
});

FloorItem.displayName = 'FloorItem';

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
  
  // Helper to get floor color based on primary use - memoized
  const getFloorColor = useCallback((primaryUse: string | undefined) => {
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
  }, []);
  
  // Get primary use for a floor - memoized
  const getFloorPrimaryUse = useCallback((floorNumber: number): string => {
    const floorConfig = floorConfigurations.find(f => f.floorNumber === floorNumber);
    return floorConfig?.primaryUse || 'office';
  }, [floorConfigurations]);
  
  // Calculate utilization ratio for floor - memoized
  const getFloorUtilization = useCallback((floorNumber: number): number => {
    const floorConfig = floorConfigurations.find(f => f.floorNumber === floorNumber);
    if (!floorConfig) return 0;
    
    const template = floorTemplates.find(t => t.id === floorConfig.templateId);
    const floorArea = floorConfig.customSquareFootage && floorConfig.customSquareFootage !== "" 
      ? parseInt(floorConfig.customSquareFootage)
      : template ? parseInt(template.squareFootage) : 0;
    
    if (floorArea === 0) return 0;
    
    const allocatedArea = calculateAllocatedAreaByFloor(floorNumber);
    return (allocatedArea / floorArea) * 100;
  }, [floorConfigurations, floorTemplates, calculateAllocatedAreaByFloor]);
  
  // Function to get template name - memoized
  const getTemplateName = useCallback((floorNumber: number): string => {
    const floorConfig = floorConfigurations.find(f => f.floorNumber === floorNumber);
    if (!floorConfig || !floorConfig.templateId) return 'Custom';
    
    const template = floorTemplates.find(t => t.id === floorConfig.templateId);
    return template ? template.name : 'Unknown Template';
  }, [floorConfigurations, floorTemplates]);
  
  // Get unit allocation summary for tooltip - memoized
  const getFloorUnitSummary = useCallback((floorNumber: number) => {
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
  }, [getAllocationsByFloor, getUnitTypeById]);

  // Sort floors by number, with above-ground floors at the top - memoized
  const sortedFloors = useMemo(() => {
    if (!floors || floors.length === 0) return [];
    
    return [...floors].sort((a, b) => {
      if (a.isUnderground && b.isUnderground) {
        return a.floorNumber - b.floorNumber;
      } else if (!a.isUnderground && !b.isUnderground) {
        return b.floorNumber - a.floorNumber;
      } else {
        return a.isUnderground ? -1 : 1;
      }
    });
  }, [floors]);

  // Handler for floor selection
  const handleFloorClick = useCallback((floorNumber: number) => {
    setSelectedFloor(prevSelected => prevSelected === floorNumber ? null : floorNumber);
  }, []);

  return (
    <Card className="h-full">
      <CardHeader className="border-b">
        <CardTitle className="text-lg font-medium">Floor Stacking Diagram</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2 max-h-[450px] overflow-y-auto py-2 pr-1">
          <TooltipProvider>
            {sortedFloors.map((floor) => {
              // Add null checks and default values
              const safeFloor = floor || { floorNumber: 0, isUnderground: false, squareFootage: 0 };
              const isSelected = selectedFloor === safeFloor.floorNumber;
              const floorColorClass = getFloorColor(getFloorPrimaryUse(safeFloor.floorNumber));
              const utilization = getFloorUtilization(safeFloor.floorNumber);
              const utilizationWidth = `${Math.min(utilization, 100)}%`;
              
              // Safety guard for square footage
              const floorSqFt = typeof safeFloor.squareFootage === 'number' ? safeFloor.squareFootage : 0;
              const templateName = getTemplateName(safeFloor.floorNumber);
              const unitSummary = getFloorUnitSummary(safeFloor.floorNumber);
              
              return (
                <FloorItem
                  key={safeFloor.floorNumber}
                  floor={safeFloor}
                  isSelected={isSelected}
                  floorColorClass={floorColorClass}
                  utilization={utilization}
                  utilizationWidth={utilizationWidth}
                  floorSqFt={floorSqFt}
                  templateName={templateName}
                  unitSummary={unitSummary}
                  showReorderButtons={isSelected}
                  onFloorClick={() => handleFloorClick(safeFloor.floorNumber)}
                  onReorderUp={() => reorderFloor(safeFloor.floorNumber, "up")}
                  onReorderDown={() => reorderFloor(safeFloor.floorNumber, "down")}
                />
              );
            })}
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(FloorStackingDiagram);
