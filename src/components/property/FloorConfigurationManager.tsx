import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Edit, Copy, Settings, ChevronUp, ChevronDown, Info, AlertTriangle, ArrowRightLeft, CheckCircle, Trash } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import FloorTemplateManager from "./FloorTemplateManager";
import FloorEditor from "./FloorEditor";
import { FloorConfiguration, FloorPlateTemplate, SpaceDefinition, BuildingSystemsConfig } from "@/types/propertyTypes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

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

interface FloorConfigurationManagerProps {
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

const FloorConfigurationManager: React.FC<FloorConfigurationManagerProps> = ({
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
}) => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [allSelected, setAllSelected] = useState(false);
  const [addFloorDialogOpen, setAddFloorDialogOpen] = useState(false);
  const [addTemplateDialogOpen, setAddTemplateDialogOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);
  const [selectedFloorForCopy, setSelectedFloorForCopy] = useState<number | null>(null);
  const [floorEditorOpen, setFloorEditorOpen] = useState(false);
  const [currentFloor, setCurrentFloor] = useState<number | null>(null);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [floorToDelete, setFloorToDelete] = useState<number | null>(null);
  
  const [floorCount, setFloorCount] = useState("1");
  const [isUnderground, setIsUnderground] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [position, setPosition] = useState<"top" | "bottom" | "specific">("top");
  const [specificPosition, setSpecificPosition] = useState<string>("");
  const [numberingPattern, setNumberingPattern] = useState<"consecutive" | "skip">("consecutive");
  
  const [bulkEditField, setBulkEditField] = useState<keyof FloorConfiguration>("templateId");
  const [bulkEditValue, setBulkEditValue] = useState<string>("");
  
  const { toast } = useToast();
  
  const sortedFloors = [...floorConfigurations].sort((a, b) => {
    if (a.isUnderground && b.isUnderground) {
      return a.floorNumber - b.floorNumber;
    } else if (!a.isUnderground && !b.isUnderground) {
      return b.floorNumber - a.floorNumber;
    } else {
      return a.isUnderground ? 1 : -1;
    }
  });
  
  const handleRowSelection = useCallback((floorNumber: number) => {
    setSelectedRows(prev => {
      if (prev.includes(floorNumber)) {
        return prev.filter(num => num !== floorNumber);
      } else {
        return [...prev, floorNumber];
      }
    });
  }, []);
  
  const handleSelectAll = useCallback(() => {
    if (allSelected || selectedRows.length === floorConfigurations.length) {
      setSelectedRows([]);
      setAllSelected(false);
    } else {
      setSelectedRows(floorConfigurations.map(floor => floor.floorNumber));
      setAllSelected(true);
    }
  }, [floorConfigurations, allSelected, selectedRows.length]);
  
  useEffect(() => {
    setSelectedRows([]);
    setAllSelected(false);
  }, [floorConfigurations.length]);
  
  useEffect(() => {
    if (selectedRows.length === floorConfigurations.length) {
      setAllSelected(true);
    } else {
      setAllSelected(false);
    }
  }, [selectedRows, floorConfigurations.length]);

  const handleAddFloors = useCallback(() => {
    if (!floorCount || isNaN(parseInt(floorCount)) || parseInt(floorCount) <= 0) {
      toast({
        title: "Invalid floor count",
        description: "Please enter a valid number of floors to add.",
        variant: "destructive",
      });
      return;
    }
    
    let positionValue: "top" | "bottom" | "specific" = position;
    let specificPositionValue: number | undefined = undefined;
    
    if (position === "specific" && specificPosition) {
      specificPositionValue = parseInt(specificPosition);
    }
    
    addFloors(
      parseInt(floorCount),
      isUnderground,
      selectedTemplateId,
      positionValue,
      specificPositionValue,
      numberingPattern
    );
    
    setAddFloorDialogOpen(false);
    
    setFloorCount("1");
    setIsUnderground(false);
    setSelectedTemplateId(null);
    setPosition("top");
    setSpecificPosition("");
    setNumberingPattern("consecutive");
    
    toast({
      title: "Floors added",
      description: `Added ${floorCount} new ${isUnderground ? "underground" : "above-ground"} floor(s).`,
    });
  }, [addFloors, floorCount, isUnderground, selectedTemplateId, position, specificPosition, numberingPattern, toast]);

