
import React, { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FloorConfiguration, FloorPlateTemplate, SpaceDefinition } from "@/types/propertyTypes";

interface ExpandableFloorRowProps {
  floor: FloorConfiguration;
  template?: FloorPlateTemplate;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggleExpand: () => void;
  hasDetailedConfig: boolean;
}

const ExpandableFloorRow: React.FC<ExpandableFloorRowProps> = ({
  floor,
  template,
  children,
  isExpanded,
  onToggleExpand,
  hasDetailedConfig
}) => {
  return (
    <div className="border-b last:border-b-0">
      <div 
        className={cn(
          "cursor-pointer transition-colors hover:bg-gray-50",
          isExpanded ? "bg-gray-50" : "",
          hasDetailedConfig && !isExpanded ? "border-l-2 border-l-blue-400" : ""
        )}
        onClick={onToggleExpand}
      >
        {children}
      </div>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {isExpanded && (
          <div className="bg-gray-50 p-4 border-t">
            <FloorDetailView floor={floor} template={template} />
          </div>
        )}
      </div>
    </div>
  );
};

const FloorDetailView: React.FC<{
  floor: FloorConfiguration;
  template?: FloorPlateTemplate;
}> = ({ floor, template }) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-white p-4 rounded-md border">
        <h3 className="font-medium text-sm text-gray-700 mb-3">Floor Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <span className="text-xs text-gray-500 block">Template</span>
            <span className="text-sm">{template?.name || "Custom"}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Floor Area</span>
            <span className="text-sm">
              {parseInt(floor.customSquareFootage || template?.squareFootage || "0").toLocaleString()} sf
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Floor Height</span>
            <span className="text-sm">{floor.floorToFloorHeight || template?.floorToFloorHeight || "12"} ft</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Primary Use</span>
            <span className="text-sm capitalize">{floor.primaryUse || "office"}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Core Percentage</span>
            <span className="text-sm">{floor.corePercentage || template?.corePercentage || "15"}%</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-md border">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-sm text-gray-700">Space Allocation</h3>
          <Button variant="outline" size="sm">Configure Spaces</Button>
        </div>
        
        {floor.spaces && floor.spaces.length > 0 ? (
          <div className="space-y-2">
            {floor.spaces.map((space, index) => (
              <div key={index} className="text-sm flex justify-between border-b pb-2 last:border-b-0 last:pb-0">
                <span>{space.type}</span>
                <span>{parseInt(space.area || "0").toLocaleString()} sf</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-gray-500">
            No spaces defined for this floor
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpandableFloorRow;
