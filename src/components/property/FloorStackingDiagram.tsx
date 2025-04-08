
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Info, Edit, Copy } from "lucide-react";

interface Space {
  id: string;
  type: string;
  squareFootage: number;
  percentage: number;
}

interface Floor {
  floorNumber: number;
  spaces: Space[];
  isUnderground?: boolean;
}

interface FloorTemplate {
  id: string;
  name: string;
  squareFootage: string;
  floorToFloorHeight: string;
  efficiencyFactor: string;
  corePercentage: string;
}

interface FloorConfiguration {
  floorNumber: number;
  isUnderground: boolean;
  templateId: string | null;
  customSquareFootage: string;
  floorToFloorHeight: string;
  efficiencyFactor: string;
  corePercentage: string;
  primaryUse: string;
  secondaryUse: string | null;
  secondaryUsePercentage: string;
}

interface FloorStackingDiagramProps {
  floors: Floor[];
  spaceTypeColors: Record<string, string>;
  floorTemplates: FloorTemplate[];
  floorConfigurations: FloorConfiguration[];
  updateFloorConfiguration: (
    floorNumber: number, 
    field: keyof FloorConfiguration, 
    value: string | null | boolean
  ) => void;
  copyFloorConfiguration: (sourceFloorNumber: number, targetFloorNumber: number) => void;
  bulkEditFloorConfigurations: (
    floorNumbers: number[], 
    field: keyof FloorConfiguration, 
    value: string | null | boolean
  ) => void;
}

