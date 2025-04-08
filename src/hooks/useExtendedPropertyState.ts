
import { useCallback, useMemo, useRef } from "react";
import { useProperty } from "@/contexts/PropertyContext";
import { useVisualizationData } from "./property/useVisualizationData";
import { useRenderDebugger } from "./useRenderDebugger";

/**
 * Enhanced hook that combines PropertyContext with visualization data
 * This maintains API compatibility with the previous implementation
 */
export const useExtendedPropertyState = () => {
  // Debug render cycles to catch infinite loops
  const { isLoopDetected } = useRenderDebugger("useExtendedPropertyState", {}, 15, true);
  const renderRef = useRef(0);
  
  // Get the property context - only once
  const property = useProperty();
  
  // Break infinite loops with circuit breaker
  renderRef.current++;
  if (renderRef.current > 25 || isLoopDetected) {
    console.error("Detected potential infinite loop in useExtendedPropertyState! Breaking out.");
    // Return cached/static data to break the loop
    return useRef({
      // Return minimal stable API to prevent errors
      projectName: property.projectName,
      setProjectName: () => {},
      projectLocation: property.projectLocation,
      setProjectLocation: () => {},
      projectType: property.projectType,
      setProjectType: () => {},
      farAllowance: property.farAllowance,
      setFarAllowance: () => {},
      totalLandArea: property.totalLandArea,
      setTotalLandArea: () => {},
      buildingFootprint: property.buildingFootprint,
      setBuildingFootprint: () => {},
      totalBuildableArea: property.totalBuildableArea || "0",
      totalAboveGroundArea: property.totalAboveGroundArea || "0",
      totalBelowGroundArea: property.totalBelowGroundArea || "0",
      actualFar: property.actualFar || "0",
      spaceTypes: property.spaceTypes || [],
      addSpaceType: () => {},
      removeSpaceType: () => {},
      updateSpaceType: () => {},
      updateSpaceTypeFloorAllocation: () => {},
      totalAllocatedArea: property.totalAllocatedArea || "0",
      resetSpaceTypes: () => {},
      unitMixes: property.unitMixes || [],
      addUnitMix: () => {},
      removeUnitMix: () => {},
      updateUnitMix: () => {},
      resetUnitMix: () => {},
      floorTemplates: property.floorTemplates || [],
      addFloorTemplate: () => {},
      updateFloorTemplate: () => {},
      removeFloorTemplate: () => {},
      resetFloorTemplates: () => {},
      floorConfigurations: property.floorConfigurations || [],
      updateFloorConfiguration: () => {},
      copyFloorConfiguration: () => {},
      bulkEditFloorConfigurations: () => {},
      addFloors: () => {},
      removeFloors: () => {},
      reorderFloor: () => {},
      updateFloorSpaces: () => {},
      updateFloorBuildingSystems: () => {},
      resetFloorConfigurations: () => {},
      isProcessingOperation: false,
      issues: [],
      spaceTypeColors: {},
      generateFloorsData: () => [],
      generateSpaceBreakdown: () => [],
      generatePhasesData: () => [],
      resetAllData: () => {}
    }).current;
  }
  
  // Visualization data depends on all other state - stability is critical here
  const visualizationData = useMemo(() => useVisualizationData(
    property.spaceTypes,
    property.actualFar,
    property.farAllowance,
    property.totalBuildableArea,
    property.totalAllocatedArea,
    property.floorConfigurations,
    property.floorTemplates
  ), [
    property.spaceTypes, 
    property.actualFar, 
    property.farAllowance,
    property.totalBuildableArea,
    property.totalAllocatedArea,
    property.floorConfigurations,
    property.floorTemplates
  ]);

  // Memoize the entire return object to ensure it remains stable
  return useMemo(() => ({
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
  }), [
    property, 
    visualizationData
  ]);
};
