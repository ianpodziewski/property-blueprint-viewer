
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FloorConfiguration, FloorPlateTemplate } from "@/types/propertyTypes";
import { useUnitAllocations } from "@/hooks/property/useUnitAllocations";
import { useUnitTypes } from "@/hooks/property/useUnitTypes";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SpaceBreakdownItem {
  type: string;
  squareFootage: number;
  percentage: number;
  color?: string;
}

interface BuildingMassingVisualizationProps {
  buildingFootprint: number;
  numberOfFloors: number;
  numberOfUndergroundFloors: number;
  spaceBreakdown: SpaceBreakdownItem[];
  floorConfigurations: FloorConfiguration[];
  floorTemplates: FloorPlateTemplate[];
}

const BuildingMassingVisualization: React.FC<BuildingMassingVisualizationProps> = ({
  buildingFootprint,
  numberOfFloors,
  numberOfUndergroundFloors,
  spaceBreakdown,
  floorConfigurations,
  floorTemplates
}) => {
  const { calculateAllocatedAreaByFloor, getAllocationsByFloor } = useUnitAllocations();
  const { getUnitTypeById, getAllCategories, unitTypes } = useUnitTypes();
  
  // Helper to calculate utilization for a floor
  const calculateFloorUtilization = (floorNumber: number) => {
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
  
  // Get color for floor based on primary category allocation
  const getFloorPrimaryCategory = (floorNumber: number) => {
    const allocations = getAllocationsByFloor(floorNumber);
    if (allocations.length === 0) {
      return {
        category: null,
        color: null,
        utilization: 0
      };
    }
    
    // Group by category
    const categoryArea: Record<string, number> = {};
    let totalArea = 0;
    
    allocations.forEach(allocation => {
      const unitType = getUnitTypeById(allocation.unitTypeId);
      if (!unitType) return;
      
      const category = unitType.category;
      const area = (parseInt(allocation.count as string) || 0) * 
                  (parseInt(allocation.squareFootage as string) || 0);
      
      if (!categoryArea[category]) {
        categoryArea[category] = 0;
      }
      
      categoryArea[category] += area;
      totalArea += area;
    });
    
    // Find category with most area
    let maxCategory = null;
    let maxArea = 0;
    
    Object.entries(categoryArea).forEach(([category, area]) => {
      if (area > maxArea) {
        maxCategory = category;
        maxArea = area;
      }
    });
    
    if (!maxCategory) return {
      category: null,
      color: null,
      utilization: 0
    };
    
    // Get the color for this category
    const unitType = allocations.find(a => {
      const ut = getUnitTypeById(a.unitTypeId);
      return ut && ut.category === maxCategory;
    });
    
    const ut = unitType ? getUnitTypeById(unitType.unitTypeId) : null;
    const utilization = calculateFloorUtilization(floorNumber);
    
    return {
      category: maxCategory,
      color: ut?.color || '#E5DEFF',
      utilization
    };
  };
  
  // Default building proportions
  const buildingHeight = 350; // Maximum height in pixels
  const maxWidth = 250; // Maximum width in pixels
  
  const floorHeight = numberOfFloors > 0 ? Math.min(buildingHeight / numberOfFloors, 40) : 40;
  const undergroundFloorHeight = numberOfUndergroundFloors > 0 ? Math.min(100 / numberOfUndergroundFloors, 40) : 0;
  
  // Scale building width based on footprint
  const buildingWidth = Math.min(Math.max(buildingFootprint / 100, 150), maxWidth);
  
  // Calculate total height
  const totalBuildingHeight = floorHeight * numberOfFloors;
  const totalUndergroundHeight = undergroundFloorHeight * numberOfUndergroundFloors;

  // Sort floors for rendering
  const sortedFloors = [...floorConfigurations].sort((a, b) => {
    if (a.isUnderground && b.isUnderground) {
      return a.floorNumber - b.floorNumber;
    } else if (!a.isUnderground && !b.isUnderground) {
      return b.floorNumber - a.floorNumber;
    } else {
      return a.isUnderground ? 1 : -1;
    }
  });
  
  // Group floors by type (above ground vs underground)
  const aboveGroundFloors = sortedFloors.filter(f => !f.isUnderground);
  const undergroundFloors = sortedFloors.filter(f => f.isUnderground);

  return (
    <Card className="h-full">
      <CardHeader className="border-b">
        <CardTitle className="text-lg font-medium">Building Visualization</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex justify-center">
          <div>
            {/* Category Legend */}
            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {getAllCategories().map(category => {
                const categoryUnitTypes = unitTypes.filter(ut => ut.category === category);
                const firstUnitType = categoryUnitTypes[0];
                return (
                  <Badge 
                    key={category} 
                    variant="outline" 
                    className="px-2 py-0.5 text-xs"
                    style={{ 
                      backgroundColor: firstUnitType ? `${firstUnitType.color}40` : "#E5DEFF40",
                      borderColor: firstUnitType ? firstUnitType.color : "#E5DEFF"
                    }}
                  >
                    {category}
                  </Badge>
                );
              })}
            </div>
            
            {/* Above Ground Floors */}
            <TooltipProvider>
              <div className="flex flex-col items-center">
                {aboveGroundFloors.map((floor, index) => {
                  const { category, color, utilization } = getFloorPrimaryCategory(floor.floorNumber);
                  const opacity = Math.min(0.3 + (utilization / 100) * 0.7, 1);
                  const floorStyle = {
                    height: `${floorHeight}px`,
                    width: `${buildingWidth}px`,
                    backgroundColor: color ? `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}` : '#f1f5f9',
                    borderColor: color || '#e2e8f0'
                  };
                  
                  return (
                    <Tooltip key={floor.floorNumber}>
                      <TooltipTrigger asChild>
                        <div 
                          className="border-b border-x first:border-t first:rounded-t-md last:rounded-b-md hover:brightness-95 flex items-center justify-between px-3"
                          style={floorStyle}
                        >
                          <span className="text-xs font-medium">Floor {floor.floorNumber}</span>
                          {category && (
                            <Badge variant="outline" className="text-[10px] h-4 bg-white/80">
                              {category}
                            </Badge>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <div className="text-xs space-y-1">
                          <p className="font-semibold">Floor {floor.floorNumber}</p>
                          <p>Utilization: {Math.round(utilization)}%</p>
                          {category && <p>Primary Use: {category}</p>}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
                
                {/* Ground Level */}
                <div 
                  className="bg-gray-200 border border-gray-300 w-full rounded-md"
                  style={{ width: `${buildingWidth + 40}px`, height: '6px' }}
                ></div>
                
                {/* Underground Floors */}
                {undergroundFloors.map((floor) => {
                  const { category, color, utilization } = getFloorPrimaryCategory(floor.floorNumber);
                  const opacity = Math.min(0.3 + (utilization / 100) * 0.7, 1);
                  const floorStyle = {
                    height: `${undergroundFloorHeight}px`,
                    width: `${buildingWidth * 0.8}px`,
                    backgroundColor: color ? `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}` : '#f1f5f9',
                    borderColor: color || '#e2e8f0'
                  };
                  
                  return (
                    <Tooltip key={floor.floorNumber}>
                      <TooltipTrigger asChild>
                        <div 
                          className="border-b border-x first:rounded-t-md last:rounded-b-md hover:brightness-95 bg-gray-100 flex items-center justify-between px-3"
                          style={floorStyle}
                        >
                          <span className="text-xs font-medium">Floor {floor.floorNumber}</span>
                          {category && (
                            <Badge variant="outline" className="text-[10px] h-4 bg-white/80">
                              {category}
                            </Badge>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <div className="text-xs space-y-1">
                          <p className="font-semibold">Underground Floor {floor.floorNumber}</p>
                          <p>Utilization: {Math.round(utilization)}%</p>
                          {category && <p>Primary Use: {category}</p>}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
            
            <div className="mt-6">
              <div className="text-sm font-medium mb-2">Building Statistics</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="text-sm text-muted-foreground">Above Ground Floors:</div>
                <div className="text-sm">{numberOfFloors}</div>
                
                <div className="text-sm text-muted-foreground">Below Ground Floors:</div>
                <div className="text-sm">{numberOfUndergroundFloors}</div>
                
                <div className="text-sm text-muted-foreground">Building Footprint:</div>
                <div className="text-sm">{buildingFootprint.toLocaleString()} sf</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BuildingMassingVisualization;
