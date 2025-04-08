
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  PieChart
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Issue } from "@/types/propertyTypes";
import { useUnitAllocations } from "@/hooks/property/useUnitAllocations";
import { useUnitTypes } from "@/hooks/property/useUnitTypes";

interface SpaceBreakdownItem {
  type: string;
  squareFootage: number;
  percentage: number;
  color?: string;
}

interface SpaceSummaryDashboardProps {
  totalBuildableArea: number;
  totalAllocatedArea: number;
  spaceBreakdown: SpaceBreakdownItem[];
  issues: Issue[];
}

const SpaceSummaryDashboard: React.FC<SpaceSummaryDashboardProps> = ({
  totalBuildableArea,
  totalAllocatedArea,
  spaceBreakdown,
  issues
}) => {
  const { unitAllocations } = useUnitAllocations();
  const { unitTypes, getAllCategories } = useUnitTypes();
  
  // Calculate unit utilization by category
  const categoryUtilization = useMemo(() => {
    const categories = getAllCategories();
    const result: Record<string, { count: number, area: number }> = {};
    
    // Initialize result for each category
    categories.forEach(category => {
      result[category] = { count: 0, area: 0 };
    });
    
    // Process each allocation
    unitAllocations.forEach(allocation => {
      const unitType = unitTypes.find(ut => ut.id === allocation.unitTypeId);
      if (!unitType) return;
      
      const count = parseInt(allocation.count as string) || 0;
      const area = count * (parseInt(allocation.squareFootage as string) || 0);
      
      if (!result[unitType.category]) {
        result[unitType.category] = { count: 0, area: 0 };
      }
      
      result[unitType.category].count += count;
      result[unitType.category].area += area;
    });
    
    return result;
  }, [unitAllocations, unitTypes, getAllCategories]);
  
  // Calculate total unit allocation area
  const totalUnitArea = useMemo(() => {
    return Object.values(categoryUtilization).reduce((sum, { area }) => sum + area, 0);
  }, [categoryUtilization]);
  
  const utilization = totalBuildableArea > 0 
    ? Math.min((totalUnitArea / totalBuildableArea) * 100, 100) 
    : 0;
    
  const remainingArea = Math.max(totalBuildableArea - totalUnitArea, 0);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="text-lg font-medium flex items-center">
          <BarChart3 className="mr-2 h-5 w-5 text-muted-foreground" />
          Space Utilization Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <div className="space-y-6">
          {/* Overall Utilization */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-sm">Overall Utilization</h3>
              <span className="text-sm font-medium">
                {Math.round(utilization)}%
              </span>
            </div>
            <Progress value={utilization} className="h-2" />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Buildable</div>
                <div className="text-lg font-semibold mt-1">{totalBuildableArea.toLocaleString()} sf</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Remaining</div>
                <div className="text-lg font-semibold mt-1 text-green-600">{remainingArea.toLocaleString()} sf</div>
              </div>
            </div>
          </div>
          
          {/* Category Breakdown */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm mb-4">Category Breakdown</h3>
            {Object.entries(categoryUtilization)
              .filter(([_, { area }]) => area > 0)
              .sort((a, b) => b[1].area - a[1].area)
              .map(([category, { count, area }]) => {
                const percentage = totalUnitArea > 0 ? (area / totalUnitArea) * 100 : 0;
                const categoryColor = unitTypes.find(ut => ut.category === category)?.color || "#E5DEFF";
                
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: categoryColor }}
                        ></div>
                        <span className="text-sm">{category}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{count}</span> units / <span className="font-medium">{area.toLocaleString()}</span> sf
                      </div>
                    </div>
                    <Progress 
                      value={percentage} 
                      className="h-1.5" 
                      indicatorClassName={`bg-[${categoryColor}]`}
                    />
                  </div>
                );
              })
            }
          </div>
          
          {/* Status/Issues */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm mb-2">Status</h3>
            <div className="border rounded-md divide-y">
              {issues.length > 0 ? (
                issues.map((issue, index) => (
                  <div key={index} className="p-3 flex items-start">
                    {issue.severity === 'warning' ? (
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="text-sm font-medium">{issue.type}</div>
                      <div className="text-sm text-muted-foreground">{issue.message}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Space allocation looks good</div>
                    <div className="text-sm text-muted-foreground">
                      {totalUnitArea > 0 
                        ? `${totalUnitArea.toLocaleString()} sf allocated across ${unitAllocations.length} allocations`
                        : "No spaces allocated yet"
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpaceSummaryDashboard;
