
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Edit } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { FloorConfiguration, FloorPlateTemplate } from "@/types/propertyTypes";

interface FloorData {
  floorNumber: number;
  spaces: {
    id: string;
    type: string;
    squareFootage: number;
    percentage: number;
  }[];
  isUnderground: boolean;
}

interface FloorStackingDiagramProps {
  floors: FloorData[];
  spaceTypeColors: Record<string, string>;
  floorTemplates: FloorPlateTemplate[];
  floorConfigurations: FloorConfiguration[];
  updateFloorConfiguration: (
    floorNumber: number,
    field: keyof FloorConfiguration,
    value: string | null | boolean
  ) => void;
  reorderFloor: (floorNumber: number, direction: "up" | "down") => void;
}

const FloorStackingDiagram = ({
  floors,
  spaceTypeColors,
  floorTemplates,
  floorConfigurations,
  updateFloorConfiguration,
  reorderFloor
}: FloorStackingDiagramProps) => {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  
  // Sort floors by number, with highest floor number at the top for above-ground floors
  const aboveGroundFloors = floors
    .filter((floor) => !floor.isUnderground)
    .sort((a, b) => b.floorNumber - a.floorNumber);
  
  // Sort underground floors with most negative at the bottom
  const belowGroundFloors = floors
    .filter((floor) => floor.isUnderground)
    .sort((a, b) => a.floorNumber - b.floorNumber);

  const getTemplateInfo = (floorNumber: number) => {
    const config = floorConfigurations.find(c => c.floorNumber === floorNumber);
    if (!config) return null;

    if (config.customSquareFootage) {
      return { name: "Custom", area: config.customSquareFootage };
    }

    const template = config.templateId 
      ? floorTemplates.find(t => t.id === config.templateId) 
      : null;

    return template
      ? { name: template.name, area: template.squareFootage } 
      : { name: "Unknown", area: "0" };
  };

  const canMoveUp = (floorNumber: number) => {
    if (floorNumber === Math.max(...floors.map(f => f.floorNumber))) return false;
    const isUnderground = floors.find(f => f.floorNumber === floorNumber)?.isUnderground;
    const siblingFloors = isUnderground ? belowGroundFloors : aboveGroundFloors;
    const index = siblingFloors.findIndex(f => f.floorNumber === floorNumber);
    return index > 0;
  };

  const canMoveDown = (floorNumber: number) => {
    if (floorNumber === Math.min(...floors.map(f => f.floorNumber))) return false;
    const isUnderground = floors.find(f => f.floorNumber === floorNumber)?.isUnderground;
    const siblingFloors = isUnderground ? belowGroundFloors : aboveGroundFloors;
    const index = siblingFloors.findIndex(f => f.floorNumber === floorNumber);
    return index < siblingFloors.length - 1;
  };

  const calculateFloorBarWidth = (spaces: FloorData["spaces"]) => {
    // Only representing percentage relative to the largest floor
    return 85; // Use a consistent percentage for visual clarity
  };

  const getTotalSquareFootage = (spaces: FloorData["spaces"]) => {
    return spaces.reduce((sum, space) => sum + space.squareFootage, 0);
  };

  const handleOpenFloorEditor = (floorNumber: number) => {
    const config = floorConfigurations.find(c => c.floorNumber === floorNumber);
    if (config) {
      // This could trigger the FloorEditor component through the parent
      setSelectedFloor(floorNumber);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Floor Stacking Diagram</CardTitle>
            <CardDescription>Visualize the vertical arrangement of your building</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {aboveGroundFloors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Above Ground</h3>
                {aboveGroundFloors.map((floor) => {
                  const totalArea = getTotalSquareFootage(floor.spaces);
                  const barWidth = calculateFloorBarWidth(floor.spaces);
                  const templateInfo = getTemplateInfo(floor.floorNumber);
                  
                  return (
                    <div 
                      key={floor.floorNumber} 
                      className={`flex items-center mb-2 ${selectedFloor === floor.floorNumber ? 'bg-muted/40 rounded-l' : ''}`}
                    >
                      <div className="w-10 text-right pr-2 font-medium">
                        {floor.floorNumber}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div 
                            className="flex h-10 rounded-sm overflow-hidden"
                            style={{ width: `${barWidth}%` }}
                          >
                            {floor.spaces.map((space) => (
                              <div
                                key={space.id}
                                className="h-full"
                                style={{ 
                                  width: `${space.percentage}%`,
                                  backgroundColor: spaceTypeColors[space.type] || '#9CA3AF',
                                }}
                                title={`${space.type}: ${space.squareFootage.toLocaleString()} sf (${space.percentage.toFixed(0)}%)`}
                              />
                            ))}
                          </div>
                          
                          <div className="ml-3 text-xs text-gray-600">
                            {totalArea.toLocaleString()} sf
                            {templateInfo && (
                              <span className="ml-2 opacity-60">
                                ({templateInfo.name})
                              </span>
                            )}
                          </div>
                          
                          <div className="ml-auto flex items-center gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={!canMoveUp(floor.floorNumber)}
                                    onClick={() => reorderFloor(floor.floorNumber, "up")}
                                  >
                                    <ArrowUp className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Move floor up</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={!canMoveDown(floor.floorNumber)}
                                    onClick={() => reorderFloor(floor.floorNumber, "down")}
                                  >
                                    <ArrowDown className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Move floor down</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleOpenFloorEditor(floor.floorNumber)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit floor</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                        
                        {/* Primary use indicators */}
                        <div className="flex mt-1 gap-1">
                          {floor.spaces.length > 0 && floor.spaces.map((space) => (
                            <Badge 
                              key={space.id} 
                              variant="outline"
                              className="text-xs py-0 h-5 capitalize"
                              style={{ 
                                borderColor: spaceTypeColors[space.type] || '#9CA3AF',
                                backgroundColor: `${spaceTypeColors[space.type] || '#9CA3AF'}15`
                              }}
                            >
                              {space.type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {belowGroundFloors.length > 0 && (
              <div className="mb-2">
                <h3 className="text-sm font-medium mb-3">Below Ground</h3>
                {belowGroundFloors.map((floor) => {
                  const totalArea = getTotalSquareFootage(floor.spaces);
                  const barWidth = calculateFloorBarWidth(floor.spaces);
                  const templateInfo = getTemplateInfo(floor.floorNumber);
                  
                  return (
                    <div 
                      key={floor.floorNumber} 
                      className={`flex items-center mb-2 ${selectedFloor === floor.floorNumber ? 'bg-muted/40 rounded-l' : ''}`}
                    >
                      <div className="w-10 text-right pr-2 font-medium">
                        B{Math.abs(floor.floorNumber)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div 
                            className="flex h-10 rounded-sm overflow-hidden"
                            style={{ width: `${barWidth}%` }}
                          >
                            {floor.spaces.map((space) => (
                              <div
                                key={space.id}
                                className="h-full"
                                style={{ 
                                  width: `${space.percentage}%`,
                                  backgroundColor: spaceTypeColors[space.type] || '#9CA3AF',
                                }}
                                title={`${space.type}: ${space.squareFootage.toLocaleString()} sf (${space.percentage.toFixed(0)}%)`}
                              />
                            ))}
                          </div>
                          
                          <div className="ml-3 text-xs text-gray-600">
                            {totalArea.toLocaleString()} sf
                            {templateInfo && (
                              <span className="ml-2 opacity-60">
                                ({templateInfo.name})
                              </span>
                            )}
                          </div>
                          
                          <div className="ml-auto flex items-center gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={!canMoveUp(floor.floorNumber)}
                                    onClick={() => reorderFloor(floor.floorNumber, "up")}
                                  >
                                    <ArrowUp className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Move floor up</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={!canMoveDown(floor.floorNumber)}
                                    onClick={() => reorderFloor(floor.floorNumber, "down")}
                                  >
                                    <ArrowDown className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Move floor down</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleOpenFloorEditor(floor.floorNumber)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit floor</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                        
                        {/* Primary use indicators */}
                        <div className="flex mt-1 gap-1">
                          {floor.spaces.length > 0 && floor.spaces.map((space) => (
                            <Badge 
                              key={space.id} 
                              variant="outline"
                              className="text-xs py-0 h-5 capitalize"
                              style={{ 
                                borderColor: spaceTypeColors[space.type] || '#9CA3AF',
                                backgroundColor: `${spaceTypeColors[space.type] || '#9CA3AF'}15`
                              }}
                            >
                              {space.type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Space type color legend */}
          <div className="mt-6 pt-4 border-t">
            <h3 className="text-sm font-medium mb-2">Legend</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(spaceTypeColors).map(([type, color]) => (
                <div key={type} className="flex items-center">
                  <div className="w-3 h-3 rounded-sm mr-1.5" style={{ backgroundColor: color }}></div>
                  <span className="text-xs capitalize">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default FloorStackingDiagram;
