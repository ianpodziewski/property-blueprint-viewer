
import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Floor, FloorPlateTemplate, Product } from "@/hooks/usePropertyState";
import { AlertTriangle, Building, Clock } from "lucide-react";

interface BuildingSummaryPanelProps {
  floors: Floor[];
  products: Product[];
  templates: FloorPlateTemplate[];
  getFloorTemplateById: (templateId: string) => FloorPlateTemplate | undefined;
  getUnitAllocation: (floorId: string, unitTypeId: string) => number;
  lastSavedTime?: Date;
}

const formatNumber = (num: number | undefined): string => {
  return num === undefined || isNaN(num) ? "0" : num.toLocaleString('en-US');
};

const BuildingSummaryPanel: React.FC<BuildingSummaryPanelProps> = ({
  floors,
  products,
  templates,
  getFloorTemplateById,
  getUnitAllocation,
  lastSavedTime,
}) => {
  const buildingSummary = useMemo(() => {
    // Calculate total building area
    let totalBuildingArea = 0;
    let totalAllocatedArea = 0;
    const floorAreas = new Map<string, { total: number, allocated: number }>();
    const overAllocatedFloors: string[] = [];
    const unallocatedFloors: string[] = [];
    
    // Gather template usage stats
    const templateUsage = new Map<string, { area: number, count: number }>();
    
    // Count units by type
    const unitsByType = new Map<string, { name: string, count: number }>();
    
    // Process each floor
    floors.forEach(floor => {
      const template = getFloorTemplateById(floor.templateId);
      const floorArea = template?.grossArea || 0;
      totalBuildingArea += floorArea;
      
      // Track template usage
      if (template) {
        const templateStats = templateUsage.get(template.id) || { area: 0, count: 0 };
        templateStats.area += template.grossArea || 0;
        templateStats.count += 1;
        templateUsage.set(template.id, templateStats);
      }
      
      // Calculate allocated area
      let floorAllocatedArea = 0;
      
      products.forEach(product => {
        product.unitTypes.forEach(unitType => {
          const allocation = getUnitAllocation(floor.id, unitType.id);
          if (allocation > 0) {
            const unitArea = unitType.grossArea || 0;
            floorAllocatedArea += unitArea * allocation;
            totalAllocatedArea += unitArea * allocation;
            
            // Track units by type
            const unitTypeKey = `${product.name}-${unitType.unitType}`;
            const unitTypeStats = unitsByType.get(unitTypeKey) || { 
              name: unitType.unitType, 
              count: 0 
            };
            unitTypeStats.count += allocation;
            unitsByType.set(unitTypeKey, unitTypeStats);
          }
        });
      });
      
      // Store floor stats
      floorAreas.set(floor.id, { 
        total: floorArea, 
        allocated: floorAllocatedArea 
      });
      
      // Check for over-allocation
      if (floorAllocatedArea > floorArea && floorArea > 0) {
        overAllocatedFloors.push(floor.label || `Floor ${floor.position}`);
      }
      
      // Check for no allocation
      if (floorAllocatedArea === 0 && floorArea > 0) {
        unallocatedFloors.push(floor.label || `Floor ${floor.position}`);
      }
    });
    
    // Calculate allocation percentage
    const allocationPercentage = totalBuildingArea > 0 
      ? (totalAllocatedArea / totalBuildingArea) * 100 
      : 0;
    
    // Calculate template breakdown
    const templateBreakdown = Array.from(templateUsage.entries()).map(([id, stats]) => {
      const template = templates.find(t => t.id === id);
      const percentage = totalBuildingArea > 0 
        ? (stats.area / totalBuildingArea) * 100 
        : 0;
      
      return {
        name: template?.name || 'Unknown',
        percentage,
        area: stats.area,
        count: stats.count
      };
    });
    
    // Format unit counts
    const formattedUnitCounts = Array.from(unitsByType.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, stats]) => {
        return `${stats.count} ${stats.name}`;
      });
    
    return {
      totalFloors: floors.length,
      totalBuildingArea,
      totalAllocatedArea,
      allocationPercentage,
      templateBreakdown,
      unitCounts: formattedUnitCounts,
      overAllocatedFloors,
      unallocatedFloors
    };
  }, [floors, products, templates, getFloorTemplateById, getUnitAllocation]);
  
  const formattedLastSaved = lastSavedTime 
    ? lastSavedTime.toLocaleString() 
    : 'Unknown';
  
  return (
    <Card className="mt-6">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <Building className="h-5 w-5 mr-2 text-blue-600" />
            <h3 className="text-lg font-medium">Building Summary</h3>
          </div>
          {lastSavedTime && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>Last updated: {formattedLastSaved}</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-500">Total Floors</div>
            <div className="text-xl font-semibold">{buildingSummary.totalFloors}</div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-500">Total Building Area</div>
            <div className="text-xl font-semibold">
              {formatNumber(buildingSummary.totalBuildingArea)} sf
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-500">Total Allocated Area</div>
            <div className="text-xl font-semibold">
              {formatNumber(buildingSummary.totalAllocatedArea)} sf
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-500">Utilization</div>
            <div className="text-xl font-semibold">
              {buildingSummary.allocationPercentage.toFixed(1)}%
            </div>
          </div>
        </div>
        
        {buildingSummary.templateBreakdown.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Template Breakdown</div>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex flex-wrap gap-2">
                {buildingSummary.templateBreakdown.map((template) => (
                  <div key={template.name} className="text-sm">
                    <span className="font-medium">{template.name}:</span> {template.percentage.toFixed(1)}%
                    <span className="text-gray-500 ml-1">({template.count} floors)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {buildingSummary.unitCounts.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Unit Mix</div>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {buildingSummary.unitCounts.map((unitCount, index) => (
                  <div key={index} className="text-sm">
                    {unitCount}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Warnings Section */}
        {(buildingSummary.overAllocatedFloors.length > 0 || buildingSummary.unallocatedFloors.length > 0) && (
          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Warnings</div>
            
            {buildingSummary.overAllocatedFloors.length > 0 && (
              <Alert variant="warning" className="mb-3">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Over-allocated Floors</AlertTitle>
                <AlertDescription>
                  The following floors have more space allocated than available:
                  <span className="block mt-1 font-medium">
                    {buildingSummary.overAllocatedFloors.join(', ')}
                  </span>
                </AlertDescription>
              </Alert>
            )}
            
            {buildingSummary.unallocatedFloors.length > 0 && (
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Unallocated Floors</AlertTitle>
                <AlertDescription>
                  The following floors have no space allocated:
                  <span className="block mt-1 font-medium">
                    {buildingSummary.unallocatedFloors.join(', ')}
                  </span>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BuildingSummaryPanel;
