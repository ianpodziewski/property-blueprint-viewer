
import { useCallback } from "react";
import { useProperty } from "@/contexts/PropertyContext";
import { useVisualizationData } from "./property/useVisualizationData";

/**
 * Enhanced hook that combines PropertyContext with visualization data
 * This maintains API compatibility with the previous implementation
 */
export const useExtendedPropertyState = () => {
  // Use the property context
  const property = useProperty();
  
  // Visualization data depends on all other state
  const visualizationData = useVisualizationData(
    property.spaceTypes,
    property.actualFar,
    property.farAllowance,
    property.totalBuildableArea,
    property.totalAllocatedArea,
    property.floorConfigurations,
    property.floorTemplates
  );
  
  return {
    // Project Information
    projectName: property.projectName, 
    setProjectName: property.setProjectName,
    projectLocation: property.projectLocation, 
    setProjectLocation: property.setProjectLocation,
    projectType: property.projectType, 
    setProjectType: property.setProjectType,
    
    // Building Parameters
    farAllowance: property.farAllowance, 
    setFarAllowance: property.setFarAllowance,
    totalLandArea: property.totalLandArea, 
    setTotalLandArea: property.setTotalLandArea,
    buildingFootprint: property.buildingFootprint, 
    setBuildingFootprint: property.setBuildingFootprint,
    totalBuildableArea: property.totalBuildableArea,
    totalAboveGroundArea: property.totalAboveGroundArea,
    totalBelowGroundArea: property.totalBelowGroundArea,
    actualFar: property.actualFar,
    
    // Space Types
    spaceTypes: property.spaceTypes,
    addSpaceType: property.addSpaceType,
    removeSpaceType: property.removeSpaceType,
    updateSpaceType: property.updateSpaceType,
    updateSpaceTypeFloorAllocation: property.updateSpaceTypeFloorAllocation,
    totalAllocatedArea: property.totalAllocatedArea,
    resetSpaceTypes: property.resetSpaceTypes,
    
    // Unit Mix
    unitMixes: property.unitMixes,
    addUnitMix: property.addUnitMix,
    removeUnitMix: property.removeUnitMix,
    updateUnitMix: property.updateUnitMix,
    resetUnitMix: property.resetUnitMix,
    
    // Floor Templates
    floorTemplates: property.floorTemplates,
    addFloorTemplate: property.addFloorTemplate,
    updateFloorTemplate: property.updateFloorTemplate,
    removeFloorTemplate: property.removeFloorTemplate,
    resetFloorTemplates: property.resetFloorTemplates,
    
    // Floor Configurations
    floorConfigurations: property.floorConfigurations,
    updateFloorConfiguration: property.updateFloorConfiguration,
    copyFloorConfiguration: property.copyFloorConfiguration,
    bulkEditFloorConfigurations: property.bulkEditFloorConfigurations,
    addFloors: property.addFloors,
    removeFloors: property.removeFloors,
    reorderFloor: property.reorderFloor,
    updateFloorSpaces: property.updateFloorSpaces,
    updateFloorBuildingSystems: property.updateFloorBuildingSystems,
    resetFloorConfigurations: property.resetFloorConfigurations,
    isProcessingOperation: property.isProcessingOperation,
    
    // Visualization and issues
    issues: visualizationData.issues,
    spaceTypeColors: visualizationData.spaceTypeColors,
    generateFloorsData: visualizationData.generateFloorsData,
    generateSpaceBreakdown: visualizationData.generateSpaceBreakdown,
    generatePhasesData: visualizationData.generatePhasesData,
    
    // Reset function
    resetAllData: property.resetAllData
  };
};
