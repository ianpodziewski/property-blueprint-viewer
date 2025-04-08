
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
import { SpaceDefinition, FloorPlateTemplate, FloorConfiguration } from "@/types/propertyTypes";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useCallback, useState } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useToast } from "@/components/ui/use-toast";
import UIRecoveryButton from "@/components/UIRecoveryButton";

const ProjectInformation = ({ 
  projectName, setProjectName, 
  projectLocation, setProjectLocation, 
  projectType, setProjectType, 
  handleTextChange 
}) => {
  return (
    <ErrorBoundary componentName="Project Information">
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
    </ErrorBoundary>
  );
};

const SpaceTypesTab = ({ 
  spaceTypes, 
  addSpaceType, 
  removeSpaceType, 
  updateSpaceType, 
  updateSpaceTypeFloorAllocation, 
  floorConfigurations, 
  stopPropagation 
}) => {
  return (
    <ErrorBoundary componentName="Space Types">
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
    </ErrorBoundary>
  );
};

const UnitMixTab = ({ 
  unitMixes, 
  addUnitMix, 
  removeUnitMix, 
  updateUnitMix, 
  stopPropagation 
}) => {
  return (
    <ErrorBoundary componentName="Unit Mix">
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
    </ErrorBoundary>
  );
};

const VisualizationsRow = ({ 
  buildingFootprint, 
  floorConfigurations, 
  floorTemplates, 
  floorsData, 
  spaceBreakdown, 
  spaceTypeColors,
  updateFloorConfiguration, 
  reorderFloor 
}) => {
  // Fix adapter functions to match the expected types
  const adaptedUpdateFloorConfig = useCallback((floorNumber: number, updates: Partial<FloorConfiguration>) => {
    // Convert object updates to individual field updates
    Object.entries(updates).forEach(([key, value]) => {
      updateFloorConfiguration(floorNumber, key as keyof FloorConfiguration, value);
    });
  }, [updateFloorConfiguration]);

  const adaptedReorderFloor = useCallback((fromIndex: number, toIndex: number) => {
    // Convert from/to index to direction
    const direction = toIndex > fromIndex ? 'down' : 'up';
    reorderFloor(fromIndex, direction);
  }, [reorderFloor]);

  return (
    <ErrorBoundary componentName="Visualizations">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BuildingMassingVisualization 
          buildingFootprint={parseFloat(buildingFootprint) || 0}
          numberOfFloors={floorConfigurations.filter(f => !f.isUnderground).length}
          numberOfUndergroundFloors={floorConfigurations.filter(f => f.isUnderground).length}
          spaceBreakdown={spaceBreakdown}
          floorConfigurations={floorConfigurations}
          floorTemplates={floorTemplates}
        />
        
        <FloorStackingDiagram 
          floors={floorsData}
          spaceTypeColors={spaceTypeColors}
          floorTemplates={floorTemplates}
          floorConfigurations={floorConfigurations}
          updateFloorConfiguration={adaptedUpdateFloorConfig}
          reorderFloor={adaptedReorderFloor}
        />
      </div>
    </ErrorBoundary>
  );
};

const SummaryRow = ({ 
  totalBuildableArea, 
  totalAllocatedArea, 
  spaceBreakdown, 
  issues,
  phasesData, 
  spaceTypeColors 
}) => {
  return (
    <ErrorBoundary componentName="Summary Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SpaceSummaryDashboard
          totalBuildableArea={totalBuildableArea}
          totalAllocatedArea={totalAllocatedArea}
          spaceBreakdown={spaceBreakdown}
          issues={issues}
        />
        
        <PhasingTimeline 
          phases={phasesData}
          spaceTypeColors={spaceTypeColors}
        />
      </div>
    </ErrorBoundary>
  );
};

const PropertyBreakdownHeading = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-blue-700 mb-4">Property Breakdown</h2>
      <p className="text-gray-600 mb-6">Define the basic characteristics and mix of your development project.</p>
    </div>
  );
};

