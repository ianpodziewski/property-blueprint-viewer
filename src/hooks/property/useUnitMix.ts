
import { useState, useEffect, useCallback } from "react";
import { saveToLocalStorage, loadFromLocalStorage } from "../useLocalStoragePersistence";
import { UnitMix } from "@/types/propertyTypes";

const STORAGE_KEY = "realEstateModel_extendedUnitMix";

export const useUnitMix = () => {
  const [unitMixes, setUnitMixes] = useState<UnitMix[]>([
    { id: "unit-1", type: "Studio", count: "0", squareFootage: "0" }
  ]);

  // Load unit mix from localStorage on mount
  useEffect(() => {
    const storedUnitMix = loadFromLocalStorage(STORAGE_KEY, [
      { id: "unit-1", type: "Studio", count: "0", squareFootage: "0" }
    ]);
    setUnitMixes(storedUnitMix);
  }, []);

  // Save unit mix to localStorage whenever it changes
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEY, unitMixes);
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
