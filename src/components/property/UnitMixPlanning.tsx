
import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, PieChart, BarChart3, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";
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

const UnitMixPlanning: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("list");
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
    removeAllocationsByUnitType
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
    
    const suggestionText = suggestions.map(s => 
      `Floor ${s.floorNumber}: ${s.count} units`
    ).join(", ");
    
    toast({
      title: "Allocation suggestion",
      description: (
        <div>
          <p className="mb-2">Suggested allocation:</p>
          <ul className="list-disc pl-5">
            {suggestions.map(s => (
              <li key={s.floorNumber}>Floor {s.floorNumber}: {s.count} units</li>
            ))}
          </ul>
          <p className="mt-2 text-sm">Expand floor rows to apply these allocations.</p>
        </div>
      )
    });
  }, [suggestAllocations, aboveGroundFloors, toast]);
  
  const renderUnitLibrary = () => {
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
        
        <div className="space-y-4">
          {unitTypes.map(unitType => {
            const stats = calculateAllocationStats(unitType.id);
            const allocated = stats.totalAllocated;
            const target = parseInt(unitType.count) || 0;
            const allocatedPercent = target ? Math.min(100, (allocated / target) * 100) : 0;
            
            return (
              <Card key={unitType.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 border-b relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: unitType.color }}></div>
                    
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-3">
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
                        <Label htmlFor={`unit-category-${unitType.id}`} className="text-xs text-muted-foreground mb-1 block">Category</Label>
                        <Select
                          value={unitType.category}
                          onValueChange={(value) => updateUnitType(unitType.id, "category", value as any)}
                        >
                          <SelectTrigger id={`unit-category-${unitType.id}`} className="h-8">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="residential">Residential</SelectItem>
                            <SelectItem value="office">Office</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="hotel">Hotel</SelectItem>
                            <SelectItem value="amenity">Amenity</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
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
                      
                      <div className="col-span-2 flex flex-col">
                        <Label className="text-xs text-muted-foreground mb-1 block">Allocation Progress</Label>
                        <div className="flex items-center gap-2">
                          <Progress value={allocatedPercent} className="h-2 flex-grow" />
                          <span className="text-xs font-medium">
                            {allocated}/{target}
                          </span>
                        </div>
                      </div>
                      
                      <div className="col-span-1 flex justify-end">
                        <div className="flex items-center gap-1">
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
                    
                    <div className="mt-3 grid grid-cols-12 gap-4">
                      <div className="col-span-8">
                        <Label htmlFor={`unit-desc-${unitType.id}`} className="text-xs text-muted-foreground mb-1 block">Description (Optional)</Label>
                        <Input 
                          id={`unit-desc-${unitType.id}`}
                          value={unitType.description || ""}
                          onChange={(e) => updateUnitType(unitType.id, "description", e.target.value)}
                          placeholder="Brief description"
                          className="h-8"
                        />
                      </div>
                      
                      <div className="col-span-4">
                        <Label className="text-xs text-muted-foreground mb-1 block">Total Area</Label>
                        <div className="text-sm font-medium">
                          {parseInt(unitType.typicalSize || "0") * parseInt(unitType.count || "0")} sq ft
                          {stats.floorCount > 0 && (
                            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700">
                              {stats.floorCount} floors
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                  
                  <Progress value={percentPlanned} className="h-2" />
                  
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
                      <Progress 
                        value={(data.area / totalUnitArea) * 100} 
                        className="h-1.5" 
                        style={{ 
                          backgroundColor: '#e5e7eb',
                          '--category-color': getCategoryColor(category),
                        } as React.CSSProperties}
                      />
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
            <CardTitle className="text-base">Category Breakdown</CardTitle>
            <CardDescription>Detailed statistics by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(categoryTotals).map(([category, data]) => (
                <div key={category} className="border rounded-md p-3">
                  <h4 className="font-medium text-sm capitalize mb-1">{category}</h4>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Units:</span>
                      <span>{data.units}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Area:</span>
                      <span>{data.area.toLocaleString()} sq ft</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">% of Total:</span>
                      <span>{((data.area / totalUnitArea) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Unit Mix Planning</span>
          <div className="flex items-center gap-1 text-sm font-normal">
            <span className="text-muted-foreground">Total:</span>
            <span>{totalUnits} units</span>
            <span className="mx-1 text-muted-foreground">•</span>
            <span>{totalUnitArea.toLocaleString()} sq ft</span>
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
              <PlusCircle className="h-4 w-4" />
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
