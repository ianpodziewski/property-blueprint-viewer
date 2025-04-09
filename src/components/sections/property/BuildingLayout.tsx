
import { useState } from "react";
import { useModel } from "@/context/ModelContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Trash, ArrowUp, ArrowDown, PlusCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const formatNumber = (num: number | undefined): string => {
  return num === undefined || isNaN(num) ? "0" : num.toLocaleString('en-US');
};

const BuildingLayout = () => {
  const { property, setHasUnsavedChanges } = useModel();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedFloors, setExpandedFloors] = useState<string[]>([]);
  
  const handleAddFloor = () => {
    property.addFloor();
    setHasUnsavedChanges(true);
  };
  
  const handleDeleteFloor = (id: string) => {
    property.deleteFloor(id);
    setHasUnsavedChanges(true);
    // Remove from expanded floors if it was expanded
    setExpandedFloors(prev => prev.filter(floorId => floorId !== id));
  };
  
  const handleMoveFloor = (id: string, direction: 'up' | 'down') => {
    const floorIndex = property.floors.findIndex(f => f.id === id);
    if (floorIndex === -1) return;
    
    const newFloors = [...property.floors];
    const currentPosition = newFloors[floorIndex].position;
    
    if (direction === 'up' && floorIndex < property.floors.length - 1) {
      // Swap positions with the floor above
      const nextFloorIndex = floorIndex + 1;
      const nextPosition = newFloors[nextFloorIndex].position;
      
      property.updateFloor(id, { position: nextPosition });
      property.updateFloor(newFloors[nextFloorIndex].id, { position: currentPosition });
    } else if (direction === 'down' && floorIndex > 0) {
      // Swap positions with the floor below
      const prevFloorIndex = floorIndex - 1;
      const prevPosition = newFloors[prevFloorIndex].position;
      
      property.updateFloor(id, { position: prevPosition });
      property.updateFloor(newFloors[prevFloorIndex].id, { position: currentPosition });
    }
    
    setHasUnsavedChanges(true);
  };
  
  const handleTemplateChange = (floorId: string, templateId: string) => {
    property.updateFloor(floorId, { templateId });
    setHasUnsavedChanges(true);
  };
  
  const handleLabelChange = (floorId: string, label: string) => {
    property.updateFloor(floorId, { label });
    setHasUnsavedChanges(true);
  };
  
  const toggleFloorExpansion = (floorId: string) => {
    setExpandedFloors(prev => {
      const isExpanded = prev.includes(floorId);
      return isExpanded 
        ? prev.filter(id => id !== floorId) 
        : [...prev, floorId];
    });
  };
  
  // Sort floors by position
  const sortedFloors = [...property.floors].sort((a, b) => b.position - a.position);
  
  // Calculate total area and floor count
  const totalArea = sortedFloors.reduce((sum, floor) => {
    const template = property.getFloorTemplateById(floor.templateId);
    return sum + (template?.grossArea || 0);
  }, 0);
  
  return (
    <>
      <Collapsible
        open={!isCollapsed}
        onOpenChange={setIsCollapsed}
        className="w-full space-y-2 mt-8"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Building Layout</h3>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
              {isCollapsed ? "+" : "-"}
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent className="pt-2">
          <div className="text-sm text-gray-500 mb-4">
            Configure your building's floors and assign units
          </div>
          
          {sortedFloors.length === 0 ? (
            <Card className="bg-gray-50 border border-dashed border-gray-200">
              <CardContent className="py-6 flex flex-col items-center justify-center text-center">
                <p className="text-gray-500 mb-4">No floors added yet</p>
                <Button variant="outline" size="sm" onClick={handleAddFloor}>
                  <PlusCircle className="h-4 w-4 mr-1" /> Add your first floor
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 mb-4">
              {sortedFloors.map((floor) => (
                <Card key={floor.id} className="bg-white">
                  <CardContent className="py-4 px-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center justify-between">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                          <div>
                            <Label htmlFor={`floor-label-${floor.id}`} className="text-sm">Floor Label</Label>
                            <Input
                              id={`floor-label-${floor.id}`}
                              value={floor.label}
                              onChange={(e) => handleLabelChange(floor.id, e.target.value)}
                              placeholder="Enter floor label"
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`floor-template-${floor.id}`} className="text-sm">Template</Label>
                            <Select 
                              value={floor.templateId} 
                              onValueChange={(value) => handleTemplateChange(floor.id, value)}
                            >
                              <SelectTrigger id={`floor-template-${floor.id}`} className="mt-1">
                                <SelectValue placeholder="Select a template" />
                              </SelectTrigger>
                              <SelectContent>
                                {property.floorPlateTemplates.map((template) => (
                                  <SelectItem key={template.id} value={template.id}>
                                    {template.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label className="text-sm">Floor Area</Label>
                            <div className="h-10 px-4 flex items-center border rounded-md mt-1 bg-gray-50">
                              {formatNumber(property.getFloorTemplateById(floor.templateId)?.grossArea)} sf
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 ml-2 mt-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleMoveFloor(floor.id, 'up')}
                            disabled={floor.position === Math.max(...property.floors.map(f => f.position))}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleMoveFloor(floor.id, 'down')}
                            disabled={floor.position === Math.min(...property.floors.map(f => f.position))}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteFloor(floor.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => toggleFloorExpansion(floor.id)}
                          >
                            {expandedFloors.includes(floor.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      {expandedFloors.includes(floor.id) && (
                        <div className="mt-4 border-t pt-4">
                          <h4 className="text-sm font-medium mb-2">Unit Allocation</h4>
                          <p className="text-sm text-gray-500">Unit allocation will be added in the next step</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddFloor}
            className="mt-2"
          >
            <PlusCircle className="h-4 w-4 mr-1" /> Add Floor
          </Button>
          
          {sortedFloors.length > 0 && (
            <Card className="mt-4 bg-blue-50">
              <CardContent className="py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Total Floors</Label>
                    <p className="mt-1">{sortedFloors.length}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Total Building Area</Label>
                    <p className="mt-1">{formatNumber(totalArea)} sf</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CollapsibleContent>
      </Collapsible>
    </>
  );
};

export default BuildingLayout;