const FloorStackingDiagram = ({ 
  floors, 
  spaceTypeColors,
  floorTemplates,
  floorConfigurations,
  updateFloorConfiguration,
  copyFloorConfiguration,
  bulkEditFloorConfigurations
}: FloorStackingDiagramProps) => {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedFloors, setSelectedFloors] = useState<number[]>([]);
  const [copyToFloorNumber, setCopyToFloorNumber] = useState<number | null>(null);
  
  // Group floors by type (above ground vs. underground)
  const aboveGroundFloors = floors.filter(floor => !floor.isUnderground);
  const belowGroundFloors = floors.filter(floor => floor.isUnderground);
  
  // Find the configuration for a floor
  const getFloorConfig = (floorNumber: number) => {
    return floorConfigurations.find(config => config.floorNumber === floorNumber);
  };
  
  // Get template name for a floor
  const getTemplateName = (floorNumber: number) => {
    const config = getFloorConfig(floorNumber);
    if (config?.templateId) {
      return floorTemplates.find(t => t.id === config.templateId)?.name || "Custom";
    }
    return "Custom";
  };
  
  // Get floor area information
  const getFloorArea = (floorNumber: number) => {
    const config = getFloorConfig(floorNumber);
    if (!config) return "0";
    
    if (config.customSquareFootage) return config.customSquareFootage;
    
    if (config.templateId) {
      const template = floorTemplates.find(t => t.id === config.templateId);
      if (template) return template.squareFootage;
    }
    
    return "0";
  };
  
  // Handle bulk edit changes
  const handleBulkEdit = (field: keyof FloorConfiguration, value: string | null | boolean) => {
    if (selectedFloors.length > 0) {
      bulkEditFloorConfigurations(selectedFloors, field, value);
    }
  };
  
  // Toggle floor selection in bulk edit mode
  const toggleFloorSelection = (floorNumber: number) => {
    if (selectedFloors.includes(floorNumber)) {
      setSelectedFloors(selectedFloors.filter(f => f !== floorNumber));
    } else {
      setSelectedFloors([...selectedFloors, floorNumber]);
    }
  };
  
  // Reset bulk edit mode
  const resetBulkEdit = () => {
    setBulkEditMode(false);
    setSelectedFloors([]);
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Floor Stacking Diagram</CardTitle>
            <CardDescription>Visual representation of space allocation by floor</CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={bulkEditMode ? "secondary" : "outline"} 
              size="sm"
              onClick={() => {
                if (bulkEditMode) {
                  resetBulkEdit();
                } else {
                  setBulkEditMode(true);
                }
              }}
            >
              {bulkEditMode ? "Exit Bulk Edit" : "Bulk Edit"}
            </Button>
            
            {bulkEditMode && selectedFloors.length > 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">Edit {selectedFloors.length} Floors</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Bulk Edit {selectedFloors.length} Floors</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Template</Label>
                      <Select
                        onValueChange={(value) => handleBulkEdit("templateId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="null">Custom (No Template)</SelectItem>
                          {floorTemplates.map(template => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Primary Use</Label>
                      <Select
                        onValueChange={(value) => handleBulkEdit("primaryUse", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select primary use" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential">Residential</SelectItem>
                          <SelectItem value="office">Office</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="parking">Parking</SelectItem>
                          <SelectItem value="hotel">Hotel</SelectItem>
                          <SelectItem value="amenities">Amenities</SelectItem>
                          <SelectItem value="storage">Storage</SelectItem>
                          <SelectItem value="mechanical">Mechanical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Floor-to-Floor Height (ft)</Label>
                      <Input 
                        type="number"
                        placeholder="12"
                        onChange={(e) => handleBulkEdit("floorToFloorHeight", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Efficiency Factor (%)</Label>
                      <Input 
                        type="number"
                        placeholder="85"
                        onChange={(e) => handleBulkEdit("efficiencyFactor", e.target.value)}
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {aboveGroundFloors.length > 0 && (
          <div className="space-y-2 mb-6">
            <h3 className="text-sm font-medium text-gray-500">Above Ground</h3>
            {aboveGroundFloors.map((floor) => (
              <FloorRow
                key={`floor-${floor.floorNumber}`}
                floor={floor}
                spaceTypeColors={spaceTypeColors}
                templateName={getTemplateName(floor.floorNumber)}
                floorArea={getFloorArea(floor.floorNumber)}
                setSelectedFloor={setSelectedFloor}
                bulkEditMode={bulkEditMode}
                isSelected={selectedFloors.includes(floor.floorNumber)}
                toggleSelection={() => toggleFloorSelection(floor.floorNumber)}
              />
            ))}
          </div>
        )}
        
        {belowGroundFloors.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Below Ground</h3>
            {belowGroundFloors.map((floor) => (
              <FloorRow
                key={`floor-${floor.floorNumber}`}
                floor={floor}
                spaceTypeColors={spaceTypeColors}
                templateName={getTemplateName(floor.floorNumber)}
                floorArea={getFloorArea(floor.floorNumber)}
                setSelectedFloor={setSelectedFloor}
                bulkEditMode={bulkEditMode}
                isSelected={selectedFloors.includes(floor.floorNumber)}
                toggleSelection={() => toggleFloorSelection(floor.floorNumber)}
              />
            ))}
          </div>
        )}
        
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(spaceTypeColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }}></div>
              <span className="text-xs capitalize">{type}</span>
            </div>
          ))}
        </div>
        
        {selectedFloor !== null && (
          <FloorConfigurationDialog
            floorNumber={selectedFloor}
            floorConfig={getFloorConfig(selectedFloor) || {
              floorNumber: selectedFloor,
              isUnderground: selectedFloor < 0,
              templateId: null,
              customSquareFootage: "0",
              floorToFloorHeight: "12",
              efficiencyFactor: "85",
              corePercentage: "15",
              primaryUse: "office",
              secondaryUse: null,
              secondaryUsePercentage: "0"
            }}
            floorTemplates={floorTemplates}
            updateFloorConfiguration={updateFloorConfiguration}
            closeDialog={() => setSelectedFloor(null)}
            floors={floors.map(f => f.floorNumber)}
            copyFloorConfiguration={copyFloorConfiguration}
            setCopyToFloorNumber={setCopyToFloorNumber}
            copyToFloorNumber={copyToFloorNumber}
          />
        )}
      </CardContent>
    </Card>
  );
};

interface FloorRowProps {
  floor: Floor;
  spaceTypeColors: Record<string, string>;
  templateName: string;
  floorArea: string;
  setSelectedFloor: (floorNumber: number) => void;
  bulkEditMode: boolean;
  isSelected: boolean;
  toggleSelection: () => void;
}

const FloorRow = ({ 
  floor, 
  spaceTypeColors, 
  templateName,
  floorArea,
  setSelectedFloor,
  bulkEditMode,
  isSelected,
  toggleSelection
}: FloorRowProps) => {
  // Format floor area with commas
  const formattedArea = parseInt(floorArea).toLocaleString();
  
  return (
    <div 
      className={`border border-gray-200 rounded-md transition-all ${bulkEditMode ? 'cursor-pointer hover:bg-gray-50' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={() => {
        if (bulkEditMode) {
          toggleSelection();
        }
      }}
    >
      <div className="bg-gray-100 px-3 py-1 border-b border-gray-200 flex justify-between items-center">
        <div className="font-medium flex items-center gap-2">
          <span className="w-6 text-center">
            {floor.floorNumber < 0 ? `B${Math.abs(floor.floorNumber)}` : floor.floorNumber}
          </span>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-1">
                <Info className="h-3.5 w-3.5 text-gray-500" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-1.5">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Template:</span>
                  <span className="text-sm">{templateName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Area:</span>
                  <span className="text-sm">{formattedArea} sq ft</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        {!bulkEditMode && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0" 
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFloor(floor.floorNumber);
            }}
          >
            <Edit className="h-3.5 w-3.5 text-gray-500" />
          </Button>
        )}
      </div>
      <div className="flex h-12">
        {floor.spaces.map((space, idx) => (
          <div 
            key={`${floor.floorNumber}-${space.id}-${idx}`}
            className="h-full flex items-center justify-center text-xs text-white overflow-hidden"
            style={{ 
              width: `${space.percentage}%`, 
              backgroundColor: spaceTypeColors[space.type] || "#9CA3AF"
            }}
            title={`${space.type}: ${space.squareFootage.toLocaleString()} sq ft (${space.percentage.toFixed(1)}%)`}
          >
            {space.percentage > 10 ? `${space.type}` : ""}
          </div>
        ))}
      </div>
    </div>
  );
};

interface FloorConfigurationDialogProps {
  floorNumber: number;
  floorConfig: FloorConfiguration;
  floorTemplates: FloorTemplate[];
  updateFloorConfiguration: (floorNumber: number, field: keyof FloorConfiguration, value: string | null | boolean) => void;
  closeDialog: () => void;
  floors: number[];
  copyFloorConfiguration: (sourceFloorNumber: number, targetFloorNumber: number) => void;
  copyToFloorNumber: number | null;
  setCopyToFloorNumber: (floor: number | null) => void;
}

const FloorConfigurationDialog = ({
  floorNumber,
  floorConfig,
  floorTemplates,
  updateFloorConfiguration,
  closeDialog,
  floors,
  copyFloorConfiguration,
  copyToFloorNumber,
  setCopyToFloorNumber
}: FloorConfigurationDialogProps) => {
  // Compute net area
  const getGrossArea = () => {
    if (floorConfig.customSquareFootage) {
      return parseFloat(floorConfig.customSquareFootage);
    }
    
    if (floorConfig.templateId) {
      const template = floorTemplates.find(t => t.id === floorConfig.templateId);
      if (template) {
        return parseFloat(template.squareFootage) || 0;
      }
    }
    
    return 0;
  };
  
  const grossArea = getGrossArea();
  const efficiencyFactor = parseFloat(floorConfig.efficiencyFactor) || 0;
  const netArea = grossArea * (efficiencyFactor / 100);
  
  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) closeDialog(); }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            Floor {floorNumber < 0 ? `B${Math.abs(floorNumber)}` : floorNumber} Configuration
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Template</Label>
              <Select
                value={floorConfig.templateId || "null"}
                onValueChange={(value) => {
                  updateFloorConfiguration(
                    floorNumber, 
                    "templateId", 
                    value === "null" ? null : value
                  );
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Custom (No Template)</SelectItem>
                  {floorTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="custom-sqft">Custom Square Footage</Label>
              <Input
                id="custom-sqft"
                type="number"
                placeholder="0"
                value={floorConfig.customSquareFootage}
                onChange={(e) => {
                  updateFloorConfiguration(
                    floorNumber, 
                    "customSquareFootage", 
                    e.target.value
                  );
                }}
              />
              <p className="text-xs text-gray-500">
                {floorConfig.templateId 
                  ? "Overrides template value if set" 
                  : "Required when no template is selected"}
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="floor-height">Floor-to-Floor Height (ft)</Label>
              <Input
                id="floor-height"
                type="number"
                placeholder="12"
                value={floorConfig.floorToFloorHeight}
                onChange={(e) => {
                  updateFloorConfiguration(
                    floorNumber, 
                    "floorToFloorHeight", 
                    e.target.value
                  );
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="efficiency">Efficiency Factor (%)</Label>
              <Input
                id="efficiency"
                type="number"
                placeholder="85"
                value={floorConfig.efficiencyFactor}
                onChange={(e) => {
                  updateFloorConfiguration(
                    floorNumber, 
                    "efficiencyFactor", 
                    e.target.value
                  );
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="core-pct">Core & Circulation (%)</Label>
              <Input
                id="core-pct"
                type="number"
                placeholder="15"
                value={floorConfig.corePercentage}
                onChange={(e) => {
                  updateFloorConfiguration(
                    floorNumber, 
                    "corePercentage", 
                    e.target.value
                  );
                }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="md:col-span-2 space-y-2">
              <Label>Primary Use</Label>
              <Select
                value={floorConfig.primaryUse}
                onValueChange={(value) => {
                  updateFloorConfiguration(floorNumber, "primaryUse", value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select primary use" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="parking">Parking</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="amenities">Amenities</SelectItem>
                  <SelectItem value="storage">Storage</SelectItem>
                  <SelectItem value="mechanical">Mechanical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2 space-y-2">
              <Label>Secondary Use</Label>
              <Select
                value={floorConfig.secondaryUse || "null"}
                onValueChange={(value) => {
                  updateFloorConfiguration(
                    floorNumber, 
                    "secondaryUse", 
                    value === "null" ? null : value
                  );
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select secondary use" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">None</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="parking">Parking</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="amenities">Amenities</SelectItem>
                  <SelectItem value="storage">Storage</SelectItem>
                  <SelectItem value="mechanical">Mechanical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="secondary-pct">Secondary (% of floor)</Label>
              <Input
                id="secondary-pct"
                type="number"
                placeholder="0"
                value={floorConfig.secondaryUsePercentage}
                disabled={!floorConfig.secondaryUse}
                onChange={(e) => {
                  updateFloorConfiguration(
                    floorNumber, 
                    "secondaryUsePercentage", 
                    e.target.value
                  );
                }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-6 bg-gray-50 p-4 rounded-md">
            <div>
              <span className="text-sm text-gray-500">Gross Area</span>
              <p className="text-lg font-medium">{grossArea.toLocaleString()} sq ft</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Net Usable Area</span>
              <p className="text-lg font-medium">{netArea.toLocaleString()} sq ft</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Floor Height</span>
              <p className="text-lg font-medium">{floorConfig.floorToFloorHeight} ft</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-between">
            <div className="space-x-2">
              <Select
                value={copyToFloorNumber?.toString() || ""}
                onValueChange={(value) => setCopyToFloorNumber(parseInt(value))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Copy to floor..." />
                </SelectTrigger>
                <SelectContent>
                  {floors
                    .filter(f => f !== floorNumber)
                    .map(f => (
                      <SelectItem key={f} value={f.toString()}>
                        Floor {f < 0 ? `B${Math.abs(f)}` : f}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => {
                  if (copyToFloorNumber !== null) {
                    copyFloorConfiguration(floorNumber, copyToFloorNumber);
                    closeDialog();
                  }
                }}
                disabled={copyToFloorNumber === null}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Configuration
              </Button>
            </div>
            
            <Button onClick={closeDialog}>Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FloorStackingDiagram;
