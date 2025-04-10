
import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Floor, FloorPlateTemplate, Product } from '@/hooks/usePropertyState';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { BuildingComponent } from '@/hooks/useBuildingComponents';

interface BuildingSummaryPanelProps {
  floors: Floor[];
  templates: FloorPlateTemplate[];
  products: Product[];
  buildingComponents: BuildingComponent[];
  getFloorTemplateById: (id: string) => FloorPlateTemplate | undefined;
  getUnitAllocation: (floorId: string, unitTypeId: string) => Promise<number>;
  getComponentsByFloorId: (floorId: string | null) => BuildingComponent[];
  calculateComponentArea: (component: BuildingComponent, floorArea: number) => number;
}

interface TemplateUsage {
  templateId: string;
  templateName: string;
  count: number;
  area: number;
}

interface UnitTypeSummary {
  unitType: string;
  count: number;
}

interface ComponentTypeSummary {
  componentType: string;
  area: number;
  percentage: number;
}

interface FloorUtilization {
  floorId: string;
  position: number;
  utilization: number;
  unitAllocated: number;
  componentAllocated: number;
  capacity: number;
}

const BuildingSummaryPanel: React.FC<BuildingSummaryPanelProps> = ({
  floors,
  templates,
  products,
  buildingComponents,
  getFloorTemplateById,
  getUnitAllocation,
  getComponentsByFloorId,
  calculateComponentArea
}) => {
  const [floorUtilizations, setFloorUtilizations] = useState<FloorUtilization[]>([]);
  const [unitTypeCounts, setUnitTypeCounts] = useState<UnitTypeSummary[]>([]);
  const [componentSummary, setComponentSummary] = useState<ComponentTypeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Calculate utilization for each floor
        const utilizations: FloorUtilization[] = [];
        
        for (const floor of floors) {
          const template = getFloorTemplateById(floor.templateId);
          if (!template) continue;
          
          let unitAllocated = 0;
          
          // Calculate allocated area for units
          for (const product of products) {
            for (const unitType of product.unitTypes) {
              const quantity = await getUnitAllocation(floor.id, unitType.id);
              unitAllocated += quantity * unitType.grossArea;
            }
          }
          
          // Calculate allocated area for building components
          const floorComponents = getComponentsByFloorId(floor.id);
          const componentAllocated = floorComponents.reduce((total, component) => {
            return total + calculateComponentArea(component, template.grossArea);
          }, 0);
          
          const totalAllocated = unitAllocated + componentAllocated;
          
          utilizations.push({
            floorId: floor.id,
            position: floor.position,
            utilization: template.grossArea > 0 ? (totalAllocated / template.grossArea) * 100 : 0,
            unitAllocated: unitAllocated,
            componentAllocated: componentAllocated,
            capacity: template.grossArea
          });
        }
        
        // Get unit type counts across all floors
        const unitCounts: Record<string, number> = {};
        
        for (const product of products) {
          for (const unitType of product.unitTypes) {
            unitCounts[unitType.unitType] = 0;
            
            // Sum quantities across all floors
            for (const floor of floors) {
              const quantity = await getUnitAllocation(floor.id, unitType.id);
              unitCounts[unitType.unitType] += quantity;
            }
          }
        }
        
        const unitSummary = Object.entries(unitCounts).map(([unitType, count]) => ({
          unitType,
          count
        }));
        
        // Calculate component type summary
        const componentTypes: Record<string, {area: number, percentage: number}> = {};
        let totalBuildingArea = 0;
        
        // First calculate total building area
        for (const floor of floors) {
          const template = getFloorTemplateById(floor.templateId);
          if (template) {
            totalBuildingArea += template.grossArea;
          }
        }
        
        // Then calculate component areas by type
        for (const floor of floors) {
          const template = getFloorTemplateById(floor.templateId);
          if (!template) continue;
          
          const floorArea = template.grossArea;
          const floorComponents = getComponentsByFloorId(floor.id);
          
          for (const component of floorComponents) {
            const area = calculateComponentArea(component, floorArea);
            
            if (!componentTypes[component.componentType]) {
              componentTypes[component.componentType] = { area: 0, percentage: 0 };
            }
            
            componentTypes[component.componentType].area += area;
          }
        }
        
        // Calculate percentages
        if (totalBuildingArea > 0) {
          for (const type in componentTypes) {
            componentTypes[type].percentage = (componentTypes[type].area / totalBuildingArea) * 100;
          }
        }
        
        const componentTypeSummary = Object.entries(componentTypes).map(([componentType, data]) => ({
          componentType,
          area: data.area,
          percentage: data.percentage
        }));
        
        setFloorUtilizations(utilizations);
        setUnitTypeCounts(unitSummary);
        setComponentSummary(componentTypeSummary);
        setLastRefreshed(new Date());
      } catch (error) {
        console.error("Error fetching building summary data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (floors.length > 0) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [floors, products, buildingComponents, getFloorTemplateById, getUnitAllocation, getComponentsByFloorId, calculateComponentArea]);
  
  // Template usage stats
  const templateUsage = useMemo(() => {
    const usage: Record<string, TemplateUsage> = {};
    
    for (const floor of floors) {
      const template = getFloorTemplateById(floor.templateId);
      if (!template) continue;
      
      if (!usage[template.id]) {
        usage[template.id] = {
          templateId: template.id,
          templateName: template.name,
          count: 0,
          area: 0
        };
      }
      
      usage[template.id].count += 1;
      usage[template.id].area += template.grossArea;
    }
    
    return Object.values(usage);
  }, [floors, getFloorTemplateById]);
  
  // Building stats
  const buildingStats = useMemo(() => {
    const totalFloors = floors.length;
    
    const totalArea = floorUtilizations.reduce((sum, floor) => sum + floor.capacity, 0);
    
    const totalUnitArea = floorUtilizations.reduce((sum, floor) => sum + floor.unitAllocated, 0);
    
    const totalComponentArea = floorUtilizations.reduce((sum, floor) => sum + floor.componentAllocated, 0);
    
    const totalAllocated = totalUnitArea + totalComponentArea;
    
    const utilizationPercentage = totalArea > 0 ? (totalAllocated / totalArea) * 100 : 0;
    
    const efficiencyRatio = totalArea > 0 ? (totalUnitArea / totalArea) * 100 : 0;
    
    const overallocatedFloors = floorUtilizations
      .filter(floor => floor.utilization > 100)
      .sort((a, b) => a.position - b.position);
    
    const emptyFloors = floorUtilizations
      .filter(floor => floor.unitAllocated === 0 && floor.componentAllocated === 0)
      .sort((a, b) => a.position - b.position);
    
    return {
      totalFloors,
      totalArea,
      totalUnitArea,
      totalComponentArea,
      totalAllocated,
      utilizationPercentage,
      efficiencyRatio,
      overallocatedFloors,
      emptyFloors
    };
  }, [floors, floorUtilizations]);
  
  // Format number with commas
  const formatNumber = (num: number): string => {
    return Math.round(num).toLocaleString();
  };
  
  // Format date for last refreshed
  const formatDate = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Template breakdown as text
  const templateBreakdownText = useMemo(() => {
    if (templateUsage.length === 0) return "No templates used";
    
    const totalArea = templateUsage.reduce((sum, template) => sum + template.area, 0);
    
    return templateUsage
      .map(template => {
        const percentage = totalArea > 0 
          ? Math.round((template.area / totalArea) * 100)
          : 0;
        return `${percentage}% ${template.templateName}`;
      })
      .join(', ');
  }, [templateUsage]);
  
  // Unit type summary as text
  const unitSummaryText = useMemo(() => {
    if (unitTypeCounts.length === 0) return "No units allocated";
    
    return unitTypeCounts
      .filter(unit => unit.count > 0)
      .map(unit => `${unit.count} ${unit.unitType}`)
      .join(', ');
  }, [unitTypeCounts]);

  // Component type summary as text
  const componentSummaryText = useMemo(() => {
    if (componentSummary.length === 0) return "No building components allocated";
    
    return componentSummary
      .map(comp => `${formatNumber(comp.area)} sf ${comp.componentType} (${comp.percentage.toFixed(1)}%)`)
      .join(', ');
  }, [componentSummary]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Building Summary</span>
          <span className="text-xs text-gray-500 font-normal">
            Last updated: {formatDate(lastRefreshed)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading summary data...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Total Floors</div>
                <div className="text-2xl font-semibold">{buildingStats.totalFloors}</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Total Building Area</div>
                <div className="text-2xl font-semibold">{formatNumber(buildingStats.totalArea)} sf</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Total Allocated Area</div>
                <div className="text-2xl font-semibold">
                  {formatNumber(buildingStats.totalAllocated)} sf
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    ({buildingStats.utilizationPercentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Rentable: {formatNumber(buildingStats.totalUnitArea)} sf ({buildingStats.efficiencyRatio.toFixed(1)}%)
                </div>
                <div className="text-xs text-gray-500">
                  Non-rentable: {formatNumber(buildingStats.totalComponentArea)} sf
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Unit Count</div>
                <div className="text-lg font-semibold truncate">{unitSummaryText}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium mb-2">Template Breakdown</div>
                <div className="text-sm">{templateBreakdownText}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-2">Building Efficiency</div>
                <div className="text-sm font-semibold">
                  {buildingStats.efficiencyRatio.toFixed(1)}% 
                  <span className="font-normal text-gray-500 ml-1">(rentable ÷ total)</span>
                </div>
              </div>
            </div>
            
            {componentSummary.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Building Components</div>
                <div className="text-sm">{componentSummaryText}</div>
              </div>
            )}
            
            {buildingStats.overallocatedFloors.length > 0 && (
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Over-allocated Floors</AlertTitle>
                <AlertDescription>
                  Floors {buildingStats.overallocatedFloors.map(f => f.position).join(', ')} have utilization over 100%
                </AlertDescription>
              </Alert>
            )}
            
            {buildingStats.emptyFloors.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Empty Floors</AlertTitle>
                <AlertDescription>
                  Floors {buildingStats.emptyFloors.map(f => f.position).join(', ')} have no unit or component allocations
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BuildingSummaryPanel;
