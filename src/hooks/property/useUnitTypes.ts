
import { useState, useEffect, useCallback } from "react";
import { UnitType } from "@/types/unitMixTypes";
import { saveToLocalStorage, loadFromLocalStorage } from "@/hooks/useLocalStoragePersistence";

const STORAGE_KEY = "realEstateModel_unitTypes";

// Function to generate a random color based on category
const getCategoryDefaultColor = (category: string): string => {
  const colors: Record<string, string[]> = {
    'residential': ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'],
    'office': ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
    'retail': ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A'],
    'hotel': ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'],
    'amenity': ['#EC4899', '#F472B6', '#F9A8D4', '#FBCFE8'],
    'other': ['#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB']
  };
  
  const categoryColors = colors[category] || colors.other;
  const randomIndex = Math.floor(Math.random() * categoryColors.length);
  return categoryColors[randomIndex];
};

export const useUnitTypes = () => {
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([
    { 
      id: "unit-1", 
      name: "Studio", 
      category: "residential",
      typicalSize: "550", 
      count: "0",
      color: getCategoryDefaultColor("residential")
    }
  ]);

  // Load unit types from localStorage on mount
  useEffect(() => {
    const storedUnitTypes = loadFromLocalStorage(STORAGE_KEY, [
      { 
        id: "unit-1", 
        name: "Studio", 
        category: "residential",
        typicalSize: "550", 
        count: "0",
        color: getCategoryDefaultColor("residential")
      }
    ]);
    setUnitTypes(storedUnitTypes);
  }, []);

  // Save unit types to localStorage whenever it changes
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEY, unitTypes);
  }, [unitTypes]);

  const addUnitType = useCallback(() => {
    const newId = `unit-${Date.now()}`;
    const defaultCategory = "residential";
    
    const newUnitType: UnitType = {
      id: newId,
      name: "New Unit Type",
      category: defaultCategory,
      typicalSize: "0",
      count: "0",
      color: getCategoryDefaultColor(defaultCategory)
    };
    
    setUnitTypes(prev => [...prev, newUnitType]);
    return newId;
  }, []);

  const removeUnitType = useCallback((id: string) => {
    setUnitTypes(prev => prev.filter(unit => unit.id !== id));
  }, []);

  const updateUnitType = useCallback((id: string, field: keyof UnitType, value: any) => {
    setUnitTypes(prev => prev.map(unit => {
      if (unit.id === id) {
        // If category changes, also update the color
        if (field === 'category') {
          return { ...unit, [field]: value, color: getCategoryDefaultColor(value as string) };
        }
        return { ...unit, [field]: value };
      }
      return unit;
    }));
  }, []);

  const calculateTotalArea = useCallback(() => {
    return unitTypes.reduce((sum, unit) => {
      const size = parseInt(unit.typicalSize) || 0;
      const count = parseInt(unit.count) || 0;
      return sum + (size * count);
    }, 0);
  }, [unitTypes]);

  return {
    unitTypes,
    addUnitType,
    removeUnitType,
    updateUnitType,
    calculateTotalArea
  };
};
