
import { useState, useEffect, useCallback } from "react";
import { saveToLocalStorage, loadFromLocalStorage } from "./useLocalStoragePersistence";

interface SpaceType {
  id: string;
  type: string;
  squareFootage: string;
  units: string;
  phase: string;
  efficiencyFactor: string;
  floorAllocation: Record<number, string>; // floor number -> percentage
}

interface UnitMix {
  id: string;
  type: string;
  count: string;
  squareFootage: string;
}

interface Issue {
  type: string;
  message: string;
  severity: 'warning' | 'error';
}

const STORAGE_KEYS = {
  PROJECT_INFO: "realEstateModel_extendedProjectInfo",
  BUILDING_PARAMS: "realEstateModel_buildingParams",
  SPACE_TYPES: "realEstateModel_extendedSpaceTypes",
  UNIT_MIX: "realEstateModel_extendedUnitMix"
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
  
  // Calculated values
  const [totalBuildableArea, setTotalBuildableArea] = useState<number>(0);
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
  };
  
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
      numberOfFloors: "1"
    });
    
    setFarAllowance(storedBuildingParams.farAllowance);
    setTotalLandArea(storedBuildingParams.totalLandArea);
    setBuildingFootprint(storedBuildingParams.buildingFootprint);
    setNumberOfFloors(storedBuildingParams.numberOfFloors);
    
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
      numberOfFloors
    });
  }, [farAllowance, totalLandArea, buildingFootprint, numberOfFloors]);
  
  // Save space types to localStorage whenever they change
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.SPACE_TYPES, spaceTypes);
  }, [spaceTypes]);
  
  // Save unit mix to localStorage whenever it changes
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.UNIT_MIX, unitMixes);
  }, [unitMixes]);
  
  // Calculate total buildable area
  useEffect(() => {
    const landArea = parseFloat(totalLandArea) || 0;
    const far = parseFloat(farAllowance) || 0;
    setTotalBuildableArea(landArea * far);
  }, [totalLandArea, farAllowance]);
  
  // Calculate actual FAR
  useEffect(() => {
    const landArea = parseFloat(totalLandArea) || 0;
    const allocatedArea = calcTotalAllocatedArea();
    
    if (landArea > 0) {
      setActualFar(allocatedArea / landArea);
    } else {
      setActualFar(0);
    }
  }, [totalLandArea, spaceTypes]);
  
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
    
    setIssues(newIssues);
  }, [spaceTypes, actualFar, farAllowance, totalBuildableArea, totalAllocatedArea]);
  
  // Generate floors data for visualizations
  const generateFloorsData = () => {
    const floorCount = parseInt(numberOfFloors) || 1;
    const floors = [];
    
    for (let i = 1; i <= floorCount; i++) {
      const floorSpaces = [];
      let totalFloorArea = 0;
      
      // Calculate total area for this floor
      spaceTypes.forEach(space => {
        const allocation = parseFloat(space.floorAllocation[i] || "0");
        if (allocation > 0) {
          const spaceArea = parseFloat(space.squareFootage) || 0;
          const floorArea = spaceArea * (allocation / 100);
          totalFloorArea += floorArea;
          
          floorSpaces.push({
            id: space.id,
            type: space.type || "unassigned",
            squareFootage: floorArea,
            percentage: 0 // Will calculate after total is known
          });
        }
      });
      
      // Calculate percentages
      if (totalFloorArea > 0) {
        floorSpaces.forEach(space => {
          space.percentage = (space.squareFootage / totalFloorArea) * 100;
        });
      }
      
      floors.push({
        floorNumber: i,
        spaces: floorSpaces
      });
    }
    
    return floors;
  };
  
  // Generate data for space breakdown visualization
  const generateSpaceBreakdown = () => {
    return spaceTypes.map(space => {
      const type = space.type || "unassigned";
      const squareFootage = parseFloat(space.squareFootage) || 0;
      const percentage = totalAllocatedArea > 0 ? (squareFootage / totalAllocatedArea) * 100 : 0;
      
      // Generate floor allocation for visualization
      const floorAllocation: Record<number, number> = {};
      
      Object.entries(space.floorAllocation).forEach(([floor, percentage]) => {
        floorAllocation[parseInt(floor)] = parseFloat(percentage) || 0;
      });
      
      return {
        type,
        squareFootage,
        percentage,
        color: spaceTypeColors[type] || "#9CA3AF",
        floorAllocation
      };
    });
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
  }, []);

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
    totalBuildableArea,
    actualFar,
    totalAllocatedArea,
    
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
