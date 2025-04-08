
import { useCallback } from "react";
import { useProjectInfo } from "./property/useProjectInfo";
import { useBuildingParameters } from "./property/useBuildingParameters";
import { useFloorTemplates } from "./property/useFloorTemplates";
import { useFloorConfigurations } from "./property/useFloorConfigurations";
import { useSpaceTypes } from "./property/useSpaceTypes";
import { useUnitMix } from "./property/useUnitMix";
import { useVisualizationData } from "./property/useVisualizationData";
import { SpaceDefinition, BuildingSystemsConfig } from "../types/propertyTypes";

export const useExtendedPropertyState = () => {
  // Use individual hooks for better organization
  const projectInfo = useProjectInfo();
  const floorConfigurations = useFloorConfigurations(
    projectInfo.projectName ? [] : [] // This is just to satisfy the dependency, will be fixed below
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
  
  // Function to reset all data
  const resetAllData = useCallback(() => {
    // Reset individual state hooks with their respective reset functions
    projectInfo.setProjectName("");
    projectInfo.setProjectLocation("");
    projectInfo.setProjectType("");
    
    buildingParams.setFarAllowance("0");
    buildingParams.setTotalLandArea("0");
    buildingParams.setBuildingFootprint("0");
    
    // Clear floor configurations
    floorConfigurations.resetFloorConfigurations();
    
    // Reset other state
    floorTemplates.resetFloorTemplates();
    spaceTypes.resetSpaceTypes && spaceTypes.resetSpaceTypes();
    unitMix.resetUnitMix && unitMix.resetUnitMix();
  }, [
    projectInfo, 
    buildingParams, 
    floorConfigurations, 
    floorTemplates,
    spaceTypes,
    unitMix
  ]);

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
    resetFloorTemplates: floorTemplates.resetFloorTemplates,
    
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
    resetFloorConfigurations: floorConfigurations.resetFloorConfigurations,
    
    // Floor space management
    updateFloorSpaces: floorConfigurations.updateFloorSpaces,
    updateFloorBuildingSystems: floorConfigurations.updateFloorBuildingSystems,
    
    // Visualization and issues
    issues: visualizationData.issues,
    spaceTypeColors: visualizationData.spaceTypeColors,
    generateFloorsData: visualizationData.generateFloorsData,
    generateSpaceBreakdown: visualizationData.generateSpaceBreakdown,
    generatePhasesData: visualizationData.generatePhasesData,
    
    // Reset function
    resetAllData
  };
};
