import { useState, useEffect, useCallback } from "react";
import { saveToLocalStorage, loadFromLocalStorage } from "../useLocalStoragePersistence";
import { UnitMix } from "@/types/propertyTypes";

const STORAGE_KEY = "realEstateModel_extendedUnitMix";

export const useUnitMix = () => {
  // Initialize state directly with data from localStorage
  const [unitMixes, setUnitMixes] = useState<UnitMix[]>(() => {
    const storedUnitMix = loadFromLocalStorage(STORAGE_KEY, [
      { id: "unit-1", type: "Studio", count: "0", squareFootage: "0" }
    ]);
    console.log("Initialized unit mixes from localStorage:", storedUnitMix);
    return storedUnitMix;
  });

  // Save unit mix to localStorage whenever it changes
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEY, unitMixes);
    console.log("Saved unit mixes to localStorage:", unitMixes);
  }, [unitMixes]);

  const addUnitMix = useCallback(() => {
    const newId = `unit-${unitMixes.length + 1}`;
    setUnitMixes([
      ...unitMixes,
      { id: newId, type: "", count: "0", squareFootage: "0" }
    ]);
  }, [unitMixes]);

  const removeUnitMix = useCallback((id: string) => {
    if (unitMixes.length > 1) {
      setUnitMixes(unitMixes.filter(unit => unit.id !== id));
    }
  }, [unitMixes]);

  const updateUnitMix = useCallback((id: string, field: keyof UnitMix, value: string) => {
    setUnitMixes(
      unitMixes.map(unit => 
        unit.id === id ? { ...unit, [field]: value } : unit
      )
    );
  }, [unitMixes]);

  // Reset all unit mixes
  const resetAllData = useCallback(() => {
    setUnitMixes([{ id: "unit-1", type: "Studio", count: "0", squareFootage: "0" }]);
  }, []);

  return {
    unitMixes,
    addUnitMix,
    removeUnitMix,
    updateUnitMix,
    resetAllData
  };
};
