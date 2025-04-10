
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Floor, FloorPlateTemplate, Product } from '@/hooks/usePropertyState';
import { BuildingComponent } from '@/hooks/useBuildingComponents';
import { Progress } from '@/components/ui/progress';

interface BuildingSummaryPanelProps {
  floors: Floor[];
  templates: FloorPlateTemplate[];
  products: Product[];
  buildingComponents: BuildingComponent[];
  getFloorTemplateById: (id: string) => FloorPlateTemplate | undefined;
  calculateComponentArea: (component: BuildingComponent, floorArea: number) => number;
}

const BuildingSummaryPanel: React.FC<BuildingSummaryPanelProps> = ({
  floors,
  templates,
  products,
  buildingComponents,
  getFloorTemplateById,
  calculateComponentArea
}) => {
  const summaryData = useMemo(() => {
    let totalBuildingArea = 0;
    let totalRentableArea = 0;
    let totalNonRentableArea = 0;
    
    // Component containers with their total areas
    const containerAreas: Record<string, { name: string, area: number }> = {};
    
    // Calculate total building area from floor templates
    floors.forEach(floor => {
      const template = getFloorTemplateById(floor.templateId);
      if (template) {
        const floorArea = template.grossArea;
        totalBuildingArea += floorArea;
        
        // Calculate component areas for this floor
        const floorComponents = buildingComponents.filter(
          component => !component.isContainer && (component.floorId === floor.id || component.floorId === null)
        );
        
        floorComponents.forEach(component => {
          const componentArea = calculateComponentArea(component, floorArea);
          totalNonRentableArea += componentArea;
          
          // Add to container totals
          const containerId = component.parentId || 'uncategorized';
          const containerName = component.parentId 
            ? buildingComponents.find(c => c.id === component.parentId)?.name || 'Other' 
            : 'Uncategorized';
            
          if (!containerAreas[containerId]) {
            containerAreas[containerId] = { name: containerName, area: 0 };
          }
          containerAreas[containerId].area += componentArea;
        });
      }
    });
    
    totalRentableArea = totalBuildingArea - totalNonRentableArea;
    
    // Calculate building efficiency (rentable to gross ratio)
    const buildingEfficiency = totalBuildingArea > 0 
      ? (totalRentableArea / totalBuildingArea) * 100 
      : 0;
      
    // Transform container areas to array for rendering
    const componentBreakdown = Object.values(containerAreas).sort((a, b) => b.area - a.area);
    
    return {
      totalBuildingArea,
      totalRentableArea,
      totalNonRentableArea,
      buildingEfficiency,
      componentBreakdown
    };
  }, [floors, buildingComponents, getFloorTemplateById, calculateComponentArea]);
  
  if (floors.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Building Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <div className="text-sm text-gray-500">Total Building Area</div>
            <div className="text-2xl font-semibold mt-1">{summaryData.totalBuildingArea.toLocaleString()} sf</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-md">
            <div className="text-sm text-gray-500">Total Rentable Area</div>
            <div className="text-2xl font-semibold mt-1">{summaryData.totalRentableArea.toLocaleString()} sf</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-md">
            <div className="text-sm text-gray-500">Building Efficiency</div>
            <div className="text-2xl font-semibold mt-1">{summaryData.buildingEfficiency.toFixed(1)}%</div>
          </div>
        </div>
        
        {summaryData.totalNonRentableArea > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Non-Rentable Space</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Total Non-Rentable</span>
                <span className="font-medium">{summaryData.totalNonRentableArea.toLocaleString()} sf</span>
              </div>
              <div className="h-px bg-gray-100"></div>
              {summaryData.componentBreakdown.map((container, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{container.name}</span>
                  <div className="text-right">
                    <span className="font-medium">{container.area.toLocaleString()} sf</span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({summaryData.totalBuildingArea > 0 
                        ? ((container.area / summaryData.totalBuildingArea) * 100).toFixed(1) 
                        : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div>
          <h4 className="text-sm font-semibold mb-2">Building Efficiency Ratio</h4>
          <Progress 
            value={summaryData.buildingEfficiency} 
            max={100}
            variant={summaryData.buildingEfficiency >= 75 ? "green" : summaryData.buildingEfficiency >= 65 ? "yellow" : "red"}
            className="h-2 mb-2"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>Rentable to Gross Ratio: {summaryData.buildingEfficiency.toFixed(1)}%</span>
            <span>100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BuildingSummaryPanel;
