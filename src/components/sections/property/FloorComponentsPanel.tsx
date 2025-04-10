
import React from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BuildingComponent } from '@/hooks/useBuildingComponents';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

interface FloorComponentsPanelProps {
  floorComponents: BuildingComponent[];
  floorArea: number;
  calculateComponentArea: (component: BuildingComponent, floorArea: number) => number;
}

const FloorComponentsPanel: React.FC<FloorComponentsPanelProps> = ({
  floorComponents,
  floorArea,
  calculateComponentArea
}) => {
  if (floorComponents.length === 0) return null;

  // Group components by container
  const groupedComponents = floorComponents.reduce((acc, component) => {
    // Skip container components themselves
    if (component.isContainer) return acc;
    
    const containerId = component.parentId || 'uncategorized';
    if (!acc[containerId]) {
      acc[containerId] = [];
    }
    acc[containerId].push(component);
    return acc;
  }, {} as Record<string, BuildingComponent[]>);

  // Find container components
  const containerComponents = floorComponents.filter(comp => comp.isContainer);
  
  return (
    <div className="mt-8 border-t pt-4">
      <div className="text-sm font-medium text-gray-700 mb-3">Building Components</div>
      
      {Object.entries(groupedComponents).map(([containerId, components]) => {
        // Find the container component if it exists
        const container = containerComponents.find(c => c.id === containerId);
        const containerName = container ? container.name : 'Other Components';
        
        return (
          <Collapsible key={containerId} className="mb-4">
            <CollapsibleTrigger className="flex items-center w-full text-left p-2 hover:bg-gray-50 rounded">
              {open => (
                <>
                  {open ? (
                    <ChevronDown className="h-4 w-4 text-gray-500 mr-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500 mr-2" />
                  )}
                  <span className="font-medium">{containerName}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({components.length} {components.length === 1 ? 'component' : 'components'})
                  </span>
                </>
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-3 pl-6">
                {components.map(component => {
                  const componentArea = calculateComponentArea(component, floorArea);
                  const percentOfFloor = floorArea > 0 ? (componentArea / floorArea) * 100 : 0;
                  
                  return (
                    <Card key={component.id} className="flex flex-col h-full p-3 bg-white border rounded shadow-sm">
                      <div className="mb-2">
                        <div className="font-medium text-sm">
                          {component.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {component.componentType && `${component.componentType} • `}
                          {component.isPercentage 
                            ? `${component.percentage}% of floor`
                            : `${component.squareFootage.toLocaleString()} sf fixed`}
                        </div>
                      </div>
                      <div className="mt-auto pt-2 text-sm font-semibold">
                        {componentArea.toLocaleString()} sf 
                        <span className="ml-1 text-xs font-normal text-gray-500">
                          ({percentOfFloor.toFixed(1)}%)
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
};

export default FloorComponentsPanel;
