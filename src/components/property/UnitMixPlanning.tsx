
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Trash } from "lucide-react";
import { UnitMix } from "@/types/propertyTypes";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface UnitMixPlanningProps {
  unitMixes: UnitMix[];
  addUnitMix: () => void;
  removeUnitMix: (id: string) => void;
  updateUnitMix: (id: string, field: keyof UnitMix, value: string) => void;
}

const UnitMixPlanning: React.FC<UnitMixPlanningProps> = ({
  unitMixes,
  addUnitMix,
  removeUnitMix,
  updateUnitMix
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>("overview");

  const totalUnits = unitMixes.reduce((sum, unit) => sum + (parseInt(unit.count) || 0), 0);
  const totalArea = unitMixes.reduce((sum, unit) => {
    return sum + ((parseInt(unit.count) || 0) * (parseInt(unit.squareFootage) || 0));
  }, 0);
  
  const avgUnitSize = totalUnits > 0 ? Math.round(totalArea / totalUnits) : 0;

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unit Mix Planning</CardTitle>
        <CardDescription>Define the mix of units for your residential component</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="pt-4">
              <div className="text-sm text-blue-600 font-medium">Total Units</div>
              <div className="text-3xl font-bold text-blue-700">{totalUnits}</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-100">
            <CardContent className="pt-4">
              <div className="text-sm text-green-600 font-medium">Total Residential Area</div>
              <div className="text-3xl font-bold text-green-700">{totalArea.toLocaleString()} sf</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-100">
            <CardContent className="pt-4">
              <div className="text-sm text-purple-600 font-medium">Average Unit Size</div>
              <div className="text-3xl font-bold text-purple-700">{avgUnitSize.toLocaleString()} sf</div>
            </CardContent>
          </Card>
        </div>
        
        <Collapsible 
          open={expandedSection === "overview"} 
          className="border rounded-lg overflow-hidden"
        >
          <CollapsibleTrigger 
            asChild
            onClick={() => toggleSection("overview")}
          >
            <div className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100">
              <h3 className="font-medium">Unit Mix Overview</h3>
              <Badge variant="outline">{unitMixes.length} unit types</Badge>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 border-t">
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit Type</TableHead>
                    <TableHead className="text-right">Units</TableHead>
                    <TableHead className="text-right">Avg. Size</TableHead>
                    <TableHead className="text-right">Total Area</TableHead>
                    <TableHead className="text-right">Mix %</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unitMixes.map((unit) => {
                    const count = parseInt(unit.count) || 0;
                    const size = parseInt(unit.squareFootage) || 0;
                    const totalUnitArea = count * size;
                    const mixPercentage = totalUnits > 0 ? Math.round((count / totalUnits) * 100) : 0;
                    
                    return (
                      <TableRow key={unit.id}>
                        <TableCell>
                          <Input 
                            value={unit.type}
                            onChange={(e) => updateUnitMix(unit.id, "type", e.target.value)}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input 
                            type="number" 
                            value={unit.count}
                            onChange={(e) => updateUnitMix(unit.id, "count", e.target.value)}
                            className="w-20 ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input 
                            type="number" 
                            value={unit.squareFootage}
                            onChange={(e) => updateUnitMix(unit.id, "squareFootage", e.target.value)}
                            className="w-24 ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-right">{totalUnitArea.toLocaleString()} sf</TableCell>
                        <TableCell className="text-right">{mixPercentage}%</TableCell>
                        <TableCell>
                          {unitMixes.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeUnitMix(unit.id)}
                              className="text-red-500 hover:text-red-700 h-8 w-8"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addUnitMix}
                  className="flex items-center gap-1"
                >
                  <PlusCircle className="h-4 w-4" /> Add Unit Type
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        <Collapsible 
          open={expandedSection === "details"} 
          className="border rounded-lg overflow-hidden"
        >
          <CollapsibleTrigger 
            asChild
            onClick={() => toggleSection("details")}
          >
            <div className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100">
              <h3 className="font-medium">Detailed Unit Specifications</h3>
              <Badge variant="outline">Advanced</Badge>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 border-t">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-6">
                {unitMixes.map((unit) => (
                  <Card key={unit.id} className="overflow-hidden">
                    <CardHeader className="bg-gray-50 py-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>{unit.type || "Unit Type"}</span>
                        <Badge variant="outline">{unit.count} units</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor={`unit-beds-${unit.id}`} className="text-xs">Bedrooms</Label>
                          <Input 
                            id={`unit-beds-${unit.id}`} 
                            type="number" 
                            placeholder="1"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`unit-baths-${unit.id}`} className="text-xs">Bathrooms</Label>
                          <Input 
                            id={`unit-baths-${unit.id}`} 
                            type="number" 
                            placeholder="1" 
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`unit-terrace-${unit.id}`} className="text-xs">Terrace (sf)</Label>
                          <Input 
                            id={`unit-terrace-${unit.id}`} 
                            type="number" 
                            placeholder="0" 
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`unit-premium-${unit.id}`} className="text-xs">Premium Factor</Label>
                          <Input 
                            id={`unit-premium-${unit.id}`} 
                            type="number" 
                            placeholder="1.0" 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default UnitMixPlanning;
