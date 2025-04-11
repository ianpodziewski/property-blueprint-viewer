import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { HardCost, CalculationMethod, PropertyType } from "@/hooks/useDevelopmentCosts";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

interface UnitTypeInfo {
  id: string;
  name: string;
  area: number;
  units: number;
}

interface PropertyTypeHardCostsProps {
  propertyType: PropertyType;
  costs: HardCost[];
  propertyArea: number;
  propertyUnits: number;
  onAddCost: (propertyType: PropertyType, costCategory: string, unitTypeId?: string) => void;
  onUpdateCost: (id: string, updates: Partial<Omit<HardCost, 'id' | 'projectId'>>) => void;
  onDeleteCost: (id: string) => void;
  subtotal: number;
  byUnitType: boolean;
  onToggleByUnitType: (value: boolean) => void;
}

export const PropertyTypeHardCosts = ({
  propertyType,
  costs,
  propertyArea,
  propertyUnits,
  onAddCost,
  onUpdateCost,
  onDeleteCost,
  subtotal,
  byUnitType,
  onToggleByUnitType
}: PropertyTypeHardCostsProps) => {
  const [unitTypes, setUnitTypes] = useState<UnitTypeInfo[]>([]);
  const [isUnitTypesOpen, setIsUnitTypesOpen] = useState(false);
  const [selectedUnitTypes, setSelectedUnitTypes] = useState<Record<string, boolean>>({});
  const [expandedUnitTypes, setExpandedUnitTypes] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const fetchUnitTypes = async () => {
      if (propertyType.toLowerCase() === "common") return; // Skip for common areas
      
      const { data, error } = await supabase
        .from('unit_types')
        .select('id, name, area, units')
        .eq('category', propertyType)
        .order('name');
        
      if (error) {
        console.error("Error fetching unit types:", error);
        return;
      }
      
      setUnitTypes(data || []);
      
      const selected: Record<string, boolean> = {};
      const expanded: Record<string, boolean> = {};
      (data || []).forEach(unitType => {
        selected[unitType.id] = true; // Default to all selected
        expanded[unitType.id] = false; // Default to collapsed
      });
      setSelectedUnitTypes(selected);
      setExpandedUnitTypes(expanded);
      
      // Auto-expand unit types that have costs
      if (data) {
        data.forEach(unitType => {
          const hasUnitTypeCosts = costs.some(cost => cost.unitTypeId === unitType.id);
          if (hasUnitTypeCosts) {
            expanded[unitType.id] = true;
          }
        });
        setExpandedUnitTypes(expanded);
      }
    };
    
    fetchUnitTypes();
  }, [propertyType, costs]);

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "$0";
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };
  
  const getPropertyTypeDisplay = (type: PropertyType) => {
    if (!type) return "Unknown";
    
    return type
      .split(/[\s-_]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  const calculateTotal = (rate: number | null, calculationMethod: CalculationMethod) => {
    if (rate === null) return null;
    
    switch (calculationMethod) {
      case "area_based_category":
        return rate * propertyArea;
      case "unit_based_category":
        return rate * propertyUnits;
      case "lump_sum":
      case "custom":
        return rate;
      default:
        return 0;
    }
  };
  
  const calculateUnitTypeTotal = (unitType: UnitTypeInfo, rate: number | null, calculationMethod: CalculationMethod) => {
    if (rate === null) return null;
    
    switch (calculationMethod) {
      case "area_based_unit_type":
        return rate * (unitType.area * unitType.units);
      case "unit_based_unit_type":
        return rate * unitType.units;
      case "lump_sum":
      case "custom":
        return rate;
      default:
        return 0;
    }
  };
  
  const getCalculationDisplay = (cost: HardCost) => {
    if (cost.rate === null) return "Enter a rate to calculate";
    
    if (cost.unitTypeId) {
      const unitType = unitTypes.find(ut => ut.id === cost.unitTypeId);
      if (!unitType) return "";
      
      const area = unitType.area * unitType.units;
      
      switch (cost.calculationMethod) {
        case "area_based_unit_type":
          return `${formatCurrency(cost.rate)}/SF × ${formatNumber(area)} SF = ${formatCurrency(cost.total)}`;
        case "unit_based_unit_type":
          return `${formatCurrency(cost.rate)}/Unit × ${unitType.units} Units = ${formatCurrency(cost.total)}`;
        case "lump_sum":
          return formatCurrency(cost.total);
        case "custom":
          return formatCurrency(cost.total) + (cost.notes ? ` (${cost.notes})` : "");
        default:
          return "";
      }
    } else {
      switch (cost.calculationMethod) {
        case "area_based_category":
          return `${formatCurrency(cost.rate)}/SF × ${formatNumber(propertyArea)} SF = ${formatCurrency(cost.total)}`;
        case "unit_based_category":
          return `${formatCurrency(cost.rate)}/Unit × ${propertyUnits} Units = ${formatCurrency(cost.total)}`;
        case "lump_sum":
          return formatCurrency(cost.total);
        case "custom":
          return formatCurrency(cost.total) + (cost.notes ? ` (${cost.notes})` : "");
        default:
          return "";
      }
    }
  };
  
  const handleRateChange = (id: string, newRate: string) => {
    const rate = newRate === "" ? null : parseFloat(newRate);
    onUpdateCost(id, { rate });
  };
  
  const handleCalculationMethodChange = (id: string, newMethod: CalculationMethod, unitTypeId?: string) => {
    if (newMethod.includes('unit_type') && !unitTypeId && unitTypes.length > 0) {
      onUpdateCost(id, { 
        calculationMethod: newMethod,
        unitTypeId: unitTypes[0].id 
      });
    } 
    else if (!newMethod.includes('unit_type') && unitTypeId) {
      onUpdateCost(id, { 
        calculationMethod: newMethod,
        unitTypeId: undefined 
      });
    }
    else {
      onUpdateCost(id, { calculationMethod: newMethod });
    }
  };

  const handleUnitTypeChange = (id: string, unitTypeId: string) => {
    onUpdateCost(id, { unitTypeId });
  };

  const handleTotalChange = (id: string, newTotal: string) => {
    const total = newTotal === "" ? null : parseFloat(newTotal);
    onUpdateCost(id, { total });
  };
  
  const handleNotesChange = (id: string, notes: string) => {
    onUpdateCost(id, { notes });
  };

  const calculateUnitTypeSubtotal = (unitTypeId: string) => {
    return costs
      .filter(cost => cost.unitTypeId === unitTypeId)
      .reduce((sum, cost) => sum + (cost.total || 0), 0);
  };

  const getCostsByUnitType = (unitTypeId: string) => {
    return costs.filter(cost => cost.unitTypeId === unitTypeId);
  };

  const getCategoryLevelCosts = () => {
    return costs.filter(cost => !cost.unitTypeId);
  };

  const hasUnitTypeCosts = (unitTypeId: string) => {
    return costs.some(cost => cost.unitTypeId === unitTypeId);
  };
  
  const toggleUnitTypeExpanded = (unitTypeId: string) => {
    setExpandedUnitTypes(prev => ({
      ...prev,
      [unitTypeId]: !prev[unitTypeId]
    }));
  };
  
  const getMethodLabel = (method: CalculationMethod) => {
    switch (method) {
      case "area_based_category": return "Per SF (Category)";
      case "unit_based_category": return "Per Unit (Category)";
      case "area_based_unit_type": return "Per SF (Unit Type)";
      case "unit_based_unit_type": return "Per Unit (Unit Type)";
      case "lump_sum": return "Lump Sum";
      case "custom": return "Custom";
      default: return method;
    }
  };
  
  const getMethodDescription = (method: CalculationMethod) => {
    switch (method) {
      case "area_based_category": return "Cost per square foot applied to all units in this category";
      case "unit_based_category": return "Cost per unit applied to all units in this category";
      case "area_based_unit_type": return "Cost per square foot applied to a specific unit type";
      case "unit_based_unit_type": return "Cost per unit applied to a specific unit type";
      case "lump_sum": return "Fixed cost amount";
      case "custom": return "Custom cost with manual input";
      default: return "";
    }
  };
  
  const getRateLabel = (method: CalculationMethod) => {
    if (method.includes("area_based")) return "Rate (per SF)";
    if (method.includes("unit_based")) return "Rate (per Unit)";
    return "Amount ($)";
  };
  
  const getCostItemRow = (cost: HardCost) => {
    return (
      <div key={cost.id} className="border-b pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-2 items-end">
          <div className="space-y-2 md:col-span-3">
            <Label htmlFor={`${cost.id}-category`}>Cost Category</Label>
            <Input 
              id={`${cost.id}-category`}
              value={cost.costCategory}
              onChange={(e) => onUpdateCost(cost.id, { costCategory: e.target.value })}
              placeholder="e.g., Shell, TI, etc."
            />
          </div>
          
          <div className="space-y-2 md:col-span-3">
            <Label htmlFor={`${cost.id}-calculation`}>Calculation Method</Label>
            <Select 
              value={cost.calculationMethod} 
              onValueChange={(value) => handleCalculationMethodChange(
                cost.id, 
                value as CalculationMethod,
                cost.unitTypeId
              )}
            >
              <SelectTrigger id={`${cost.id}-calculation`}>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="area_based_category">{getMethodLabel("area_based_category")}</SelectItem>
                {propertyUnits > 0 && (
                  <SelectItem value="unit_based_category">{getMethodLabel("unit_based_category")}</SelectItem>
                )}
                {unitTypes.length > 0 && (
                  <SelectItem value="area_based_unit_type">{getMethodLabel("area_based_unit_type")}</SelectItem>
                )}
                {unitTypes.length > 0 && propertyUnits > 0 && (
                  <SelectItem value="unit_based_unit_type">{getMethodLabel("unit_based_unit_type")}</SelectItem>
                )}
                <SelectItem value="lump_sum">{getMethodLabel("lump_sum")}</SelectItem>
                <SelectItem value="custom">{getMethodLabel("custom")}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">{getMethodDescription(cost.calculationMethod)}</p>
          </div>
          
          {(cost.calculationMethod.includes('unit_type') && unitTypes.length > 0) && (
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor={`${cost.id}-unit-type`}>Unit Type</Label>
              <Select 
                value={cost.unitTypeId || ''} 
                onValueChange={(value) => handleUnitTypeChange(cost.id, value)}
              >
                <SelectTrigger id={`${cost.id}-unit-type`}>
                  <SelectValue placeholder="Select unit type" />
                </SelectTrigger>
                <SelectContent>
                  {unitTypes.map(unitType => (
                    <SelectItem key={unitType.id} value={unitType.id}>
                      {unitType.name} ({unitType.units} units)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className={`space-y-2 ${cost.calculationMethod.includes('unit_type') && unitTypes.length > 0 ? 'md:col-span-2' : 'md:col-span-3'}`}>
            <Label htmlFor={`${cost.id}-rate`}>{getRateLabel(cost.calculationMethod)}</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">$</span>
              <Input 
                id={`${cost.id}-rate`}
                value={cost.rate === null ? "" : cost.rate}
                onChange={(e) => handleRateChange(cost.id, e.target.value)}
                type="number"
                min="0"
                step="0.01"
                className="rounded-l-none"
                placeholder="0"
              />
            </div>
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label>Total</Label>
            <div className="h-10 flex items-center text-base md:text-sm font-medium">
              {cost.calculationMethod === "custom" ? (
                <div className="flex w-full">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">$</span>
                  <Input 
                    value={cost.total === null ? "" : cost.total}
                    onChange={(e) => handleTotalChange(cost.id, e.target.value)}
                    type="number"
                    min="0"
                    step="0.01"
                    className="rounded-l-none"
                    placeholder="0"
                  />
                </div>
              ) : (
                cost.total === null ? "-" : formatCurrency(cost.total)
              )}
            </div>
          </div>
          
          <div className="md:col-span-1 flex justify-end">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onDeleteCost(cost.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-5 w-5" />
              <span className="sr-only">Remove</span>
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-gray-500 mt-1">
          {getCalculationDisplay(cost)}
        </div>
        
        {(cost.calculationMethod === "custom" || cost.calculationMethod === "lump_sum") && (
          <div className="mt-3">
            <Label htmlFor={`${cost.id}-notes`}>Notes</Label>
            <Textarea 
              id={`${cost.id}-notes`}
              value={cost.notes || ""}
              onChange={(e) => handleNotesChange(cost.id, e.target.value)}
              placeholder="Explain your calculation method or add notes..."
              className="mt-1"
            />
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{getPropertyTypeDisplay(propertyType)}</CardTitle>
            <CardDescription>
              {propertyType.toLowerCase() === "common" 
                ? "Building-wide costs" 
                : `${formatNumber(propertyArea)} SF${propertyUnits > 0 ? `, ${propertyUnits} Units` : ""}`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {propertyType.toLowerCase() !== "common" && (
          <Collapsible 
            open={isUnitTypesOpen} 
            onOpenChange={setIsUnitTypesOpen}
            className="border rounded-md p-2 mb-4"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-sm font-medium">
              <span>Unit Types Breakdown</span>
              {isUnitTypesOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              {unitTypes.length === 0 ? (
                <div className="text-sm text-gray-500 p-2">No unit types defined for this category</div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-2">
                    <div className="col-span-5">Unit Type</div>
                    <div className="col-span-3 text-right">Area/Unit</div>
                    <div className="col-span-2 text-right">Units</div>
                    <div className="col-span-2 text-right">Total Area</div>
                  </div>
                  {unitTypes.map(unitType => (
                    <div key={unitType.id} className="grid grid-cols-12 gap-2 text-sm px-2 py-1 border-t">
                      <div className="col-span-5">{unitType.name}</div>
                      <div className="col-span-3 text-right">{formatNumber(unitType.area)} SF</div>
                      <div className="col-span-2 text-right">{unitType.units}</div>
                      <div className="col-span-2 text-right">{formatNumber(unitType.area * unitType.units)} SF</div>
                    </div>
                  ))}
                  <div className="grid grid-cols-12 gap-2 text-sm font-medium px-2 py-1 border-t">
                    <div className="col-span-8">Total</div>
                    <div className="col-span-2 text-right">{unitTypes.reduce((sum, unit) => sum + unit.units, 0)}</div>
                    <div className="col-span-2 text-right">{formatNumber(unitTypes.reduce((sum, unit) => sum + (unit.area * unit.units), 0))} SF</div>
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}
      
        {/* Category Level Costs */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold">General Costs</h3>
          {getCategoryLevelCosts().length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No cost items yet. Add one below.
            </div>
          ) : (
            getCategoryLevelCosts().map(cost => getCostItemRow(cost))
          )}
          
          <Button 
            variant="outline" 
            onClick={() => onAddCost(propertyType, "")} 
            className="mt-4"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Category Cost
          </Button>
        </div>
        
        {/* Unit Type Specific Costs */}
        {propertyType.toLowerCase() !== "common" && unitTypes.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-base font-semibold">Unit Type Specific Costs</h3>
            
            {unitTypes.map(unitType => {
              const unitTypeCosts = getCostsByUnitType(unitType.id);
              const unitTypeSubtotal = calculateUnitTypeSubtotal(unitType.id);
              const unitTypeArea = unitType.area * unitType.units;
              const isExpanded = expandedUnitTypes[unitType.id] || false;
              
              return (
                <Collapsible 
                  key={unitType.id}
                  className="border rounded-md p-4 mb-4"
                  open={isExpanded}
                  onOpenChange={() => toggleUnitTypeExpanded(unitType.id)}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
                    <div>
                      <h3 className="text-base font-medium">{unitType.name}</h3>
                      <p className="text-sm text-gray-600">
                        {formatNumber(unitTypeArea)} SF ({unitType.units} units × {formatNumber(unitType.area)} SF)
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{formatCurrency(unitTypeSubtotal)}</span>
                      {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0 opacity-50" /> : <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />}
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="pt-4 space-y-4">
                    {unitTypeCosts.length === 0 ? (
                      <div className="text-center py-2 text-gray-500">
                        No cost items yet. Add one below.
                      </div>
                    ) : (
                      unitTypeCosts.map(cost => getCostItemRow(cost))
                    )}
                    
                    <Button 
                      variant="outline" 
                      onClick={() => onAddCost(propertyType, "", unitType.id)} 
                      className="mt-4"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Cost Item for {unitType.name}
                    </Button>
                    
                    <div className="mt-2 flex justify-between items-center pt-2 border-t">
                      <span className="font-medium">Subtotal for {unitType.name}</span>
                      <span className="font-semibold">{formatCurrency(unitTypeSubtotal)}</span>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        )}
        
        <div className="mt-6 flex justify-between items-center pt-4 border-t">
          <span className="font-medium">Subtotal</span>
          <span className="font-semibold">{formatCurrency(subtotal)}</span>
        </div>
      </CardContent>
    </Card>
  );
};