  const handleBulkEdit = useCallback(() => {
    if (selectedRows.length === 0) {
      toast({
        title: "No floors selected",
        description: "Please select floors to edit.",
        variant: "destructive",
      });
      return;
    }
    
    bulkEditFloorConfigurations(selectedRows, bulkEditField, bulkEditValue);
    setBulkEditDialogOpen(false);
    
    setBulkEditField("templateId");
    setBulkEditValue("");
    
    toast({
      title: "Floors updated",
      description: `Updated ${selectedRows.length} floor(s).`,
    });
  }, [selectedRows, bulkEditField, bulkEditValue, bulkEditFloorConfigurations, toast]);
  
  const handleCopyFloorConfig = useCallback(() => {
    if (!selectedFloorForCopy) {
      toast({
        title: "No source floor selected",
        description: "Please select a source floor to copy from.",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedRows.length === 0) {
      toast({
        title: "No target floors selected",
        description: "Please select floors to copy to.",
        variant: "destructive",
      });
      return;
    }
    
    copyFloorConfiguration(selectedFloorForCopy, selectedRows);
    setCopyDialogOpen(false);
    
    setSelectedFloorForCopy(null);
    
    toast({
      title: "Floor configuration copied",
      description: `Copied configuration to ${selectedRows.length} floor(s).`,
    });
  }, [selectedFloorForCopy, selectedRows, copyFloorConfiguration, toast]);
  
  const handleEditFloor = useCallback((floorNumber: number) => {
    setCurrentFloor(floorNumber);
    setFloorEditorOpen(true);
  }, []);
  
  const handleDeleteClick = useCallback((floorNumber: number) => {
    setFloorToDelete(floorNumber);
    setDeleteDialogOpen(true);
  }, []);
  
  const handleDeleteFloor = useCallback(() => {
    if (floorToDelete === null) return;
    
    removeFloors([floorToDelete]);
    setDeleteDialogOpen(false);
    setFloorToDelete(null);
    
    toast({
      title: "Floor removed",
      description: "The floor has been successfully removed.",
    });
  }, [floorToDelete, removeFloors, toast]);
  
  const getTemplateName = useCallback((templateId: string | null) => {
    if (!templateId) return "No template";
    const template = floorTemplates.find(t => t.id === templateId);
    return template ? template.name : "Unknown template";
  }, [floorTemplates]);
  
  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Floor Configuration</CardTitle>
            <CardDescription>Define your building's floor layout</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setAddTemplateDialogOpen(true)}
            >
              <Settings className="w-4 h-4 mr-1" /> Manage Templates
            </Button>
            <Button onClick={() => setAddFloorDialogOpen(true)}>
              <PlusCircle className="w-4 h-4 mr-1" /> Add Floors
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            {floorConfigurations.length} floors • {floorConfigurations.filter(f => !f.isUnderground).length} above ground • {floorConfigurations.filter(f => f.isUnderground).length} below ground
          </div>
          
          {selectedRows.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedRows.length} selected
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSelectedRows([]);
                  setAllSelected(false);
                }}
              >
                Clear
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setBulkEditDialogOpen(true)}
              >
                Bulk Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCopyDialogOpen(true)}
              >
                Copy To
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={allSelected} 
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-16">Floor</TableHead>
                <TableHead>Template</TableHead>
                <TableHead className="w-24 text-right">Height</TableHead>
                <TableHead className="w-24 text-right">Area</TableHead>
                <TableHead className="w-24 text-center">Primary Use</TableHead>
                <TableHead className="w-16 text-center">Spaces</TableHead>
                <TableHead className="w-16 text-center">Effic.</TableHead>
                <TableHead className="w-[120px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedFloors.map(floor => {
                const template = floorTemplates.find(t => t.id === floor.templateId);
                const floorArea = floor.customSquareFootage && floor.customSquareFootage !== "" 
                  ? floor.customSquareFootage 
                  : template?.squareFootage || "0";
                const spacesCount = floor.spaces?.length || 0;
                
                return (
                  <TableRow key={`floor-${floor.floorNumber}`}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedRows.includes(floor.floorNumber)}
                        onCheckedChange={() => handleRowSelection(floor.floorNumber)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Badge variant={floor.isUnderground ? "outline" : "default"} className="mr-1">
                          {floor.floorNumber}
                        </Badge>
                        <div className="flex flex-col ml-1">
                          <div className="flex gap-1">
                            {floor.floorNumber > 1 && !floor.isUnderground && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-5 w-5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  reorderFloor(floor.floorNumber, "down");
                                }}
                              >
                                <ChevronUp className="h-3 w-3" />
                              </Button>
                            )}
                            {floor.floorNumber < 0 && floor.isUnderground && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-5 w-5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  reorderFloor(floor.floorNumber, "up");
                                }}
                              >
                                <ChevronUp className="h-3 w-3" />
                              </Button>
                            )}
                            {((floor.isUnderground && floor.floorNumber !== -1) || 
                                (!floor.isUnderground && floor.floorNumber !== 1)) && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-5 w-5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  reorderFloor(floor.floorNumber, floor.isUnderground ? "down" : "up");
                                }}
                              >
                                <ChevronDown className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {floor.templateId ? (
                        getTemplateName(floor.templateId)
                      ) : (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                          Custom
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {floor.floorToFloorHeight}' 
                    </TableCell>
                    <TableCell className="text-right">
                      {parseInt(floorArea).toLocaleString()} sf
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant="outline" 
                        className={`capitalize ${getBadgeColorForUse(floor.primaryUse || "office")}`}
                      >
                        {floor.primaryUse || "office"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {spacesCount > 0 ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-800">
                          {spacesCount}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-600">
                          0
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {floor.efficiencyFactor}%
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditFloor(floor.floorNumber)}
                          title="Edit floor"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteClick(floor.floorNumber)}
                          title="Delete floor"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
        
        {floorConfigurations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">No floors added yet</div>
            <Button onClick={() => setAddFloorDialogOpen(true)}>
              <PlusCircle className="w-4 h-4 mr-1" /> Add Your First Floor
            </Button>
          </div>
        )}
      </CardContent>
      
      <Dialog open={addFloorDialogOpen} onOpenChange={setAddFloorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Floors</DialogTitle>
            <DialogDescription>Add new floors to your building</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="floor-count">Number of Floors</Label>
                <Input
                  id="floor-count"
                  type="number"
                  min="1"
                  value={floorCount}
                  onChange={(e) => setFloorCount(e.target.value)}
                />
              </div>
              <div>
                <Label>Floor Type</Label>
                <div className="flex items-center pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is-underground" 
                      checked={isUnderground}
                      onCheckedChange={(checked) => {
                        setIsUnderground(!!checked);
                        setPosition(isUnderground ? "top" : "bottom");
                      }}
                    />
                    <label 
                      htmlFor="is-underground" 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Underground Floors
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="floor-template">Floor Template</Label>
              <Select 
                value={selectedTemplateId || ""} 
                onValueChange={setSelectedTemplateId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Custom)</SelectItem>
                  {floorTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} ({parseInt(template.squareFootage || "0").toLocaleString()} sf)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Position</Label>
              <Tabs 
                value={position} 
                onValueChange={(value) => setPosition(value as "top" | "bottom" | "specific")}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 mb-2">
                  <TabsTrigger value={isUnderground ? "bottom" : "top"}>
                    {isUnderground ? "Bottom" : "Top"}
                  </TabsTrigger>
                  <TabsTrigger value={isUnderground ? "top" : "bottom"}>
                    {isUnderground ? "Top" : "Bottom"}
                  </TabsTrigger>
                  <TabsTrigger value="specific">Specific</TabsTrigger>
                </TabsList>
                
                <TabsContent value="specific" className="mt-1">
                  <div>
                    <Label htmlFor="specific-position">Floor Number</Label>
                    <Input
                      id="specific-position"
                      type="number"
                      value={specificPosition}
                      onChange={(e) => setSpecificPosition(e.target.value)}
                      placeholder={isUnderground ? "-1, -2, etc." : "1, 2, etc."}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <div>
              <Label>Numbering Pattern</Label>
              <Tabs 
                value={numberingPattern} 
                onValueChange={(value) => setNumberingPattern(value as "consecutive" | "skip")}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 mb-2">
                  <TabsTrigger value="consecutive">Consecutive</TabsTrigger>
                  <TabsTrigger value="skip">Skip Numbers</TabsTrigger>
                </TabsList>
                
                <TabsContent value="consecutive" className="text-muted-foreground text-xs mt-1">
                  Example: 1, 2, 3, 4, 5
                </TabsContent>
                <TabsContent value="skip" className="text-muted-foreground text-xs mt-1">
                  Example: 1, 3, 5, 7, 9
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddFloorDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFloors}>
              Add Floors
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <FloorTemplateManager
        isOpen={addTemplateDialogOpen}
        onClose={() => setAddTemplateDialogOpen(false)}
        templates={floorTemplates}
        addTemplate={addFloorTemplate}
        updateTemplate={updateFloorTemplate}
        removeTemplate={removeFloorTemplate}
      />
      
      <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy Floor Configuration</DialogTitle>
            <DialogDescription>Copy settings from one floor to others</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="source-floor">Source Floor</Label>
              <Select 
                value={selectedFloorForCopy?.toString() || ""} 
                onValueChange={(value) => setSelectedFloorForCopy(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source floor" />
                </SelectTrigger>
                <SelectContent>
                  {sortedFloors.map(floor => (
                    <SelectItem key={`source-${floor.floorNumber}`} value={floor.floorNumber.toString()}>
                      Floor {floor.floorNumber} {floor.isUnderground ? '(Underground)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Target Floors</Label>
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                {selectedRows.length === 0 ? (
                  <div className="text-muted-foreground text-center py-2">
                    No floors selected
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {selectedRows.map(floorNum => (
                      <Badge key={`target-${floorNum}`} variant="secondary">
                        Floor {floorNum}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Select floors from the table to copy configuration to
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCopyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCopyFloorConfig}>
              Copy Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={bulkEditDialogOpen} onOpenChange={setBulkEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Edit Floors</DialogTitle>
            <DialogDescription>Apply changes to multiple floors at once</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="bulk-edit-field">Field to Edit</Label>
              <Select 
                value={bulkEditField} 
                onValueChange={(value) => setBulkEditField(value as keyof FloorConfiguration)}
              >
                <SelectTrigger id="bulk-edit-field">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="templateId">Template</SelectItem>
                  <SelectItem value="floorToFloorHeight">Floor Height</SelectItem>
                  <SelectItem value="efficiencyFactor">Efficiency Factor</SelectItem>
                  <SelectItem value="primaryUse">Primary Use</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="bulk-edit-value">New Value</Label>
              {bulkEditField === "templateId" ? (
                <Select 
                  value={bulkEditValue} 
                  onValueChange={setBulkEditValue}
                >
                  <SelectTrigger id="bulk-edit-value">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {floorTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : bulkEditField === "primaryUse" ? (
                <Select 
                  value={bulkEditValue} 
                  onValueChange={setBulkEditValue}
                >
                  <SelectTrigger id="bulk-edit-value">
                    <SelectValue placeholder="Select use" />
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
              ) : (
                <Input
                  id="bulk-edit-value"
                  value={bulkEditValue}
                  onChange={(e) => setBulkEditValue(e.target.value)}
                  placeholder={
                    bulkEditField === "floorToFloorHeight" ? "12" : 
                    bulkEditField === "efficiencyFactor" ? "85" : ""
                  }
                />
              )}
            </div>
            
            <div>
              <Label>Floors to Edit</Label>
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                {selectedRows.length === 0 ? (
                  <div className="text-muted-foreground text-center py-2">
                    No floors selected
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {selectedRows.map(floorNum => (
                      <Badge key={`edit-${floorNum}`} variant="secondary">
                        Floor {floorNum}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkEdit}>
              Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {currentFloor !== null && (
        <Dialog open={floorEditorOpen} onOpenChange={setFloorEditorOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <FloorEditor
              floorNumber={currentFloor}
              floorConfiguration={floorConfigurations.find(f => f.floorNumber === currentFloor) as FloorConfiguration}
              floorTemplates={floorTemplates}
              updateFloorConfiguration={updateFloorConfiguration}
              updateFloorSpaces={updateFloorSpaces}
            />
          </DialogContent>
        </Dialog>
      )}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Floor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete Floor {floorToDelete}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteFloor}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default FloorConfigurationManager;
