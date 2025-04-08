import { useState, useEffect, useCallback } from "react";
import { saveToLocalStorage, loadFromLocalStorage } from "./useLocalStoragePersistence";
import { 
  SpaceType, 
  UnitMix, 
  Issue, 
  FloorPlateTemplate, 
  SpaceDefinition, 
  BuildingSystemsConfig, 
  FloorConfiguration 
} from "../types/propertyTypes";

const STORAGE_KEYS = {
  PROJECT_INFO: "realEstateModel_extendedProjectInfo",
  BUILDING_PARAMS: "realEstateModel_buildingParams",
  SPACE_TYPES: "realEstateModel_extendedSpaceTypes",
  UNIT_MIX: "realEstateModel_extendedUnitMix",
  FLOOR_TEMPLATES: "realEstateModel_floorTemplates",
  FLOOR_CONFIGURATIONS: "realEstateModel_floorConfigurations"
};

// Add an event dispatcher for floor config updates
const dispatchFloorConfigSavedEvent = () => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('floorConfigSaved');
    window.dispatchEvent(event);
  }
};

export const useExtendedPropertyState = () => {
  // Project Information
  const [projectName, setProjectName] = useState<string>("");
  const [projectLocation, setProjectLocation] = useState<string>("");
  const [projectType, setProjectType] = useState<string>("");
  
  // Building Parameters
  const [farAllowance, setFarAllowance] = useState<string>("1.5");
  const [totalLandArea, setTotalLandArea] = useState<string>("0");
  const [buildingFootprint, setBuildingFootprint] = useState<string>("0");
  const [numberOfFloors, setNumberOfFloors] = useState<string>("1");
  const [numberOfUndergroundFloors, setNumberOfUndergroundFloors] = useState<string>("0");
  
  // Floor Templates
  const [floorTemplates, setFloorTemplates] = useState<FloorPlateTemplate[]>([
    {
      id: "template-1",
      name: "Standard Floor",
      squareFootage: "10000",
      floorToFloorHeight: "12",
      efficiencyFactor: "85",
      corePercentage: "15"
    }
  ]);
  
  // Floor Configurations
  const [floorConfigurations, setFloorConfigurations] = useState<FloorConfiguration[]>([]);
  
  // Calculated values
  const [totalBuildableArea, setTotalBuildableArea] = useState<number>(0);
  const [totalAboveGroundArea, setTotalAboveGroundArea] = useState<number>(0);
  const [totalBelowGroundArea, setTotalBelowGroundArea] = useState<number>(0);
  const [actualFar, setActualFar] = useState<number>(0);
  const [totalAllocatedArea, setTotalAllocatedArea] = useState<number>(0);
  
  // Space Types
  const [spaceTypes, setSpaceTypes] = useState<SpaceType[]>([
    { 
      id: "space-1", 
      type: "", 
      squareFootage: "0", 
      units: "", 
      phase: "phase1",
      efficiencyFactor: "85",
      floorAllocation: { 1: "100" }
    }
  ]);
  
  // Unit Mix
  const [unitMixes, setUnitMixes] = useState<UnitMix[]>([
    { id: "unit-1", type: "Studio", count: "0", squareFootage: "0" }
  ]);
  
  // Issues
  const [issues, setIssues] = useState<Issue[]>([]);
  
  // Space type colors for visualizations
  const spaceTypeColors: Record<string, string> = {
    "residential": "#3B82F6", // blue
    "office": "#10B981",      // green
    "retail": "#F59E0B",      // amber
    "parking": "#6B7280",     // gray
    "hotel": "#8B5CF6",       // purple
    "amenities": "#EC4899",   // pink
    "storage": "#78716C",     // warm gray
    "mechanical": "#475569",  // slate
  };

  // Initialize floor configurations when number of floors changes
  useEffect(() => {
    const aboveGroundFloors = parseInt(numberOfFloors) || 0;
    const belowGroundFloors = parseInt(numberOfUndergroundFloors) || 0;
    
    // Only do this initial setup if the configurations array is empty
    if (floorConfigurations.length === 0) {
      const newConfigurations: FloorConfiguration[] = [];
      
      // Create above ground configurations
      for (let i = 1; i <= aboveGroundFloors; i++) {
        newConfigurations.push({
          floorNumber: i,
          isUnderground: false,
          templateId: "template-1",
          customSquareFootage: "",
          floorToFloorHeight: "12",
          efficiencyFactor: "85",
          corePercentage: "15",
          primaryUse: "office",
          secondaryUse: null,
          secondaryUsePercentage: "0"
        });
      }
      
      // Create below ground configurations
      for (let i = 1; i <= belowGroundFloors; i++) {
        newConfigurations.push({
          floorNumber: -i,
          isUnderground: true,
          templateId: "template-1",
          customSquareFootage: "",
          floorToFloorHeight: "12",
          efficiencyFactor: "85",
          corePercentage: "15",
          primaryUse: "parking",
          secondaryUse: null,
          secondaryUsePercentage: "0"
        });
      }
      
      setFloorConfigurations(newConfigurations);
    } else {
      // Update existing configurations if number of floors changes
      const currentAboveGround = floorConfigurations.filter(f => !f.isUnderground).length;
      const currentBelowGround = floorConfigurations.filter(f => f.isUnderground).length;
      
      if (currentAboveGround !== aboveGroundFloors || currentBelowGround !== belowGroundFloors) {
        let updatedConfigurations = [...floorConfigurations];
        
        // Handle above ground floors
        if (currentAboveGround < aboveGroundFloors) {
          // Add new floors
          for (let i = currentAboveGround + 1; i <= aboveGroundFloors; i++) {
            updatedConfigurations.push({
              floorNumber: i,
              isUnderground: false,
              templateId: "template-1",
              customSquareFootage: "",
              floorToFloorHeight: "12",
              efficiencyFactor: "85",
              corePercentage: "15",
              primaryUse: "office",
              secondaryUse: null,
              secondaryUsePercentage: "0"
            });
          }
        } else if (currentAboveGround > aboveGroundFloors) {
          // Remove excess floors
          updatedConfigurations = updatedConfigurations.filter(
            config => config.isUnderground || config.floorNumber <= aboveGroundFloors
          );
        }
        
        // Handle below ground floors
        if (currentBelowGround < belowGroundFloors) {
          // Add new below ground floors
          for (let i = currentBelowGround + 1; i <= belowGroundFloors; i++) {
            updatedConfigurations.push({
              floorNumber: -i,
              isUnderground: true,
              templateId: "template-1",
              customSquareFootage: "",
              floorToFloorHeight: "12",
              efficiencyFactor: "85",
              corePercentage: "15",
              primaryUse: "parking",
              secondaryUse: null,
              secondaryUsePercentage: "0"
            });
          }
        } else if (currentBelowGround > belowGroundFloors) {
          // Remove excess below ground floors
          const minFloorNumber = -(belowGroundFloors);
          updatedConfigurations = updatedConfigurations.filter(
            config => !config.isUnderground || config.floorNumber >= minFloorNumber
          );
        }
        
        setFloorConfigurations(updatedConfigurations);
      }
    }
  }, [numberOfFloors, numberOfUndergroundFloors, floorConfigurations.length]);
  
  // Load data from localStorage on component mount
  useEffect(() => {
    const storedProjectInfo = loadFromLocalStorage(STORAGE_KEYS.PROJECT_INFO, {
      projectName: "",
      projectLocation: "",
      projectType: ""
    });
    
    setProjectName(storedProjectInfo.projectName);
    setProjectLocation(storedProjectInfo.projectLocation);
    setProjectType(storedProjectInfo.projectType);
    
    const storedBuildingParams = loadFromLocalStorage(STORAGE_KEYS.BUILDING_PARAMS, {
      farAllowance: "1.5",
      totalLandArea: "0",
      buildingFootprint: "0",
      numberOfFloors: "1",
      numberOfUndergroundFloors: "0"
    });
    
    setFarAllowance(storedBuildingParams.farAllowance);
    setTotalLandArea(storedBuildingParams.totalLandArea);
    setBuildingFootprint(storedBuildingParams.buildingFootprint);
    setNumberOfFloors(storedBuildingParams.numberOfFloors);
    setNumberOfUndergroundFloors(storedBuildingParams.numberOfUndergroundFloors || "0");
    
    const storedSpaceTypes = loadFromLocalStorage(STORAGE_KEYS.SPACE_TYPES, [
      { 
        id: "space-1", 
        type: "", 
        squareFootage: "0", 
        units: "", 
        phase: "phase1",
        efficiencyFactor: "85",
        floorAllocation: { 1: "100" }
      }
    ]);
    setSpaceTypes(storedSpaceTypes);
    
    const storedUnitMix = loadFromLocalStorage(STORAGE_KEYS.UNIT_MIX, [
      { id: "unit-1", type: "Studio", count: "0", squareFootage: "0" }
    ]);
    setUnitMixes(storedUnitMix);
    
    const storedFloorTemplates = loadFromLocalStorage(STORAGE_KEYS.FLOOR_TEMPLATES, [
      {
        id: "template-1",
        name: "Standard Floor",
        squareFootage: "10000",
        floorToFloorHeight: "12",
        efficiencyFactor: "85",
        corePercentage: "15"
      }
    ]);
    setFloorTemplates(storedFloorTemplates);
    
    const storedFloorConfigurations = loadFromLocalStorage(STORAGE_KEYS.FLOOR_CONFIGURATIONS, []);
    setFloorConfigurations(storedFloorConfigurations);
  }, []);
  
  // Save project info to localStorage whenever it changes
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.PROJECT_INFO, {
      projectName,
      projectLocation,
      projectType
    });
  }, [projectName, projectLocation, projectType]);
  
  // Save building parameters to localStorage whenever they change
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.BUILDING_PARAMS, {
      farAllowance,
      totalLandArea,
      buildingFootprint,
      numberOfFloors,
      numberOfUndergroundFloors
    });
  }, [farAllowance, totalLandArea, buildingFootprint, numberOfFloors, numberOfUndergroundFloors]);
  
  // Save space types to localStorage whenever they change
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.SPACE_TYPES, spaceTypes);
  }, [spaceTypes]);
  
  // Save unit mix to localStorage whenever it changes
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.UNIT_MIX, unitMixes);
  }, [unitMixes]);
  
  // Save floor templates to localStorage whenever they change
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.FLOOR_TEMPLATES, floorTemplates);
  }, [floorTemplates]);
  
  // Save floor configurations to localStorage whenever they change
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.FLOOR_CONFIGURATIONS, floorConfigurations);
  }, [floorConfigurations]);
  
  // Calculate total square footage based on floor configurations
  useEffect(() => {
    let aboveGround = 0;
    let belowGround = 0;
    
    floorConfigurations.forEach(floor => {
      // Get square footage either from template or custom value
      let squareFootage = 0;
      if (floor.templateId) {
        const template = floorTemplates.find(t => t.id === floor.templateId);
        if (template) {
          squareFootage = parseFloat(template.squareFootage) || 0;
        }
      }
      
      if (floor.customSquareFootage) {
        squareFootage = parseFloat(floor.customSquareFootage) || 0;
      }
      
      if (floor.isUnderground) {
        belowGround += squareFootage;
      } else {
        aboveGround += squareFootage;
      }
    });
    
    setTotalAboveGroundArea(aboveGround);
    setTotalBelowGroundArea(belowGround);
    setTotalBuildableArea(aboveGround + belowGround);
  }, [floorConfigurations, floorTemplates]);
  
  // Calculate actual FAR (using only above ground area)
  useEffect(() => {
    const landArea = parseFloat(totalLandArea) || 0;
    
    if (landArea > 0) {
      setActualFar(totalAboveGroundArea / landArea);
    } else {
      setActualFar(0);
    }
  }, [totalLandArea, totalAboveGroundArea]);
  
  // Calculate total allocated area
  const calcTotalAllocatedArea = () => {
    const total = spaceTypes.reduce((sum, space) => {
      return sum + (parseFloat(space.squareFootage) || 0);
    }, 0);
    setTotalAllocatedArea(total);
    return total;
  };
  
  // Update issues
  useEffect(() => {
    const newIssues: Issue[] = [];
    
    // Check if exceeding FAR
    if (actualFar > parseFloat(farAllowance)) {
      newIssues.push({
        type: "FAR Exceeded",
        message: `Actual FAR (${actualFar.toFixed(2)}) exceeds zoning allowance (${farAllowance}).`,
        severity: "error",
      });
    }
    
    // Check if all space is allocated
    const unallocatedSpace = totalBuildableArea - totalAllocatedArea;
    if (Math.abs(unallocatedSpace) > 100) { // Allow small rounding errors
      const action = unallocatedSpace > 0 ? "Unallocated" : "Over-allocated";
      newIssues.push({
        type: `${action} Space`,
        message: `${Math.abs(unallocatedSpace).toLocaleString()} sq ft of space is ${unallocatedSpace > 0 ? "unallocated" : "over-allocated"}.`,
        severity: "warning",
      });
    }
    
    // Check floor allocation for each space type
    spaceTypes.forEach(space => {
      if (space.type) {
        const totalAllocation = Object.values(space.floorAllocation)
          .reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
          
        if (Math.abs(totalAllocation - 100) > 1) {
          newIssues.push({
            type: "Incomplete Floor Allocation",
            message: `${space.type} space has ${totalAllocation.toFixed(1)}% floor allocation (should be 100%).`,
            severity: "warning",
          });
        }
      }
    });
    
    // Check for inconsistent floor plate data
    floorConfigurations.forEach(floor => {
      if (!floor.templateId && !floor.customSquareFootage) {
        newIssues.push({
          type: "Missing Floor Plate Data",
          message: `Floor ${floor.floorNumber} is missing square footage information.`,
          severity: "warning",
        });
      }
    });
    
    setIssues(newIssues);
  }, [spaceTypes, actualFar, farAllowance, totalBuildableArea, totalAllocatedArea, floorConfigurations]);
  
  // Floor template operations
  const addFloorTemplate = () => {
    const newId = `template-${floorTemplates.length + 1}`;
    setFloorTemplates([
      ...floorTemplates,
      {
        id: newId,
        name: `Template ${floorTemplates.length + 1}`,
        squareFootage: "10000",
        floorToFloorHeight: "12",
        efficiencyFactor: "85",
        corePercentage: "15"
      }
    ]);
  };
  
  const updateFloorTemplate = (id: string, field: keyof FloorPlateTemplate, value: string) => {
    setFloorTemplates(
      floorTemplates.map(template => 
        template.id === id ? { ...template, [field]: value } : template
      )
    );
  };
  
  const removeFloorTemplate = (id: string) => {
    if (floorTemplates.length > 1) {
      // Remove the template
      setFloorTemplates(floorTemplates.filter(template => template.id !== id));
      
      // Update any floor configurations using this template to use the first available template
      const firstTemplateId = floorTemplates.find(t => t.id !== id)?.id || null;
      setFloorConfigurations(
        floorConfigurations.map(floor => 
          floor.templateId === id ? { ...floor, templateId: firstTemplateId } : floor
        )
      );
    }
  };
  
  // Floor configuration operations
  const updateFloorConfiguration = (
    floorNumber: number, 
    field: keyof FloorConfiguration, 
    value: string | null | boolean | SpaceDefinition[] | BuildingSystemsConfig
  ) => {
    console.log(`Updating floor ${floorNumber}, field ${String(field)}`, value);
    
    setFloorConfigurations(
      floorConfigurations.map(floor => {
        if (floor.floorNumber === floorNumber) {
          const updatedFloor = { ...floor, [field]: value };
          return updatedFloor;
        }
        return floor;
      })
    );
    
    // Force save to localStorage right away for critical updates
    if (field === 'spaces' || field === 'buildingSystems') {
      const updatedConfigs = floorConfigurations.map(floor => 
        floor.floorNumber === floorNumber ? { ...floor, [field]: value } : floor
      );
      saveToLocalStorage(STORAGE_KEYS.FLOOR_CONFIGURATIONS, updatedConfigs);
      dispatchFloorConfigSavedEvent();
    }
  };
  
  const copyFloorConfiguration = (sourceFloorNumber: number, targetFloorNumber: number) => {
    const sourceFloor = floorConfigurations.find(floor => floor.floorNumber === sourceFloorNumber);
    
    if (sourceFloor) {
      setFloorConfigurations(
        floorConfigurations.map(floor => 
          floor.floorNumber === targetFloorNumber 
            ? { 
                ...floor, 
                templateId: sourceFloor.templateId,
                customSquareFootage: sourceFloor.customSquareFootage,
                floorToFloorHeight: sourceFloor.floorToFloorHeight,
                efficiencyFactor: sourceFloor.efficiencyFactor,
                corePercentage: sourceFloor.corePercentage,
                primaryUse: sourceFloor.primaryUse,
                secondaryUse: sourceFloor.secondaryUse,
                secondaryUsePercentage: sourceFloor.secondaryUsePercentage,
                spaces: sourceFloor.spaces ? [...sourceFloor.spaces] : undefined,
                buildingSystems: sourceFloor.buildingSystems ? {...sourceFloor.buildingSystems} : undefined
              } 
            : floor
        )
      );
    }
  };
  
  const bulkEditFloorConfigurations = (
    floorNumbers: number[], 
    field: keyof FloorConfiguration, 
    value: string | null | boolean
  ) => {
    setFloorConfigurations(
      floorConfigurations.map(floor => 
        floorNumbers.includes(floor.floorNumber) ? { ...floor, [field]: value } : floor
      )
    );
  };
  
  // Generate floors data for visualizations
  const generateFloorsData = () => {
    // Sort configurations by floor number (highest first)
    const sortedConfigs = [...floorConfigurations].sort((a, b) => b.floorNumber - a.floorNumber);
    const floors = [];
    
    for (const config of sortedConfigs) {
      const floorSpaces = [];
      let totalFloorArea = 0;
      
      // Get square footage for this floor
      let floorSquareFootage = 0;
      if (config.templateId) {
        const template = floorTemplates.find(t => t.id === config.templateId);
        if (template) {
          floorSquareFootage = parseFloat(template.squareFootage) || 0;
        }
      }
      if (config.customSquareFootage) {
        floorSquareFootage = parseFloat(config.customSquareFootage) || 0;
      }
      
      // Primary use
      if (config.primaryUse) {
        const primaryPercentage = 100 - (parseFloat(config.secondaryUsePercentage) || 0);
        const primaryArea = floorSquareFootage * (primaryPercentage / 100);
        totalFloorArea += primaryArea;
        
        floorSpaces.push({
          id: `${config.floorNumber}-primary`,
          type: config.primaryUse,
          squareFootage: primaryArea,
          percentage: 0 // Will calculate after total is known
        });
      }
      
      // Secondary use if specified
      if (config.secondaryUse && parseFloat(config.secondaryUsePercentage) > 0) {
        const secondaryArea = floorSquareFootage * (parseFloat(config.secondaryUsePercentage) / 100);
        totalFloorArea += secondaryArea;
        
        floorSpaces.push({
          id: `${config.floorNumber}-secondary`,
          type: config.secondaryUse,
          squareFootage: secondaryArea,
          percentage: 0 // Will calculate after total is known
        });
      }
      
      // Calculate percentages
      if (totalFloorArea > 0) {
        floorSpaces.forEach(space => {
          space.percentage = (space.squareFootage / totalFloorArea) * 100;
        });
      }
      
      floors.push({
        floorNumber: config.floorNumber,
        spaces: floorSpaces,
        isUnderground: config.isUnderground
      });
    }
    
    return floors;
  };
  
  // Generate data for space breakdown visualization
  const generateSpaceBreakdown = () => {
    // Create a map to aggregate space types
    const spaceMap: Record<string, { 
      type: string, 
      squareFootage: number, 
      floorAllocation: Record<number, number> 
    }> = {};
    
    floorConfigurations.forEach(config => {
      // Get square footage for this floor
      let floorSquareFootage = 0;
      if (config.templateId) {
        const template = floorTemplates.find(t => t.id === config.templateId);
        if (template) {
          floorSquareFootage = parseFloat(template.squareFootage) || 0;
        }
      }
      if (config.customSquareFootage) {
        floorSquareFootage = parseFloat(config.customSquareFootage) || 0;
      }
      
      // Primary use
      if (config.primaryUse) {
        const primaryPercentage = 100 - (parseFloat(config.secondaryUsePercentage) || 0);
        const primaryArea = floorSquareFootage * (primaryPercentage / 100);
        
        if (!spaceMap[config.primaryUse]) {
          spaceMap[config.primaryUse] = {
            type: config.primaryUse,
            squareFootage: 0,
            floorAllocation: {}
          };
        }
        
        spaceMap[config.primaryUse].squareFootage += primaryArea;
        spaceMap[config.primaryUse].floorAllocation[config.floorNumber] = primaryPercentage;
      }
      
      // Secondary use
      if (config.secondaryUse && parseFloat(config.secondaryUsePercentage) > 0) {
        const secondaryArea = floorSquareFootage * (parseFloat(config.secondaryUsePercentage) / 100);
        
        if (!spaceMap[config.secondaryUse]) {
          spaceMap[config.secondaryUse] = {
            type: config.secondaryUse,
            squareFootage: 0,
            floorAllocation: {}
          };
        }
        
        spaceMap[config.secondaryUse].squareFootage += secondaryArea;
        spaceMap[config.secondaryUse].floorAllocation[config.floorNumber] = 
          parseFloat(config.secondaryUsePercentage);
      }
    });
    
    const totalArea = Object.values(spaceMap).reduce((sum, space) => sum + space.squareFootage, 0);
    
    return Object.values(spaceMap).map(space => ({
      type: space.type,
      squareFootage: space.squareFootage,
      percentage: totalArea > 0 ? (space.squareFootage / totalArea) * 100 : 0,
      color: spaceTypeColors[space.type] || "#9CA3AF",
      floorAllocation: space.floorAllocation
    }));
  };
  
  // Generate phases data for visualization
  const generatePhasesData = () => {
    const phaseMap: Record<string, {
      name: string,
      squareFootage: number,
      timeline: { start: string, end: string },
      spaceTypes: Map<string, number>
    }> = {
      "phase1": {
        name: "Phase 1",
        squareFootage: 0,
        timeline: { start: "2024-01-01", end: "2025-06-30" },
        spaceTypes: new Map()
      },
      "phase2": {
        name: "Phase 2",
        squareFootage: 0,
        timeline: { start: "2025-03-01", end: "2026-12-31" },
        spaceTypes: new Map()
      },
      "phase3": {
        name: "Phase 3",
        squareFootage: 0,
        timeline: { start: "2026-06-01", end: "2027-12-31" },
        spaceTypes: new Map()
      }
    };
    
    // Aggregate space data by phase
    spaceTypes.forEach(space => {
      if (space.phase && phaseMap[space.phase]) {
        const squareFootage = parseFloat(space.squareFootage) || 0;
        const type = space.type || "unassigned";
        
        phaseMap[space.phase].squareFootage += squareFootage;
        
        const currentValue = phaseMap[space.phase].spaceTypes.get(type) || 0;
        phaseMap[space.phase].spaceTypes.set(type, currentValue + squareFootage);
      }
    });
    
    // Convert to array format for component
    return Object.entries(phaseMap).map(([phaseId, phaseData]) => {
      return {
        phase: phaseId,
        name: phaseData.name,
        squareFootage: phaseData.squareFootage,
        percentage: totalAllocatedArea > 0 ? (phaseData.squareFootage / totalAllocatedArea) * 100 : 0,
        timeline: phaseData.timeline,
        spaceTypes: Array.from(phaseData.spaceTypes.entries()).map(([type, squareFootage]) => ({
          type,
          squareFootage
        }))
      };
    }).filter(phase => phase.squareFootage > 0);
  };
  
  // Space Type operations
  const addSpaceType = () => {
    const newId = `space-${spaceTypes.length + 1}`;
    const floorCount = parseInt(numberOfFloors) || 1;
    const floorAllocation: Record<number, string> = {};
    
    // Default to allocating 100% to floor 1
    floorAllocation[1] = "100";
    
    setSpaceTypes([
      ...spaceTypes,
      { 
        id: newId, 
        type: "", 
        squareFootage: "0", 
        units: "", 
        phase: "phase1",
        efficiencyFactor: "85",
        floorAllocation
      }
    ]);
  };

  const removeSpaceType = (id: string) => {
    if (spaceTypes.length > 1) {
      setSpaceTypes(spaceTypes.filter(space => space.id !== id));
    }
  };

  const updateSpaceType = (id: string, field: keyof SpaceType, value: string) => {
    setSpaceTypes(
      spaceTypes.map(space => 
        space.id === id ? { ...space, [field]: value } : space
      )
    );
  };
  
  const updateSpaceTypeFloorAllocation = (id: string, floor: number, value: string) => {
    setSpaceTypes(
      spaceTypes.map(space => {
        if (space.id === id) {
          const newFloorAllocation = { ...space.floorAllocation };
          newFloorAllocation[floor] = value;
          return { ...space, floorAllocation: newFloorAllocation };
        }
        return space;
      })
    );
  };
  
  // Unit Mix operations
  const addUnitMix = () => {
    const newId = `unit-${unitMixes.length + 1}`;
    setUnitMixes([
      ...unitMixes,
      { id: newId, type: "", count: "0", squareFootage: "0" }
    ]);
  };

  const removeUnitMix = (id: string) => {
    if (unitMixes.length > 1) {
      setUnitMixes(unitMixes.filter(unit => unit.id !== id));
    }
  };

  const updateUnitMix = (id: string, field: keyof UnitMix, value: string) => {
    setUnitMixes(
      unitMixes.map(unit => 
        unit.id === id ? { ...unit, [field]: value } : unit
      )
    );
  };
  
  // Reset all data
  const resetAllData = useCallback(() => {
    setProjectName("");
    setProjectLocation("");
    setProjectType("");
    setFarAllowance("1.5");
    setTotalLandArea("0");
    setBuildingFootprint("0");
    setNumberOfFloors("1");
    setNumberOfUndergroundFloors("0");
    setSpaceTypes([{ 
      id: "space-1", 
      type: "", 
      squareFootage: "0", 
      units: "", 
      phase: "phase1",
      efficiencyFactor: "85",
      floorAllocation: { 1: "100" }
    }]);
    setUnitMixes([{ id: "unit-1", type: "Studio", count: "0", squareFootage: "0" }]);
    setFloorTemplates([{
      id: "template-1",
      name: "Standard Floor",
      squareFootage: "10000",
      floorToFloorHeight: "12",
      efficiencyFactor: "85",
      corePercentage: "15"
    }]);
    setFloorConfigurations([]);
  }, []);

  // Update spaces for a specific floor
  const updateFloorSpaces = (floorNumber: number, spaces: SpaceDefinition[]) => {
    console.log(`Updating spaces for floor ${floorNumber}`, spaces);
    updateFloorConfiguration(floorNumber, 'spaces', spaces);
  };
  
  // Update building systems for a specific floor
  const updateFloorBuildingSystems = (floorNumber: number, systems: BuildingSystemsConfig) => {
    console.log(`Updating building systems for floor ${floorNumber}`, systems);
    updateFloorConfiguration(floorNumber, 'buildingSystems', systems);
  };
  
  return {
    // Project Information
    projectName, setProjectName,
    projectLocation, setProjectLocation,
    projectType, setProjectType,
    
    // Building Parameters
    farAllowance, setFarAllowance,
    totalLandArea, setTotalLandArea,
    buildingFootprint, setBuildingFootprint,
    numberOfFloors, setNumberOfFloors,
    numberOfUndergroundFloors, setNumberOfUndergroundFloors,
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
    updateFloorSpaces,
    updateFloorBuildingSystems,
    
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
    issues,
    
    // Data persistence
    resetAllData
  };
};
