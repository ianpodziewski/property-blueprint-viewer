
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FloorPlateTemplates from "./FloorPlateTemplates";
import UnitMix from "./UnitMix";
import NonRentableComponents from "./NonRentableComponents";
import { FloorPlateTemplate, Product, UnitType, BuildingComponentCategory } from "@/hooks/usePropertyState";

interface PlanningCardProps {
  floorPlateTemplates: FloorPlateTemplate[];
  products: Product[];
  buildingComponentCategories: BuildingComponentCategory[];
  onAddTemplate: (template: Omit<FloorPlateTemplate, 'id'>) => Promise<FloorPlateTemplate | null>;
  onUpdateTemplate: (id: string, updates: Partial<Omit<FloorPlateTemplate, 'id'>>) => Promise<boolean>;
  onDeleteTemplate: (id: string) => Promise<boolean>;
  onAddProduct: (name: string) => Promise<Product | null>;
  onUpdateProduct: (id: string, name: string) => Promise<boolean>;
  onDeleteProduct: (id: string) => Promise<boolean>;
  onAddUnitType: (productId: string, unit: Omit<UnitType, 'id'>) => Promise<UnitType | null>;
  onUpdateUnitType: (productId: string, unitId: string, updates: Partial<Omit<UnitType, 'id'>>) => Promise<boolean>;
  onDeleteUnitType: (productId: string, unitId: string) => Promise<boolean>;
  onAddComponent: (name: string) => Promise<BuildingComponentCategory | null>;
  onUpdateComponent: (id: string, name: string) => Promise<boolean>;
  onDeleteComponent: (id: string) => Promise<boolean>;
}

const PlanningCard = ({
  floorPlateTemplates,
  products,
  buildingComponentCategories,
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddUnitType,
  onUpdateUnitType,
  onDeleteUnitType,
  onAddComponent,
  onUpdateComponent,
  onDeleteComponent
}: PlanningCardProps) => {
  const [activeTab, setActiveTab] = useState("floor-plate-templates");

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Planning</CardTitle>
        <CardDescription>Plan your development's floor templates and unit types</CardDescription>
      </CardHeader>
      <CardContent className="pb-8">
        <Tabs 
          defaultValue="floor-plate-templates" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="floor-plate-templates">Floor Plate Templates</TabsTrigger>
            <TabsTrigger value="unit-mix">Unit Mix</TabsTrigger>
            <TabsTrigger value="non-rentable">Non-Rentable</TabsTrigger>
          </TabsList>
          
          <TabsContent value="floor-plate-templates" className="mt-0">
            <div className="text-sm text-gray-500 mb-4">
              Create templates for recurring floor configurations
            </div>
            <FloorPlateTemplates
              templates={floorPlateTemplates}
              onAddTemplate={onAddTemplate}
              onUpdateTemplate={onUpdateTemplate}
              onDeleteTemplate={onDeleteTemplate}
            />
          </TabsContent>
          
          <TabsContent value="unit-mix" className="mt-0">
            <div className="text-sm text-gray-500 mb-4">
              Define the types of units for your development
            </div>
            <UnitMix
              products={products}
              onAddProduct={onAddProduct}
              onUpdateProduct={onUpdateProduct}
              onDeleteProduct={onDeleteProduct}
              onAddUnitType={onAddUnitType}
              onUpdateUnitType={onUpdateUnitType}
              onDeleteUnitType={onDeleteUnitType}
            />
          </TabsContent>
          
          <TabsContent value="non-rentable" className="mt-0">
            <div className="text-sm text-gray-500 mb-4">
              Define non-rentable spaces to ensure complete building allocation
            </div>
            <NonRentableComponents
              components={buildingComponentCategories}
              onAddComponent={onAddComponent}
              onUpdateComponent={onUpdateComponent}
              onDeleteComponent={onDeleteComponent}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PlanningCard;
