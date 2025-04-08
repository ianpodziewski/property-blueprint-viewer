
import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Copy, Trash, ChevronUp, ChevronDown, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FloorConfiguration, FloorPlateTemplate, SpaceDefinition } from "@/types/propertyTypes";
import { useToast } from "@/hooks/use-toast";
import ExpandableFloorRow from "./ExpandableFloorRow";

interface FloorConfigurationManagerEnhancedProps {
  floorConfigurations: FloorConfiguration[];
  floorTemplates: FloorPlateTemplate[];
  updateFloorConfiguration: (floorNumber: number, field: keyof FloorConfiguration, value: any) => void;
  copyFloorConfiguration: (sourceFloorNumber: number, targetFloorNumbers: number[]) => void;
  bulkEditFloorConfigurations: (floorNumbers: number[], field: keyof FloorConfiguration, value: any) => void;
  updateFloorSpaces: (floorNumber: number, spaces: SpaceDefinition[]) => void;
  addFloors: (count: number, isUnderground: boolean, templateId: string | null, position: "top" | "bottom" | "specific", specificPosition?: number, numberingPattern?: "consecutive" | "skip" | "custom", customNumbering?: number[]) => void;
  removeFloors: (floorNumbers: number[]) => void;
  reorderFloor: (floorNumber: number, direction: "up" | "down") => void;
  addFloorTemplate: (template: Omit<FloorPlateTemplate, "id">) => void;
  updateFloorTemplate: (id: string, template: Partial<FloorPlateTemplate>) => void;
  removeFloorTemplate: (id: string) => void;
}

const getBadgeColorForUse = (useType: string): string => {
  switch (useType) {
    case "residential":
      return "bg-blue-50 text-blue-800";
    case "office":
      return "bg-green-50 text-green-800";
    case "retail":
      return "bg-amber-50 text-amber-800";
    case "parking":
      return "bg-gray-50 text-gray-800";
    case "hotel":
      return "bg-purple-50 text-purple-800";
    case "amenities":
      return "bg-pink-50 text-pink-800";
    case "storage":
      return "bg-yellow-50 text-yellow-800";
    case "mechanical":
      return "bg-slate-50 text-slate-800";
    default:
      return "bg-gray-50 text-gray-800";
  }
};

