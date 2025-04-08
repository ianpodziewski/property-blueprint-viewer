
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

// Component for unit type distribution charts
import UnitTypeDistributionChart from "./UnitTypeDistributionChart";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Utility function for calculating color based on capacity
const getCapacityColor = (percentUsed: number): string => {
  if (percentUsed > 100) return "bg-red-500"; // Over capacity
  if (percentUsed >= 85) return "bg-green-500"; // Good utilization
  return "bg-amber-400"; // Under utilized
};

// Suggested categories for quick start
const SUGGESTED_CATEGORIES = [
  { name: "residential", icon: <Home className="h-4 w-4" />, description: "Apartments, condos, and living spaces" },
  { name: "office", icon: <Building2 className="h-4 w-4" />, description: "Commercial office spaces" },
  { name: "retail", icon: <Store className="h-4 w-4" />, description: "Shops, restaurants, and commercial storefronts" },
  { name: "hotel", icon: <Hotel className="h-4 w-4" />, description: "Hotel rooms and hospitality spaces" },
  { name: "amenity", icon: <Coffee className="h-4 w-4" />, description: "Shared amenities and common areas" }
];

// Predefined color options
const COLOR_OPTIONS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#6B7280", // Gray
  "#EF4444", // Red
  "#14B8A6", // Teal
  "#F97316", // Orange
  "#8B5CF6"  // Indigo
];

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
    totalBuildableArea
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
  
  // Group unit types by category
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
  
  // Calculate category totals
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
    
    // If a category was specified, update the new unit to use it
    if (category) {
      updateUnitType(newId, "category", category);
    }
    
    toast({
      title: "Unit type added",
      description: "New unit type has been added to the library."
    });
    
    // Focus the new item
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
    
    // Apply suggested category if one is selected
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
    // Add a residential category to help user get started
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
      
      // Add a sample unit type
      setTimeout(() => {
        const newId = addUnitType();
        updateUnitType(newId, "name", "Studio");
        updateUnitType(newId, "typicalSize", "600");
      }, 100);
    }
  }, [addCustomCategory, addUnitType, updateUnitType, toast]);
  
  const handleDeleteCategory = useCallback((category: string) => {
    // Check if category has unit types
    const hasUnitTypes = unitTypesByCategory[category]?.length > 0;
    
    if (hasUnitTypes) {
      setCategoryToDelete(category);
      setDeleteConfirmDialogOpen(true);
    } else {
      // No units, can delete directly
      removeCategory(category);
      toast({
        title: "Category deleted",
        description: `Category "${category}" has been removed.`,
        action: recentlyDeletedCategory ? {
          label: "Undo",
          onClick: () => {
            const success = undoRemoveCategory();
            if (success) {
              toast({
                title: "Category restored",
                description: `Category "${category}" has been restored.`
              });
            }
          }
        } : undefined
      });
    }
  }, [unitTypesByCategory, removeCategory, undoRemoveCategory, recentlyDeletedCategory, toast]);
  
  const confirmDeleteCategory = useCallback(() => {
    if (!categoryToDelete) return;
    
    removeCategory(categoryToDelete);
    
    toast({
      title: "Category deleted",
      description: `Category "${categoryToDelete}" and all its unit types have been removed.`,
      action: {
        label: "Undo",
        onClick: () => {
          const success = undoRemoveCategory();
          if (success) {
            toast({
              title: "Category restored",
              description: `Category "${categoryToDelete}" has been restored with all its unit types.`
            });
          }
        }
      }
    });
    
    setCategoryToDelete(null);
    setDeleteConfirmDialogOpen(false);
  }, [categoryToDelete, removeCategory, undoRemoveCategory, toast]);
  
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
    
    // Calculate how many to allocate per floor
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
      // Check if there's enough space on this floor
      const floorConfig = floorConfigurations.find(f => f.floorNumber === floorNumber);
      if (!floorConfig) return;
      
      // Get floor area
      const floorArea = floorConfig.customSquareFootage && floorConfig.customSquareFootage !== "" 
        ? parseInt(floorConfig.customSquareFootage) 
        : 0;
      
      // Calculate allocated area on this floor
      const allocatedArea = calculateAllocatedAreaByFloor(floorNumber);
      const availableArea = Math.max(0, floorArea - allocatedArea);
      
      // Calculate how many units can fit in the available area
      const unitSize = parseInt(unitType.typicalSize) || 0;
      const maxUnitsForSpace = unitSize > 0 ? Math.floor(availableArea / unitSize) : unitsPerFloor;
      
      // Allocate the units
      const unitsToAllocate = Math.min(unitsPerFloor, maxUnitsForSpace, remaining - allocatedCount);
      
      if (unitsToAllocate > 0) {
        addAllocation({
          unitTypeId: selectedUnitTypeId,
          floorNumber: floorNumber,
          count: unitsToAllocate.toString(),
          squareFootage: unitType.typicalSize,
          notes: `Allocated ${new Date().toLocaleDateString()}`,
          status: "planned"
        });
        
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
  }, [selectedUnitTypeId, selectedFloors, unitTypes, floorConfigurations, calculateAllocationStats, calculateAllocatedAreaByFloor, addAllocation, toast]);
  
  const toggleCategoryCollapse = useCallback((category: string) => {
    setCollapsedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  }, []);
  
  const isValidFloorForUnitType = useCallback((floorNumber: number, unitTypeId: string) => {
    const unitType = unitTypes.find(u => u.id === unitTypeId);
    if (!unitType) return false;
    
    // Check floor use compatibility
    const floorConfig = floorConfigurations.find(f => f.floorNumber === floorNumber);
    if (!floorConfig) return false;
    
    // For simplicity, we'll just check if there's enough space
    const floorArea = floorConfig.customSquareFootage && floorConfig.customSquareFootage !== "" 
      ? parseInt(floorConfig.customSquareFootage) 
      : 0;
    
    const allocatedArea = calculateAllocatedAreaByFloor(floorNumber);
    const availableArea = Math.max(0, floorArea - allocatedArea);
    
    // Unit should take at least some space
    const unitSize = parseInt(unitType.typicalSize) || 0;
    return availableArea >= unitSize;
  }, [floorConfigurations, unitTypes, calculateAllocatedAreaByFloor]);
  
  const validateInput = useCallback((value: string, type: 'size' | 'count'): string => {
    // Remove non-numeric values
    let sanitized = value.replace(/[^0-9]/g, '');
    
    // Convert to number
    const numValue = parseInt(sanitized) || 0;
    
    // Ensure non-negative
    if (numValue < 0) sanitized = '0';
    
    return sanitized;
  }, []);
  
  const handleInputUpdate = useCallback((id: string, field: keyof UnitType, value: any) => {
    // Validate numeric fields
    if (field === 'typicalSize' || field === 'count') {
      value = validateInput(value, field as 'size' | 'count');
    }
    
    updateUnitType(id, field, value);
  }, [updateUnitType, validateInput]);

  const handleSuggestedCategorySelect = useCallback((categoryName: string) => {
    setSelectedSuggestedCategory(categoryName);
    setNewCategoryName(categoryName);
    
    // Find the suggested category to get its description
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
                                  
                                  {/* Add description field */}
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
        
        {/* New Category Dialog */}
        <Dialog open={newCategoryDialogOpen} onOpenChange={setNewCategoryDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Create a new category to organize your unit types.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* Suggested Categories */}
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
              
              {/* Custom Category Name */}
              <div className="grid gap-2">
                <Label htmlFor="categoryName">Category Name</Label>
                <Input
                  id="categoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Residential, Office, etc."
                />
              </div>
              
              {/* Color Selection */}
              <div className="grid gap-2">
                <Label>Category Color</Label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <TooltipProvider key={color}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setNewCategoryColor(color)}
                            className={`w-8 h-8 rounded-full border ${newCategoryColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : 'ring-0'}`}
                            style={{ backgroundColor: color }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Select this color</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
              
              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="categoryDescription">Description (optional)</Label>
                <Input
                  id="categoryDescription"
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  placeholder="Brief description of this category"
                />
              </div>
            </div>
            
            <DialogFooter className="sm:justify-start">
              <Button
                variant="default"
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                className="flex items-center"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Category
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setNewCategoryName("");
                  setNewCategoryColor(COLOR_OPTIONS[0]);
                  setNewCategoryDescription("");
                  setSelectedSuggestedCategory(null);
                  setNewCategoryDialogOpen(false);
                }}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Allocate Units Dialog */}
        <Dialog open={allocateDialogOpen} onOpenChange={setAllocateDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Allocate Units to Floors</DialogTitle>
              <DialogDescription>
                Select which floors these units should be allocated to.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              {selectedUnitTypeId && (
                <div className="mb-4 p-3 bg-slate-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Unit Type:</span> 
                    <span>{unitTypes.find(u => u.id === selectedUnitTypeId)?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-medium">Size:</span>
                    <span>{unitTypes.find(u => u.id === selectedUnitTypeId)?.typicalSize} sq ft</span>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <h4 className="font-medium">Select Floors</h4>
                <div className="grid grid-cols-3 gap-2">
                  {aboveGroundFloors.map(floorNumber => {
                    const isValid = selectedUnitTypeId ? isValidFloorForUnitType(floorNumber, selectedUnitTypeId) : false;
                    const isSelected = selectedFloors.includes(floorNumber);
                    
                    return (
                      <div key={floorNumber} className="flex items-center space-x-2">
                        <Checkbox
                          id={`floor-${floorNumber}`}
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedFloors(prev => [...prev, floorNumber]);
                            } else {
                              setSelectedFloors(prev => prev.filter(f => f !== floorNumber));
                            }
                          }}
                          disabled={!isValid}
                        />
                        <Label
                          htmlFor={`floor-${floorNumber}`}
                          className={`${!isValid ? 'text-muted-foreground' : ''}`}
                        >
                          Floor {floorNumber}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="default"
                onClick={handleAllocateUnits}
                disabled={selectedFloors.length === 0}
                className="flex items-center"
              >
                <ArrowDownToLine className="h-4 w-4 mr-2" />
                Allocate Units
              </Button>
              <Button
                variant="outline"
                onClick={() => setAllocateDialogOpen(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Category Confirmation Dialog */}
        <Dialog open={deleteConfirmDialogOpen} onOpenChange={setDeleteConfirmDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Category</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this category? This will also remove all unit types within it.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Warning</p>
                    <p className="text-sm text-muted-foreground">
                      This will delete the "{categoryToDelete}" category and {unitTypesByCategory[categoryToDelete || ""]?.length || 0} unit types within it.
                      All floor allocations for these unit types will also be removed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={confirmDeleteCategory}
                className="flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Category
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCategoryToDelete(null);
                  setDeleteConfirmDialogOpen(false);
                }}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };
  
  return (
    <div className="w-full p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Unit Mix Planning</h2>
          <p className="text-muted-foreground">
            Define unit types and allocate them to floors
          </p>
        </div>
        
        <div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <Progress value={percentPlanned} className="w-32 h-2" />
                  <span className="text-sm font-medium">{percentPlanned.toFixed(1)}%</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Percentage of buildable area allocated to unit types</p>
                <div className="text-xs text-muted-foreground mt-1">
                  {totalUnitArea.toLocaleString()} of {totalBuildableAreaNumber.toLocaleString()} sq ft planned
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list" className="flex items-center">
            <FolderOpen className="h-4 w-4 mr-2" />
            Unit Library
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex items-center">
            <PieChart className="h-4 w-4 mr-2" />
            Distribution
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="w-full">
          {renderUnitLibrary()}
        </TabsContent>
        
        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Unit Type Distribution</CardTitle>
              <CardDescription>
                Visual breakdown of unit types across the building
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unitTypes.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">No unit types defined yet</p>
                  <Button 
                    onClick={() => setActiveTab("list")} 
                    variant="outline"
                  >
                    Go to Unit Library
                  </Button>
                </div>
              ) : (
                <div className="h-[300px]">
                  <UnitTypeDistributionChart unitTypes={unitTypes} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnitMixPlanning;
