
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SpaceTypesTab from "./SpaceTypesTab";
import UnitMixTab from "./UnitMixTab";
import { SpaceType, UnitMix } from "@/types/propertyTypes";

interface SpaceTabContentProps {
  spaceTypes: SpaceType[];
  unitMixes: UnitMix[];
  addSpaceType: () => void;
  removeSpaceType: (id: string) => void;
  updateSpaceType: (id: string, field: keyof SpaceType, value: string) => void;
  updateSpaceTypeFloorAllocation: (id: string, floor: number, value: string) => void;
  addUnitMix: () => void;
  removeUnitMix: (id: string) => void;
  updateUnitMix: (id: string, field: keyof UnitMix, value: string) => void;
  floorConfigurations: any[];
  stopPropagation: (e: React.MouseEvent<Element, MouseEvent>) => boolean;
}

const SpaceTabContent: React.FC<SpaceTabContentProps> = ({
  spaceTypes,
  unitMixes,
  addSpaceType,
  removeSpaceType,
  updateSpaceType,
  updateSpaceTypeFloorAllocation,
  addUnitMix,
  removeUnitMix,
  updateUnitMix,
  floorConfigurations,
  stopPropagation
}) => {
  return (
    <Tabs defaultValue="space-types">
      <TabsList>
        <TabsTrigger value="space-types">Space Types</TabsTrigger>
        <TabsTrigger value="unit-mix">Unit Mix</TabsTrigger>
      </TabsList>
      
      <TabsContent value="space-types">
        <SpaceTypesTab
          spaceTypes={spaceTypes}
          addSpaceType={addSpaceType}
          removeSpaceType={removeSpaceType}
          updateSpaceType={updateSpaceType}
          updateSpaceTypeFloorAllocation={updateSpaceTypeFloorAllocation}
          availableFloors={floorConfigurations.length}
          stopPropagation={stopPropagation}
        />
      </TabsContent>
      
      <TabsContent value="unit-mix">
        <UnitMixTab
          unitMixes={unitMixes}
          addUnitMix={addUnitMix}
          removeUnitMix={removeUnitMix}
          updateUnitMix={updateUnitMix}
          stopPropagation={stopPropagation}
        />
      </TabsContent>
    </Tabs>
  );
};

export default SpaceTabContent;
