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

const dispatchFloorConfigSavedEvent = () => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('floorConfigSaved');
    window.dispatchEvent(event);
  }
};

export const useExtendedPropertyState = () => {
  const [projectName, setProjectName] = useState<string>("");
  const [projectLocation, setProjectLocation] = useState<string>("");
  const [projectType, setProjectType] = useState<string>("");

  const [farAllowance, setFarAllowance] = useState<string>("1.5");
  const [totalLandArea, setTotalLandArea] = useState<string>("0");
  const [buildingFootprint, setBuildingFootprint] = useState<string>("0");

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

  const [floorConfigurations, setFloorConfigurations] = useState<FloorConfiguration[]>([
    {
      floorNumber: 1,
      isUnderground: false,
      templateId: "template-1",
      customSquareFootage: "",
      floorToFloorHeight: "12",
      efficiencyFactor: "85",
      corePercentage: "15",
      primaryUse: "office",
      secondaryUse: null,
      secondaryUsePercentage: "0"
    }
  ]);

  const [totalBuildableArea, setTotalBuildableArea] = useState<number>(0);
  const [totalAboveGroundArea, setTotalAboveGroundArea] = useState<number>(0);
  const [totalBelowGroundArea, setTotalBelowGroundArea] = useState<number>(0);
  const [actualFar, setActualFar] = useState<number>(0);
  const [totalAllocatedArea, setTotalAllocatedArea] = useState<number>(0);

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

  const [unitMixes, setUnitMixes] = useState<UnitMix[]>([
    { id: "unit-1", type: "Studio", count: "0", squareFootage: "0" }
  ]);

  const [issues, setIssues] = useState<Issue[]>([]);

  const spaceTypeColors: Record<string, string> = {
    "residential": "#3B82F6",
    "office": "#10B981",
    "retail": "#F59E0B",
    "parking": "#6B7280",
    "hotel": "#8B5CF6",
    "amenities": "#EC4899",
    "storage": "#78716C",
    "mechanical": "#475569"
  };

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
      buildingFootprint: "0"
    });

    setFarAllowance(storedBuildingParams.farAllowance);
    setTotalLandArea(storedBuildingParams.totalLandArea);
    setBuildingFootprint(storedBuildingParams.buildingFootprint);

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

    const storedFloorConfigurations = loadFromLocalStorage(STORAGE_KEYS.FLOOR_CONFIGURATIONS, [
      {
        floorNumber: 1,
        isUnderground: false,
        templateId: "template-1",
        customSquareFootage: "",
        floorToFloorHeight: "12",
        efficiencyFactor: "85",
        corePercentage: "15",
        primaryUse: "office",
        secondaryUse: null,
        secondaryUsePercentage: "0"
      }
    ]);
    
    if (storedFloorConfigurations.length > 0) {
      setFloorConfigurations(storedFloorConfigurations);
    }
  }, []);

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.PROJECT_INFO, {
      projectName,
      projectLocation,
      projectType
    });
  }, [projectName, projectLocation, projectType]);

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.BUILDING_PARAMS, {
      farAllowance,
      totalLandArea,
      buildingFootprint
    });
  }, [farAllowance, totalLandArea, buildingFootprint]);

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.SPACE_TYPES, spaceTypes);
  }, [spaceTypes]);

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.UNIT_MIX, unitMixes);
  }, [unitMixes]);

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.FLOOR_TEMPLATES, floorTemplates);
  }, [floorTemplates]);

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.FLOOR_CONFIGURATIONS, floorConfigurations);
  }, [floorConfigurations]);

  useEffect(() => {
    let aboveGround = 0;
    let belowGround = 0;

    floorConfigurations.forEach(floor => {
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

  useEffect(() => {
    const landArea = parseFloat(totalLandArea) || 0;

    if (landArea > 0) {
      setActualFar(totalAboveGroundArea / landArea);
    } else {
      setActualFar(0);
    }
  }, [totalLandArea, totalAboveGroundArea]);

  const calcTotalAllocatedArea = () => {
    const total = spaceTypes.reduce((sum, space) => {
      return sum + (parseFloat(space.squareFootage) || 0);
    }, 0);
    setTotalAllocatedArea(total);
    return total;
  };

  useEffect(() => {
    const newIssues: Issue[] = [];

    if (actualFar > parseFloat(farAllowance)) {
      newIssues.push({
        type: "FAR Exceeded",
        message: `Actual FAR (${actualFar.toFixed(2)}) exceeds zoning allowance (${farAllowance}).`,
        severity: "error",
      });
    }

    const unallocatedSpace = totalBuildableArea - totalAllocatedArea;
    if (Math.abs(unallocatedSpace) > 100) {
      const action = unallocatedSpace > 0 ? "Unallocated" : "Over-allocated";
      newIssues.push({
        type: `${action} Space`,
        message: `${Math.abs(unallocatedSpace).toLocaleString()} sq ft of space is ${unallocatedSpace > 0 ? "unallocated" : "over-allocated"}.`,
        severity: "warning",
      });
    }

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
      setFloorTemplates(floorTemplates.filter(template => template.id !== id));
      
      const firstTemplateId = floorTemplates.find(t => t.id !== id)?.id || null;
      setFloorConfigurations(
        floorConfigurations.map(floor => 
          floor.templateId === id ? { ...floor, templateId: firstTemplateId } : floor
        )
      );
    }
  };

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
    
    if (field === 'spaces' || field === 'buildingSystems') {
      const updatedConfigs = floorConfigurations.map(floor => 
        floor.floorNumber === floorNumber ? { ...floor, [field]: value } : floor
      );
      saveToLocalStorage(STORAGE_KEYS.FLOOR_CONFIGURATIONS, updatedConfigs);
      dispatchFloorConfigSavedEvent();
    }
  };

  const copyFloorConfiguration = (sourceFloorNumber: number, targetFloorNumbers: number[]) => {
    const sourceFloor = floorConfigurations.find(floor => floor.floorNumber === sourceFloorNumber);
    
    if (sourceFloor && targetFloorNumbers.length > 0) {
      setFloorConfigurations(
        floorConfigurations.map(floor => 
          targetFloorNumbers.includes(floor.floorNumber)
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

  const addFloors = (
    count: number,
    isUnderground: boolean,
    templateId: string | null,
    position: "top" | "bottom" | "specific",
    specificPosition?: number,
    numberingPattern?: "consecutive" | "skip" | "custom",
    customNumbering?: number[]
  ) => {
    const aboveGroundFloors = floorConfigurations.filter(f => !f.isUnderground);
    const belowGroundFloors = floorConfigurations.filter(f => f.isUnderground);
    
    let newFloors: FloorConfiguration[] = [];
    let defaultTemplate = floorTemplates[0];
    let numberingStart: number;
    
    if (isUnderground) {
      const lowestBelowGround = belowGroundFloors.length > 0 
        ? Math.min(...belowGroundFloors.map(f => f.floorNumber)) 
        : 0;
      numberingStart = lowestBelowGround <= 0 ? lowestBelowGround - count : -1;
    } else {
      const highestAboveGround = aboveGroundFloors.length > 0 
        ? Math.max(...aboveGroundFloors.map(f => f.floorNumber)) 
        : 0;
      numberingStart = highestAboveGround >= 1 ? highestAboveGround + 1 : 1;
    }
    
    if (position === "specific" && specificPosition !== undefined) {
      numberingStart = specificPosition;
    }
    
    for (let i = 0; i < count; i++) {
      let floorNumber: number;
      
      if (numberingPattern === "consecutive" || !numberingPattern) {
        floorNumber = isUnderground ? numberingStart + i : numberingStart + i;
      } else if (numberingPattern === "skip") {
        floorNumber = isUnderground ? numberingStart + (i * 2) : numberingStart + (i * 2);
      } else if (numberingPattern === "custom" && customNumbering && customNumbering[i] !== undefined) {
        floorNumber = customNumbering[i];
      } else {
        floorNumber = isUnderground ? numberingStart + i : numberingStart + i;
      }
      
      newFloors.push({
        floorNumber: floorNumber,
        isUnderground: isUnderground,
        templateId: templateId,
        customSquareFootage: "",
        floorToFloorHeight: "12",
        efficiencyFactor: "85",
        corePercentage: "15",
        primaryUse: isUnderground ? "parking" : "office",
        secondaryUse: null,
        secondaryUsePercentage: "0"
      });
    }
    
    let updatedFloors: FloorConfiguration[];
    if (position === "top" && !isUnderground) {
      updatedFloors = [...floorConfigurations, ...newFloors];
    } else if (position === "bottom" && isUnderground) {
      updatedFloors = [...newFloors, ...floorConfigurations];
    } else if (position === "specific" && specificPosition !== undefined) {
      const sortedFloors = [...floorConfigurations].sort((a, b) => b.floorNumber - a.floorNumber);
      const insertIndex = sortedFloors.findIndex(f => 
        isUnderground ? f.floorNumber <= specificPosition : f.floorNumber >= specificPosition
      );
      
      if (insertIndex === -1) {
        updatedFloors = isUnderground
          ? [...sortedFloors, ...newFloors]
          : [...newFloors, ...sortedFloors];
      } else {
        updatedFloors = [
          ...sortedFloors.slice(0, insertIndex),
          ...newFloors,
          ...sortedFloors.slice(insertIndex)
        ];
      }
    } else {
      updatedFloors = isUnderground 
        ? [...newFloors, ...floorConfigurations]
        : [...floorConfigurations, ...newFloors];
    }
    
    setFloorConfigurations(updatedFloors);
  };

  const removeFloors = (floorNumbers: number[]) => {
    if (floorNumbers.length > 0) {
      const remainingFloors = floorConfigurations.filter(
        floor => !floorNumbers.includes(floor.floorNumber)
      );
      
      if (remainingFloors.length === 0) {
        const defaultFloor: FloorConfiguration = {
          floorNumber: 1,
          isUnderground: false,
          templateId: floorTemplates[0]?.id || null,
          customSquareFootage: "",
          floorToFloorHeight: "12",
          efficiencyFactor: "85",
          corePercentage: "15",
          primaryUse: "office",
          secondaryUse: null,
          secondaryUsePercentage: "0"
        };
        
        setFloorConfigurations([defaultFloor]);
      } else {
        setFloorConfigurations(remainingFloors);
      }
    }
  };

  const reorderFloor = (floorNumber: number, direction: "up" | "down") => {
    const sortedFloors = [...floorConfigurations].sort((a, b) => b.floorNumber - a.floorNumber);
    const currentIndex = sortedFloors.findIndex(f => f.floorNumber === floorNumber);
    
    if (currentIndex === -1) return;
    
    const targetIndex = direction === "up" 
      ? Math.max(0, currentIndex - 1) 
      : Math.min(sortedFloors.length - 1, currentIndex + 1);
    
    if (currentIndex === targetIndex) return;
    
    const targetFloor = sortedFloors[targetIndex];
    const currentFloor = sortedFloors[currentIndex];
    
    const tempFloorNumber = currentFloor.floorNumber;
    currentFloor.floorNumber = targetFloor.floorNumber;
    targetFloor.floorNumber = tempFloorNumber;
    
    setFloorConfigurations([...sortedFloors]);
  };

  const importFloorConfigurations = (configurations: FloorConfiguration[]) => {
    if (configurations && configurations.length > 0) {
      setFloorConfigurations(configurations);
    }
  };

  const exportFloorConfigurations = () => {
    return floorConfigurations;
  };

  const generateFloorsData = () => {
    const sortedConfigs = [...floorConfigurations].sort((a, b) => b.floorNumber - a.floorNumber);
    const floors = [];
    
    for (const config of sortedConfigs) {
      const floorSpaces = [];
      let totalFloorArea = 0;
      
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
      
      if (config.primaryUse) {
        const primaryPercentage = 100 - (parseFloat(config.secondaryUsePercentage) || 0);
        const primaryArea = floorSquareFootage * (primaryPercentage / 100);
        totalFloorArea += primaryArea;
        
        floorSpaces.push({
          id: `${config.floorNumber}-primary`,
          type: config.primaryUse,
          squareFootage: primaryArea,
          percentage: 0
        });
      }
      
      if (config.secondaryUse && parseFloat(config.secondaryUsePercentage) > 0) {
        const secondaryArea = floorSquareFootage * (parseFloat(config.secondaryUsePercentage) / 100);
        totalFloorArea += secondaryArea;
        
        floorSpaces.push({
          id: `${config.floorNumber}-secondary`,
          type: config.secondaryUse,
          squareFootage: secondaryArea,
          percentage: 0
        });
      }
      
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

  const generateSpaceBreakdown = () => {
    const spaceMap: Record<string, { 
      type: string, 
      squareFootage: number, 
      floorAllocation: Record<number, number> 
    }> = {};
    
    floorConfigurations.forEach(config => {
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
    
    spaceTypes.forEach(space => {
      if (space.phase && phaseMap[space.phase]) {
        const squareFootage = parseFloat(space.squareFootage) || 0;
        const type = space.type || "unassigned";
        
        phaseMap[space.phase].squareFootage += squareFootage;
        
        const currentValue = phaseMap[space.phase].spaceTypes.get(type) || 0;
        phaseMap[space.phase].spaceTypes.set(type, currentValue + squareFootage);
      }
    });
    
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

  const addSpaceType = () => {
    const newId = `space-${spaceTypes.length + 1}`;
    const floorAllocation: Record<number, string> = {};
    
    const firstFloorNum = floorConfigurations.length > 0 
      ? floorConfigurations[0].floorNumber 
      : 1;
    
    floorAllocation[firstFloorNum] = "100";
    
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

  const resetAllData = useCallback(() => {
    setProjectName("");
    setProjectLocation("");
    setProjectType("");
    setFarAllowance("1.5");
    setTotalLandArea("0");
    setBuildingFootprint("0");
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
    setFloorConfigurations([{
      floorNumber: 1,
      isUnderground: false,
      templateId: "template-1",
      customSquareFootage: "",
      floorToFloorHeight: "12",
      efficiencyFactor: "85",
      corePercentage: "15",
      primaryUse: "office",
      secondaryUse: null,
      secondaryUsePercentage: "0"
    }]);
  }, []);

  const updateFloorSpaces = (floorNumber: number, spaces: SpaceDefinition[]) => {
    const validatedSpaces = spaces.map(space => ({
      ...space,
      dimensions: space.dimensions || { width: "0", depth: "0" },
      subType: space.subType || null,
      percentage: typeof space.percentage === 'number' ? space.percentage : 0
    }));
    console.log(`Updating spaces for floor ${floorNumber}`, validatedSpaces);
    updateFloorConfiguration(floorNumber, 'spaces', validatedSpaces);
  };

  const updateFloorBuildingSystems = (floorNumber: number, systems: BuildingSystemsConfig) => {
    const validatedSystems = {
      ...systems,
      elevators: systems.elevators || {
        passenger: "0",
        service: "0",
        freight: "0"
      }
    };
    console.log(`Updating building systems for floor ${floorNumber}`, validatedSystems);
    updateFloorConfiguration(floorNumber, 'buildingSystems', validatedSystems);
  };

  return {
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
    importFloorConfigurations,
    exportFloorConfigurations,
    updateFloorSpaces,
    updateFloorBuildingSystems,
    
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
    
    issues,
    
    resetAllData
  };
};
