
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Copy, Layout, AlertTriangle } from "lucide-react";
import FloorEditor from "./FloorEditor";
import { 
  FloorPlateTemplate,
  FloorConfiguration, 
  SpaceDefinition,
  BuildingSystemsConfig
} from "@/types/propertyTypes";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FloorConfigurationManagerProps {
  floorConfigurations: FloorConfiguration[];
  floorTemplates: FloorPlateTemplate[];
  updateFloorConfiguration: (
    floorNumber: number, 
    field: keyof FloorConfiguration, 
    value: any
  ) => void;
  copyFloorConfiguration: (sourceFloorNumber: number, targetFloorNumber: number) => void;
  bulkEditFloorConfigurations: (
    floorNumbers: number[], 
    field: keyof FloorConfiguration, 
    value: any
  ) => void;
  updateFloorSpaces: (floorNumber: number, spaces: SpaceDefinition[]) => void;
  updateFloorBuildingSystems?: (floorNumber: number, systems: BuildingSystemsConfig) => void;
}

const FloorConfigurationManager = ({
  floorConfigurations,
  floorTemplates,
  updateFloorConfiguration,
  copyFloorConfiguration,
  bulkEditFloorConfigurations,
  updateFloorSpaces,
  updateFloorBuildingSystems
}: FloorConfigurationManagerProps) => {
  const [selectedFloor, setSelectedFloor] = useState<FloorConfiguration | null>(null);
  const [isFloorEditorOpen, setIsFloorEditorOpen] = useState(false);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedFloors, setSelectedFloors] = useState<number[]>([]);
  const [groupStartFloor, setGroupStartFloor] = useState<string>("");
  const [groupEndFloor, setGroupEndFloor] = useState<string>("");
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [copySourceFloor, setCopySourceFloor] = useState<string>("");
  const [copyTargetFloor, setCopyTargetFloor] = useState<string>("");
  const [editorKey, setEditorKey] = useState<string>(`floor-editor-${Date.now()}`);

  // Clean up state when component unmounts
  useEffect(() => {
    return () => {
      setSelectedFloor(null);
      setIsFloorEditorOpen(false);
    };
  }, []);

  const aboveGroundConfigs = floorConfigurations
    .filter(config => !config.isUnderground)
    .sort((a, b) => b.floorNumber - a.floorNumber);
    
  const belowGroundConfigs = floorConfigurations
    .filter(config => config.isUnderground)
    .sort((a, b) => a.floorNumber - b.floorNumber);
  
  const getTemplateName = (templateId: string | null) => {
    if (!templateId) return "Custom";
    const template = floorTemplates.find(t => t.id === templateId);
    return template ? template.name : "Custom";
  };
  
  const handleEditFloor = (floor: FloorConfiguration) => {
    console.log("Opening floor editor for floor:", floor.floorNumber);
    setSelectedFloor(floor);
    setEditorKey(`floor-editor-${floor.floorNumber}-${Date.now()}`);
    setIsFloorEditorOpen(true);
  };

  const handleCloseFloorEditor = () => {
    console.log("Closing floor editor");
    setIsFloorEditorOpen(false);
    // Use a timeout to ensure React has time to process state updates
    setTimeout(() => {
      setSelectedFloor(null);
    }, 100);
  };
  
  const toggleFloorSelection = (floorNumber: number) => {
    if (selectedFloors.includes(floorNumber)) {
      setSelectedFloors(selectedFloors.filter(f => f !== floorNumber));
    } else {
      setSelectedFloors([...selectedFloors, floorNumber]);
    }
  };
  
  const selectFloorRange = () => {
    const start = parseInt(groupStartFloor);
    const end = parseInt(groupEndFloor);
    
    if (!isNaN(start) && !isNaN(end)) {
      const floorNumbers = [];
      
      for (const config of floorConfigurations) {
        const floorNum = config.floorNumber;
        if ((floorNum >= start && floorNum <= end) || (floorNum <= start && floorNum >= end)) {
          floorNumbers.push(floorNum);
        }
      }
      
      setSelectedFloors(floorNumbers);
    }
  };
  
  const applyBulkEdit = (field: keyof FloorConfiguration, value: any) => {
    bulkEditFloorConfigurations(selectedFloors, field, value);
  };
  
  const handleCopy = () => {
    const source = parseInt(copySourceFloor);
    const target = parseInt(copyTargetFloor);
    
    if (!isNaN(source) && !isNaN(target)) {
      copyFloorConfiguration(source, target);
      setCopyDialogOpen(false);
    }
  };
  
  const calculateGrossArea = (config: FloorConfiguration) => {
    if (config.customSquareFootage) {
      return parseFloat(config.customSquareFootage) || 0;
    } else if (config.templateId) {
      const template = floorTemplates.find(t => t.id === config.templateId);
      if (template) {
        return parseFloat(template.squareFootage) || 0;
      }
    }
    return 0;
  };

  const calculateAssignedArea = (config: FloorConfiguration) => {
    if (!config.spaces || config.spaces.length === 0) return 0;
    
    return config.spaces.reduce((sum, space) => {
      return sum + (parseFloat(space.squareFootage) || 0);
    }, 0);
  };

  const getSpacesInfo = (config: FloorConfiguration) => {
    if (!config.spaces || config.spaces.length === 0) return null;
    
    const totalSpaces = config.spaces.length;
    const totalPlannedArea = calculateAssignedArea(config);
    
    const rentableArea = config.spaces
      .filter(space => space.isRentable)
      .reduce((sum, space) => sum + (parseFloat(space.squareFootage) || 0), 0);
    
    return { totalSpaces, totalPlannedArea, rentableArea };
  };

  const getAssignedAreaStatus = (config: FloorConfiguration) => {
    const grossArea = calculateGrossArea(config);
    const assignedArea = calculateAssignedArea(config);
    
    if (assignedArea <= 0) return 'empty';
    if (assignedArea > grossArea) return 'error';
    if (assignedArea < grossArea * 0.9) return 'warning';
    return 'ok';
  };

  const getAssignedPercentage = (config: FloorConfiguration) => {
    const grossArea = calculateGrossArea(config);
    const assignedArea = calculateAssignedArea(config);
    
    if (grossArea <= 0) return 0;
    return (assignedArea / grossArea) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Floor Configuration Manager</CardTitle>
            <CardDescription>Manage building floor configurations and templates</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={bulkEditMode ? "secondary" : "outline"}
              onClick={() => {
                setBulkEditMode(!bulkEditMode);
                setSelectedFloors([]);
              }}
            >
              {bulkEditMode ? "Exit Bulk Edit" : "Bulk Edit"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setCopyDialogOpen(true)}
            >
              <Copy className="h-4 w-4 mr-2" /> Copy Floor
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {bulkEditMode && (
          <div className="mb-6 bg-muted/30 p-4 rounded-lg border">
            <h3 className="text-sm font-medium mb-3">Bulk Edit Controls</h3>
            
            <div className="flex flex-wrap gap-3 items-end mb-4">
              <div className="space-y-2">
                <Label htmlFor="start-floor">Start Floor</Label>
                <Input 
                  id="start-floor" 
                  className="w-24" 
                  value={groupStartFloor}
                  onChange={(e) => setGroupStartFloor(e.target.value)}
                  placeholder="-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-floor">End Floor</Label>
                <Input 
                  id="end-floor" 
                  className="w-24" 
                  value={groupEndFloor}
                  onChange={(e) => setGroupEndFloor(e.target.value)}
                  placeholder="5"
                />
              </div>
              <Button onClick={selectFloorRange} variant="secondary">
                Select Range
              </Button>
              {selectedFloors.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {selectedFloors.length} floors selected
                </Badge>
              )}
            </div>
            
            {selectedFloors.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Template</Label>
                  <Select onValueChange={(value) => applyBulkEdit("templateId", value === "null" ? null : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Apply template..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Custom (No Template)</SelectItem>
                      {floorTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Primary Use</Label>
                  <Select onValueChange={(value) => applyBulkEdit("primaryUse", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Set use..." />
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
                  <div className="flex gap-2">
                    <Input type="number" placeholder="12" />
                    <Button variant="secondary" onClick={(e) => {
                      const input = (e.currentTarget.previousSibling as HTMLInputElement);
                      applyBulkEdit("floorToFloorHeight", input.value);
                    }}>
                      Apply
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Efficiency Factor (%)</Label>
                  <div className="flex gap-2">
                    <Input type="number" placeholder="85" />
                    <Button variant="secondary" onClick={(e) => {
                      const input = (e.currentTarget.previousSibling as HTMLInputElement);
                      applyBulkEdit("efficiencyFactor", input.value);
                    }}>
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <h3 className="text-sm font-medium mb-2">Above Ground Floors</h3>
        <div className="overflow-x-auto">
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Floor</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Gross Area</TableHead>
                  <TableHead>Assigned Area</TableHead>
                  <TableHead>Height</TableHead>
                  <TableHead>Primary Use</TableHead>
                  <TableHead>Space Planning</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aboveGroundConfigs.map((config) => (
                  <TableRow key={config.floorNumber} className={bulkEditMode && selectedFloors.includes(config.floorNumber) ? "bg-muted/20" : ""}>
                    <TableCell>
                      {bulkEditMode ? (
                        <Button 
                          variant={selectedFloors.includes(config.floorNumber) ? "secondary" : "ghost"}
                          size="sm"
                          className="px-2 h-6"
                          onClick={() => toggleFloorSelection(config.floorNumber)}
                        >
                          {config.floorNumber}
                        </Button>
                      ) : (
                        config.floorNumber
                      )}
                    </TableCell>
                    <TableCell>{getTemplateName(config.templateId)}</TableCell>
                    <TableCell>
                      {calculateGrossArea(config).toLocaleString()} sf
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center">
                            <span className={
                              getAssignedAreaStatus(config) === 'error' 
                                ? "text-red-500 font-medium" 
                                : ""
                            }>
                              {calculateAssignedArea(config) > 0 
                                ? calculateAssignedArea(config).toLocaleString() + " sf" 
                                : "Not assigned"}
                            </span>
                            
                            {getAssignedAreaStatus(config) === 'warning' && (
                              <AlertTriangle className="h-4 w-4 ml-1.5 text-amber-500" />
                            )}
                            
                            {getAssignedAreaStatus(config) === 'error' && (
                              <AlertTriangle className="h-4 w-4 ml-1.5 text-red-500" />
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <div className="max-w-xs">
                            <p className="font-medium mb-1">Assigned Area</p>
                            <p className="text-sm text-muted-foreground">
                              {getAssignedAreaStatus(config) === 'empty' && (
                                "No spaces have been assigned to this floor yet."
                              )}
                              {getAssignedAreaStatus(config) === 'error' && (
                                "Assigned area exceeds the gross area of this floor."
                              )}
                              {getAssignedAreaStatus(config) === 'warning' && (
                                `Only ${getAssignedPercentage(config).toFixed(1)}% of the floor area has been assigned.`
                              )}
                              {getAssignedAreaStatus(config) === 'ok' && (
                                `${getAssignedPercentage(config).toFixed(1)}% of the floor area has been assigned.`
                              )}
                            </p>
                            <p className="text-xs mt-1 text-muted-foreground">
                              Assigned Area represents the total square footage that has been allocated to specific spaces on this floor. This should typically be equal to or slightly less than the Gross Area.
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{config.floorToFloorHeight}'</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-sm" 
                          style={{ backgroundColor: getUseColor(config.primaryUse) }}
                        ></div>
                        <span className="capitalize">{config.primaryUse}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getSpacesInfo(config) ? (
                        <Badge variant="outline" className="bg-muted/30 hover:bg-muted cursor-default">
                          {getSpacesInfo(config)!.totalSpaces} spaces • {getSpacesInfo(config)!.totalPlannedArea.toLocaleString()} sf
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Not configured
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditFloor(config)}
                        className="px-2 h-7"
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TooltipProvider>
        </div>
        
        {belowGroundConfigs.length > 0 && (
          <>
            <h3 className="text-sm font-medium mb-2 mt-8">Below Ground Floors</h3>
            <div className="overflow-x-auto">
              <TooltipProvider>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Floor</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Gross Area</TableHead>
                      <TableHead>Assigned Area</TableHead>
                      <TableHead>Height</TableHead>
                      <TableHead>Primary Use</TableHead>
                      <TableHead>Space Planning</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {belowGroundConfigs.map((config) => (
                      <TableRow key={config.floorNumber} className={bulkEditMode && selectedFloors.includes(config.floorNumber) ? "bg-muted/20" : ""}>
                        <TableCell>
                          {bulkEditMode ? (
                            <Button 
                              variant={selectedFloors.includes(config.floorNumber) ? "secondary" : "ghost"}
                              size="sm"
                              className="px-2 h-6"
                              onClick={() => toggleFloorSelection(config.floorNumber)}
                            >
                              B{Math.abs(config.floorNumber)}
                            </Button>
                          ) : (
                            `B${Math.abs(config.floorNumber)}`
                          )}
                        </TableCell>
                        <TableCell>{getTemplateName(config.templateId)}</TableCell>
                        <TableCell>
                          {calculateGrossArea(config).toLocaleString()} sf
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center">
                                <span className={
                                  getAssignedAreaStatus(config) === 'error' 
                                    ? "text-red-500 font-medium" 
                                    : ""
                                }>
                                  {calculateAssignedArea(config) > 0 
                                    ? calculateAssignedArea(config).toLocaleString() + " sf" 
                                    : "Not assigned"}
                                </span>
                                
                                {getAssignedAreaStatus(config) === 'warning' && (
                                  <AlertTriangle className="h-4 w-4 ml-1.5 text-amber-500" />
                                )}
                                
                                {getAssignedAreaStatus(config) === 'error' && (
                                  <AlertTriangle className="h-4 w-4 ml-1.5 text-red-500" />
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <div className="max-w-xs">
                                <p className="font-medium mb-1">Assigned Area</p>
                                <p className="text-sm text-muted-foreground">
                                  {getAssignedAreaStatus(config) === 'empty' && (
                                    "No spaces have been assigned to this floor yet."
                                  )}
                                  {getAssignedAreaStatus(config) === 'error' && (
                                    "Assigned area exceeds the gross area of this floor."
                                  )}
                                  {getAssignedAreaStatus(config) === 'warning' && (
                                    `Only ${getAssignedPercentage(config).toFixed(1)}% of the floor area has been assigned.`
                                  )}
                                  {getAssignedAreaStatus(config) === 'ok' && (
                                    `${getAssignedPercentage(config).toFixed(1)}% of the floor area has been assigned.`
                                  )}
                                </p>
                                <p className="text-xs mt-1 text-muted-foreground">
                                  Assigned Area represents the total square footage that has been allocated to specific spaces on this floor. This should typically be equal to or slightly less than the Gross Area.
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{config.floorToFloorHeight}'</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-sm" 
                              style={{ backgroundColor: getUseColor(config.primaryUse) }}
                            ></div>
                            <span className="capitalize">{config.primaryUse}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getSpacesInfo(config) ? (
                            <Badge variant="outline" className="bg-muted/30 hover:bg-muted cursor-default">
                              {getSpacesInfo(config)!.totalSpaces} spaces • {getSpacesInfo(config)!.totalPlannedArea.toLocaleString()} sf
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Not configured
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditFloor(config)}
                            className="px-2 h-7"
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TooltipProvider>
            </div>
          </>
        )}
      </CardContent>
      
      {selectedFloor && isFloorEditorOpen && (
        <FloorEditor
          key={editorKey}
          isOpen={isFloorEditorOpen}
          onClose={handleCloseFloorEditor}
          floorConfig={selectedFloor}
          floorTemplates={floorTemplates}
          updateFloorConfiguration={updateFloorConfiguration}
          updateSpaces={updateFloorSpaces}
          updateBuildingSystems={updateFloorBuildingSystems}
        />
      )}
      
      <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy Floor Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Source Floor</Label>
              <Select value={copySourceFloor} onValueChange={setCopySourceFloor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source floor" />
                </SelectTrigger>
                <SelectContent>
                  {floorConfigurations.map((config) => (
                    <SelectItem key={config.floorNumber} value={config.floorNumber.toString()}>
                      Floor {config.floorNumber < 0 ? `B${Math.abs(config.floorNumber)}` : config.floorNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Target Floor</Label>
              <Select value={copyTargetFloor} onValueChange={setCopyTargetFloor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target floor" />
                </SelectTrigger>
                <SelectContent>
                  {floorConfigurations.map((config) => (
                    <SelectItem key={config.floorNumber} value={config.floorNumber.toString()}>
                      Floor {config.floorNumber < 0 ? `B${Math.abs(config.floorNumber)}` : config.floorNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setCopyDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCopy}>Copy Configuration</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const getUseColor = (spaceType: string) => {
  const colors: Record<string, string> = {
    "residential": "#3B82F6",
    "office": "#10B981",
    "retail": "#F59E0B",
    "parking": "#6B7280",
    "hotel": "#8B5CF6",
    "amenities": "#EC4899",
    "storage": "#78716C",
    "mechanical": "#475569",
  };
  
  return colors[spaceType] || "#9CA3AF";
};

export default FloorConfigurationManager;
