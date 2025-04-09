
import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Layers, AlertTriangle, Clock } from "lucide-react";
import { Floor, FloorPlateTemplate } from "@/hooks/usePropertyState";

interface BuildingSummaryPanelProps {
  floors: Floor[];
  getFloorTemplateById: (templateId: string) => FloorPlateTemplate | undefined;
  lastSavedTime: Date | null;
}

const BuildingSummaryPanel: React.FC<BuildingSummaryPanelProps> = ({
  floors,
  getFloorTemplateById,
  lastSavedTime
}) => {
  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    // Floors with missing templates
    const floorsWithoutTemplates = floors.filter(
      floor => !getFloorTemplateById(floor.templateId)
    );
    
    // Total building area
    let totalBuildingArea = 0;
    let totalFloorCount = floors.length;
    
    // Template breakdown
    const templateUsage: Record<string, { count: number; area: number; name: string }> = {};
    
    // Process each floor
    floors.forEach(floor => {
      const template = getFloorTemplateById(floor.templateId);
      
      if (template) {
        // Add to total area
        totalBuildingArea += template.grossArea;
        
        // Add to template usage
        if (!templateUsage[template.id]) {
          templateUsage[template.id] = {
            count: 0,
            area: 0,
            name: template.name
          };
        }
        
        templateUsage[template.id].count += 1;
        templateUsage[template.id].area += template.grossArea;
      }
    });
    
    // Convert template usage to percentages
    const templateBreakdown = Object.values(templateUsage).map(template => ({
      name: template.name,
      percentage: totalBuildingArea > 0 
        ? Math.round((template.area / totalBuildingArea) * 100) 
        : 0,
      count: template.count
    }));
    
    return {
      totalFloorCount,
      totalBuildingArea,
      floorsWithoutTemplates,
      templateBreakdown
    };
  }, [floors, getFloorTemplateById]);
  
  // Format the last saved time
  const formattedLastSaved = lastSavedTime
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(lastSavedTime)
    : 'Not saved yet';

  return (
    <Card className="bg-gray-50/50">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Building Metrics */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-500" />
              Building Metrics
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Floors:</span>
                <span className="text-sm font-medium">{summaryMetrics.totalFloorCount}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Building Area:</span>
                <span className="text-sm font-medium">
                  {summaryMetrics.totalBuildingArea.toLocaleString()} sf
                </span>
              </div>
              
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm text-gray-600">Last Updated:</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-500" />
                  {formattedLastSaved}
                </span>
              </div>
            </div>
          </div>
          
          {/* Template Breakdown */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Template Distribution</h3>
            
            <div className="space-y-2">
              {summaryMetrics.templateBreakdown.length > 0 ? (
                summaryMetrics.templateBreakdown.map((template, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      {template.name} ({template.count} floors):
                    </span>
                    <span className="text-sm font-medium">{template.percentage}%</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No templates assigned</div>
              )}
            </div>
          </div>
          
          {/* Warnings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Warnings
            </h3>
            
            <div className="space-y-2">
              {summaryMetrics.floorsWithoutTemplates.length > 0 ? (
                <Alert variant="warning" className="py-2">
                  <AlertTitle className="text-xs font-medium">Missing Templates</AlertTitle>
                  <AlertDescription className="text-xs">
                    {summaryMetrics.floorsWithoutTemplates.length} floor(s) have no template assigned
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="text-sm text-green-600">No warnings detected</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BuildingSummaryPanel;
