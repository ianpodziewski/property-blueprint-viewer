
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Floor, FloorPlateTemplate, Product } from '@/hooks/usePropertyState';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NonRentableAllocation } from '@/hooks/useSupabasePropertyData';

interface BuildingSummaryPanelProps {
  floors: Floor[];
  templates: FloorPlateTemplate[];
  products: Product[];
  getFloorTemplateById: (id: string) => FloorPlateTemplate | undefined;
  getUnitAllocation: (floorId: string, unitTypeId: string) => Promise<number>;
  nonRentableAllocations?: NonRentableAllocation[];
}

const BuildingSummaryPanel: React.FC<BuildingSummaryPanelProps> = ({
  floors,
  templates,
  products,
  getFloorTemplateById,
  getUnitAllocation,
  nonRentableAllocations = []
}) => {
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [unitStats, setUnitStats] = useState<{
    total: number;
    allocated: number;
  }>({
    total: 0,
    allocated: 0
  });
  
  const [areaStats, setAreaStats] = useState<{
    total: number;
    allocated: number;
    nonRentable: number;
  }>({
    total: 0,
    allocated: 0,
    nonRentable: 0
  });
  
  // Calculate total non-rentable area
  const totalNonRentableArea = useMemo(() => {
    return nonRentableAllocations.reduce((total, allocation) => {
      return total + allocation.squareFootage;
    }, 0);
  }, [nonRentableAllocations]);
  
  useEffect(() => {
    const calculateBuildingStats = async () => {
      if (floors.length === 0 || products.length === 0) return;
      
      setIsLoadingStats(true);
      
      try {
        let totalGrossArea = 0;
        let totalAllocatedArea = 0;
        let totalUnits = 0;
        let totalAllocatedUnits = 0;
        
        // Calculate gross area of all floors
        for (const floor of floors) {
          const template = getFloorTemplateById(floor.templateId);
          if (template) {
            totalGrossArea += template.grossArea;
          }
        }
        
        // Calculate allocated unit area and unit counts
        for (const product of products) {
          for (const unitType of product.unitTypes) {
            totalUnits += unitType.numberOfUnits;
            
            for (const floor of floors) {
              const allocation = await getUnitAllocation(floor.id, unitType.id);
              totalAllocatedUnits += allocation;
              totalAllocatedArea += allocation * unitType.grossArea;
            }
          }
        }
        
        // Add non-rentable area to total allocated area
        totalAllocatedArea += totalNonRentableArea;
        
        setUnitStats({
          total: totalUnits,
          allocated: totalAllocatedUnits
        });
        
        setAreaStats({
          total: totalGrossArea,
          allocated: totalAllocatedArea,
          nonRentable: totalNonRentableArea
        });
      } catch (error) {
        console.error("Error calculating building stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };
    
    calculateBuildingStats();
  }, [floors, products, getFloorTemplateById, getUnitAllocation, totalNonRentableArea]);
  
  const buildingUtilization = areaStats.total > 0 
    ? (areaStats.allocated / areaStats.total) * 100 
    : 0;
  
  const unitUtilization = unitStats.total > 0 
    ? (unitStats.allocated / unitStats.total) * 100 
    : 0;
    
  const getProgressVariant = (value: number) => {
    if (value >= 80) return "green";
    if (value >= 50) return "yellow";
    return "red";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Building Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium mb-4">Area Utilization</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Total Area</TableCell>
                  <TableCell className="text-right">{areaStats.total.toLocaleString()} sf</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center cursor-help">
                          <span>Allocated Area</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 text-gray-500">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                          </svg>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Total allocated space includes:</p>
                          <ul className="mt-1 text-xs">
                            <li>• Unit allocations: {(areaStats.allocated - areaStats.nonRentable).toLocaleString()} sf</li>
                            <li>• Non-rentable space: {areaStats.nonRentable.toLocaleString()} sf</li>
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-right">{areaStats.allocated.toLocaleString()} sf</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Non-Rentable Space</TableCell>
                  <TableCell className="text-right">{areaStats.nonRentable.toLocaleString()} sf</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Remaining Unallocated</TableCell>
                  <TableCell className="text-right">{Math.max(0, areaStats.total - areaStats.allocated).toLocaleString()} sf</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Building Utilization</span>
                <span>{buildingUtilization.toFixed(1)}%</span>
              </div>
              <Progress 
                value={buildingUtilization} 
                variant={getProgressVariant(buildingUtilization)}
                size="md"
              />
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-4">Unit Utilization</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Total Units</TableCell>
                  <TableCell className="text-right">{unitStats.total}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Allocated Units</TableCell>
                  <TableCell className="text-right">{unitStats.allocated}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Remaining Unallocated</TableCell>
                  <TableCell className="text-right">{Math.max(0, unitStats.total - unitStats.allocated)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Unit Utilization</span>
                <span>{unitUtilization.toFixed(1)}%</span>
              </div>
              <Progress 
                value={unitUtilization} 
                variant={getProgressVariant(unitUtilization)}
                size="md"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BuildingSummaryPanel;
