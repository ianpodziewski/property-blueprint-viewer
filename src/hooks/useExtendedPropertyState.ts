
import { useCallback, useEffect, useState, useRef } from "react";
import { useProjectInfo } from "./property/useProjectInfo";
import { useBuildingParameters } from "./property/useBuildingParameters";
import { useFloorTemplates } from "./property/useFloorTemplates";
import { useFloorConfigurations } from "./property/useFloorConfigurations";
import { useSpaceTypes } from "./property/useSpaceTypes";
import { useUnitMix } from "./property/useUnitMix";
import { useUnitTypes } from "./property/useUnitTypes";
import { useUnitAllocations } from "./property/useUnitAllocations";
import { useVisualizationData } from "./property/useVisualizationData";
import { SpaceDefinition, BuildingSystemsConfig, FloorConfiguration, FloorPlateTemplate } from "../types/propertyTypes";

export const useExtendedPropertyState = () => {
  // Reference to prevent initialization loops
  const isMounted = useRef(false);
  
  const projectInfo = useProjectInfo();
  const floorTemplates = useFloorTemplates();
  
  // Pass floorTemplates.floorTemplates directly to ensure it's available immediately
  const floorConfigurations = useFloorConfigurations(floorTemplates.floorTemplates);
  
  const buildingParams = useBuildingParameters(
    floorConfigurations.floorConfigurations, 
    floorTemplates.floorTemplates
  );
  
  const spaceTypes = useSpaceTypes();
  const unitMix = useUnitMix();
  const unitTypes = useUnitTypes();
  const unitAllocations = useUnitAllocations();
  
  const visualizationData = useVisualizationData(
    spaceTypes.spaceTypes,
    buildingParams.actualFar,
    buildingParams.farAllowance,
    buildingParams.totalBuildableArea,
    spaceTypes.totalAllocatedArea,
    floorConfigurations.floorConfigurations,
    floorTemplates.floorTemplates
  );
  
  // Listen for template changes and update floor configurations - with protection
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    
    const handleTemplateChange = (event: Event) => {
      // Force a refresh of the configurations with the latest templates
      if (floorTemplates.floorTemplates.length > 0) {
        console.log("Template changed event received, templates:", floorTemplates.floorTemplates);
      }
    };
    
    window.addEventListener('floorTemplatesChanged', handleTemplateChange);
    return () => {
      window.removeEventListener('floorTemplatesChanged', handleTemplateChange);
    };
  }, [floorTemplates.floorTemplates]);
  
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
