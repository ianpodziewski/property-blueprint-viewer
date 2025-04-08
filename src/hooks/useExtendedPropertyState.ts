
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
  
  // Store last calculation values to prevent unnecessary rerenders
  const lastCalculationRef = useRef({
    spaceTypes: "[]",
    actualFar: 0,
    farAllowance: "0",
    totalBuildableArea: 0,
    totalAllocatedArea: 0,
    floorConfigurations: "[]",
    floorTemplates: "[]"
  });
  
  // Initialize hooks at the top level (required by React's Rules of Hooks)
  const projectInfo = useProjectInfo();
  const spaceTypes = useSpaceTypes();
  const unitMix = useUnitMix();
  const unitTypes = useUnitTypes();
  const unitAllocations = useUnitAllocations();
  const floorTemplates = useFloorTemplates();
  
  // Get default empty arrays for safety
  const safeFloorTemplates = useMemo(() => floorTemplates?.floorTemplates || [], [floorTemplates]);
  
  // Pass safe values to the dependent hooks
  const floorConfigurations = useFloorConfigurations(safeFloorTemplates);
  
  // Get safe floor configurations
  const safeFloorConfigurations = useMemo(
    () => floorConfigurations?.floorConfigurations || [], 
    [floorConfigurations]
  );
  
  const buildingParams = useBuildingParameters(
    safeFloorConfigurations, 
    safeFloorTemplates
  );
  
  // Pre-calculate safe values for visualization data
  const safeSpaceTypesArray = useMemo(() => spaceTypes?.spaceTypes || [], [spaceTypes]);
  const safeActualFar = useMemo(() => buildingParams?.actualFar || 0, [buildingParams]);
  const safeFarAllowance = useMemo(() => buildingParams?.farAllowance || "0", [buildingParams]);
  const safeTotalBuildableArea = useMemo(() => buildingParams?.totalBuildableArea || 0, [buildingParams]);
  const safeTotalAllocatedArea = useMemo(() => spaceTypes?.totalAllocatedArea || 0, [spaceTypes]);
  
  // Memoize the check for whether visualization needs to update
  const shouldUpdateVisualization = useMemo(() => {
    // Skip if an update is in progress
    if (isUpdating.current) return false;
    
    const currentSpaceTypesJSON = JSON.stringify(safeSpaceTypesArray);
    const currentFloorConfigsJSON = JSON.stringify(safeFloorConfigurations);
    const currentFloorTemplatesJSON = JSON.stringify(safeFloorTemplates);
    
    const result = 
      currentSpaceTypesJSON !== lastCalculationRef.current.spaceTypes ||
      safeActualFar !== lastCalculationRef.current.actualFar ||
      safeFarAllowance !== lastCalculationRef.current.farAllowance ||
      safeTotalBuildableArea !== lastCalculationRef.current.totalBuildableArea ||
      safeTotalAllocatedArea !== lastCalculationRef.current.totalAllocatedArea ||
      currentFloorConfigsJSON !== lastCalculationRef.current.floorConfigurations ||
      currentFloorTemplatesJSON !== lastCalculationRef.current.floorTemplates;
      
    return result;
  }, [
    safeSpaceTypesArray, 
    safeActualFar,
    safeFarAllowance,
    safeTotalBuildableArea,
    safeTotalAllocatedArea,
    safeFloorConfigurations,
    safeFloorTemplates
  ]);
  
  // Only get new visualization data when needed - with memoization
  const visualizationData = useMemo(() => {
    if (!shouldUpdateVisualization) {
      try {
        return useVisualizationData(
          JSON.parse(lastCalculationRef.current.spaceTypes),
          lastCalculationRef.current.actualFar,
          lastCalculationRef.current.farAllowance,
          lastCalculationRef.current.totalBuildableArea,
          lastCalculationRef.current.totalAllocatedArea,
          JSON.parse(lastCalculationRef.current.floorConfigurations),
          JSON.parse(lastCalculationRef.current.floorTemplates)
        );
      } catch (err) {
        console.error("Error parsing visualization data:", err);
        // Return default visualization data if parsing fails
        return useVisualizationData([], 0, "0", 0, 0, [], []);
      }
    }
    
    return useVisualizationData(
      safeSpaceTypesArray,
      safeActualFar,
      safeFarAllowance,
      safeTotalBuildableArea,
      safeTotalAllocatedArea,
      safeFloorConfigurations,
      safeFloorTemplates
    );
  }, [
    shouldUpdateVisualization,
    safeSpaceTypesArray,
    safeActualFar,
    safeFarAllowance,
    safeTotalBuildableArea,
    safeTotalAllocatedArea,
    safeFloorConfigurations,
    safeFloorTemplates
  ]);
  
  // Update reference when visualization data inputs change - with controlled updates
  useEffect(() => {
    if (shouldUpdateVisualization && !isUpdating.current) {
      isUpdating.current = true;
      
      // Use setTimeout to ensure this happens outside the current render cycle
      setTimeout(() => {
        lastCalculationRef.current = {
          spaceTypes: JSON.stringify(safeSpaceTypesArray),
          actualFar: safeActualFar,
          farAllowance: safeFarAllowance,
          totalBuildableArea: safeTotalBuildableArea,
          totalAllocatedArea: safeTotalAllocatedArea,
          floorConfigurations: JSON.stringify(safeFloorConfigurations),
          floorTemplates: JSON.stringify(safeFloorTemplates)
        };
        
        isUpdating.current = false;
      }, 0);
    }
  }, [
    shouldUpdateVisualization, 
    safeSpaceTypesArray, 
    safeActualFar,
    safeFarAllowance,
    safeTotalBuildableArea, 
    safeTotalAllocatedArea, 
    safeFloorConfigurations, 
    safeFloorTemplates
  ]);
  
  // Listen for template changes and update floor configurations
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    
    if (typeof window === 'undefined') return; // Check if running in browser
    
    const handleTemplateChange = () => {
      // Only log if templates exist to prevent console spam
      if (safeFloorTemplates.length > 0) {
        console.log("Template changed event received, templates:", safeFloorTemplates);
      }
    };
    
    window.addEventListener('floorTemplatesChanged', handleTemplateChange);
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('floorTemplatesChanged', handleTemplateChange);
      }
    };
  }, [safeFloorTemplates]); // Depend only on the safe values
  
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
    
    floorTemplates: safeFloorTemplates,
    addFloorTemplate: floorTemplates.addFloorTemplate,
    updateFloorTemplate: floorTemplates.updateFloorTemplate,
    removeFloorTemplate: floorTemplates.removeFloorTemplate,
    
    floorConfigurations: safeFloorConfigurations,
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
