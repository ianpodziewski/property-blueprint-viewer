
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import FloorPlateTemplates from "./property/FloorPlateTemplates";
import UnitMix from "./property/UnitMix";
import BuildingLayout from "./property/BuildingLayout";
import { useSupabasePropertyData } from "@/hooks/useSupabasePropertyData";
import { useParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formatNumber = (num: number): string => {
  return isNaN(num) ? "" : num.toLocaleString('en-US');
};

const PropertyBreakdown = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const {
    loading,
    saving,
    error,
    projectData,
    updateProjectInfo,
    floorPlateTemplates,
    products,
    floors,
    addFloorPlateTemplate,
    updateFloorPlateTemplate,
    deleteFloorPlateTemplate,
    addProduct,
    updateProduct,
    deleteProduct,
    addUnitType,
    updateUnitType,
    deleteUnitType,
    addFloor,
    updateFloor,
    deleteFloor,
    updateUnitAllocation,
    getUnitAllocation,
    getFloorTemplateById
  } = useSupabasePropertyData(projectId || null);
  
  const [formattedLotSize, setFormattedLotSize] = useState<string>("");
  
  // Calculate max buildable area whenever lot size or FAR changes
  useEffect(() => {
    if (projectData) {
      const maxArea = projectData.far_allowance > 0 && projectData.lot_size > 0 
        ? (projectData.lot_size * projectData.far_allowance / 100) 
        : 0;
      
      if (maxArea !== projectData.max_buildable_area) {
        updateProjectInfo({ max_buildable_area: maxArea });
      }
    }
  }, [projectData?.far_allowance, projectData?.lot_size]);

  // Update formatted lot size whenever projectData changes
  useEffect(() => {
    if (projectData) {
      setFormattedLotSize(formatNumber(projectData.lot_size));
    }
  }, [projectData?.lot_size]);

  // Handle lot size input change with formatting
  const handleLotSizeChange = (value: string) => {
    const rawValue = value.replace(/[^0-9]/g, '');
    const numericValue = rawValue === '' ? 0 : Number(rawValue);
    updateProjectInfo({ lot_size: numericValue });
    setFormattedLotSize(formatNumber(numericValue));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">Loading project data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-6">
        <AlertDescription>
          {error} Please refresh the page or try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!projectData) {
    return (
      <Alert variant="destructive" className="mt-6">
        <AlertDescription>
          Project not found. Please go back to your projects list and select a valid project.
        </AlertDescription>
      </Alert>
    );
  }

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
            <Input 
              id="project-name" 
              placeholder="Enter project name" 
              value={projectData.name} 
              onChange={e => {
                updateProjectInfo({ name: e.target.value });
              }} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input 
              id="location" 
              placeholder="City, State" 
              value={projectData.location} 
              onChange={e => {
                updateProjectInfo({ location: e.target.value });
              }} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-type">Project Type</Label>
            <Input 
              id="project-type" 
              placeholder="Mixed-use, Residential, etc." 
              value={projectData.project_type} 
              onChange={e => {
                updateProjectInfo({ project_type: e.target.value });
              }} 
            />
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
              <Input 
                id="far-allowance" 
                placeholder="e.g., 1600 for FAR of 16" 
                value={projectData.far_allowance || ""} 
                onChange={e => {
                  const value = e.target.value.replace(/[^0-9.]/g, '');
                  const numericValue = value === '' ? 0 : Number(value);
                  updateProjectInfo({ far_allowance: numericValue });
                }} 
                type="text" 
                className="pr-8" 
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500">%</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lot-size">Lot Size (sf)</Label>
            <Input 
              id="lot-size" 
              placeholder="Enter lot size" 
              value={formattedLotSize} 
              onChange={e => handleLotSizeChange(e.target.value)} 
              type="text" 
              className="pr-8" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="max-buildable-area">Maximum Buildable Area (sf)</Label>
            <Input 
              id="max-buildable-area" 
              value={formatNumber(projectData.max_buildable_area)} 
              readOnly 
              className="bg-gray-50 text-gray-600" 
            />
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Project Configuration</CardTitle>
          <CardDescription>Define the building elements of your development</CardDescription>
        </CardHeader>
        <CardContent className="pb-8 space-y-6">
          <FloorPlateTemplates 
            templates={floorPlateTemplates}
            onAddTemplate={addFloorPlateTemplate}
            onUpdateTemplate={updateFloorPlateTemplate}
            onDeleteTemplate={deleteFloorPlateTemplate}
          />
          
          <UnitMix 
            products={products}
            onAddProduct={addProduct}
            onUpdateProduct={updateProduct}
            onDeleteProduct={deleteProduct}
            onAddUnitType={addUnitType}
            onUpdateUnitType={updateUnitType}
            onDeleteUnitType={deleteUnitType}
          />
          
          <BuildingLayout 
            floors={floors}
            templates={floorPlateTemplates}
            products={products}
            onAddFloor={addFloor}
            onUpdateFloor={updateFloor}
            onDeleteFloor={deleteFloor}
            onUpdateUnitAllocation={updateUnitAllocation}
            getUnitAllocation={getUnitAllocation}
            getFloorTemplateById={getFloorTemplateById}
          />
        </CardContent>
      </Card>
    </div>;
};

export default PropertyBreakdown;
