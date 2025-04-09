
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, AlertCircle, FileSpreadsheet, Printer, 
  PieChart, Save, Clock, Share2, Download
} from "lucide-react";
import { BuildingSummary, BuildingWarning } from '@/hooks/usePropertyState';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie
} from 'recharts';

interface BuildingSummaryPanelProps {
  summary: BuildingSummary;
  lastSaved?: Date | null;
  hasUnsavedChanges: boolean;
  onExportCSV: () => void;
  onExportExcel: () => void;
  onPrint: () => void;
  onSaveNow: () => void;
}

const formatArea = (area: number): string => {
  return area.toLocaleString('en-US') + ' sf';
};

const formatPercentage = (percentage: number): string => {
  return percentage.toFixed(1) + '%';
};

const BuildingSummaryPanel: React.FC<BuildingSummaryPanelProps> = ({
  summary,
  lastSaved,
  hasUnsavedChanges,
  onExportCSV,
  onExportExcel,
  onPrint,
  onSaveNow
}) => {
  // Prepare data for unit type chart
  const unitTypeData = Object.entries(summary.unitTypeBreakdown).map(([unitType, count]) => ({
    name: unitType,
    value: count
  }));

  // Prepare data for floor template chart
  const templateData = Object.entries(summary.floorTemplateBreakdown).map(([template, count]) => ({
    name: template,
    value: count
  }));

  // Colors for charts
  const COLORS = ['#8B5CF6', '#D946EF', '#F97316', '#0EA5E9', '#10B981', '#A1A1AA'];

  return (
    <div className="space-y-6 mt-8 border-t pt-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-blue-700">Building Summary & Analytics</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          {lastSaved && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>
                Last saved: {lastSaved.toLocaleTimeString()} {lastSaved.toLocaleDateString()}
              </span>
            </div>
          )}
          {hasUnsavedChanges && (
            <div className="flex items-center text-amber-600 ml-4">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span>Unsaved changes</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onSaveNow} 
                className="ml-2 text-blue-600"
              >
                <Save className="h-3.5 w-3.5 mr-1" />
                Save Now
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Summary Metrics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Building Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Floors</div>
                <div className="text-2xl font-semibold">{summary.totalFloors}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Building Area</div>
                <div className="text-2xl font-semibold">{formatArea(summary.totalBuildingArea)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Allocated Area</div>
                <div className="text-2xl font-semibold">{formatArea(summary.totalAllocatedArea)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Utilization</div>
                <div className="text-2xl font-semibold">{formatPercentage(summary.allocationPercentage)}</div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-2">Units by Type</h4>
              <div className="space-y-2">
                {Object.entries(summary.unitTypeBreakdown).map(([unitType, count]) => (
                  <div key={unitType} className="flex justify-between text-sm">
                    <span>{unitType}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-2">Floors by Template</h4>
              <div className="space-y-2">
                {Object.entries(summary.floorTemplateBreakdown).map(([template, count]) => (
                  <div key={template} className="flex justify-between text-sm">
                    <span>{template}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Middle Column - Charts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Building Composition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-[180px]">
              <h4 className="text-sm font-medium mb-1 text-center">Unit Distribution</h4>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={unitTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {unitTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            <Separator />

            <div className="h-[180px]">
              <h4 className="text-sm font-medium mb-1 text-center">Floor Templates</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={templateData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <RechartsTooltip 
                    formatter={(value, name) => [`${value} floors`, 'Count']}
                  />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Warnings & Export */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Warnings & Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {summary.warnings.length === 0 ? (
                <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                  No issues detected with your building configuration
                </div>
              ) : (
                summary.warnings.map((warning, index) => (
                  <Alert 
                    key={index} 
                    variant={warning.severity === 'error' ? "destructive" : "default"}
                    className={warning.severity === 'error' ? "py-2" : "py-2 bg-amber-50 border-amber-200 text-amber-800"}
                  >
                    {warning.severity === 'error' ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    <AlertTitle className="text-sm font-medium">{warning.type === 'overallocated' ? 'Over-allocation' : 
                      warning.type === 'underutilized' ? 'Low Utilization' : 'Unit Distribution'}</AlertTitle>
                    <AlertDescription className="text-xs">
                      {warning.message}
                    </AlertDescription>
                  </Alert>
                ))
              )}
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-3">Export & Share</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex justify-start"
                  onClick={onExportCSV}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex justify-start"
                  onClick={onExportExcel}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex justify-start"
                  onClick={onPrint}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex justify-start"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BuildingSummaryPanel;
