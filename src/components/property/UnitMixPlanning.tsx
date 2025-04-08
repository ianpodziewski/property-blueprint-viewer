
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
  HelpCircle, ArrowDownToLine, FolderOpen, ChevronDown, ChevronUp, Building 
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { UnitType } from "@/types/unitMixTypes";
import { useUnitTypes } from "@/hooks/property/useUnitTypes";
import { useUnitAllocations } from "@/hooks/property/useUnitAllocations";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useExtendedPropertyState } from "@/hooks/useExtendedPropertyState";

// Component for unit type distribution charts
import UnitTypeDistributionChart from "./UnitTypeDistributionChart";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Utility function for calculating color based on capacity
const getCapacityColor = (percentUsed: number): string => {
  if (percentUsed > 100) return "bg-red-500"; // Over capacity
  if (percentUsed >= 85) return "bg-green-500"; // Good utilization
  return "bg-amber-400"; // Under utilized
};

const UnitMixPlanning: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("list");
  const [allocateDialogOpen, setAllocateDialogOpen] = useState(false);
  const [selectedUnitTypeId, setSelectedUnitTypeId] = useState<string | null>(null);
  const [selectedFloors, setSelectedFloors] = useState<number[]>([]);
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>([]);
  const { toast } = useToast();
  
  const {
    unitTypes,
    addUnitType,
    updateUnitType,
    removeUnitType,
    calculateTotalArea
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
  
  const handleAddUnitType = useCallback(() => {
    const newId = addUnitType();
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
  }, [addUnitType, toast]);
  
  const handleRemoveUnitType = useCallback((id: string) => {
    if (confirm("Are you sure you want to remove this unit type? This will also remove all allocations of this unit type from floors.")) {
      removeUnitType(id);
      removeAllocationsByUnitType(id);
      
      toast({
        title: "Unit type removed",
        description: "The unit type and all its allocations have been removed."
      });
    }
  }, [removeUnitType, removeAllocationsByUnitType, toast]);
  
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
  
  const renderUnitLibrary = () => {
    const categoryOrder = ["residential", "office", "retail", "hotel", "amenity", "other"];
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Unit Library</h3>
            <p className="text-muted-foreground text-sm">Define standard unit types for your project</p>
          </div>
          <Button onClick={handleAddUnitType} variant="outline">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Unit Type
          </Button>
        </div>
        
        <div className="space-y-5">
          {categoryOrder.map(category => {
            const units = unitTypesByCategory[category] || [];
            if (units.length === 0) return null;
            
            const isCollapsed = collapsedCategories.includes(category);
            const categoryTotal = categoryTotals[category] || { units: 0, area: 0 };
            
            return (
              <Collapsible 
                key={category} 
                open={!isCollapsed}
                className="border rounded-md overflow-hidden"
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-3 bg-slate-50 border-b cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: getCategoryColor(category) }}></div>
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
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </Button>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="space-y-4 p-3">
                    {units.map(unitType => {
                      const stats = calculateAllocationStats(unitType.id);
                      const allocated = stats.totalAllocated;
                      const target = parseInt(unitType.count) || 0;
                      const allocatedPercent = target ? Math.min(100, (allocated / target) * 100) : 0;
                      
                      return (
                        <Card key={unitType.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="p-4 relative">
                              <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: unitType.color || getCategoryColor(category) }}></div>
                              
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
                                    onChange={(e) => updateUnitType(unitType.id, "typicalSize", e.target.value)}
                                    placeholder="0"
                                    className="h-8"
                                    type="number"
                                  />
                                </div>
                                
                                <div className="col-span-2">
                                  <Label htmlFor={`unit-count-${unitType.id}`} className="text-xs text-muted-foreground mb-1 block">Total Needed</Label>
                                  <Input 
                                    id={`unit-count-${unitType.id}`}
                                    value={unitType.count}
                                    onChange={(e) => updateUnitType(unitType.id, "count", e.target.value)}
                                    placeholder="0"
                                    className="h-8"
                                    type="number"
                                  />
                                </div>
                                
                                <div className="col-span-2">
                                  <Label className="text-xs text-muted-foreground mb-1 block">Allocation</Label>
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 flex-grow relative">
                                      <div className="absolute inset-0 bg-slate-200 rounded-full"></div>
                                      <div 
                                        className={`absolute left-0 top-0 bottom-0 rounded-full ${getCapacityColor(allocatedPercent)}`}
                                        style={{ width: `${allocatedPercent}%` }}
                                      ></div>
                                    </div>
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
                                          <p>Allocate to floors</p>
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
                                          <p>Suggest allocation to floors</p>
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
                              
                              {/* Category-specific fields */}
                              {category === "residential" && (
                                <div className="mt-3 grid grid-cols-12 gap-4 pt-2 border-t">
                                  <div className="col-span-3">
                                    <Label className="text-xs text-muted-foreground mb-1 block">Bedrooms</Label>
                                    <Select
                                      value={unitType.description || ""}
                                      onValueChange={(value) => updateUnitType(unitType.id, "description", value)}
                                    >
                                      <SelectTrigger className="h-8">
                                        <SelectValue placeholder="Select" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="0">Studio</SelectItem>
                                        <SelectItem value="1">1 Bedroom</SelectItem>
                                        <SelectItem value="2">2 Bedroom</SelectItem>
                                        <SelectItem value="3">3 Bedroom</SelectItem>
                                        <SelectItem value="4+">4+ Bedroom</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  {stats.floorCount > 0 && (
                                    <div className="col-span-9 flex items-center">
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
                              )}
                              
                              {category === "retail" && (
                                <div className="mt-3 grid grid-cols-12 gap-4 pt-2 border-t">
                                  <div className="col-span-4">
                                    <Label className="text-xs text-muted-foreground mb-1 block">Retail Type</Label>
                                    <Select
                                      value={unitType.description || ""}
                                      onValueChange={(value) => updateUnitType(unitType.id, "description", value)}
                                    >
                                      <SelectTrigger className="h-8">
                                        <SelectValue placeholder="Select" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="restaurant">Restaurant</SelectItem>
                                        <SelectItem value="shop">Shop</SelectItem>
                                        <SelectItem value="service">Service</SelectItem>
                                        <SelectItem value="grocery">Grocery</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  {stats.floorCount > 0 && (
                                    <div className="col-span-8 flex items-center">
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
                              )}
                              
                              {/* Total area calculation */}
                              {!["residential", "retail"].includes(category) && stats.floorCount > 0 && (
                                <div className="mt-3 grid grid-cols-12 gap-4 pt-2 border-t">
                                  <div className="col-span-12">
                                    <div className="flex items-center gap-1 text-sm">
                                      <Building className="h-4 w-4 mr-1 text-slate-400" />
                                      <span className="text-muted-foreground mr-1">Allocated to:</span>
                                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                        {stats.floorCount} floors
                                      </Badge>
                                      <span className="mx-2 text-muted-foreground">•</span>
                                      <span className="text-muted-foreground mr-1">Total area:</span>
                                      <span className="font-medium">{parseInt(unitType.typicalSize || "0") * parseInt(unitType.count || "0")} sq ft</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
          
          {unitTypes.length === 0 && (
            <div className="text-center py-8 border rounded-md">
              <p className="text-muted-foreground">No unit types defined yet</p>
              <Button onClick={handleAddUnitType} variant="outline" className="mt-4">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Your First Unit Type
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Unit Mix Summary</h3>
            <p className="text-muted-foreground text-sm">Summary of unit types and space requirements</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Area Requirements</CardTitle>
              <CardDescription>Total area needed vs. available</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Planned Unit Area:</span>
                    <span className="font-medium">{totalUnitArea.toLocaleString()} sq ft</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Total Building Area:</span>
                    <span className="font-medium">{totalBuildableAreaNumber.toLocaleString()} sq ft</span>
                  </div>
                  
                  <div className="h-2 w-full bg-slate-100 rounded-full relative">
                    <div 
                      className={`absolute left-0 top-0 bottom-0 rounded-full ${getCapacityColor(percentPlanned)}`}
                      style={{ width: `${Math.min(100, percentPlanned)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs mt-1">
                    <span>{percentPlanned.toFixed(1)}% planned</span>
                    <span>
                      {percentPlanned <= 100 ? (
                        <span className="text-green-600">
                          {(totalBuildableAreaNumber - totalUnitArea).toLocaleString()} sq ft available
                        </span>
                      ) : (
                        <span className="text-red-600">
                          {(totalUnitArea - totalBuildableAreaNumber).toLocaleString()} sq ft over capacity
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Area by Category</h4>
                  
                  {Object.entries(categoryTotals).map(([category, data]) => (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{category}:</span>
                        <span>{data.units} units / {data.area.toLocaleString()} sq ft</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full relative">
                        <div 
                          className="absolute left-0 top-0 bottom-0 rounded-full"
                          style={{ 
                            width: `${(data.area / totalUnitArea) * 100}%`,
                            backgroundColor: getCategoryColor(category)
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Unit Distribution</CardTitle>
              <CardDescription>Visual breakdown of unit types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <UnitTypeDistributionChart unitTypes={unitTypes} />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Floor Capacity Analysis</CardTitle>
            <CardDescription>Space allocation by floor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {floorConfigurations
                .filter(f => !f.isUnderground)
                .sort((a, b) => b.floorNumber - a.floorNumber)
                .map(floor => {
                  const floorArea = floor.customSquareFootage && floor.customSquareFootage !== "" 
                    ? parseInt(floor.customSquareFootage) 
                    : 0;
                  
                  const allocatedArea = calculateAllocatedAreaByFloor(floor.floorNumber);
                  const percentUsed = floorArea > 0 ? (allocatedArea / floorArea) * 100 : 0;
                  
                  return (
                    <div key={floor.floorNumber} className="flex items-center space-x-4">
                      <div className="w-8 text-right font-medium">
                        {floor.floorNumber}
                      </div>
                      <div className="flex-1">
                        <div className="h-6 bg-slate-100 rounded-md relative">
                          <div 
                            className={`absolute left-0 top-0 bottom-0 rounded-l-md ${getCapacityColor(percentUsed)}`}
                            style={{ width: `${Math.min(100, percentUsed)}%` }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-medium">
                            <span className={percentUsed > 40 ? "text-white" : "text-slate-700"}>
                              {allocatedArea.toLocaleString()} sq ft
                            </span>
                            <span className="text-slate-700">
                              {floorArea.toLocaleString()} sq ft
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-16 text-xs font-medium text-right">
                        {percentUsed.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Card className="mt-8" id="unit-mix-section">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Unit Mix Planning</span>
          <div className="flex items-center gap-1 text-sm font-normal">
            <span className="text-muted-foreground">Total:</span>
            <span>{totalUnits} units</span>
            <span className="mx-1 text-muted-foreground">•</span>
            <span>{totalUnitArea.toLocaleString()} sq ft</span>
            <span className="mx-1 text-muted-foreground">•</span>
            <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              percentPlanned > 100 
                ? 'bg-red-100 text-red-800' 
                : percentPlanned >= 85 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-amber-100 text-amber-800'
            }`}>
              {percentPlanned.toFixed(1)}% capacity
            </div>
          </div>
        </CardTitle>
        <CardDescription>
          Define and manage the unit mix for your development
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              <span>Unit Library</span>
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Summary</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            {renderUnitLibrary()}
          </TabsContent>
          
          <TabsContent value="summary">
            {renderSummary()}
          </TabsContent>
        </Tabs>
        
        {percentPlanned > 95 && (
          <div className={`mt-4 p-3 rounded-md flex items-start gap-3 ${
            percentPlanned > 100 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            {percentPlanned > 100 ? (
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            ) : (
              <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className="font-medium">
                {percentPlanned > 100 ? 'Space requirements exceed building capacity' : 'Space requirements near capacity'}
              </p>
              <p className="text-sm mt-1">
                {percentPlanned > 100
                  ? `Your unit mix requires ${totalUnitArea.toLocaleString()} sq ft, but your building only has ${totalBuildableAreaNumber.toLocaleString()} sq ft available.`
                  : `Your unit mix uses ${percentPlanned.toFixed(1)}% of available building area.`
                }
              </p>
              {percentPlanned > 100 && (
                <p className="text-sm mt-2">
                  Consider reducing unit count, decreasing unit sizes, or increasing building area.
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Allocate Units Dialog */}
        <Dialog open={allocateDialogOpen} onOpenChange={setAllocateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Allocate Units to Floors</DialogTitle>
              <DialogDescription>
                Select which floors to allocate this unit type to
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="mb-4">
                <Label className="text-sm font-medium">Selected Unit Type</Label>
                <div className="mt-1 p-2 border rounded-md">
                  {selectedUnitTypeId && (() => {
                    const unitType = unitTypes.find(u => u.id === selectedUnitTypeId);
                    if (!unitType) return "Unknown unit type";
                    
                    const target = parseInt(unitType.count) || 0;
                    const stats = calculateAllocationStats(unitType.id);
                    const remaining = Math.max(0, target - stats.totalAllocated);
                    
                    return (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{unitType.name}</span>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">{remaining}</span> of {target} units remaining to allocate
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Select Floors to Allocate Units</Label>
                <div className="border rounded-md p-1 max-h-60 overflow-y-auto grid grid-cols-3 gap-1">
                  {floorConfigurations
                    .filter(f => !f.isUnderground)
                    .sort((a, b) => b.floorNumber - a.floorNumber)
                    .map(floor => {
                      const isSelected = selectedFloors.includes(floor.floorNumber);
                      const isValid = selectedUnitTypeId ? 
                        isValidFloorForUnitType(floor.floorNumber, selectedUnitTypeId) : 
                        true;
                      
                      return (
                        <div 
                          key={floor.floorNumber}
                          className={`p-2 rounded-md border cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-primary/10 border-primary/30' 
                              : !isValid 
                                ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' 
                                : 'hover:bg-slate-50 border-slate-200'
                          }`}
                          onClick={() => {
                            if (!isValid) return;
                            setSelectedFloors(prev => 
                              isSelected 
                                ? prev.filter(f => f !== floor.floorNumber)
                                : [...prev, floor.floorNumber]
                            );
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-medium ${isSelected ? 'text-primary' : ''}`}>
                              Floor {floor.floorNumber}
                            </span>
                            <Checkbox checked={isSelected} className="pointer-events-none" />
                          </div>
                          {!isValid && (
                            <div className="text-xs text-slate-400 mt-1">
                              Insufficient space
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setAllocateDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleAllocateUnits}
                disabled={selectedFloors.length === 0}
              >
                Allocate Units
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// Helper function to get colors by category
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'residential': '#3B82F6',
    'office': '#10B981',
    'retail': '#F59E0B',
    'hotel': '#8B5CF6',
    'amenity': '#EC4899',
    'other': '#6B7280'
  };
  
  return colors[category] || '#9CA3AF';
}

export default UnitMixPlanning;
