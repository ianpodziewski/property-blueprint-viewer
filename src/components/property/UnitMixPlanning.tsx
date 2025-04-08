import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PlusCircle, Trash2, PieChart, BarChart3, AlertTriangle, CheckCircle, 
  HelpCircle, ArrowDownToLine, FolderOpen, ChevronDown, ChevronUp, Building, 
  Grip, Move, Palette, Undo, Home, Building2, Store, Hotel, Coffee
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { UnitType } from "@/types/unitMixTypes";
import { useUnitTypes } from "@/hooks/property/useUnitTypes";
import { useUnitAllocations } from "@/hooks/property/useUnitAllocations";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useExtendedPropertyState } from "@/hooks/useExtendedPropertyState";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import UnitTypeDistributionChart from "./UnitTypeDistributionChart";

const UnitMixPlanning: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("list");
  const [allocateDialogOpen, setAllocateDialogOpen] = useState(false);
  const [selectedUnitTypeId, setSelectedUnitTypeId] = useState<string | null>(null);
  const [selectedFloors, setSelectedFloors] = useState<number[]>([]);
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>([]);
  const [newCategoryDialogOpen, setNewCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(COLOR_OPTIONS[0]);
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [selectedSuggestedCategory, setSelectedSuggestedCategory] = useState<string | null>(null);
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  
  const {
    unitTypes,
    addUnitType,
    updateUnitType,
    removeUnitType,
    calculateTotalArea,
    addCustomCategory,
    removeCategory,
    undoRemoveCategory,
    getAllCategories,
    getCategoryColor,
    getCategoryDescription,
    hasCategories,
    recentlyDeletedCategory
  } = useUnitTypes();
  
  const {
    unitAllocations,
    calculateAllocationStats,
    suggestAllocations,
    removeAllocationsByUnitType,
    addAllocation,
    calculateAllocatedAreaByFloor
  } = useUnitAllocations();
  
  const {
    floorConfigurations,
    totalBuildableArea,
    getFloorArea
  } = useExtendedPropertyState();
  
  const totalUnitArea = calculateTotalArea();
  const totalUnits = unitTypes.reduce((sum, unit) => sum + (parseInt(unit.count) || 0), 0);
  const totalBuildableAreaNumber = parseInt(String(totalBuildableArea)) || 0;
  const percentPlanned = totalBuildableAreaNumber ? Math.min(100, (totalUnitArea / totalBuildableAreaNumber) * 100) : 0;
  
  const aboveGroundFloors = useMemo(() => 
    floorConfigurations.filter(f => !f.isUnderground).map(f => f.floorNumber),
    [floorConfigurations]
  );
  
  const allCategories = useMemo(() => getAllCategories(), [getAllCategories]);
  
  const unitTypesByCategory = useMemo(() => {
    const groups: Record<string, UnitType[]> = {};
    
    unitTypes.forEach(unit => {
      const category = unit.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(unit);
    });
    
    return groups;
  }, [unitTypes]);
  
  const categoryTotals = useMemo(() => {
    const totals: Record<string, { units: number, area: number }> = {};
    
    unitTypes.forEach(unit => {
      const category = unit.category;
      const count = parseInt(unit.count) || 0;
      const area = count * (parseInt(unit.typicalSize) || 0);
      
      if (!totals[category]) {
        totals[category] = { units: 0, area: 0 };
      }
      
      totals[category].units += count;
      totals[category].area += area;
    });
    
    return totals;
  }, [unitTypes]);
  
  const handleAddUnitType = useCallback((category?: string) => {
    if (!hasCategories) {
      toast({
        title: "No categories defined",
        description: "Please create a category first before adding unit types.",
        variant: "destructive"
      });
      return;
    }
    
    const newId = addUnitType();
    if (!newId) return;
    
    if (category) {
      updateUnitType(newId, "category", category);
    }
    
    toast({
      title: "Unit type added",
      description: "New unit type has been added to the library."
    });
    
    setTimeout(() => {
      const element = document.getElementById(`unit-name-${newId}`);
      if (element) {
        element.focus();
      }
    }, 100);
  }, [addUnitType, hasCategories, updateUnitType, toast]);
  
  const handleRemoveUnitType = useCallback((id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this unit type? This will also remove all allocations of this unit type from floors.");
    
    if (confirmDelete) {
      removeUnitType(id);
      removeAllocationsByUnitType(id);
      
      toast({
        title: "Unit type removed",
        description: "The unit type and all its allocations have been removed."
      });
    }
  }, [removeUnitType, removeAllocationsByUnitType, toast]);
  
  const handleAddCategory = useCallback(() => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Category name required",
        description: "Please enter a name for the new category.",
        variant: "destructive"
      });
      return;
    }
    
    let categoryName = newCategoryName;
    let description = newCategoryDescription;
    
    if (selectedSuggestedCategory) {
      const suggested = SUGGESTED_CATEGORIES.find(cat => cat.name === selectedSuggestedCategory);
      if (suggested) {
        categoryName = suggested.name;
        description = description || suggested.description;
      }
    }
    
    const success = addCustomCategory(categoryName, newCategoryColor, description);
    
    if (success) {
      toast({
        title: "Category added",
        description: `New category "${categoryName}" has been added.`
      });
      setNewCategoryName("");
      setNewCategoryColor(COLOR_OPTIONS[0]);
      setNewCategoryDescription("");
      setSelectedSuggestedCategory(null);
      setNewCategoryDialogOpen(false);
    } else {
      toast({
        title: "Category already exists",
        description: "A category with this name already exists.",
        variant: "destructive"
      });
    }
  }, [newCategoryName, newCategoryColor, newCategoryDescription, selectedSuggestedCategory, addCustomCategory, toast]);
  
  const handleQuickStart = useCallback(() => {
    const defaultCategory = SUGGESTED_CATEGORIES[0];
    const success = addCustomCategory(
      defaultCategory.name, 
      COLOR_OPTIONS[0], 
      defaultCategory.description
    );
    
    if (success) {
      toast({
        title: "Quick start complete",
        description: `Added "${defaultCategory.name}" category to help you get started.`
      });
      
      setTimeout(() => {
        const newId = addUnitType();
        updateUnitType(newId, "name", "Studio");
        updateUnitType(newId, "typicalSize", "600");
      }, 100);
    }
  }, [addCustomCategory, addUnitType, updateUnitType, toast]);
  
  const handleDeleteCategory = useCallback((category: string) => {
    const hasUnitTypes = unitTypesByCategory[category]?.length > 0;
    
    if (hasUnitTypes) {
      setCategoryToDelete(category);
      setDeleteConfirmDialogOpen(true);
    } else {
      removeCategory(category);
      toast({
        title: "Category deleted",
        description: `Category "${category}" has been removed.`,
        action: recentlyDeletedCategory ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              const success = undoRemoveCategory();
              if (success) {
                toast({
                  title: "Category restored",
                  description: `Category "${category}" has been restored.`
                });
              }
            }}
          >
            Undo
          </Button>
        ) : undefined
      });
    }
  }, [unitTypesByCategory, removeCategory, undoRemoveCategory, recentlyDeletedCategory, toast]);
  
  const confirmDeleteCategory = useCallback(() => {
    if (!categoryToDelete) return;
    
    removeCategory(categoryToDelete);
    
    toast({
      title: "Category deleted",
      description: `Category "${categoryToDelete}" and all its unit types have been removed.`,
      action: (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            const success = undoRemoveCategory();
            if (success) {
              toast({
                title: "Category restored",
                description: `Category "${categoryToDelete}" has been restored with all its unit types.`
              });
            }
          }}
        >
          Undo
        </Button>
      )
    });
    
    setCategoryToDelete(null);
    setDeleteConfirmDialogOpen(false);
  }, [categoryToDelete, removeCategory, undoRemoveCategory, toast]);
  
  // This helper function needs to be defined BEFORE it's used
  const isValidFloorForUnitType = useCallback((floorNumber: number, unitTypeId: string) => {
    const unitType = unitTypes.find(u => u.id === unitTypeId);
    if (!unitType) return false;
    
    const floorArea = getFloorArea(floorNumber);
    console.log(`Checking floor ${floorNumber} with total area: ${floorArea} sq ft`);
    
    if (floorArea <= 0) {
      console.log(`Floor ${floorNumber} has no valid area`);
      return false;
    }
    
    const allocatedArea = calculateAllocatedAreaByFloor(floorNumber);
    console.log(`Floor ${floorNumber} already has ${allocatedArea} sq ft allocated`);
    
    const availableArea = Math.max(0, floorArea - allocatedArea);
    console.log(`Floor ${floorNumber} has ${availableArea} sq ft available`);
    
    const unitSize = parseInt(unitType.typicalSize) || 0;
    console.log(`Unit ${unitType.name} requires ${unitSize} sq ft`);
    
    const unitFits = availableArea >= unitSize;
    console.log(`Can unit fit on floor ${floorNumber}? ${unitFits ? 'Yes' : 'No'}`);
    
    return unitFits;
  }, [unitTypes, getFloorArea, calculateAllocatedAreaByFloor]);
  
  const handleSuggestAllocation = useCallback((unitTypeId: string, targetCount: number) => {
    const suggestions = suggestAllocations(unitTypeId, targetCount, aboveGroundFloors);
    
    if (suggestions.length === 0) {
      toast({
        title: "No allocation suggestions",
        description: "All floors already have this unit type or there are no floors available.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedUnitTypeId(unitTypeId);
    setSelectedFloors(suggestions.map(s => s.floorNumber));
    setAllocateDialogOpen(true);
    
    toast({
      title: "Allocation suggestion",
      description: "We've suggested floors for this unit type. Review and confirm the allocation."
    });
  }, [suggestAllocations, aboveGroundFloors, toast]);
  
  const handleOpenAllocateDialog = useCallback((unitTypeId: string) => {
    setSelectedUnitTypeId(unitTypeId);
    setSelectedFloors([]);
    setAllocateDialogOpen(true);
  }, []);
  
  const handleAllocateUnits = useCallback(() => {
    if (!selectedUnitTypeId || selectedFloors.length === 0) return;
    
    const unitType = unitTypes.find(u => u.id === selectedUnitTypeId);
    if (!unitType) return;
    
    const targetCount = parseInt(unitType.count) || 0;
    const currentStats = calculateAllocationStats(selectedUnitTypeId);
    const remaining = Math.max(0, targetCount - currentStats.totalAllocated);
    
    if (remaining <= 0) {
      toast({
        title: "Already fully allocated",
        description: `All ${targetCount} units have already been allocated to floors.`,
        variant: "default"
      });
      setAllocateDialogOpen(false);
      return;
    }
    
    const unitsPerFloor = Math.ceil(remaining / selectedFloors.length);
    let allocatedCount = 0;
    
    selectedFloors.forEach(floorNumber => {
      console.log(`Attempting to allocate to floor ${floorNumber}...`);
      
      if (!isValidFloorForUnitType(floorNumber, selectedUnitTypeId)) {
        console.log(`Floor ${floorNumber} doesn't have enough space for this unit type`);
        return; // Skip this floor
      }
      
      const floorConfig = floorConfigurations.find(f => f.floorNumber === floorNumber);
      if (!floorConfig) {
        console.log(`Floor ${floorNumber} configuration not found`);
        return;
      }
      
      const floorArea = getFloorArea(floorNumber);
      console.log(`Floor ${floorNumber} total area: ${floorArea} sq ft`);
      
      const allocatedArea = calculateAllocatedAreaByFloor(floorNumber);
      console.log(`Floor ${floorNumber} allocated area: ${allocatedArea} sq ft`);
      
      const availableArea = Math.max(0, floorArea - allocatedArea);
      console.log(`Floor ${floorNumber} available area: ${availableArea} sq ft`);
      
      const unitSize = parseInt(unitType.typicalSize) || 0;
      console.log(`Unit size: ${unitSize} sq ft`);
      
      const maxUnitsForSpace = unitSize > 0 ? Math.floor(availableArea / unitSize) : unitsPerFloor;
      console.log(`Max units that can fit: ${maxUnitsForSpace}`);
      
      const unitsToAllocate = Math.min(unitsPerFloor, maxUnitsForSpace, remaining - allocatedCount);
      console.log(`Units to allocate: ${unitsToAllocate}`);
      
      if (unitsToAllocate > 0) {
        console.log(`Allocating ${unitsToAllocate} units to floor ${floorNumber}`);
        
        const allocationId = addAllocation({
          unitTypeId: selectedUnitTypeId,
          floorNumber: floorNumber,
          count: unitsToAllocate.toString(),
          squareFootage: unitType.typicalSize,
          notes: `Allocated ${new Date().toLocaleDateString()}`,
          status: "planned"
        });
        
        console.log(`Allocation created with ID: ${allocationId}`);
        allocatedCount += unitsToAllocate;
      }
    });
    
    if (allocatedCount > 0) {
      toast({
        title: "Units allocated",
        description: `${allocatedCount} units have been allocated across ${selectedFloors.length} floors.`
      });
    } else {
      toast({
        title: "No units allocated",
        description: "There isn't enough available space on the selected floors for these units.",
        variant: "destructive"
      });
    }
    
    setAllocateDialogOpen(false);
  }, [selectedUnitTypeId, selectedFloors, unitTypes, floorConfigurations, calculateAllocationStats, calculateAllocatedAreaByFloor, getFloorArea, addAllocation, isValidFloorForUnitType, toast]);
  
  const toggleCategoryCollapse = useCallback((category: string) => {
    setCollapsedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  }, []);
  
  const validateInput = useCallback((value: string, type: 'size' | 'count'): string => {
    let sanitized = value.replace(/[^0-9]/g, '');
    const numValue = parseInt(sanitized) || 0;
    if (numValue < 0) sanitized = '0';
    return sanitized;
  }, []);
  
  const handleInputUpdate = useCallback((id: string, field: keyof UnitType, value: any) => {
    if (field === 'typicalSize' || field === 'count') {
      value = validateInput(value, field as 'size' | 'count');
    }
    
    updateUnitType(id, field, value);
  }, [updateUnitType, validateInput]);
  
  const handleSuggestedCategorySelect = useCallback((categoryName: string) => {
    setSelectedSuggestedCategory(categoryName);
    setNewCategoryName(categoryName);
    
    const suggested = SUGGESTED_CATEGORIES.find(cat => cat.name === categoryName);
    if (suggested && !newCategoryDescription) {
      setNewCategoryDescription(suggested.description);
    }
  }, [newCategoryDescription]);
  
  const renderEmptyState = () => {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 border rounded-lg bg-slate-50">
        <div className="mb-6 p-6 rounded-full bg-slate-100">
          <Building2 className="h-16 w-16 text-slate-400" />
        </div>
        
        <h3 className="text-xl font-medium mb-2">No unit categories defined yet</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          Start by creating categories for your different unit types, such as residential, 
          retail, or office spaces. Then add specific unit types to each category.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => setNewCategoryDialogOpen(true)} 
            size="lg" 
            className="flex items-center"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Create First Category
          </Button>
          
          <Button 
            onClick={handleQuickStart} 
            variant="outline" 
            size="lg"
            className="flex items-center"
          >
            <Palette className="h-5 w-5 mr-2" />
            Quick Start
          </Button>
        </div>
      </div>
    );
  };
  
  const renderUnitLibrary = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Unit Library</h3>
            <p className="text-muted-foreground text-sm">Define standard unit types for your project</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setNewCategoryDialogOpen(true)} 
              variant="outline"
              className="flex items-center"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New Category
            </Button>
            
            <Button 
              onClick={() => handleAddUnitType()} 
              variant="default"
              disabled={!hasCategories}
              className="flex items-center"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Unit Type
            </Button>
          </div>
        </div>
        
        {!hasCategories && renderEmptyState()}
        
        {hasCategories && (
          <div className="space-y-5">
            {allCategories.map(category => {
              const units = unitTypesByCategory[category] || [];
              const isCollapsed = collapsedCategories.includes(category);
              const categoryTotal = categoryTotals[category] || { units: 0, area: 0 };
              const categoryColor = getCategoryColor(category);
              const categoryDescription = getCategoryDescription(category);
              
              return (
                <Collapsible 
                  key={category} 
                  open={!isCollapsed}
                  className="border rounded-md overflow-hidden"
                >
                  <CollapsibleTrigger asChild>
                    <div 
                      className="flex items-center justify-between p-3 bg-slate-50 border-b cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => toggleCategoryCollapse(category)}
                    >
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: categoryColor }}></div>
                        <h4 className="font-medium capitalize">{category}</h4>
                        <Badge variant="outline" className="ml-2">
                          {units.length} types
                        </Badge>
                        <Badge variant="outline" className="ml-1">
                          {categoryTotal.units} units
                        </Badge>
                        <Badge variant="outline" className="ml-1">
                          {categoryTotal.area.toLocaleString()} sq ft
                        </Badge>
                        {categoryDescription && (
                          <span className="ml-2 text-xs text-muted-foreground hidden md:inline">
                            {categoryDescription}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCategory(category);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete category</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="space-y-4 p-3">
                      {units.length === 0 ? (
                        <div className="p-8 text-center">
                          <p className="text-muted-foreground mb-4">No unit types in this category</p>
                          <Button 
                            onClick={() => handleAddUnitType(category)} 
                            variant="outline" 
                            size="sm"
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Unit Type
                          </Button>
                        </div>
                      ) : (
                        units.map(unitType => {
                          const stats = calculateAllocationStats(unitType.id);
                          const allocated = stats.totalAllocated;
                          const target = parseInt(unitType.count) || 0;
                          const allocatedPercent = target ? Math.min(100, (allocated / target) * 100) : 0;
                          
                          return (
                            <Card key={unitType.id} className="overflow-hidden">
                              <CardContent className="p-0">
                                <div className="p-4 relative">
                                  <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: unitType.color || categoryColor }}></div>
                                  
                                  <div className="grid grid-cols-12 gap-4 items-center">
                                    <div className="col-span-3 pl-3">
                                      <Label htmlFor={`unit-name-${unitType.id}`} className="text-xs text-muted-foreground mb-1 block">Name</Label>
                                      <Input 
                                        id={`unit-name-${unitType.id}`}
                                        value={unitType.name}
                                        onChange={(e) => updateUnitType(unitType.id, "name", e.target.value)}
                                        placeholder="Unit name"
                                        className="h-8"
                                      />
                                    </div>
                                    
                                    <div className="col-span-2">
                                      <Label htmlFor={`unit-size-${unitType.id}`} className="text-xs text-muted-foreground mb-1 block">Size (sq ft)</Label>
                                      <Input 
                                        id={`unit-size-${unitType.id}`}
                                        value={unitType.typicalSize}
                                        onChange={(e) => handleInputUpdate(unitType.id, "typicalSize", e.target.value)}
                                        placeholder="0"
                                        className="h-8"
                                        type="number"
                                        min="0"
                                      />
                                    </div>
                                    
                                    <div className="col-span-2">
                                      <Label htmlFor={`unit-count-${unitType.id}`} className="text-xs text-muted-foreground mb-1 block">Total Needed</Label>
                                      <Input 
                                        id={`unit-count-${unitType.id}`}
                                        value={unitType.count}
                                        onChange={(e) => handleInputUpdate(unitType.id, "count", e.target.value)}
                                        placeholder="0"
                                        className="h-8"
                                        type="number"
                                        min="0"
                                      />
                                    </div>
                                    
                                    <div className="col-span-2">
                                      <Label className="text-xs text-muted-foreground mb-1 block">Allocation</Label>
                                      <div className="flex items-center gap-2">
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <div className="h-2 flex-grow relative">
                                                <div className="absolute inset-0 bg-slate-200 rounded-full"></div>
                                                <div 
                                                  className={`absolute left-0 top-0 bottom-0 rounded-full ${getCapacityColor(allocatedPercent)}`}
                                                  style={{ width: `${allocatedPercent}%` }}
                                                ></div>
                                              </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>{allocatedPercent.toFixed(1)}% allocated ({allocated} of {target} units)</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                        <span className="text-xs font-medium whitespace-nowrap">
                                          {allocated}/{target}
                                        </span>
                                      </div>
                                    </div>
                                    
                                    <div className="col-span-3 flex justify-end">
                                      <div className="flex items-center gap-1">
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-8 text-xs"
                                                onClick={() => handleOpenAllocateDialog(unitType.id)}
                                              >
                                                <ArrowDownToLine className="h-3 w-3 mr-1" />
                                                Allocate
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>Allocate units to specific floors</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                        
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-8 w-8 p-0"
                                                onClick={() => handleSuggestAllocation(unitType.id, parseInt(unitType.count) || 0)}
                                              >
                                                <HelpCircle className="h-4 w-4" />
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>Suggest optimal floor allocation</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                        
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleRemoveUnitType(unitType.id)}
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>Remove unit type</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-3 grid grid-cols-12 gap-4 pt-2 border-t">
                                    <div className="col-span-6">
                                      <Label htmlFor={`unit-description-${unitType.id}`} className="text-xs text-muted-foreground mb-1 block">Description (optional)</Label>
                                      <Input 
                                        id={`unit-description-${unitType.id}`}
                                        value={unitType.description || ""}
                                        onChange={(e) => updateUnitType(unitType.id, "description", e.target.value)}
                                        placeholder="Add description"
                                        className="h-8"
                                      />
                                    </div>
                                    
                                    {stats.floorCount > 0 && (
                                      <div className="col-span-6 flex items-center justify-end">
                                        <div className="flex items-center gap-1 text-sm">
                                          <Building className="h-4 w-4 mr-1 text-slate-400" />
                                          <span className="text-muted-foreground mr-1">Allocated to:</span>
                                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                            {stats.floorCount} floors
                                          </Badge>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })
                      )}
                      
                      <div className="text-center">
                        <Button 
                          onClick={() => handleAddUnitType(category)} 
                          variant="outline" 
                          size="sm" 
                          className="w-full border-dashed"
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add {category} Unit Type
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        )}
        
        <Dialog open={newCategoryDialogOpen} onOpenChange={setNewCategoryDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Create a new category to organize your unit types.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div>
                <Label className="mb-2 block">Suggested Categories</Label>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {SUGGESTED_CATEGORIES.map((cat) => (
                    <Button
                      key={cat.name}
                      type="button"
                      variant={selectedSuggestedCategory === cat.name ? "default" : "outline"}
                      className="justify-start h-auto py-2 px-3"
                      onClick={() => handleSuggestedCategorySelect(cat.name)}
                    >
                      {cat.icon}
                      <span className="ml-2 capitalize">{cat.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="category-name" className="mb-2 block">Category Name</Label>
                <Input
                  id="category-name"
                  placeholder="Enter category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="mb-2"
                />
              </div>
              
              <div>
                <Label className="mb-2 block">Category Color</Label>
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <Button
                      key={color}
                      type="button"
                      variant="outline"
                      className={`w-full h-8 p-0 border-2 ${newCategoryColor === color ? 'border-blue-500' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewCategoryColor(color)}
                    />
                  ))}
