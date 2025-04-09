
import { useState, useEffect } from "react";

interface SpaceType {
  id: string;
  type: string;
  squareFootage: string;
  units: string;
  phase: string;
}

interface UnitMix {
  id: string;
  type: string;
  count: string;
  squareFootage: string;
}

// Helper to safely retrieve saved values from localStorage
const getSavedValue = (key: string, defaultValue: string): string => {
  try {
    const savedModel = localStorage.getItem('realEstateModel');
    if (savedModel) {
      const parsedModel = JSON.parse(savedModel);
      if (parsedModel.property && parsedModel.property[key] !== undefined) {
        return parsedModel.property[key];
      }
    }
  } catch (error) {
    console.error(`Error retrieving saved value for ${key}:`, error);
  }
  return defaultValue;
};

// Helper to retrieve complex objects from localStorage
const getSavedArrayValue = <T>(key: string, defaultValue: T[]): T[] => {
  try {
    const savedModel = localStorage.getItem('realEstateModel');
    if (savedModel) {
      const parsedModel = JSON.parse(savedModel);
      if (parsedModel.property && Array.isArray(parsedModel.property[key])) {
        return parsedModel.property[key];
      }
    }
  } catch (error) {
    console.error(`Error retrieving saved array for ${key}:`, error);
  }
  return defaultValue;
};

export const usePropertyState = () => {
  // Project Information with initial values from localStorage
  const [projectName, setProjectName] = useState<string>(getSavedValue('projectName', ""));
  const [projectLocation, setProjectLocation] = useState<string>(getSavedValue('projectLocation', ""));
  const [projectType, setProjectType] = useState<string>(getSavedValue('projectType', ""));
  const [totalLandArea, setTotalLandArea] = useState<string>(getSavedValue('totalLandArea', ""));
  
  // Space Types with initial values from localStorage or default
  const [spaceTypes, setSpaceTypes] = useState<SpaceType[]>(
    getSavedArrayValue('spaceTypes', [{ id: "space-1", type: "", squareFootage: "", units: "", phase: "" }])
  );
  
  // Unit Mix with initial values from localStorage or default
  const [unitMixes, setUnitMixes] = useState<UnitMix[]>(
    getSavedArrayValue('unitMixes', [{ id: "unit-1", type: "Studio", count: "", squareFootage: "" }])
  );
  
  // Log state changes for debugging
  useEffect(() => {
    console.log("Property state updated:", {
      projectName, projectLocation, projectType, totalLandArea,
      spaceTypesCount: spaceTypes.length,
      unitMixesCount: unitMixes.length
    });
  }, [projectName, projectLocation, projectType, totalLandArea, spaceTypes, unitMixes]);
  
  const addSpaceType = () => {
    const newId = `space-${spaceTypes.length + 1}`;
    setSpaceTypes([
      ...spaceTypes,
      { id: newId, type: "", squareFootage: "", units: "", phase: "" }
    ]);
    console.log("Space type added with ID:", newId);
  };

  const removeSpaceType = (id: string) => {
    if (spaceTypes.length > 1) {
      setSpaceTypes(spaceTypes.filter(space => space.id !== id));
      console.log("Space type removed with ID:", id);
    } else {
      console.warn("Cannot remove the only space type");
    }
  };

  const updateSpaceType = (id: string, field: keyof SpaceType, value: string) => {
    setSpaceTypes(
      spaceTypes.map(space => 
        space.id === id ? { ...space, [field]: value } : space
      )
    );
    console.log(`Space type ${id} updated - ${field}:`, value);
  };

  const addUnitMix = () => {
    const newId = `unit-${unitMixes.length + 1}`;
    setUnitMixes([
      ...unitMixes,
      { id: newId, type: "", count: "", squareFootage: "" }
    ]);
    console.log("Unit mix added with ID:", newId);
  };

  const removeUnitMix = (id: string) => {
    if (unitMixes.length > 1) {
      setUnitMixes(unitMixes.filter(unit => unit.id !== id));
      console.log("Unit mix removed with ID:", id);
    } else {
      console.warn("Cannot remove the only unit mix");
    }
  };

  const updateUnitMix = (id: string, field: keyof UnitMix, value: string) => {
    setUnitMixes(
      unitMixes.map(unit => 
        unit.id === id ? { ...unit, [field]: value } : unit
      )
    );
    console.log(`Unit mix ${id} updated - ${field}:`, value);
  };

  return {
    // Project Information
    projectName, setProjectName,
    projectLocation, setProjectLocation,
    projectType, setProjectType,
    totalLandArea, setTotalLandArea,
    
    // Space Types
    spaceTypes, 
    addSpaceType,
    removeSpaceType,
    updateSpaceType,
    
    // Unit Mix
    unitMixes,
    addUnitMix,
    removeUnitMix,
    updateUnitMix
  };
};
