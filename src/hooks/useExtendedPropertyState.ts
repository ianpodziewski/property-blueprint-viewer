import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useProjectInfo } from "./property/useProjectInfo";
import { useBuildingParameters } from "./property/useBuildingParameters";
import { useFloorTemplates } from "./property/useFloorTemplates";
import { useFloorConfigurations } from "./property/useFloorConfigurations";
import { useSpaceTypes } from "./property/useSpaceTypes";
import { useUnitMix } from "./property/useUnitMix";
import { useUnitTypes } from "./property/useUnitTypes";
import { useUnitAllocations } from "./property/useUnitAllocations";
import { useVisualizationData } from "./property/useVisualizationData";

export const useExtendedPropertyState = () => {
  // Reference to prevent initialization loops
  const isMounted = useRef(false);
  
  // Track if update is in progress to prevent circular updates
  const isUpdating = useRef(false);
  
  const projectInfo = useProjectInfo();
  const floorTemplates = useFloorTemplates();
  
  // Pass floorTemplates.floorTemplates directly to ensure it's available immediately
  // Add a safety check to ensure floorTemplates.floorTemplates exists
  const floorConfigurations = useFloorConfigurations(
    floorTemplates.floorTemplates || []
  );
  
  const buildingParams = useBuildingParameters(
    floorConfigurations.floorConfigurations || [], 
    floorTemplates.floorTemplates || []
  );
  
  const spaceTypes = useSpaceTypes();
  const unitMix = useUnitMix();
  const unitTypes = useUnitTypes();
  const unitAllocations = useUnitAllocations();
  
  // Use ref to prevent updates from visualization data changes triggering new visualizations
  const lastVisualizationData = useRef({
    spaceTypes: JSON.stringify(spaceTypes.spaceTypes || []),
    actualFar: buildingParams.actualFar || 0,
    farAllowance: buildingParams.farAllowance || "0",
    totalBuildableArea: buildingParams.totalBuildableArea || 0,
    totalAllocatedArea: spaceTypes.totalAllocatedArea || 0,
    floorConfigurations: JSON.stringify(floorConfigurations.floorConfigurations || []),
    floorTemplates: JSON.stringify(floorTemplates.floorTemplates || [])
  });
  
  // Memoize the check for whether visualization needs to update
  const shouldUpdateVisualization = useMemo(() => {
    // Skip if an update is in progress
    if (isUpdating.current) return false;
    
    // Safely handle potential undefined values
    const currentSpaceTypes = spaceTypes.spaceTypes || [];
    const currentFarAllowance = buildingParams.farAllowance || "0";
    const currentFloorConfigs = floorConfigurations.floorConfigurations || [];
    const currentFloorTemplates = floorTemplates.floorTemplates || [];
    
    const result = 
      JSON.stringify(currentSpaceTypes) !== lastVisualizationData.current.spaceTypes ||
      (buildingParams.actualFar || 0) !== lastVisualizationData.current.actualFar ||
      currentFarAllowance !== lastVisualizationData.current.farAllowance ||
      (buildingParams.totalBuildableArea || 0) !== lastVisualizationData.current.totalBuildableArea ||
      (spaceTypes.totalAllocatedArea || 0) !== lastVisualizationData.current.totalAllocatedArea ||
      JSON.stringify(currentFloorConfigs) !== lastVisualizationData.current.floorConfigurations ||
      JSON.stringify(currentFloorTemplates) !== lastVisualizationData.current.floorTemplates;
      
    return result;
  }, [
    spaceTypes.spaceTypes, 
    buildingParams.actualFar,
    buildingParams.farAllowance,
    buildingParams.totalBuildableArea,
    spaceTypes.totalAllocatedArea,
    floorConfigurations.floorConfigurations,
    floorTemplates.floorTemplates
  ]);
  
  // Only get new visualization data when needed - with memoization
  const visualizationData = useMemo(() => {
    if (!shouldUpdateVisualization) {
      try {
        return useVisualizationData(
          JSON.parse(lastVisualizationData.current.spaceTypes),
          lastVisualizationData.current.actualFar,
          lastVisualizationData.current.farAllowance,
          lastVisualizationData.current.totalBuildableArea,
          lastVisualizationData.current.totalAllocatedArea,
          JSON.parse(lastVisualizationData.current.floorConfigurations),
          JSON.parse(lastVisualizationData.current.floorTemplates)
        );
      } catch (err) {
        console.error("Error parsing visualization data:", err);
        // Return default visualization data if parsing fails
        return useVisualizationData([], 0, "0", 0, 0, [], []);
      }
    }
    
    return useVisualizationData(
      spaceTypes.spaceTypes || [],
      buildingParams.actualFar || 0,
      buildingParams.farAllowance || "0",
      buildingParams.totalBuildableArea || 0,
      spaceTypes.totalAllocatedArea || 0,
      floorConfigurations.floorConfigurations || [],
      floorTemplates.floorTemplates || []
    );
  }, [
    shouldUpdateVisualization,
    spaceTypes.spaceTypes,
    buildingParams.actualFar,
    buildingParams.farAllowance,
    buildingParams.totalBuildableArea,
    spaceTypes.totalAllocatedArea,
    floorConfigurations.floorConfigurations,
    floorTemplates.floorTemplates
  ]);
  
  // Update reference when visualization data inputs change - with controlled updates
  useEffect(() => {
    // CRITICAL FIX: Ensure all dependency array items exist before proceeding
    if (!spaceTypes.spaceTypes || !buildingParams || !floorConfigurations.floorConfigurations || !floorTemplates.floorTemplates) {
      return;
    }
    
    if (shouldUpdateVisualization && !isUpdating.current) {
      isUpdating.current = true;
      
      // Use setTimeout to ensure this happens outside the current render cycle
      setTimeout(() => {
        lastVisualizationData.current = {
          spaceTypes: JSON.stringify(spaceTypes.spaceTypes || []),
          actualFar: buildingParams.actualFar || 0,
          farAllowance: buildingParams.farAllowance || "0",
          totalBuildableArea: buildingParams.totalBuildableArea || 0,
          totalAllocatedArea: spaceTypes.totalAllocatedArea || 0,
          floorConfigurations: JSON.stringify(floorConfigurations.floorConfigurations || []),
          floorTemplates: JSON.stringify(floorTemplates.floorTemplates || [])
        };
        
        isUpdating.current = false;
      }, 0);
    }
  }, [shouldUpdateVisualization, spaceTypes.spaceTypes, buildingParams, spaceTypes.totalAllocatedArea, floorConfigurations.floorConfigurations, floorTemplates.floorTemplates]);
  
  // Listen for template changes and update floor configurations - with protection
  useEffect(() => {
    // CRITICAL FIX: Return early if floorTemplates is undefined
    if (!floorTemplates || !floorTemplates.floorTemplates) {
      return;
    }
    
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    
    if (typeof window === 'undefined') return; // Check if running in browser
    
    const handleTemplateChange = (event: Event) => {
      // Force a refresh of the configurations with the latest templates
      if (floorTemplates.floorTemplates && floorTemplates.floorTemplates.length > 0) {
        console.log("Template changed event received, templates:", floorTemplates.floorTemplates);
      }
    };
    
    window.addEventListener('floorTemplatesChanged', handleTemplateChange);
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('floorTemplatesChanged', handleTemplateChange);
      }
    };
  }, [floorTemplates, floorTemplates?.floorTemplates]); // Add floorTemplates itself as a dependency
  
  const resetAllData = useCallback(() => {
    if (projectInfo.resetAllData) projectInfo.resetAllData();
    if (floorConfigurations.resetAllData) floorConfigurations.resetAllData();
    if (floorTemplates.resetAllData) floorTemplates.resetAllData();
    if (buildingParams.resetAllData) buildingParams.resetAllData();
    if (spaceTypes.resetAllData) spaceTypes.resetAllData();
    if (unitMix.resetAllData) unitMix.resetAllData();
    if (unitTypes.resetAllData) unitTypes.resetAllData();
    if (unitAllocations.resetAllData) unitAllocations.resetAllData();
    
    console.log("All data has been reset across all modules");
  }, [
    projectInfo, floorConfigurations, floorTemplates, 
    buildingParams, spaceTypes, unitMix, unitTypes, unitAllocations
  ]);

  return {
    projectName: projectInfo.projectName, 
    setProjectName: projectInfo.setProjectName,
    projectLocation: projectInfo.projectLocation, 
    setProjectLocation: projectInfo.setProjectLocation,
    projectType: projectInfo.projectType, 
    setProjectType: projectInfo.setProjectType,
    
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
    
    spaceTypes: spaceTypes.spaceTypes,
    addSpaceType: spaceTypes.addSpaceType,
    removeSpaceType: spaceTypes.removeSpaceType,
    updateSpaceType: spaceTypes.updateSpaceType,
    updateSpaceTypeFloorAllocation: spaceTypes.updateSpaceTypeFloorAllocation,
    totalAllocatedArea: spaceTypes.totalAllocatedArea,
    
    unitMixes: unitMix.unitMixes,
    addUnitMix: unitMix.addUnitMix,
    removeUnitMix: unitMix.removeUnitMix,
    updateUnitMix: unitMix.updateUnitMix,
    
    unitTypes: unitTypes.unitTypes,
    addUnitType: unitTypes.addUnitType,
    updateUnitType: unitTypes.updateUnitType,
    removeUnitType: unitTypes.removeUnitType,
    addCustomCategory: unitTypes.addCustomCategory,
    removeCategory: unitTypes.removeCategory,
    undoRemoveCategory: unitTypes.undoRemoveCategory,
    getAllCategories: unitTypes.getAllCategories,
    getCategoryColor: unitTypes.getCategoryColor,
    getCategoryDescription: unitTypes.getCategoryDescription,
    hasCategories: unitTypes.hasCategories,
    recentlyDeletedCategory: unitTypes.recentlyDeletedCategory,
    
    unitAllocations: unitAllocations.unitAllocations,
    addUnitAllocation: unitAllocations.addAllocation,
    updateUnitAllocation: unitAllocations.updateAllocation,
    removeUnitAllocation: unitAllocations.removeAllocation,
    calculateAllocatedAreaByFloor: unitAllocations.calculateAllocatedAreaByFloor,
    
    floorTemplates: floorTemplates.floorTemplates,
    addFloorTemplate: floorTemplates.addFloorTemplate,
    updateFloorTemplate: floorTemplates.updateFloorTemplate,
    removeFloorTemplate: floorTemplates.removeFloorTemplate,
    
    floorConfigurations: floorConfigurations.floorConfigurations,
    updateFloorConfiguration: floorConfigurations.updateFloorConfiguration,
    copyFloorConfiguration: floorConfigurations.copyFloorConfiguration,
    bulkEditFloorConfigurations: floorConfigurations.bulkEditFloorConfigurations,
    addFloors: floorConfigurations.addFloors,
    removeFloors: floorConfigurations.removeFloors,
    reorderFloor: floorConfigurations.reorderFloor,
    importFloorConfigurations: floorConfigurations.importFloorConfigurations,
    exportFloorConfigurations: floorConfigurations.exportFloorConfigurations,
    getFloorArea: floorConfigurations.getFloorArea,
    updateFloorSpaces: floorConfigurations.updateFloorSpaces,
    updateFloorBuildingSystems: floorConfigurations.updateFloorBuildingSystems,
    
    issues: visualizationData.issues,
    spaceTypeColors: visualizationData.spaceTypeColors,
    generateFloorsData: visualizationData.generateFloorsData,
    generateSpaceBreakdown: visualizationData.generateSpaceBreakdown,
    generatePhasesData: visualizationData.generatePhasesData,
    
    resetAllData
  };
};
