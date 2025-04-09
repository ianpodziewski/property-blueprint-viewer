import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Settings, Building, Library } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import FloorTemplateManager from "./FloorTemplateManager";
import UnitTypeManager from "./UnitTypeManager";
import { FloorConfiguration, FloorPlateTemplate, SpaceDefinition, BuildingSystemsConfig } from "@/types/propertyTypes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import ExpandableFloorRow from "./ExpandableFloorRow";
import { useUnitAllocations } from "@/hooks/property/useUnitAllocations";
import { markUIInteractionInProgress } from "../SaveNotification";

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
  const [unitTypeManagerOpen, setUnitTypeManagerOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);
  const [selectedFloorForCopy, setSelectedFloorForCopy] = useState<number | null>(null);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [floorToDelete, setFloorToDelete] = useState<number | null>(null);
  
  const [floorCount, setFloorCount] = useState("1");
  const [floorType, setFloorType] = useState<"aboveGround" | "underground">("aboveGround");
  const [isUnderground, setIsUnderground] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [position, setPosition] = useState<"top" | "bottom" | "specific">("top");
  const [specificPosition, setSpecificPosition] = useState<string>("");
  const [numberingPattern, setNumberingPattern] = useState<"consecutive" | "skip">("consecutive");
  
  const [bulkEditField, setBulkEditField] = useState<keyof FloorConfiguration>("templateId");
  const [bulkEditValue, setBulkEditValue] = useState<string>("");
  
  const [expandedFloors, setExpandedFloors] = useState<number[]>([]);
  
  const { copyAllocations } = useUnitAllocations();
  const { toast } = useToast();

  useEffect(() => {
    setIsUnderground(floorType === "underground");
    
    if (floorType === "underground") {
      setPosition("bottom");
    } else {
      setPosition("top");
    }
  }, [floorType]);
  
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
    markUIInteractionInProgress();
    setSelectedRows(prev => {
      if (prev.includes(floorNumber)) {
        return prev.filter(num => num !== floorNumber);
      } else {
        return [...prev, floorNumber];
      }
    });
  }, []);
  
  const handleSelectAll = useCallback(() => {
    markUIInteractionInProgress();
    if (allSelected || selectedRows.length === floorConfigurations.length) {
      setSelectedRows([]);
      setAllSelected(false);
    } else {
      setSelectedRows(floorConfigurations.map(floor => floor.floorNumber));
      setAllSelected(true);
    }
  }, [floorConfigurations, allSelected, selectedRows.length]);
  
  const toggleFloorExpansion = useCallback((floorNumber: number) => {
    markUIInteractionInProgress();
    console.log(`Toggling expansion for floor ${floorNumber}`);
    setExpandedFloors(prev => {
      if (prev.includes(floorNumber)) {
        return prev.filter(num => num !== floorNumber);
      } else {
        return [...prev, floorNumber];
      }
    });
  }, []);
  
  const handleEditFloor = useCallback((floorNumber: number) => {
    markUIInteractionInProgress();
    console.log(`Editing floor ${floorNumber}`);
    // Any edit logic would go here
  }, []);
  
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
    setFloorType("aboveGround");
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
    copyAllocations(selectedFloorForCopy, selectedRows);
    
    setCopyDialogOpen(false);
    setSelectedFloorForCopy(null);
    
    toast({
      title: "Floor configuration copied",
      description: `Copied configuration and unit allocations to ${selectedRows.length} floor(s).`,
    });
  }, [selectedFloorForCopy, selectedRows, copyFloorConfiguration, copyAllocations, toast]);
  
  const handleDeleteClick = useCallback((floorNumber: number) => {
    markUIInteractionInProgress();
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
              onClick={() => setUnitTypeManagerOpen(true)}
            >
              <Library className="w-4 h-4 mr-1" /> Manage Unit Types
            </Button>
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
        {floorConfigurations.length > 0 ? (
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
                  <TableHead className="w-20">Floor</TableHead>
                  <TableHead className="w-[180px]">Template</TableHead>
                  <TableHead className="w-[140px] text-right">Floor Plate (sf)</TableHead>
                  <TableHead className="w-[140px] text-center">Primary Use</TableHead>
                  <TableHead className="w-20 text-center">Spaces</TableHead>
                  <TableHead className="w-[120px] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedFloors.map(floor => (
                  <ExpandableFloorRow
                    key={`floor-${floor.floorNumber}`}
                    floor={floor}
                    floorTemplates={floorTemplates}
                    isSelected={selectedRows.includes(floor.floorNumber)}
                    onSelect={handleRowSelection}
                    onEdit={() => handleEditFloor(floor.floorNumber)}
                    onDelete={handleDeleteClick}
                    reorderFloor={reorderFloor}
                    updateFloorConfiguration={updateFloorConfiguration}
                    getTemplateName={getTemplateName}
                    totalRows={floorConfigurations.length}
                    isExpanded={expandedFloors.includes(floor.floorNumber)}
                    onToggleExpand={toggleFloorExpansion}
                  />
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <div className="text-center py-12 border border-dashed rounded-lg border-gray-300 bg-gray-50">
            <div className="flex flex-col items-center justify-center space-y-4 p-8">
              <Building className="h-16 w-16 text-gray-400" />
              <div className="space-y-2 text-center">
                <h3 className="font-semibold text-lg">No floors defined yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your building needs floors to define spaces and unit allocations. Click 'Add Floors' to start building your structure.
                </p>
              </div>
              <Button 
                onClick={() => setAddFloorDialogOpen(true)} 
                size="lg" 
                className="mt-4"
              >
                <PlusCircle className="w-5 h-5 mr-2" /> Add Your First Floor
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      
      <Dialog open={addFloorDialogOpen} onOpenChange={setAddFloorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{floorConfigurations.length === 0 ? "Add Your First Floor" : "Add Floors"}</DialogTitle>
            <DialogDescription>
              {floorConfigurations.length === 0 
                ? "Start by adding the first floor to your building" 
                : "Add new floors to your building"}
            </DialogDescription>
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
                <Label htmlFor="floor-type" className="mb-2 block">Floor Type</Label>
                <RadioGroup 
                  id="floor-type"
                  defaultValue="aboveGround" 
                  value={floorType}
                  onValueChange={(value) => setFloorType(value as "aboveGround" | "underground")}
                  className="flex flex-col space-y-1.5"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="aboveGround" id="above-ground" />
                    <Label htmlFor="above-ground" className="cursor-pointer">
                      Above Ground
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="underground" id="underground" />
                    <Label htmlFor="underground" className="cursor-pointer">
                      Underground
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <div>
              <Label htmlFor="floor-template">Floor Template</Label>
              <Select 
                value={selectedTemplateId || undefined} 
                onValueChange={setSelectedTemplateId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Custom)</SelectItem>
                  {floorTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} ({parseInt(template.squareFootage || "0").toLocaleString()} sf)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {floorConfigurations.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  You can create templates to reuse floor configurations across multiple floors
                </p>
              )}
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
                  Example: {isUnderground ? "-1, -2, -3, -4, -5" : "1, 2, 3, 4, 5"}
                </TabsContent>
                <TabsContent value="skip" className="text-muted-foreground text-xs mt-1">
                  Example: {isUnderground ? "-1, -3, -5, -7, -9" : "1, 3, 5, 7, 9"}
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddFloorDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFloors}>
              {floorConfigurations.length === 0 ? "Create Floor" : "Add Floors"}
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
      
      <UnitTypeManager
        isOpen={unitTypeManagerOpen}
        onClose={() => setUnitTypeManagerOpen(false)}
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
                value={selectedFloorForCopy?.toString() || undefined} 
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
                  <SelectItem value="primaryUse">Primary Use</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="bulk-edit-value">New Value</Label>
              {bulkEditField === "templateId" ? (
                <Select 
                  value={bulkEditValue || undefined} 
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
                  value={bulkEditValue || undefined} 
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
                    bulkEditField === "floorToFloorHeight" ? "12" : ""
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
