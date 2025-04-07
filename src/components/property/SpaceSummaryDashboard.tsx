
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface SpaceSummary {
  totalBuildableArea: number;
  totalAllocatedArea: number;
  spaceBreakdown: {
    type: string;
    squareFootage: number;
    percentage: number;
  }[];
  issues: {
    type: string;
    message: string;
    severity: 'warning' | 'error';
  }[];
}

const SpaceSummaryDashboard = ({ 
  totalBuildableArea,
  totalAllocatedArea,
  spaceBreakdown,
  issues
}: SpaceSummary) => {
  const unallocatedArea = totalBuildableArea - totalAllocatedArea;
  const unallocatedPercentage = totalBuildableArea > 0 
    ? (unallocatedArea / totalBuildableArea) * 100 
    : 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Space Summary Dashboard</CardTitle>
        <CardDescription>Overview of space allocation and potential issues</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Space Allocation Overview */}
        <div>
          <h3 className="text-lg font-medium mb-3">Space Allocation</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Buildable Area:</span>
              <span className="font-medium">{totalBuildableArea.toLocaleString()} sq ft</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Allocated Area:</span>
              <span className="font-medium">{totalAllocatedArea.toLocaleString()} sq ft</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Unallocated Area:</span>
              <span className={`font-medium ${unallocatedArea !== 0 ? 'text-amber-600' : 'text-green-600'}`}>
                {unallocatedArea.toLocaleString()} sq ft ({unallocatedPercentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
        
        {/* Space Type Breakdown */}
        <div>
          <h3 className="text-lg font-medium mb-3">Usage Breakdown</h3>
          <div className="space-y-2">
            {spaceBreakdown.map((space, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 text-sm">
                <span>{space.type}</span>
                <span className="text-right">{space.squareFootage.toLocaleString()} sq ft</span>
                <span className="text-right">{space.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Validation Issues */}
        <div>
          <h3 className="text-lg font-medium mb-3">Validation</h3>
          {issues.length === 0 ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>No issues detected</span>
            </div>
          ) : (
            <div className="space-y-2">
              {issues.map((issue, index) => (
                <Alert key={index} variant={issue.severity === 'error' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{issue.type}</AlertTitle>
                  <AlertDescription>{issue.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpaceSummaryDashboard;
