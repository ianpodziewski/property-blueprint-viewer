
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
import { SpaceDefinition, FloorPlateTemplate, FloorConfiguration, BuildingSystemsConfig } from "@/types/propertyTypes";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useCallback, useMemo, useState } from "react";
import { FLOOR_CONFIG_EVENT } from "@/hooks/property/useFloorConfigurations";
import { useUIRecovery } from "@/App";

const PropertyBreakdown = () => {
  const { toast } = useToast();
  const { isProcessing: isGlobalProcessing, forceUIRecovery } = useUIRecovery();
  
  const [isSafeToInteract, setIsSafeToInteract] = useState(true);
  const [lastInteractionTime, setLastInteractionTime] = useState(0);
  
  const {
    projectName, setProjectName,
    projectLocation, setProjectLocation,
    projectType, setProjectType,
    
    farAllowance, setFarAllowance,
    totalLandArea, setTotalLandArea,
    buildingFootprint, setBuildingFootprint,
    totalBuildableArea,
    totalAboveGroundArea,
    totalBelowGroundArea,
    actualFar,
    totalAllocatedArea,
    
    floorTemplates,
    addFloorTemplate,
    updateFloorTemplate,
    removeFloorTemplate,
    
    floorConfigurations,
    updateFloorConfiguration,
    copyFloorConfiguration,
    bulkEditFloorConfigurations,
    addFloors,
    removeFloors,
    reorderFloor,
    updateFloorSpaces,
    isProcessingOperation,
    
    spaceTypes, 
    addSpaceType,
    removeSpaceType,
    updateSpaceType,
    updateSpaceTypeFloorAllocation,
    
    unitMixes,
    addUnitMix,
    removeUnitMix,
    updateUnitMix,
    
    generateFloorsData,
    generateSpaceBreakdown,
    generatePhasesData,
    spaceTypeColors,
    
    issues
  } = useExtendedPropertyState();
  
  const { handleTextChange, handleNumberChange } = useModelState();

  const adaptedUpdateFloorConfiguration = useCallback((floorNumber: number, field: keyof FloorConfiguration, value: any) => {
    console.log(`adaptedUpdateFloorConfiguration called for floor ${floorNumber}, field ${String(field)}`);
    setLastInteractionTime(Date.now());
    updateFloorConfiguration(floorNumber, field, value);
  }, [updateFloorConfiguration]);

  const safeRemoveFloors = useCallback((floorNumbers: number[]) => {
    console.log(`safeRemoveFloors called for floors ${floorNumbers.join(', ')}`);
    try {
      setIsSafeToInteract(false);
      setLastInteractionTime(Date.now());
      
      const deleteOperation = new Promise<void>((resolve, reject) => {
        try {
          removeFloors(floorNumbers);
          setTimeout(() => {
            console.log("Floor deletion completed successfully");
            resolve();
          }, 300);
        } catch (error) {
          console.error("Error in delete operation:", error);
          reject(error);
        }
      });
      
      deleteOperation
        .then(() => {
          console.log("Restoring UI interactivity after remove floors");
          setTimeout(() => {
            setIsSafeToInteract(true);
          }, 500);
        })
        .catch(error => {
          console.error("Failed to remove floors:", error);
          toast({
            title: "Error removing floors",
            description: "There was a problem removing the selected floors. The UI will be refreshed to recover.",
            variant: "destructive"
          });
          
          setTimeout(() => {
            forceUIRecovery();
            setIsSafeToInteract(true);
          }, 200);
        });
    } catch (outer) {
      console.error("Outer error in safeRemoveFloors:", outer);
      setIsSafeToInteract(true);
      forceUIRecovery();
    }
  }, [removeFloors, toast, forceUIRecovery]);

  const adaptedReorderFloor = useCallback((floorNumber: number, direction: "up" | "down") => {
    console.log(`adaptedReorderFloor called for floor ${floorNumber}, direction ${direction}`);
    setLastInteractionTime(Date.now());
    reorderFloor(floorNumber, direction);
  }, [reorderFloor]);
  
  useEffect(() => {
    const isCurrentlyProcessing = isProcessingOperation || isGlobalProcessing;
    console.log(`Processing state: ${isCurrentlyProcessing ? 'active' : 'inactive'}`);
    
    if (isCurrentlyProcessing) {
      setIsSafeToInteract(false);
    } else {
      const timer = setTimeout(() => {
        setIsSafeToInteract(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isProcessingOperation, isGlobalProcessing]);
  
  useEffect(() => {
    const handleFloorConfigEvent = (event: Event) => {
      if (event instanceof CustomEvent) {
        console.log("Floor configuration event detected:", event.detail);
        
        setTimeout(() => {
          console.log("Auto-refreshing UI after floor configuration event");
          setIsSafeToInteract(true);
        }, 400);
        
        if (event.detail?.operation === "remove") {
          console.log("Remove operation detected, ensuring UI cleanup");
          document.querySelectorAll('[role="dialog"]').forEach(dialog => {
            if (dialog.getAttribute('data-state') === 'open') {
              console.log("Found open dialog after operation, closing");
              dialog.setAttribute('data-state', 'closed');
            }
          });
        }
      }
    };
    
    window.addEventListener(FLOOR_CONFIG_EVENT, handleFloorConfigEvent);
    
    return () => {
      window.removeEventListener(FLOOR_CONFIG_EVENT, handleFloorConfigEvent);
      
      document.querySelectorAll('[role="dialog"]').forEach(modal => {
        modal.removeAttribute('data-state');
      });
    };
  }, []);

  const floorsData = useMemo(() => generateFloorsData(), [generateFloorsData]);
  const spaceBreakdown = useMemo(() => generateSpaceBreakdown(), [generateSpaceBreakdown]);
  const phasesData = useMemo(() => generatePhasesData(), [generatePhasesData]);
  
  const adaptedUpdateFloorTemplateForBuildingParams = useCallback((id: string, field: keyof FloorPlateTemplate, value: string) => {
    updateFloorTemplate(id, { [field]: value });
  }, [updateFloorTemplate]);
  
  const adaptedUpdateFloorTemplateForConfigManager = useCallback((id: string, template: Partial<FloorPlateTemplate>) => {
    updateFloorTemplate(id, template);
  }, [updateFloorTemplate]);
  
  const adaptedAddFloorTemplate = useCallback((defaultTemplate?: Omit<FloorPlateTemplate, "id">) => {
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
  
  const stopPropagation = useCallback((e: React.MouseEvent<Element, MouseEvent>) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    return true;
  }, []);
  
  const safeAddSpaceType = useCallback((e: React.MouseEvent) => {
    try {
      stopPropagation(e);
      if (!isSafeToInteract) return;
      addSpaceType();
    } catch (error) {
      console.error("Error adding space type:", error);
      toast({
        title: "Error adding space type",
        description: "There was an error adding a new space type. Please try again.",
        variant: "destructive"
      });
    }
  }, [addSpaceType, stopPropagation, isSafeToInteract, toast]);
  
  const safeAddUnitMix = useCallback((e: React.MouseEvent) => {
    try {
      stopPropagation(e);
      if (!isSafeToInteract) return;
      addUnitMix();
    } catch (error) {
      console.error("Error adding unit mix:", error);
      toast({
        title: "Error adding unit type",
        description: "There was an error adding a new unit type. Please try again.",
        variant: "destructive"
      });
    }
  }, [addUnitMix, stopPropagation, isSafeToInteract, toast]);
  
  const triggerManualUIRecovery = useCallback(() => {
    forceUIRecovery();
    toast({
      title: "UI Reset",
      description: "The interface has been reset and should now be responsive.",
      duration: 3000,
    });
  }, [forceUIRecovery, toast]);

  return (
    <div 
      className="space-y-6"
      onClick={(e) => stopPropagation(e)}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Property Breakdown</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={triggerManualUIRecovery}
          className="text-xs text-gray-500"
        >
          Reset UI
        </Button>
      </div>
      <p className="text-gray-600 mb-6">Define the basic characteristics and mix of your development project.</p>
      
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
      
      <FloorConfigurationManager 
        floorConfigurations={floorConfigurations}
        floorTemplates={floorTemplates}
        updateFloorConfiguration={adaptedUpdateFloorConfiguration}
        copyFloorConfiguration={copyFloorConfiguration}
        bulkEditFloorConfigurations={bulkEditFloorConfigurations}
        updateFloorSpaces={updateFloorSpaces}
        addFloors={addFloors}
        removeFloors={safeRemoveFloors}
        reorderFloor={adaptedReorderFloor}
        addFloorTemplate={adaptedAddFloorTemplate}
        updateFloorTemplate={adaptedUpdateFloorTemplateForConfigManager}
        removeFloorTemplate={removeFloorTemplate}
      />
      
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
          updateFloorConfiguration={adaptedUpdateFloorConfiguration}
          reorderFloor={adaptedReorderFloor}
        />
      </div>
      
      <Separator className="my-2" />
      
      <Tabs defaultValue="space-types">
        <TabsList>
          <TabsTrigger value="space-types">Space Types</TabsTrigger>
          <TabsTrigger value="unit-mix">Unit Mix</TabsTrigger>
        </TabsList>
        
        <TabsContent value="space-types">
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
                    onClick={safeAddSpaceType}
                    className="flex items-center gap-2"
                    disabled={!isSafeToInteract}
                  >
                    <PlusCircle className="h-4 w-4" /> Add Another Space Type
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="unit-mix">
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
                        disabled={!isSafeToInteract}
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
                        disabled={!isSafeToInteract}
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
                        disabled={!isSafeToInteract}
                      />
                    </div>

                    <div className="flex items-end justify-end">
                      {unitMixes.length > 1 && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={(e) => {
                            stopPropagation(e);
                            if (!isSafeToInteract) return;
                            removeUnitMix(unit.id);
                          }}
                          className="text-red-500 hover:text-red-700"
                          disabled={!isSafeToInteract}
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
                    onClick={safeAddUnitMix}
                    className="flex items-center gap-2"
                    disabled={!isSafeToInteract}
                  >
                    <PlusCircle className="h-4 w-4" /> Add Another Unit Type
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SpaceSummaryDashboard
          totalBuildableArea={parseFloat(totalBuildableArea) || 0}
          totalAllocatedArea={parseFloat(totalAllocatedArea) || 0}
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
