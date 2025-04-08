
import { useState, useEffect, useCallback } from "react";
import { Issue, FloorConfiguration, FloorPlateTemplate, SpaceType } from "@/types/propertyTypes";

export const useVisualizationData = (
  spaceTypes: SpaceType[],
  actualFar: number,
  farAllowance: string,
  totalBuildableArea: number,
  totalAllocatedArea: number,
  floorConfigurations: FloorConfiguration[],
  floorTemplates: FloorPlateTemplate[]
) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [floorsData, setFloorsData] = useState<any[]>([]);
  const [spaceBreakdown, setSpaceBreakdown] = useState<any[]>([]);
  const [phasesData, setPhasesData] = useState<any[]>([]);

  // Define space type colors
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

  // Check for issues
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

  // Generate floors data for visualization
  const generateFloorsData = useCallback(() => {
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
  }, [floorConfigurations, floorTemplates]);

  // Generate space breakdown for visualization
  const generateSpaceBreakdown = useCallback(() => {
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
  }, [floorConfigurations, floorTemplates, spaceTypeColors]);

  // Generate phases data for visualization
  const generatePhasesData = useCallback(() => {
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
  }, [spaceTypes, totalAllocatedArea]);

  // Update visualization data on changes
  useEffect(() => {
    setFloorsData(generateFloorsData());
  }, [generateFloorsData]);

  useEffect(() => {
    setSpaceBreakdown(generateSpaceBreakdown());
  }, [generateSpaceBreakdown]);

  useEffect(() => {
    setPhasesData(generatePhasesData());
  }, [generatePhasesData]);

  return {
    issues,
    spaceTypeColors,
    generateFloorsData: () => floorsData,
    generateSpaceBreakdown: () => spaceBreakdown,
    generatePhasesData: () => phasesData
  };
};
