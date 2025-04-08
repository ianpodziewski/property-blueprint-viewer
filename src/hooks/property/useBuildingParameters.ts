
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  
  // Add a ref to track the version of configurations and templates
  const configVersionRef = useRef<string>("");
  
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
  
  // Track if we're currently updating parameters to prevent infinite loops
  const isUpdatingParams = useRef(false);

  // Save building parameters to localStorage with deep comparison to avoid unnecessary updates
  useEffect(() => {
    // Skip initial render and only save on real user changes
    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }
    
    // Skip if we're currently in the middle of an update
    if (isUpdatingParams.current) return;
    
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

  // Use useMemo to optimize building area calculations
  // This will only recompute when floor configurations or templates actually change
  const buildingAreas = useMemo(() => {
    // Generate a version identifier to detect real changes
    const newConfigVersion = JSON.stringify({
      configs: floorConfigurations.map(f => ({
        id: f.floorNumber,
        template: f.templateId,
        custom: f.customSquareFootage,
        isUnderground: f.isUnderground
      })),
      templates: floorTemplates.map(t => ({ id: t.id, sqft: t.squareFootage }))
    });
    
    // Skip recalculation if nothing changed
    if (configVersionRef.current === newConfigVersion) {
      return {
        aboveGround: prevBuildingParams.current.aboveGround,
        belowGround: prevBuildingParams.current.belowGround,
        total: prevBuildingParams.current.total
      };
    }
    
    // Store the new version reference
    configVersionRef.current = newConfigVersion;
    
    // Perform the actual calculation
    let aboveGround = 0;
    let belowGround = 0;

    for (const floor of floorConfigurations) {
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
    }
    
    // Log the calculation result (fewer logs)
    console.log(`Building area calculation: Above ground: ${aboveGround}, Below ground: ${belowGround}, Total: ${aboveGround + belowGround} sq ft`);
    
    // Update our reference to current values
    prevBuildingParams.current.aboveGround = aboveGround;
    prevBuildingParams.current.belowGround = belowGround;
    prevBuildingParams.current.total = aboveGround + belowGround;
    
    return { aboveGround, belowGround, total: aboveGround + belowGround };
  }, [floorConfigurations, floorTemplates]);

  // Update state based on memoized calculations - with controlled updates
  useEffect(() => {
    // Flag that we're updating to prevent loops
    isUpdatingParams.current = true;
    
    // Use requestAnimationFrame to batch these updates
    requestAnimationFrame(() => {
      setTotalAboveGroundArea(buildingAreas.aboveGround);
      setTotalBelowGroundArea(buildingAreas.belowGround);
      setTotalBuildableArea(buildingAreas.total);
      
      // Reset update flag after updates are processed
      isUpdatingParams.current = false;
    });
  }, [buildingAreas]);

  // Calculate actual FAR with memoization to prevent needless recalculation
  useEffect(() => {
    // Skip if we're currently updating other parameters
    if (isUpdatingParams.current) return;
    
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
    configVersionRef.current = ""; // Reset config version reference
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
