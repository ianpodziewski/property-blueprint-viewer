
import { useState, useEffect, useCallback, useRef } from "react";
import { saveToLocalStorage, loadFromLocalStorage } from "../useLocalStoragePersistence";
import { FloorConfiguration, FloorPlateTemplate } from "@/types/propertyTypes";

const STORAGE_KEY = "realEstateModel_buildingParams";

export const useBuildingParameters = (
  floorConfigurations: FloorConfiguration[], 
  floorTemplates: FloorPlateTemplate[]
) => {
  // Track initialization state to prevent unnecessary updates
  const isInitialized = useRef(false);
  const prevBuildingParams = useRef<{
    aboveGround: number;
    belowGround: number;
    total: number;
    far: number;
  }>({ aboveGround: 0, belowGround: 0, total: 0, far: 0 });
  
  // Initialize state directly with data from localStorage
  const [farAllowance, setFarAllowance] = useState<string>(() => {
    const storedBuildingParams = loadFromLocalStorage(STORAGE_KEY, {
      farAllowance: "1.5",
      totalLandArea: "0",
      buildingFootprint: "0"
    });
    return storedBuildingParams.farAllowance;
  });
  
  const [totalLandArea, setTotalLandArea] = useState<string>(() => {
    const storedBuildingParams = loadFromLocalStorage(STORAGE_KEY, {
      farAllowance: "1.5",
      totalLandArea: "0",
      buildingFootprint: "0"
    });
    return storedBuildingParams.totalLandArea;
  });
  
  const [buildingFootprint, setBuildingFootprint] = useState<string>(() => {
    const storedBuildingParams = loadFromLocalStorage(STORAGE_KEY, {
      farAllowance: "1.5",
      totalLandArea: "0",
      buildingFootprint: "0"
    });
    return storedBuildingParams.buildingFootprint;
  });
  
  const [totalBuildableArea, setTotalBuildableArea] = useState<number>(0);
  const [totalAboveGroundArea, setTotalAboveGroundArea] = useState<number>(0);
  const [totalBelowGroundArea, setTotalBelowGroundArea] = useState<number>(0);
  const [actualFar, setActualFar] = useState<number>(0);

  // Save building parameters to localStorage with deep comparison to avoid unnecessary updates
  useEffect(() => {
    // Skip initial render and only save on real user changes
    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }
    
    const params = {
      farAllowance,
      totalLandArea,
      buildingFootprint
    };
    
    // Get previous values from localStorage
    const storedParams = loadFromLocalStorage(STORAGE_KEY, {
      farAllowance: "1.5",
      totalLandArea: "0",
      buildingFootprint: "0"
    });
    
    // Only save if there's an actual change to avoid updating in a loop
    if (JSON.stringify(params) !== JSON.stringify(storedParams)) {
      saveToLocalStorage(STORAGE_KEY, params);
      console.log("Saved building parameters to localStorage:", params);
    }
  }, [farAllowance, totalLandArea, buildingFootprint]);

  // Calculate building areas based on floor configurations with memoization to prevent needless recalculation
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

    // Only update state if values actually changed to prevent render loops
    const newTotal = aboveGround + belowGround;
    
    if (aboveGround !== prevBuildingParams.current.aboveGround) {
      setTotalAboveGroundArea(aboveGround);
      prevBuildingParams.current.aboveGround = aboveGround;
    }
    
    if (belowGround !== prevBuildingParams.current.belowGround) {
      setTotalBelowGroundArea(belowGround);
      prevBuildingParams.current.belowGround = belowGround;
    }
    
    if (newTotal !== prevBuildingParams.current.total) {
      setTotalBuildableArea(newTotal);
      prevBuildingParams.current.total = newTotal;
    }
  }, [floorConfigurations, floorTemplates]);

  // Calculate actual FAR with memoization to prevent needless recalculation
  useEffect(() => {
    const landArea = parseFloat(totalLandArea) || 0;
    let newFar = 0;

    if (landArea > 0) {
      newFar = totalAboveGroundArea / landArea;
    }
    
    // Only update if value changed to prevent render loops
    if (newFar !== prevBuildingParams.current.far) {
      setActualFar(newFar);
      prevBuildingParams.current.far = newFar;
    }
  }, [totalLandArea, totalAboveGroundArea]);

  // Reset all building parameters
  const resetAllData = useCallback(() => {
    setFarAllowance("1.5");
    setTotalLandArea("0");
    setBuildingFootprint("0");
    // The calculated values will be reset through the effects
    isInitialized.current = false; // Reset initialization flag
    prevBuildingParams.current = { aboveGround: 0, belowGround: 0, total: 0, far: 0 }; // Reset previous values
  }, []);

  return {
    farAllowance, 
    setFarAllowance,
    totalLandArea, 
    setTotalLandArea,
    buildingFootprint, 
    setBuildingFootprint,
    totalBuildableArea,
    totalAboveGroundArea,
    totalBelowGroundArea,
    actualFar,
    resetAllData
  };
};
