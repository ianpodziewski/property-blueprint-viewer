
import React, { useCallback, useEffect } from "react";
import { useExtendedPropertyState } from "@/hooks/useExtendedPropertyState";
import { useModelState } from "@/hooks/useModelState";
import { Separator } from "@/components/ui/separator"; 
import { Toaster } from "@/components/ui/toaster";
import BuildingParameters from "@/components/property/BuildingParameters";
import FloorConfigurationManager from "@/components/property/FloorConfigurationManager";
import { FloorPlateTemplate } from "@/types/propertyTypes";

// Import the new components
import PropertyBreakdownHeading from "@/components/property-breakdown/PropertyBreakdownHeading";
import ProjectInformation from "@/components/property-breakdown/ProjectInformation";
import VisualizationsRow from "@/components/property-breakdown/VisualizationsRow";
import SummaryRow from "@/components/property-breakdown/SummaryRow";
import SpaceTabContent from "@/components/property-breakdown/SpaceTabContent";

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
  
  return (
    <div 
      className="space-y-6"
      onClick={(e) => stopPropagation(e)}
    >
      <PropertyBreakdownHeading />
      
      <ProjectInformation 
        projectName={projectName}
        setProjectName={setProjectName}
        projectLocation={projectLocation}
        setProjectLocation={setProjectLocation}
        projectType={projectType}
        setProjectType={setProjectType}
      />
      
      {/* Building Parameters Section */}
      <BuildingParameters
        farAllowance={farAllowance}
        setFarAllowance={setFarAllowance}
        totalLandArea={totalLandArea}
        setTotalLandArea={setTotalLandArea}
        buildingFootprint={buildingFootprint}
        setBuildingFootprint={setBuildingFootprint}
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
      <VisualizationsRow 
        buildingFootprint={parseFloat(buildingFootprint) || 0}
        floorConfigurations={floorConfigurations}
        floorTemplates={floorTemplates}
        floorsData={floorsData}
        spaceBreakdown={spaceBreakdown}
        spaceTypeColors={spaceTypeColors}
        updateFloorConfiguration={updateFloorConfiguration}
        reorderFloor={reorderFloor}
      />
      
      <Separator className="my-2" />
      
      {/* Space Types and Unit Mix Tabs */}
      <SpaceTabContent
        spaceTypes={spaceTypes}
        unitMixes={unitMixes}
        addSpaceType={addSpaceType}
        removeSpaceType={removeSpaceType}
        updateSpaceType={updateSpaceType}
        updateSpaceTypeFloorAllocation={updateSpaceTypeFloorAllocation}
        addUnitMix={addUnitMix}
        removeUnitMix={removeUnitMix}
        updateUnitMix={updateUnitMix}
        floorConfigurations={floorConfigurations}
        stopPropagation={stopPropagation}
      />
      
      {/* Space Summary and Phasing */}
      <SummaryRow
        totalBuildableArea={totalBuildableArea}
        totalAllocatedArea={totalAllocatedArea}
        spaceBreakdown={spaceBreakdown}
        phases={phasesData}
        issues={issues}
        spaceTypeColors={spaceTypeColors}
      />
      
      <Toaster />
    </div>
  );
};

export default PropertyBreakdown;
