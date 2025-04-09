
import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Floor, FloorPlateTemplate, Product } from '@/hooks/usePropertyState';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface BuildingSummaryPanelProps {
  floors: Floor[];
  templates: FloorPlateTemplate[];
  products: Product[];
  getFloorTemplateById: (id: string) => FloorPlateTemplate | undefined;
  getUnitAllocation: (floorId: string, unitTypeId: string) => Promise<number>;
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

interface FloorUtilization {
  floorId: string;
  position: number;
  utilization: number;
  allocated: number;
  capacity: number;
}

const BuildingSummaryPanel: React.FC<BuildingSummaryPanelProps> = ({
  floors,
  templates,
  products,
  getFloorTemplateById,
  getUnitAllocation
}) => {
  const [floorUtilizations, setFloorUtilizations] = useState<FloorUtilization[]>([]);
  const [unitTypeCounts, setUnitTypeCounts] = useState<UnitTypeSummary[]>([]);
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
          
          let allocatedArea = 0;
          
          // Calculate allocated area
          for (const product of products) {
            for (const unitType of product.unitTypes) {
              const quantity = await getUnitAllocation(floor.id, unitType.id);
              allocatedArea += quantity * unitType.grossArea;
            }
          }
          
          utilizations.push({
            floorId: floor.id,
            position: floor.position,
            utilization: template.grossArea > 0 ? (allocatedArea / template.grossArea) * 100 : 0,
            allocated: allocatedArea,
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
        
        setFloorUtilizations(utilizations);
        setUnitTypeCounts(unitSummary);
        setLastRefreshed(new Date());
      } catch (error) {
        console.error("Error fetching building summary data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (floors.length > 0 && products.length > 0) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [floors, products, getFloorTemplateById, getUnitAllocation]);
  
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
    
    const totalAllocated = floorUtilizations.reduce((sum, floor) => sum + floor.allocated, 0);
    
    const utilizationPercentage = totalArea > 0 ? (totalAllocated / totalArea) * 100 : 0;
    
    const overallocatedFloors = floorUtilizations
      .filter(floor => floor.utilization > 100)
      .sort((a, b) => a.position - b.position);
    
    const emptyFloors = floorUtilizations
      .filter(floor => floor.allocated === 0)
      .sort((a, b) => a.position - b.position);
    
    return {
      totalFloors,
      totalArea,
      totalAllocated,
      utilizationPercentage,
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
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Unit Count</div>
                <div className="text-lg font-semibold truncate">{unitSummaryText}</div>
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium mb-2">Template Breakdown</div>
              <div className="text-sm">{templateBreakdownText}</div>
            </div>
            
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
                  Floors {buildingStats.emptyFloors.map(f => f.position).join(', ')} have no unit allocations
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