const PropertyBreakdown = () => {
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();
  
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
    const cleanupFunction = () => {
      // Clean up any global event listeners to prevent memory leaks
      const modals = document.querySelectorAll('[role="dialog"]');
      modals.forEach(modal => {
        modal.removeAttribute('data-state');
      });
      
      // Clean up any other event listeners
      window.removeEventListener('keydown', handleKeyDown);
    };
    
    // Handle keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      // Add global keyboard shortcuts if needed
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return cleanupFunction;
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
    try {
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
    } catch (error) {
      console.error('Failed to add floor template:', error);
      toast({
        title: "Error",
        description: `Failed to add new floor template. Please try again.`,
        variant: "destructive",
      });
    }
  }, [addFloorTemplate, toast]);
  
  // Safely stop propagation to prevent unexpected behavior
  const stopPropagation = useCallback((e: React.MouseEvent<Element, MouseEvent>) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    return true;
  }, []);
  
  // Create adapter functions for FloorConfigurationManager compatibility
  const adaptedUpdateFloorConfig = useCallback((index: number, updates: Partial<FloorConfiguration>) => {
    // Convert object updates to individual field updates
    Object.entries(updates).forEach(([key, value]) => {
      updateFloorConfiguration(index, key as keyof FloorConfiguration, value);
    });
  }, [updateFloorConfiguration]);

  const adaptedReorderFloor = useCallback((fromIndex: number, toIndex: number) => {
    // Convert from/to index to direction
    const direction = toIndex > fromIndex ? 'down' : 'up';
    reorderFloor(fromIndex, direction);
  }, [reorderFloor]);
  
  return (
    <ErrorBoundary 
      componentName="Property Breakdown" 
      onReset={() => {
        setHasError(false);
        // Force re-initialization of critical components
        window.location.reload();
      }}
    >
      <div 
        className="space-y-6"
        onClick={(e) => stopPropagation(e)}
      >
        <PropertyBreakdownHeading />
        
        {hasError && (
          <div className="mb-4 p-4 border border-red-300 bg-red-50 rounded-md">
            <h3 className="text-red-700 font-medium mb-2">UI Recovery Required</h3>
            <p className="text-sm mb-3">
              The application has detected issues with UI interactivity. Use the UI Recovery button to restore functionality.
            </p>
            <div className="flex justify-end">
              <UIRecoveryButton />
            </div>
          </div>
        )}
        
        <ProjectInformation
          projectName={projectName}
          setProjectName={setProjectName}
          projectLocation={projectLocation}
          setProjectLocation={setProjectLocation}
          projectType={projectType}
          setProjectType={setProjectType}
          handleTextChange={handleTextChange}
        />
        
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
        <ErrorBoundary componentName="Floor Configuration Manager">
          <FloorConfigurationManager 
            floorConfigurations={floorConfigurations}
            floorTemplates={floorTemplates}
            updateFloorConfiguration={adaptedUpdateFloorConfig}
            copyFloorConfiguration={copyFloorConfiguration}
            bulkEditFloorConfigurations={bulkEditFloorConfigurations}
            updateFloorSpaces={updateFloorSpaces}
            addFloors={addFloors}
            removeFloors={removeFloors}
            reorderFloor={adaptedReorderFloor}
            addFloorTemplate={adaptedAddFloorTemplate}
            updateFloorTemplate={adaptedUpdateFloorTemplateForConfigManager}
            removeFloorTemplate={removeFloorTemplate}
          />
        </ErrorBoundary>
        
        {/* Visualizations Row */}
        <VisualizationsRow 
          buildingFootprint={buildingFootprint}
          floorConfigurations={floorConfigurations}
          floorTemplates={floorTemplates}
          floorsData={floorsData}
          spaceBreakdown={spaceBreakdown}
          spaceTypeColors={spaceTypeColors}
          updateFloorConfiguration={updateFloorConfiguration}
          reorderFloor={reorderFloor}
        />
        
        <Separator className="my-2" />
        
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
              floorConfigurations={floorConfigurations}
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
        
        {/* Space Summary and Phasing */}
        <SummaryRow 
          totalBuildableArea={totalBuildableArea}
          totalAllocatedArea={totalAllocatedArea}
          spaceBreakdown={spaceBreakdown}
          issues={issues}
          phasesData={phasesData}
          spaceTypeColors={spaceTypeColors}
        />
        <Toaster />
      </div>
    </ErrorBoundary>
  );
};

export default PropertyBreakdown;
