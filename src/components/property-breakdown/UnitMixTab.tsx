
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { UnitMix } from "@/types/propertyTypes";

interface UnitMixTabProps {
  unitMixes: UnitMix[];
  addUnitMix: () => void;
  removeUnitMix: (id: string) => void;
  updateUnitMix: (id: string, field: keyof UnitMix, value: string) => void;
  stopPropagation: (e: React.MouseEvent<Element, MouseEvent>) => boolean;
}

const UnitMixTab: React.FC<UnitMixTabProps> = ({
  unitMixes,
  addUnitMix,
  removeUnitMix,
  updateUnitMix,
  stopPropagation
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Unit Mix</CardTitle>
        <CardDescription>Define the mix of unit types in your residential spaces</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {unitMixes.map((unit) => (
            <div 
              key={unit.id} 
              className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-6 border-b border-gray-200 last:border-0"
            >
              <div className="space-y-2">
                <Label htmlFor={`unit-type-${unit.id}`}>Unit Type</Label>
                <select 
                  id={`unit-type-${unit.id}`}
                  value={unit.type}
                  onChange={(e) => updateUnitMix(unit.id, "type", e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="Studio">Studio</option>
                  <option value="1-bed">1 Bedroom</option>
                  <option value="2-bed">2 Bedroom</option>
                  <option value="3-bed">3 Bedroom</option>
                  <option value="penthouse">Penthouse</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`unit-count-${unit.id}`}>Number of Units</Label>
                <Input 
                  id={`unit-count-${unit.id}`} 
                  placeholder="0" 
                  type="number"
                  value={unit.count}
                  onChange={(e) => updateUnitMix(unit.id, "count", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`unit-sqft-${unit.id}`}>Avg. Square Footage</Label>
                <Input 
                  id={`unit-sqft-${unit.id}`} 
                  placeholder="0" 
                  type="number"
                  value={unit.squareFootage}
                  onChange={(e) => updateUnitMix(unit.id, "squareFootage", e.target.value)}
                />
              </div>

              <div className="flex items-end justify-end">
                {unitMixes.length > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={(e) => {
                      stopPropagation(e);
                      removeUnitMix(unit.id);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          <div className="pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={(e) => {
                stopPropagation(e);
                addUnitMix();
              }}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" /> Add Another Unit Type
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnitMixTab;
