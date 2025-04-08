
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Copy, Layout, AlertTriangle, X, Check, CheckSquare, Square, ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
  copyFloorConfiguration: (sourceFloorNumber: number, targetFloorNumbers: number[]) => void;
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
  const [copyTargetFloors, setCopyTargetFloors] = useState<number[]>([]);
  const [showRangeSelector, setShowRangeSelector] = useState(false);
  const [rangeStart, setRangeStart] = useState<string>("");
  const [rangeEnd, setRangeEnd] = useState<string>("");
  const [confirmCopyOpen, setConfirmCopyOpen] = useState(false);
  const [editorKey, setEditorKey] = useState<string>(`floor-editor-${Date.now()}`);

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
  
  const getFloorsByUse = () => {
    const useGroups: Record<string, number[]> = {};
    
    floorConfigurations.forEach(config => {
      const use = config.primaryUse;
      if (!useGroups[use]) {
        useGroups[use] = [];
      }
      useGroups[use].push(config.floorNumber);
    });
    
    return useGroups;
  };
  
  const floorsByUse = getFloorsByUse();
  
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
  
  const toggleTargetFloorSelection = (floorNumber: number) => {
    if (copyTargetFloors.includes(floorNumber)) {
      setCopyTargetFloors(copyTargetFloors.filter(f => f !== floorNumber));
    } else {
      setCopyTargetFloors([...copyTargetFloors, floorNumber]);
    }
  };
  
  const selectAllTargetFloors = () => {
    const sourceFloorNum = parseInt(copySourceFloor);
    const allFloorNumbers = floorConfigurations
      .map(config => config.floorNumber)
      .filter(num => num !== sourceFloorNum);
    
    setCopyTargetFloors(allFloorNumbers);
  };
  
  const clearAllTargetFloors = () => {
    setCopyTargetFloors([]);
  };
  
  const selectTargetFloorsByUse = (use: string) => {
    if (floorsByUse[use]) {
      const sourceFloorNum = parseInt(copySourceFloor);
      const floorsOfThisUse = floorsByUse[use].filter(num => num !== sourceFloorNum);
      setCopyTargetFloors([...new Set([...copyTargetFloors, ...floorsOfThisUse])]);
    }
  };
  
  const selectTargetFloorsInRange = () => {
    const start = parseInt(rangeStart);
    const end = parseInt(rangeEnd);
    
    if (!isNaN(start) && !isNaN(end)) {
      const sourceFloorNum = parseInt(copySourceFloor);
      const floorsInRange = [];
      
      for (const config of floorConfigurations) {
        const floorNum = config.floorNumber;
        if (floorNum !== sourceFloorNum && 
            ((floorNum >= start && floorNum <= end) || 
             (floorNum <= start && floorNum >= end))) {
          floorsInRange.push(floorNum);
        }
      }
      
      setCopyTargetFloors([...new Set([...copyTargetFloors, ...floorsInRange])]);
      setShowRangeSelector(false);
    }
  };
  
  const handleCopy = () => {
    const source = parseInt(copySourceFloor);
    
    if (!isNaN(source) && copyTargetFloors.length > 0) {
      setConfirmCopyOpen(false);
      
      copyTargetFloors.forEach(targetFloor => {
        copyFloorConfiguration(source, targetFloor);
      });
      
      setCopyTargetFloors([]);
      setCopyDialogOpen(false);
    }
  };
  
  const handleOpenConfirmCopy = () => {
    if (copyTargetFloors.length > 0) {
      setConfirmCopyOpen(true);
    }
  };
  
  const formatFloorNumber = (floorNumber: number) => {
    return floorNumber < 0 ? `B${Math.abs(floorNumber)}` : floorNumber.toString();
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
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Copy Floor Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Source Floor</Label>
              <Select value={copySourceFloor} onValueChange={(value) => {
                setCopySourceFloor(value);
                if (copyTargetFloors.includes(parseInt(value))) {
                  setCopyTargetFloors(copyTargetFloors.filter(f => f !== parseInt(value)));
                }
              }}>
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
              <div className="flex justify-between items-center">
                <Label>Target Floors</Label>
                <div className="space-x-2 text-xs">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={selectAllTargetFloors}
                  >
                    Select All
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={clearAllTargetFloors}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-md">
                <div className="flex justify-between items-center p-2 bg-muted/40 border-b">
                  <span className="text-sm font-medium">Select target floors</span>
                  {copyTargetFloors.length > 0 && (
                    <Badge variant="secondary">
                      {copyTargetFloors.length} floor{copyTargetFloors.length > 1 ? 's' : ''} selected
                    </Badge>
                  )}
                </div>
                
                <ScrollArea className="h-[180px] p-2">
                  <div className="space-y-1">
                    {floorConfigurations
                      .filter(config => config.floorNumber !== parseInt(copySourceFloor))
                      .sort((a, b) => b.floorNumber - a.floorNumber)
                      .map((config) => (
                        <div 
                          key={`target-${config.floorNumber}`}
                          className="flex items-center space-x-2 py-1 px-1 hover:bg-muted/40 rounded"
                        >
                          <Checkbox 
                            id={`floor-${config.floorNumber}`}
                            checked={copyTargetFloors.includes(config.floorNumber)}
                            onCheckedChange={() => toggleTargetFloorSelection(config.floorNumber)}
                          />
                          <Label 
                            htmlFor={`floor-${config.floorNumber}`}
                            className="flex-1 cursor-pointer text-sm flex items-center justify-between"
                          >
                            <span>
                              Floor {config.floorNumber < 0 ? `B${Math.abs(config.floorNumber)}` : config.floorNumber}
                            </span>
                            <span className="text-muted-foreground text-xs capitalize">
                              {config.primaryUse}
                            </span>
                          </Label>
                        </div>
                      ))
                    }
                  </div>
                </ScrollArea>
              </div>
              
              <div className="pt-2 space-y-3">
                <div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-between"
                    onClick={() => setShowRangeSelector(!showRangeSelector)}
                  >
                    <span>Select Floor Range</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showRangeSelector ? 'rotate-180' : ''}`} />
                  </Button>
                  
                  {showRangeSelector && (
                    <div className="border rounded-md mt-2 p-3 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="range-start" className="text-xs">Start Floor</Label>
                          <Input 
                            id="range-start" 
                            value={rangeStart}
                            onChange={e => setRangeStart(e.target.value)}
                            placeholder="e.g., 1 or -1"
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="range-end" className="text-xs">End Floor</Label>
                          <Input 
                            id="range-end" 
                            value={rangeEnd}
                            onChange={e => setRangeEnd(e.target.value)}
                            placeholder="e.g., 10 or -3"
                            className="h-8"
                          />
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={selectTargetFloorsInRange}
                      >
                        Add Range to Selection
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs">Select by Use Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(floorsByUse).map(([use, floors]) => (
                      <Badge 
                        key={use}
                        variant="outline" 
                        className="cursor-pointer hover:bg-muted/60 capitalize"
                        onClick={() => selectTargetFloorsByUse(use)}
                      >
                        All {use} ({floors.length})
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              {copyTargetFloors.length > 0 && (
                <div className="pt-2">
                  <Label className="text-sm">Selected Floors</Label>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {copyTargetFloors
                      .sort((a, b) => b - a)
                      .map(floorNum => (
                        <Badge
                          key={`selected-${floorNum}`}
                          variant="secondary"
                          className="pl-2 flex items-center gap-1 bg-muted/60 hover:bg-muted"
                        >
                          {formatFloorNumber(floorNum)}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-transparent hover:text-destructive"
                            onClick={() => toggleTargetFloorSelection(floorNum)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => {
                setCopyDialogOpen(false);
                setCopyTargetFloors([]);
                setShowRangeSelector(false);
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleOpenConfirmCopy}
                disabled={copyTargetFloors.length === 0 || !copySourceFloor}
              >
                Copy to {copyTargetFloors.length} Floor{copyTargetFloors.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={confirmCopyOpen} onOpenChange={setConfirmCopyOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Floor Configuration Copy</AlertDialogTitle>
            <AlertDialogDescription>
              <p>
                You are about to copy the configuration from Floor {formatFloorNumber(parseInt(copySourceFloor))} 
                to {copyTargetFloors.length} floor{copyTargetFloors.length !== 1 ? 's' : ''}.
              </p>
              {copyTargetFloors.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium text-sm mb-1">Target floors:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {copyTargetFloors
                      .sort((a, b) => b - a)
                      .map(floorNum => (
                        <Badge key={`confirm-${floorNum}`} variant="outline">
                          Floor {formatFloorNumber(floorNum)}
                        </Badge>
                      ))
                    }
                  </div>
                </div>
              )}
              <p className="mt-3 text-amber-600 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                <span>This will overwrite any existing configurations on the target floors.</span>
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCopy}>
              <Check className="h-4 w-4 mr-2" /> Confirm Copy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
