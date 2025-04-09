
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModel } from "@/context/ModelContext";
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import FloorPlateTemplates from "./property/FloorPlateTemplates";
import UnitMix from "./property/UnitMix";

const formatNumber = (num: number): string => {
  return isNaN(num) ? "" : num.toLocaleString('en-US');
};

const PropertyBreakdown = () => {
  const {
    property,
    setHasUnsavedChanges
  } = useModel();
  
  const [formattedLotSize, setFormattedLotSize] = useState<string>(property.lotSize ? formatNumber(property.lotSize) : "");
  
  useEffect(() => {
    console.log("PropertyBreakdown mounted, connected to context state", {
      projectName: property.projectName,
      projectLocation: property.projectLocation,
      projectType: property.projectType,
      farAllowance: property.farAllowance,
      lotSize: property.lotSize,
      maxBuildableArea: property.maxBuildableArea,
      initialLoadComplete: property.initialLoadComplete,
      floorPlateTemplatesCount: property.floorPlateTemplates.length,
      productsCount: property.products.length
    });
  }, [property]);

  useEffect(() => {
    setFormattedLotSize(property.lotSize ? formatNumber(property.lotSize) : "");
  }, [property.lotSize]);

  return <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Property Breakdown</h2>
        <p className="text-gray-600 mb-6">Define the basic characteristics of your development project.</p>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
          <CardDescription>Set your project's basic details</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input id="project-name" placeholder="Enter project name" value={property.projectName} onChange={e => {
            property.setProjectName(e.target.value);
            setHasUnsavedChanges(true);
            console.log("Project name input changed to:", e.target.value);
          }} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="City, State" value={property.projectLocation} onChange={e => {
            property.setProjectLocation(e.target.value);
            setHasUnsavedChanges(true);
            console.log("Location input changed to:", e.target.value);
          }} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-type">Project Type</Label>
            <Input id="project-type" placeholder="Mixed-use, Residential, etc." value={property.projectType} onChange={e => {
            property.setProjectType(e.target.value);
            setHasUnsavedChanges(true);
            console.log("Project type input changed to:", e.target.value);
          }} />
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Building Parameters</CardTitle>
          <CardDescription>Define the physical constraints of your development</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="far-allowance">FAR Allowance (%)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">Floor Area Ratio - the ratio of a building's total floor area to the size of the lot</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="relative">
              <Input id="far-allowance" placeholder="e.g., 1600 for FAR of 16" value={property.farAllowance || ""} onChange={e => {
              const value = e.target.value.replace(/[^0-9.]/g, '');
              const numericValue = value === '' ? 0 : Number(value);
              property.setFarAllowance(numericValue);
              setHasUnsavedChanges(true);
              console.log("FAR allowance input changed to:", numericValue);
            }} type="text" className="pr-8" />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500">%</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lot-size">Lot Size (sf)</Label>
            <Input id="lot-size" placeholder="Enter lot size" value={formattedLotSize} onChange={e => {
            const rawValue = e.target.value.replace(/[^0-9]/g, '');
            const numericValue = rawValue === '' ? 0 : Number(rawValue);
            property.setLotSize(numericValue);
            setFormattedLotSize(formatNumber(numericValue));
            setHasUnsavedChanges(true);
            console.log("Lot size input changed to:", numericValue);
          }} type="text" className="pr-8" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="max-buildable-area">Maximum Buildable Area (sf)</Label>
            <Input id="max-buildable-area" value={formatNumber(property.maxBuildableArea)} readOnly className="bg-gray-50 text-gray-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Project Configuration</CardTitle>
          <CardDescription>Define the building elements of your development</CardDescription>
        </CardHeader>
        <CardContent className="pb-8 space-y-6">
          <FloorPlateTemplates />
          <UnitMix />
        </CardContent>
      </Card>
    </div>;
};

export default PropertyBreakdown;
