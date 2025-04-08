
import { useCallback, useEffect, useState } from "react";
import { useProjectInfo } from "./property/useProjectInfo";
import { useBuildingParameters } from "./property/useBuildingParameters";
import { useFloorTemplates } from "./property/useFloorTemplates";
import { useFloorConfigurations } from "./property/useFloorConfigurations";
import { useSpaceTypes } from "./property/useSpaceTypes";
import { useUnitMix } from "./property/useUnitMix";
import { useVisualizationData } from "./property/useVisualizationData";
import { SpaceDefinition, BuildingSystemsConfig } from "../types/propertyTypes";
import { useToast } from "@/components/ui/use-toast";

export const useExtendedPropertyState = () => {
  const { toast } = useToast();
  const [errorState, setErrorState] = useState({
    hasError: false,
    lastErrorMessage: ""
  });
  
  // Use individual hooks for better organization
  const projectInfo = useProjectInfo();
  
  // Start with default floor configs, will be updated once loaded
  const floorConfigurations = useFloorConfigurations(
    [] // Passing empty array initially
  );
  
  const floorTemplates = useFloorTemplates(
    floorConfigurations.floorConfigurations, 
    floorConfigurations.setFloorConfigurations
  );
  
  const buildingParams = useBuildingParameters(
    floorConfigurations.floorConfigurations, 
    floorTemplates.floorTemplates
  );
  
  const spaceTypes = useSpaceTypes();
  const unitMix = useUnitMix();
  
  // Visualization data depends on all other hooks
  const visualizationData = useVisualizationData(
    spaceTypes.spaceTypes,
    buildingParams.actualFar,
    buildingParams.farAllowance,
    buildingParams.totalBuildableArea,
    spaceTypes.totalAllocatedArea,
    floorConfigurations.floorConfigurations,
    floorTemplates.floorTemplates
  );
  
  // Error handling and recovery
  useEffect(() => {
    const handleGlobalError = (error: ErrorEvent) => {
      console.error('Global error caught in ExtendedPropertyState:', error);
      setErrorState({
        hasError: true,
        lastErrorMessage: error.message
      });
      
      toast({
        title: "Error Detected",
        description: "An error occurred in the property state. Some features might not work correctly.",
        variant: "destructive",
      });
    };
    
    window.addEventListener('error', handleGlobalError);
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
    };
  }, [toast]);
  
  // Function to reset all data
  const resetAllData = useCallback(() => {
    try {
      // Reset individual state hooks
      if (projectInfo.resetProjectInfo) projectInfo.resetProjectInfo();
      if (floorConfigurations.resetFloorConfigurations) floorConfigurations.resetFloorConfigurations();
      if (spaceTypes.resetSpaceTypes) spaceTypes.resetSpaceTypes();
      if (unitMix.resetUnitMix) unitMix.resetUnitMix();
      
      // Reset error state
      setErrorState({
        hasError: false,
        lastErrorMessage: ""
      });
      
      toast({
        title: "Reset Complete",
        description: "All property data has been reset to default values.",
      });
    } catch (error) {
      console.error('Failed to reset all data:', error);
      toast({
        title: "Error",
        description: "Failed to reset all data. Please try refreshing the page.",
        variant: "destructive",
      });
    }
  }, [projectInfo, floorConfigurations, spaceTypes, unitMix, toast]);

  // Return all the properties and methods from individual hooks
  return {
    // Project Information
    projectName: projectInfo.projectName, 
    setProjectName: projectInfo.setProjectName,
    projectLocation: projectInfo.projectLocation, 
    setProjectLocation: projectInfo.setProjectLocation,
    projectType: projectInfo.projectType, 
    setProjectType: projectInfo.setProjectType,
    
    // Building Parameters
    farAllowance: buildingParams.farAllowance, 
    setFarAllowance: buildingParams.setFarAllowance,
    totalLandArea: buildingParams.totalLandArea, 
    setTotalLandArea: buildingParams.setTotalLandArea,
    buildingFootprint: buildingParams.buildingFootprint, 
    setBuildingFootprint: buildingParams.setBuildingFootprint,
    totalBuildableArea: buildingParams.totalBuildableArea,
    totalAboveGroundArea: buildingParams.totalAboveGroundArea,
    totalBelowGroundArea: buildingParams.totalBelowGroundArea,
    actualFar: buildingParams.actualFar,
    
    // Space Types
    spaceTypes: spaceTypes.spaceTypes,
    addSpaceType: spaceTypes.addSpaceType,
    removeSpaceType: spaceTypes.removeSpaceType,
    updateSpaceType: spaceTypes.updateSpaceType,
    updateSpaceTypeFloorAllocation: spaceTypes.updateSpaceTypeFloorAllocation,
    totalAllocatedArea: spaceTypes.totalAllocatedArea,
    resetSpaceTypes: spaceTypes.resetSpaceTypes,
    
    // Unit Mix
    unitMixes: unitMix.unitMixes,
    addUnitMix: unitMix.addUnitMix,
    removeUnitMix: unitMix.removeUnitMix,
    updateUnitMix: unitMix.updateUnitMix,
    resetUnitMix: unitMix.resetUnitMix,
    
    // Floor Templates
    floorTemplates: floorTemplates.floorTemplates,
    addFloorTemplate: floorTemplates.addFloorTemplate,
    updateFloorTemplate: floorTemplates.updateFloorTemplate,
    removeFloorTemplate: floorTemplates.removeFloorTemplate,
    
    // Floor Configurations
    floorConfigurations: floorConfigurations.floorConfigurations,
    updateFloorConfiguration: floorConfigurations.updateFloorConfiguration,
    copyFloorConfiguration: floorConfigurations.copyFloorConfiguration,
    bulkEditFloorConfigurations: floorConfigurations.bulkEditFloorConfigurations,
    addFloors: floorConfigurations.addFloors,
    removeFloors: floorConfigurations.removeFloors,
    reorderFloor: floorConfigurations.reorderFloor,
    importFloorConfigurations: floorConfigurations.importFloorConfigurations,
    exportFloorConfigurations: floorConfigurations.exportFloorConfigurations,
    
    // Floor space management
    updateFloorSpaces: floorConfigurations.updateFloorSpaces,
    updateFloorBuildingSystems: floorConfigurations.updateFloorBuildingSystems,
    
    // Visualization and issues
    issues: visualizationData.issues,
    spaceTypeColors: visualizationData.spaceTypeColors,
    generateFloorsData: visualizationData.generateFloorsData,
    generateSpaceBreakdown: visualizationData.generateSpaceBreakdown,
    generatePhasesData: visualizationData.generatePhasesData,
    
    // Error state
    hasError: errorState.hasError,
    lastErrorMessage: errorState.lastErrorMessage,
    
    // Reset function
    resetAllData
  };
};
