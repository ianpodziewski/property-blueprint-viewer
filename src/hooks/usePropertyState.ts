
import { useState } from "react";

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

export const usePropertyState = () => {
  // Project Information
  const [projectName, setProjectName] = useState<string>("");
  const [projectLocation, setProjectLocation] = useState<string>("");
  const [projectType, setProjectType] = useState<string>("");
  const [totalLandArea, setTotalLandArea] = useState<string>("");
  
  // Space Types
  const [spaceTypes, setSpaceTypes] = useState<SpaceType[]>([
    { id: "space-1", type: "", squareFootage: "", units: "", phase: "" }
  ]);
  
  // Unit Mix
  const [unitMixes, setUnitMixes] = useState<UnitMix[]>([
    { id: "unit-1", type: "Studio", count: "", squareFootage: "" }
  ]);
  
  const addSpaceType = () => {
    const newId = `space-${spaceTypes.length + 1}`;
    setSpaceTypes([
      ...spaceTypes,
      { id: newId, type: "", squareFootage: "", units: "", phase: "" }
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

  const addUnitMix = () => {
    const newId = `unit-${unitMixes.length + 1}`;
    setUnitMixes([
      ...unitMixes,
      { id: newId, type: "", count: "", squareFootage: "" }
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
