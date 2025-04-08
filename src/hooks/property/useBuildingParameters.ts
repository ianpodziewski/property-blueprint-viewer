import { useState, useEffect, useCallback } from "react";
import { saveToLocalStorage, loadFromLocalStorage } from "../useLocalStoragePersistence";
import { FloorConfiguration, FloorPlateTemplate } from "@/types/propertyTypes";

const STORAGE_KEY = "realEstateModel_buildingParams";

export const useBuildingParameters = (
  floorConfigurations: FloorConfiguration[], 
  floorTemplates: FloorPlateTemplate[]
) => {
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

  // Save building parameters to localStorage whenever they change
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEY, {
      farAllowance,
      totalLandArea,
      buildingFootprint
    });
    
    console.log("Saved building parameters to localStorage:", {
      farAllowance,
      totalLandArea,
      buildingFootprint
    });
  }, [farAllowance, totalLandArea, buildingFootprint]);

  // Calculate building areas based on floor configurations
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

  // Calculate actual FAR whenever land area or above ground area changes
  useEffect(() => {
    const landArea = parseFloat(totalLandArea) || 0;

    if (landArea > 0) {
      setActualFar(totalAboveGroundArea / landArea);
    } else {
      setActualFar(0);
    }
  }, [totalLandArea, totalAboveGroundArea]);

  // Reset all building parameters
  const resetAllData = useCallback(() => {
    setFarAllowance("1.5");
    setTotalLandArea("0");
    setBuildingFootprint("0");
    // The calculated values will be reset through the effects
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