const FloorConfigurationManagerEnhanced = ({
  floorConfigurations,
  floorTemplates,
  updateFloorConfiguration,
  copyFloorConfiguration,
  bulkEditFloorConfigurations,
  updateFloorSpaces,
  addFloors,
  removeFloors,
  reorderFloor,
  addFloorTemplate,
  updateFloorTemplate,
  removeFloorTemplate
}: FloorConfigurationManagerEnhancedProps) => {
  const { toast } = useToast();
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [allSelected, setAllSelected] = useState(false);
  const [expandedFloors, setExpandedFloors] = useState<number[]>([]);

  const sortedFloors = [...floorConfigurations].sort((a, b) => {
    if (a.isUnderground && b.isUnderground) {
      return a.floorNumber - b.floorNumber;
    } else if (!a.isUnderground && !b.isUnderground) {
      return b.floorNumber - a.floorNumber;
    } else {
      return a.isUnderground ? 1 : -1;
    }
  });

  const handleRowSelection = useCallback((floorNumber: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedRows(prev => {
      if (prev.includes(floorNumber)) {
        return prev.filter(num => num !== floorNumber);
      } else {
        return [...prev, floorNumber];
      }
    });
  }, []);

  const handleSelectAll = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    if (allSelected || selectedRows.length === floorConfigurations.length) {
      setSelectedRows([]);
      setAllSelected(false);
    } else {
      setSelectedRows(floorConfigurations.map(floor => floor.floorNumber));
      setAllSelected(true);
    }
  }, [floorConfigurations, allSelected, selectedRows.length]);

  const toggleFloorExpand = useCallback((floorNumber: number) => {
    setExpandedFloors(prev => {
      if (prev.includes(floorNumber)) {
        return prev.filter(num => num !== floorNumber);
      } else {
        return [...prev, floorNumber];
      }
    });
  }, []);

  const handleDeleteClick = useCallback((floorNumber: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm(`Are you sure you want to delete Floor ${floorNumber}?`)) {
      removeFloors([floorNumber]);
      toast({
        title: "Floor removed",
        description: "The floor has been successfully removed."
      });
    }
  }, [removeFloors, toast]);

  const getTemplateName = useCallback((templateId: string | null) => {
    if (!templateId) return "Custom";
    const template = floorTemplates.find(t => t.id === templateId);
    return template ? template.name : "Unknown template";
  }, [floorTemplates]);

  const hasDetailedConfig = useCallback((floor: FloorConfiguration) => {
    return Boolean(floor.spaces && floor.spaces.length > 0);
  }, []);

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Floor Configuration</CardTitle>
            <CardDescription>Define your building's floor layout</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Manage Templates</Button>
            <Button><PlusCircle className="w-4 h-4 mr-1" /> Add Floors</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-0 border rounded-md">
            <div className="bg-gray-50 p-3 border-b flex items-center">
              <div className="w-12">
                <Checkbox 
                  checked={allSelected} 
                  onClick={(e: any) => handleSelectAll(e)}
                />
              </div>
              <div className="w-20">Floor</div>
              <div className="w-[180px]">Template</div>
              <div className="w-[140px] text-right">Floor Plate (sf)</div>
              <div className="w-[140px] text-center">Primary Use</div>
              <div className="w-20 text-center">Spaces</div>
              <div className="w-[120px] text-center">Actions</div>
            </div>
            
            {sortedFloors.map(floor => {
              const template = floorTemplates.find(t => t.id === floor.templateId);
              const floorArea = floor.customSquareFootage && floor.customSquareFootage !== "" 
                ? floor.customSquareFootage 
                : template?.squareFootage || "0";
              const spacesCount = floor.spaces?.length || 0;
              const isExpanded = expandedFloors.includes(floor.floorNumber);
              const hasDetailConfig = hasDetailedConfig(floor);
              
              return (
                <ExpandableFloorRow 
                  key={`floor-${floor.floorNumber}`}
                  floor={floor}
                  template={template}
                  isExpanded={isExpanded}
                  onToggleExpand={() => toggleFloorExpand(floor.floorNumber)}
                  hasDetailedConfig={hasDetailConfig}
                >
                  <div className="p-3 flex items-center">
                    <div className="w-12">
                      <Checkbox 
                        checked={selectedRows.includes(floor.floorNumber)}
                        onClick={(e: any) => handleRowSelection(floor.floorNumber, e)}
                      />
                    </div>
                    <div className="w-20 flex items-center">
                      <div className="mr-2">
                        {isExpanded ? 
                          <ChevronDown className="h-4 w-4 text-gray-500" /> :
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        }
                      </div>
                      <Badge variant={floor.isUnderground ? "outline" : "default"}>
                        {floor.floorNumber}
                      </Badge>
                    </div>
                    <div className="w-[180px]">
                      {floor.templateId ? (
                        getTemplateName(floor.templateId)
                      ) : (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                          Custom
                        </Badge>
                      )}
                    </div>
                    <div className="w-[140px] text-right">
                      {parseInt(floorArea).toLocaleString()} sf
                    </div>
                    <div className="w-[140px] text-center">
                      <Badge 
                        variant="outline" 
                        className={`capitalize ${getBadgeColorForUse(floor.primaryUse || "office")}`}
                      >
                        {floor.primaryUse || "office"}
                      </Badge>
                    </div>
                    <div className="w-20 text-center">
                      {spacesCount > 0 ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-800">
                          {spacesCount}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-600">
                          0
                        </Badge>
                      )}
                    </div>
                    <div className="w-[120px] text-center">
                      <div className="flex justify-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Open floor editor
                          }}
                          title="Edit floor"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => handleDeleteClick(floor.floorNumber, e)}
                          title="Delete floor"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </ExpandableFloorRow>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default FloorConfigurationManagerEnhanced;
