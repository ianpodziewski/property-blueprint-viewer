import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import BuildingLayout from "./property/BuildingLayout";
import { useSupabasePropertyData } from "@/hooks/useSupabasePropertyData";
import { useParams } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useModel } from "@/context/ModelContext";
import { toast } from "sonner";
import PlanningCard from "./property/PlanningCard";

const formatNumber = (num: number): string => {
  return isNaN(num) ? "" : num.toLocaleString('en-US');
};

const PropertyBreakdown = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { setHasUnsavedChanges } = useModel();
  
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
    getFloorTemplateById,
    reloadProjectData
  } = useSupabasePropertyData(projectId || null);
  
  const [formattedLotSize, setFormattedLotSize] = useState<string>("");
  
  useEffect(() => {
    console.log("PropertyBreakdown: Floors data updated:", floors);
  }, [floors]);
  
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

  useEffect(() => {
    if (projectData) {
      setFormattedLotSize(formatNumber(projectData.lot_size));
    }
  }, [projectData?.lot_size]);

  const handleLotSizeChange = (value: string) => {
    const rawValue = value.replace(/[^0-9]/g, '');
    const numericValue = rawValue === '' ? 0 : Number(rawValue);
    updateProjectInfo({ lot_size: numericValue });
    setFormattedLotSize(formatNumber(numericValue));
    setHasUnsavedChanges(true);
  };

  const handleDataChange = (updates: any) => {
    updateProjectInfo(updates);
    setHasUnsavedChanges(true);
  };

  const handleRetry = () => {
    console.log("Manually triggering data reload");
    reloadProjectData();
  };

  const handleDataRefresh = async (): Promise<void> => {
    console.log("PropertyBreakdown: Manual data refresh requested");
    try {
      await reloadProjectData();
      console.log("PropertyBreakdown: Manual data refresh completed");
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("PropertyBreakdown: Error during manual refresh:", error);
      toast.error("Failed to refresh data");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <div className="text-center">
          <h3 className="text-lg font-medium mb-1">Loading project data...</h3>
          <p className="text-gray-500 text-sm">Please wait while we fetch your project information</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-6">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle>Error Loading Project</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={handleRetry}
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!projectData) {
    return (
      <Alert variant="destructive" className="mt-6">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle>Project Not Found</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>Project not found. Please go back to your projects list and select a valid project.</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={handleRetry}
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Try Again
          </Button>
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
            <div className="relative">
              <Input 
                id="project-name" 
                placeholder="Enter project name" 
                value={projectData.name} 
                onChange={e => {
                  handleDataChange({ name: e.target.value });
                }} 
              />
              {saving && <div className="absolute right-3 top-2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <Input 
                id="location" 
                placeholder="City, State" 
                value={projectData.location} 
                onChange={e => {
                  handleDataChange({ location: e.target.value });
                }} 
              />
              {saving && <div className="absolute right-3 top-2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-type">Project Type</Label>
            <div className="relative">
              <Input 
                id="project-type" 
                placeholder="Mixed-use, Residential, etc." 
                value={projectData.project_type} 
                onChange={e => {
                  handleDataChange({ project_type: e.target.value });
                }} 
              />
              {saving && <div className="absolute right-3 top-2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>}
            </div>
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
                  handleDataChange({ far_allowance: numericValue });
                }} 
                type="text" 
                className="pr-8" 
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500">%</span>
              </div>
              {saving && <div className="absolute right-10 top-2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lot-size">Lot Size (sf)</Label>
            <div className="relative">
              <Input 
                id="lot-size" 
                placeholder="Enter lot size" 
                value={formattedLotSize} 
                onChange={e => handleLotSizeChange(e.target.value)} 
                type="text" 
                className="pr-8" 
              />
              {saving && <div className="absolute right-3 top-2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>}
            </div>
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
      
      <PlanningCard
        floorPlateTemplates={floorPlateTemplates}
        products={products}
        onAddTemplate={addFloorPlateTemplate}
        onUpdateTemplate={updateFloorPlateTemplate}
        onDeleteTemplate={deleteFloorPlateTemplate}
        onAddProduct={addProduct}
        onUpdateProduct={updateProduct}
        onDeleteProduct={deleteProduct}
        onAddUnitType={addUnitType}
        onUpdateUnitType={updateUnitType}
        onDeleteUnitType={deleteUnitType}
      />
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Project Configuration</CardTitle>
          <CardDescription>Define the building elements of your development</CardDescription>
        </CardHeader>
        <CardContent className="pb-8 space-y-6">
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
            onRefreshData={handleDataRefresh}
          />
        </CardContent>
      </Card>
    </div>;
};

export default PropertyBreakdown;
