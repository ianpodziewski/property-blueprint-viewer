
import React from "react";
import BuildingMassingVisualization from "@/components/property/BuildingMassingVisualization";
import FloorStackingDiagram from "@/components/property/FloorStackingDiagram";
import { FloorPlateTemplate, FloorConfiguration } from "@/types/propertyTypes";

interface VisualizationsRowProps {
  buildingFootprint: number;
  floorConfigurations: FloorConfiguration[];
  floorTemplates: FloorPlateTemplate[];
  floorsData: any[];
  spaceBreakdown: any[];
  spaceTypeColors: Record<string, string>;
  updateFloorConfiguration: (index: number, updates: Partial<FloorConfiguration>) => void;
  reorderFloor: (fromIndex: number, toIndex: number) => void;
}

const VisualizationsRow: React.FC<VisualizationsRowProps> = ({
  buildingFootprint,
  floorConfigurations,
  floorTemplates,
  floorsData,
  spaceBreakdown,
  spaceTypeColors,
  updateFloorConfiguration,
  reorderFloor,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <BuildingMassingVisualization 
        buildingFootprint={buildingFootprint}
        numberOfFloors={floorConfigurations.filter(f => !f.isUnderground).length}
        numberOfUndergroundFloors={floorConfigurations.filter(f => f.isUnderground).length}
        spaceBreakdown={spaceBreakdown}
        floorConfigurations={floorConfigurations}
        floorTemplates={floorTemplates}
      />
      
      <FloorStackingDiagram 
        floors={floorsData}
        spaceTypeColors={spaceTypeColors}
        floorTemplates={floorTemplates}
        floorConfigurations={floorConfigurations}
        updateFloorConfiguration={updateFloorConfiguration}
        reorderFloor={reorderFloor}
      />
    </div>
  );
};

export default VisualizationsRow;
