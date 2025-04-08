
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { useExtendedPropertyState } from "@/hooks/useExtendedPropertyState";
import BuildingParameters from "@/components/property/BuildingParameters";
import EnhancedSpaceTypeInput from "@/components/property/EnhancedSpaceTypeInput";
import FloorStackingDiagram from "@/components/property/FloorStackingDiagram";
import BuildingMassingVisualization from "@/components/property/BuildingMassingVisualization";
import SpaceSummaryDashboard from "@/components/property/SpaceSummaryDashboard";
import PhasingTimeline from "@/components/property/PhasingTimeline";
import FloorConfigurationManager from "@/components/property/FloorConfigurationManager";
import { useModelState } from "@/hooks/useModelState";
import { Separator } from "@/components/ui/separator"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpaceDefinition, FloorPlateTemplate } from "@/types/propertyTypes";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useCallback } from "react";

const PropertyBreakdown = () => {
  
  const {
    // Project Information
    projectName, setProjectName,
    projectLocation, setProjectLocation,
    projectType, setProjectType,
    
    // Building Parameters
    farAllowance, setFarAllowance,
    totalLandArea, setTotalLandArea,
    buildingFootprint, setBuildingFootprint,
    totalBuildableArea,
    totalAboveGroundArea,
    totalBelowGroundArea,
    actualFar,
    totalAllocatedArea,
    
    // Floor Templates
    floorTemplates,
    addFloorTemplate,
    updateFloorTemplate,
    removeFloorTemplate,
    
    // Floor Configurations
    floorConfigurations,
    updateFloorConfiguration,
    copyFloorConfiguration,
    bulkEditFloorConfigurations,
    addFloors,
    removeFloors,
    reorderFloor,
    updateFloorSpaces,
    
    // Space Types
    spaceTypes, 
    addSpaceType,
    removeSpaceType,
    updateSpaceType,
    updateSpaceTypeFloorAllocation,
    
    // Unit Mix
    unitMixes,
    addUnitMix,
    removeUnitMix,
    updateUnitMix,
    
    // Visualization data
    generateFloorsData,
    generateSpaceBreakdown,
    generatePhasesData,
    spaceTypeColors,
    
    // Issues
    issues
  } = useExtendedPropertyState();
  
  // Get common handlers from the model state to ensure persistence
  const { handleTextChange, handleNumberChange } = useModelState();

  // Ensure clean-up of any global event listeners when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any global event listeners to prevent memory leaks
      const modals = document.querySelectorAll('[role="dialog"]');
      modals.forEach(modal => {
        modal.removeAttribute('data-state');
      });
    };
  }, []);

  // Generate data for visualizations
  const floorsData = generateFloorsData();
  const spaceBreakdown = generateSpaceBreakdown();
  const phasesData = generatePhasesData();
  
  // Create adapter functions to convert between the two function signatures
  // For BuildingParameters component (expects id, field, value)
  const adaptedUpdateFloorTemplateForBuildingParams = useCallback((id: string, field: keyof FloorPlateTemplate, value: string) => {
    updateFloorTemplate(id, { [field]: value });
  }, [updateFloorTemplate]);
  
  // For FloorConfigurationManager component (expects id, template)
  const adaptedUpdateFloorTemplateForConfigManager = useCallback((id: string, template: Partial<FloorPlateTemplate>) => {
    updateFloorTemplate(id, template);
  }, [updateFloorTemplate]);
  
  // Fix: Direct pass through of template data rather than creating default values
  // This ensures user input values are used when creating a new template
  const adaptedAddFloorTemplate = useCallback((defaultTemplate?: Omit<FloorPlateTemplate, "id">) => {
    // If a template is provided, pass it through, otherwise create a default
    const template = defaultTemplate || {
      name: "New Template",
      squareFootage: "10000",
      floorToFloorHeight: "12",
      efficiencyFactor: "85",
      corePercentage: "15",
      primaryUse: "office",
      description: ""
    };
    
    addFloorTemplate(template);
  }, [addFloorTemplate]);
  
  // Safely stop propagation to prevent unexpected behavior
  const stopPropagation = useCallback((e: React.MouseEvent<Element, MouseEvent>) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    return true;
  }, []);
  
  // Fix for type issues - convert string values to numbers
  const buildingFootprintAsNumber = parseFloat(buildingFootprint || "0");
  const totalBuildableAreaAsNumber = parseFloat(String(totalBuildableArea) || "0");
  const totalAllocatedAreaAsNumber = parseFloat(String(totalAllocatedArea) || "0");
  const aboveGroundFloorsCount = floorConfigurations.filter(f => !f.isUnderground).length;
  const belowGroundFloorsCount = floorConfigurations.filter(f => f.isUnderground).length;
  
  return (
    <div 
      className="space-y-6"
      onClick={(e) => stopPropagation(e)}
    >
      <div>
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Property Breakdown</h2>
        <p className="text-gray-600 mb-6">Define the basic characteristics and mix of your development project.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
          <CardDescription>Set your project's basic details</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input 
              id="project-name" 
              placeholder="Enter project name" 
              value={projectName}
              onChange={(e) => handleTextChange(e, setProjectName)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input 
              id="location" 
              placeholder="City, State" 
              value={projectLocation}
              onChange={(e) => handleTextChange(e, setProjectLocation)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-type">Project Type</Label>
            <Input 
              id="project-type" 
              placeholder="Mixed-use, Residential, etc." 
              value={projectType}
              onChange={(e) => handleTextChange(e, setProjectType)}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Building Parameters Section */}
      <BuildingParameters
        farAllowance={farAllowance}
        setFarAllowance={(value) => {
          setFarAllowance(value);
        }}
        totalLandArea={totalLandArea}
        setTotalLandArea={(value) => {
          setTotalLandArea(value);
        }}
        buildingFootprint={buildingFootprint}
        setBuildingFootprint={(value) => {
          setBuildingFootprint(value);
        }}
        totalBuildableArea={totalBuildableArea}
        totalAboveGroundArea={totalAboveGroundArea}
        totalBelowGroundArea={totalBelowGroundArea}
        actualFar={actualFar}
        floorTemplates={floorTemplates}
        addFloorTemplate={adaptedAddFloorTemplate}
        updateFloorTemplate={adaptedUpdateFloorTemplateForBuildingParams}
        removeFloorTemplate={removeFloorTemplate}
      />
      
      {/* Floor Configuration Manager */}
      <FloorConfigurationManager 
        floorConfigurations={floorConfigurations}
        floorTemplates={floorTemplates}
        updateFloorConfiguration={updateFloorConfiguration}
        copyFloorConfiguration={copyFloorConfiguration}
        bulkEditFloorConfigurations={bulkEditFloorConfigurations}
        updateFloorSpaces={updateFloorSpaces}
        addFloors={addFloors}
        removeFloors={removeFloors}
        reorderFloor={reorderFloor}
        addFloorTemplate={adaptedAddFloorTemplate}
        updateFloorTemplate={adaptedUpdateFloorTemplateForConfigManager}
        removeFloorTemplate={removeFloorTemplate}
      />
      
      {/* Visualizations Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BuildingMassingVisualization 
          buildingFootprint={buildingFootprintAsNumber}
          numberOfFloors={aboveGroundFloorsCount}
          numberOfUndergroundFloors={belowGroundFloorsCount}
          spaceBreakdown={spaceBreakdown}
          floorConfigurations={floorConfigurations}
          floorTemplates={floorTemplates}
        />
        
        <FloorStackingDiagram 
          floors={floorsData}
          spaceTypeColors={spaceTypeColors}
          floorTemplates={floorTemplates}
          floorConfigurations={floorConfigurations}
          updateFloorConfiguration={updateFloorConfiguration}
          reorderFloor={reorderFloor}
        />
      </div>
      
      <Separator className="my-2" />
      
      <Tabs defaultValue="space-types">
        <TabsList>
          <TabsTrigger value="space-types">Space Types</TabsTrigger>
          <TabsTrigger value="unit-mix">Unit Mix</TabsTrigger>
        </TabsList>
        
        <TabsContent value="space-types">
          {/* Space Types Section */}
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
                    availableFloors={floorConfigurations.length}
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
        </TabsContent>
        
        <TabsContent value="unit-mix">
          {/* Unit Mix Section */}
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
        </TabsContent>
      </Tabs>
      
      {/* Space Summary and Phasing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SpaceSummaryDashboard
          totalBuildableArea={totalBuildableAreaAsNumber}
          totalAllocatedArea={totalAllocatedAreaAsNumber}
          spaceBreakdown={spaceBreakdown}
          issues={issues}
        />
        
        <PhasingTimeline 
          phases={phasesData}
          spaceTypeColors={spaceTypeColors}
        />
      </div>
      <Toaster />
    </div>
  );
};

export default PropertyBreakdown;
