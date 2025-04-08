
import { useState, useEffect, useCallback } from "react";
import { UnitType } from "@/types/unitMixTypes";
import { saveToLocalStorage, loadFromLocalStorage } from "@/hooks/useLocalStoragePersistence";

const STORAGE_KEY = "realEstateModel_unitTypes";

const defaultUnitTypes: UnitType[] = [
  {
    id: "unit-type-1",
    name: "Studio",
    category: "residential",
    typicalSize: "500",
    count: "20",
    description: "Compact studio apartments",
    color: "#3B82F6"
  },
  {
    id: "unit-type-2",
    name: "1-Bedroom",
    category: "residential",
    typicalSize: "700",
    count: "30",
    description: "Standard one-bedroom apartments",
    color: "#2563EB"
  },
  {
    id: "unit-type-3",
    name: "2-Bedroom",
    category: "residential",
    typicalSize: "1000",
    count: "15",
    description: "Two-bedroom family apartments",
    color: "#1D4ED8"
  },
  {
    id: "unit-type-4",
    name: "Retail Space",
    category: "retail",
    typicalSize: "2500",
    count: "4",
    description: "Ground floor retail units",
    color: "#F59E0B"
  }
];

export const useUnitTypes = () => {
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const storedUnitTypes = loadFromLocalStorage(STORAGE_KEY, defaultUnitTypes);
    setUnitTypes(storedUnitTypes);
  }, []);

  // Save to localStorage when updated
  useEffect(() => {
    if (unitTypes.length > 0) {
      saveToLocalStorage(STORAGE_KEY, unitTypes);
    }
  }, [unitTypes]);

  const addUnitType = useCallback(() => {
    const newId = `unit-type-${Date.now()}`;
    const newUnitType: UnitType = {
      id: newId,
      name: "",
      category: "residential",
      typicalSize: "0",
      count: "0",
      color: getRandomColor()
    };
    
    setUnitTypes(prev => [...prev, newUnitType]);
    return newId;
  }, []);

  const updateUnitType = useCallback((id: string, field: keyof UnitType, value: string) => {
    setUnitTypes(prev => 
      prev.map(unitType => 
        unitType.id === id ? { ...unitType, [field]: value } : unitType
      )
    );
  }, []);

  const removeUnitType = useCallback((id: string) => {
    setUnitTypes(prev => prev.filter(unitType => unitType.id !== id));
  }, []);

  const calculateTotalArea = useCallback(() => {
    return unitTypes.reduce((total, unitType) => {
      const count = parseInt(unitType.count) || 0;
      const size = parseInt(unitType.typicalSize) || 0;
      return total + (count * size);
    }, 0);
  }, [unitTypes]);

  const getUnitTypeById = useCallback((id: string) => {
    return unitTypes.find(unitType => unitType.id === id);
  }, [unitTypes]);

  return {
    unitTypes,
    addUnitType,
    updateUnitType,
    removeUnitType,
    calculateTotalArea,
    getUnitTypeById
  };
};

// Helper function to generate random colors for new unit types
function getRandomColor() {
  const colors = [
    "#3B82F6", "#2563EB", "#1D4ED8", // Blues
    "#10B981", "#059669", "#047857", // Greens
    "#F59E0B", "#D97706", "#B45309", // Ambers
    "#8B5CF6", "#7C3AED", "#6D28D9", // Purples
    "#EC4899", "#DB2777", "#BE185D", // Pinks
    "#EF4444", "#DC2626", "#B91C1C"  // Reds
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
