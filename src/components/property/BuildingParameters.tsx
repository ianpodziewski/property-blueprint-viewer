
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FloorPlateTemplate {
  id: string;
  name: string;
  squareFootage: string;
  floorToFloorHeight: string;
  efficiencyFactor: string;
  corePercentage: string;
}

interface BuildingParametersProps {
  farAllowance: string;
  setFarAllowance: (value: string) => void;
  totalLandArea: string;
  setTotalLandArea: (value: string) => void;
  buildingFootprint: string;
  setBuildingFootprint: (value: string) => void;
  numberOfFloors: string;
  setNumberOfFloors: (value: string) => void;
  numberOfUndergroundFloors: string;
  setNumberOfUndergroundFloors: (value: string) => void;
  totalBuildableArea: number;
  totalAboveGroundArea: number;
  totalBelowGroundArea: number;
  actualFar: number;
  
  // Floor template management
  floorTemplates: FloorPlateTemplate[];
  addFloorTemplate: () => void;
  updateFloorTemplate: (id: string, field: keyof FloorPlateTemplate, value: string) => void;
  removeFloorTemplate: (id: string) => void;
}

const BuildingParameters = ({
  farAllowance,
  setFarAllowance,
  totalLandArea,
  setTotalLandArea,
  buildingFootprint,
  setBuildingFootprint,
  numberOfFloors,
  setNumberOfFloors,
  numberOfUndergroundFloors,
  setNumberOfUndergroundFloors,
  totalBuildableArea,
  totalAboveGroundArea,
  totalBelowGroundArea,
  actualFar,
  floorTemplates,
  addFloorTemplate,
  updateFloorTemplate,
  removeFloorTemplate
}: BuildingParametersProps) => {
  const [farUtilization, setFarUtilization] = useState(0);
  
  // Calculate FAR utilization percentage
  useEffect(() => {
    if (parseFloat(farAllowance) > 0) {
      setFarUtilization(Math.min((actualFar / parseFloat(farAllowance)) * 100, 100));
    } else {
      setFarUtilization(0);
    }
  }, [farAllowance, actualFar]);

  return (
    <Tabs defaultValue="parameters" className="w-full">
      <TabsList className="mb-2">
        <TabsTrigger value="parameters">Building Parameters</TabsTrigger>
        <TabsTrigger value="templates">Floor Templates</TabsTrigger>
      </TabsList>
      
      <TabsContent value="parameters">
        <Card>
          <CardHeader>
            <CardTitle>Building Parameters</CardTitle>
            <CardDescription>Define the overall building parameters and FAR calculations</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="zoning-far">Zoning FAR Allowance</Label>
              <Input 
                id="zoning-far" 
                placeholder="0.0" 
                type="number"
                value={farAllowance}
                onChange={(e) => setFarAllowance(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="total-land">Total Land Area (sq ft)</Label>
              <Input 
                id="total-land" 
                placeholder="0" 
                type="number"
                value={totalLandArea}
                onChange={(e) => setTotalLandArea(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="building-footprint">Building Footprint (sq ft)</Label>
              <Input 
                id="building-footprint" 
                placeholder="0" 
                type="number"
                value={buildingFootprint}
                onChange={(e) => setBuildingFootprint(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number-floors">Above Ground Floors</Label>
                <Input 
                  id="number-floors" 
                  placeholder="0" 
                  type="number"
                  value={numberOfFloors}
                  onChange={(e) => setNumberOfFloors(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="number-underground-floors">Below Ground Floors</Label>
                <Input 
                  id="number-underground-floors" 
                  placeholder="0" 
                  type="number"
                  value={numberOfUndergroundFloors}
                  onChange={(e) => setNumberOfUndergroundFloors(e.target.value)}
                />
              </div>
            </div>
            
            <div className="col-span-2">
              <Separator className="my-4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Total Buildable Area (sq ft)</Label>
                  <div className="text-xl font-semibold bg-gray-50 py-2 px-3 rounded-md border border-gray-200">
                    {totalBuildableArea.toLocaleString()}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Above Ground Area (sq ft)</Label>
                  <div className="text-xl font-semibold bg-gray-50 py-2 px-3 rounded-md border border-gray-200">
                    {totalAboveGroundArea.toLocaleString()}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Below Ground Area (sq ft)</Label>
                  <div className="text-xl font-semibold bg-gray-50 py-2 px-3 rounded-md border border-gray-200">
                    {totalBelowGroundArea.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-span-2 space-y-2">
              <div className="flex justify-between items-center">
                <Label>Actual FAR</Label>
                <span className={actualFar > parseFloat(farAllowance) ? "text-red-500 font-medium" : "text-green-600 font-medium"}>
                  {actualFar.toFixed(2)}
                </span>
              </div>
              <Progress value={farUtilization} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0</span>
                <span>FAR Utilization: {farUtilization.toFixed(1)}%</span>
                <span>Allowance: {farAllowance}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="templates">
        <Card>
          <CardHeader>
            <CardTitle>Floor Plate Templates</CardTitle>
            <CardDescription>Define reusable floor plate configurations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {floorTemplates.map((template) => (
                <div 
                  key={template.id}
                  className="grid grid-cols-1 lg:grid-cols-6 gap-4 pb-6 border-b border-gray-200 last:border-0 last:pb-0"
                >
                  <div className="space-y-2 lg:col-span-2">
                    <Label htmlFor={`template-name-${template.id}`}>Template Name</Label>
                    <Input 
                      id={`template-name-${template.id}`}
                      placeholder="Standard Floor"
                      value={template.name}
                      onChange={(e) => updateFloorTemplate(template.id, "name", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`template-sqft-${template.id}`}>Square Footage</Label>
                    <Input 
                      id={`template-sqft-${template.id}`}
                      placeholder="0"
                      type="number" 
                      value={template.squareFootage}
                      onChange={(e) => updateFloorTemplate(template.id, "squareFootage", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`template-height-${template.id}`}>Floor-to-Floor Height (ft)</Label>
                    <Input 
                      id={`template-height-${template.id}`}
                      placeholder="12"
                      type="number" 
                      value={template.floorToFloorHeight}
                      onChange={(e) => updateFloorTemplate(template.id, "floorToFloorHeight", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`template-efficiency-${template.id}`}>Efficiency Factor (%)</Label>
                    <Input 
                      id={`template-efficiency-${template.id}`}
                      placeholder="85"
                      type="number" 
                      value={template.efficiencyFactor}
                      onChange={(e) => updateFloorTemplate(template.id, "efficiencyFactor", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2 flex items-end">
                    {floorTemplates.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFloorTemplate(template.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addFloorTemplate}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add Template
              </Button>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 text-xs text-muted-foreground">
            <p>Floor plate templates can be applied to one or more floors in your building.</p>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default BuildingParameters;
