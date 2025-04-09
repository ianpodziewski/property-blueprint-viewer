
import React, { useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Floor, FloorPlateTemplate, Product, UnitType } from '@/hooks/usePropertyState';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, CheckCircle, Clock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToCsv, exportToExcel } from '@/utils/exportUtils';

export interface BuildingSummary {
  // Building metrics
  totalFloors: number;
  totalBuildingArea: number;
  totalAllocatedArea: number;
  allocationPercentage: number;
  unitsByType: Record<string, number>;
  totalUnits: number;
  
  // Template usage
  templateUsage: {
    name: string;
    area: number;
    count: number;
    percentage: number;
  }[];
  
  // Warnings
  overAllocatedFloors: {
    floorId: string;
    label: string;
    percentage: number;
  }[];
  underUtilizedFloors: {
    floorId: string;
    label: string;
    percentage: number;
  }[];
  excessiveUnitTypes: {
    unitType: string;
    count: number;
    percentage: number;
  }[];
  
  // Last saved
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

interface BuildingSummaryPanelProps {
  summary: BuildingSummary;
  floors: Floor[];
  templates: FloorPlateTemplate[];
  products: Product[];
  unitAllocations: Record<string, Record<string, number>>;
  onExportCsv: () => void;
  onExportExcel: () => void;
}

// Custom colors for charts
const CHART_COLORS = [
  '#4299E1', // blue-400
  '#ED64A6', // pink-400
  '#48BB78', // green-400
  '#ECC94B', // yellow-400
  '#9F7AEA', // purple-400
  '#F56565', // red-400
  '#38B2AC', // teal-400
  '#F6AD55', // orange-400
];

const BuildingSummaryPanel: React.FC<BuildingSummaryPanelProps> = ({
  summary,
  floors,
  templates,
  products,
  unitAllocations,
  onExportCsv,
  onExportExcel
}) => {
  const pieChartData = useMemo(() => {
    return summary.templateUsage.map((usage, index) => ({
      name: usage.name,
      value: usage.area,
      count: usage.count,
      percentage: usage.percentage,
    }));
  }, [summary.templateUsage]);

  const unitTypeData = useMemo(() => {
    return Object.entries(summary.unitsByType).map(([type, count], index) => ({
      name: type,
      count,
      percentage: (count / summary.totalUnits) * 100
    }));
  }, [summary.unitsByType, summary.totalUnits]);

  return (
    <Card className="mt-6 mb-2">
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <CardTitle className="text-xl font-bold text-blue-700">Building Summary & Analytics</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onExportCsv}>
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={onExportExcel}>
            <Download className="h-4 w-4 mr-1" /> Export Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="warnings">Warnings {summary.overAllocatedFloors.length + summary.underUtilizedFloors.length + summary.excessiveUnitTypes.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                {summary.overAllocatedFloors.length + summary.underUtilizedFloors.length + summary.excessiveUnitTypes.length}
              </Badge>
            )}</TabsTrigger>
          </TabsList>
        
          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Building Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-blue-50 p-3">
                      <p className="text-sm text-gray-500">Total Floors</p>
                      <p className="text-2xl font-bold text-blue-700">{summary.totalFloors}</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-3">
                      <p className="text-sm text-gray-500">Total Building Area</p>
                      <p className="text-2xl font-bold text-blue-700">{summary.totalBuildingArea.toLocaleString()} sf</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-3">
                      <p className="text-sm text-gray-500">Total Allocated Area</p>
                      <p className="text-2xl font-bold text-blue-700">{summary.totalAllocatedArea.toLocaleString()} sf</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-3">
                      <p className="text-sm text-gray-500">Allocation Percentage</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-blue-700">{summary.allocationPercentage.toFixed(1)}%</p>
                        <div className="flex-1">
                          <Progress value={summary.allocationPercentage} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Units by Type</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {Object.entries(summary.unitsByType).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-medium">{type}</span>
                        <Badge variant="outline">{count} units</Badge>
                      </div>
                    ))}
                    <div className="flex justify-between items-center p-2 bg-blue-100 rounded font-semibold">
                      <span>Total Units</span>
                      <Badge>{summary.totalUnits} units</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-2 text-sm">
                  {summary.lastSaved ? (
                    <div className="flex items-center text-gray-500">
                      <Clock className="h-4 w-4 mr-1" /> 
                      Last saved: {summary.lastSaved.toLocaleTimeString()}
                    </div>
                  ) : (
                    <div className="flex items-center text-yellow-600">
                      <AlertTriangle className="h-4 w-4 mr-1" /> 
                      Not saved yet
                    </div>
                  )}
                  
                  {summary.hasUnsavedChanges && (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">
                      <AlertCircle className="h-3 w-3 mr-1" /> Unsaved changes
                    </Badge>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Floor Template Usage</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={1}
                        dataKey="value"
                        label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`${Number(value).toLocaleString()} sf`, name]}
                        labelFormatter={() => ''}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Template Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={summary.templateUsage}
                      margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} floors`, 'Count']} />
                      <Bar dataKey="count" fill="#4299E1">
                        {summary.templateUsage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Unit Type Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={unitTypeData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} units`, 'Count']} />
                      <Bar dataKey="count" fill="#4299E1">
                        {unitTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-2">Floor Allocation Efficiency</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={floors.map(floor => {
                        const template = templates.find(t => t.id === floor.templateId);
                        const floorArea = template?.grossArea || 0;
                        
                        // Calculate allocated area for this floor
                        let allocatedArea = 0;
                        if (unitAllocations[floor.id]) {
                          Object.entries(unitAllocations[floor.id]).forEach(([unitTypeId, count]) => {
                            const unit = products.flatMap(p => p.unitTypes).find(u => u.id === unitTypeId);
                            if (unit) {
                              allocatedArea += unit.grossArea * count;
                            }
                          });
                        }
                        
                        const efficiencyPercentage = floorArea > 0 ? (allocatedArea / floorArea) * 100 : 0;
                        
                        return {
                          name: floor.label,
                          efficiency: Math.min(efficiencyPercentage, 100),
                          overAllocation: efficiencyPercentage > 100 ? efficiencyPercentage - 100 : 0
                        };
                      })}
                      margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" width={80} />
                      <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Allocation']} />
                      <Bar dataKey="efficiency" fill="#48BB78" stackId="a" />
                      <Bar dataKey="overAllocation" fill="#F56565" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="warnings" className="mt-0">
            <div className="space-y-6">
              {summary.overAllocatedFloors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Over-allocated Floors</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">The following floors have allocated more space than available:</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                      {summary.overAllocatedFloors.map(floor => (
                        <div key={floor.floorId} className="flex justify-between items-center p-2 bg-red-50 rounded">
                          <span className="font-medium">{floor.label}</span>
                          <Badge variant="destructive">{floor.percentage.toFixed(1)}% allocated</Badge>
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              {summary.underUtilizedFloors.length > 0 && (
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Under-utilized Floors</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">The following floors are significantly under-utilized:</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                      {summary.underUtilizedFloors.map(floor => (
                        <div key={floor.floorId} className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                          <span className="font-medium">{floor.label}</span>
                          <Badge variant="outline" className="bg-yellow-50">
                            Only {floor.percentage.toFixed(1)}% allocated
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              {summary.excessiveUnitTypes.length > 0 && (
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Excessive Unit Allocations</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">The following unit types have unusually high allocations:</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                      {summary.excessiveUnitTypes.map(unit => (
                        <div key={unit.unitType} className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                          <span className="font-medium">{unit.unitType}</span>
                          <Badge variant="outline" className="bg-yellow-50">
                            {unit.count} units ({unit.percentage.toFixed(1)}%)
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              {summary.overAllocatedFloors.length === 0 && 
               summary.underUtilizedFloors.length === 0 && 
               summary.excessiveUnitTypes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium text-green-700">No Issues Detected</h3>
                  <p className="text-gray-500 mt-2">Your building configuration looks good!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BuildingSummaryPanel;
