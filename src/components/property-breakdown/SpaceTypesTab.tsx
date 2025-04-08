
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import EnhancedSpaceTypeInput from "@/components/property/EnhancedSpaceTypeInput";
import { SpaceType } from "@/types/propertyTypes";

interface SpaceTypesTabProps {
  spaceTypes: SpaceType[];
  addSpaceType: () => void;
  removeSpaceType: (id: string) => void;
  updateSpaceType: (id: string, field: keyof SpaceType, value: string) => void;
  updateSpaceTypeFloorAllocation: (id: string, floor: number, value: string) => void;
  availableFloors: number;
  stopPropagation: (e: React.MouseEvent<Element, MouseEvent>) => boolean;
}

const SpaceTypesTab: React.FC<SpaceTypesTabProps> = ({
  spaceTypes, 
  addSpaceType,
  removeSpaceType,
  updateSpaceType,
  updateSpaceTypeFloorAllocation,
  availableFloors,
  stopPropagation
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Space Types</CardTitle>
        <CardDescription>Define the different space types in your development and their floor allocation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {spaceTypes.map((space) => (
            <EnhancedSpaceTypeInput 
              key={space.id}
              id={space.id}
              type={space.type}
              squareFootage={space.squareFootage}
              units={space.units}
              phase={space.phase}
              efficiencyFactor={space.efficiencyFactor}
              floorAllocation={space.floorAllocation}
              onUpdate={(id, field, value) => {
                updateSpaceType(id, field as keyof typeof space, value);
              }}
              onUpdateFloorAllocation={(id, floor, value) => {
                updateSpaceTypeFloorAllocation(id, floor, value);
              }}
              onRemove={removeSpaceType}
              availableFloors={availableFloors}
            />
          ))}
          
          <div className="pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={(e) => {
                stopPropagation(e);
                addSpaceType();
              }}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" /> Add Another Space Type
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpaceTypesTab;
