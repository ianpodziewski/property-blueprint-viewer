
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2 } from "lucide-react";
import { HardCost, CalculationMethod, PropertyType } from "@/hooks/useDevelopmentCosts";

interface PropertyTypeHardCostsProps {
  propertyType: PropertyType;
  costs: HardCost[];
  propertyArea: number;
  propertyUnits: number;
  onAddCost: (propertyType: PropertyType, costCategory: string) => void;
  onUpdateCost: (id: string, updates: Partial<Omit<HardCost, 'id' | 'projectId'>>) => void;
  onDeleteCost: (id: string) => void;
  subtotal: number;
}

export const PropertyTypeHardCosts = ({
  propertyType,
  costs,
  propertyArea,
  propertyUnits,
  onAddCost,
  onUpdateCost,
  onDeleteCost,
  subtotal
}: PropertyTypeHardCostsProps) => {
  // Helper to format currency
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "$0";
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Get property type display name with proper capitalization
  const getPropertyTypeDisplay = (type: PropertyType) => {
    if (!type) return "Unknown";
    
    // Split by spaces, hyphens or underscores, capitalize each word, join with spaces
    return type
      .split(/[\s-_]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  // Calculate total based on rate and area/units
  const calculateTotal = (rate: number | null, calculationMethod: CalculationMethod) => {
    if (rate === null) return null;
    
    switch (calculationMethod) {
      case "area_based":
        return rate * propertyArea;
      case "unit_based":
        return rate * propertyUnits;
      case "custom":
        return rate;
      default:
        return 0;
    }
  };
  
  // Get calculation display text
  const getCalculationDisplay = (cost: HardCost) => {
    if (cost.rate === null) return "Enter a rate to calculate";
    
    switch (cost.calculationMethod) {
      case "area_based":
        return `${formatCurrency(cost.rate)}/SF × ${propertyArea.toLocaleString()} SF = ${formatCurrency(cost.total)}`;
      case "unit_based":
        return `${formatCurrency(cost.rate)}/Unit × ${propertyUnits} Units = ${formatCurrency(cost.total)}`;
      case "custom":
        return formatCurrency(cost.total);
      default:
        return "";
    }
  };
  
  // When rate or calculation method changes, update the total
  const handleRateChange = (id: string, newRate: string, calculationMethod: CalculationMethod) => {
    const rate = newRate === "" ? null : parseFloat(newRate);
    onUpdateCost(id, { rate });
  };
  
  const handleCalculationMethodChange = (id: string, newMethod: CalculationMethod) => {
    onUpdateCost(id, { calculationMethod: newMethod });
  };

  const handleTotalChange = (id: string, newTotal: string) => {
    const total = newTotal === "" ? null : parseFloat(newTotal);
    onUpdateCost(id, { total });
  };
  
  const handleNotesChange = (id: string, notes: string) => {
    onUpdateCost(id, { notes });
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{getPropertyTypeDisplay(propertyType)}</CardTitle>
        <CardDescription>
          {propertyType.toLowerCase() === "common" 
            ? "Building-wide costs" 
            : `${propertyArea.toLocaleString()} SF${propertyUnits > 0 ? `, ${propertyUnits} Units` : ""}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {costs.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No cost items yet. Add one below.
          </div>
        ) : (
          costs.map((cost) => (
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
                      value as CalculationMethod
                    )}
                  >
                    <SelectTrigger id={`${cost.id}-calculation`}>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="area_based">Area-Based</SelectItem>
                      {propertyUnits > 0 && (
                        <SelectItem value="unit_based">Unit-Based</SelectItem>
                      )}
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor={`${cost.id}-rate`}>
                    {cost.calculationMethod === "area_based" ? "Rate (per SF)" : 
                     cost.calculationMethod === "unit_based" ? "Rate (per Unit)" : 
                     "Amount ($)"}
                  </Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">$</span>
                    <Input 
                      id={`${cost.id}-rate`}
                      value={cost.rate === null ? "" : cost.rate}
                      onChange={(e) => handleRateChange(
                        cost.id, 
                        e.target.value, 
                        cost.calculationMethod
                      )}
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
              
              {cost.calculationMethod === "custom" && (
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
          ))
        )}
        
        <Button 
          variant="outline" 
          onClick={() => onAddCost(propertyType, "")} 
          className="mt-4"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Cost Item
        </Button>
        
        <div className="mt-6 flex justify-between items-center pt-4 border-t">
          <span className="font-medium">Subtotal</span>
          <span className="font-semibold">{formatCurrency(subtotal)}</span>
        </div>
      </CardContent>
    </Card>
  );
};
