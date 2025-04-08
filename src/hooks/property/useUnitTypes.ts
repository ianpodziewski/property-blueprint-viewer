
import { useState, useEffect, useCallback } from "react";
import { UnitType } from "@/types/unitMixTypes";
import { saveToLocalStorage, loadFromLocalStorage } from "@/hooks/useLocalStoragePersistence";

const STORAGE_KEY = "realEstateModel_unitTypes";
const CATEGORIES_STORAGE_KEY = "realEstateModel_unitCategories";

const DEFAULT_CATEGORIES = ["residential", "office", "retail", "hotel", "amenity", "other"];

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
  
  // If we don't have a predefined color for this category, generate one
  if (!colors[category]) {
    // Generate a random pastel color
    const hue = Math.floor(Math.random() * 360);
    const pastelColor = `hsl(${hue}, 70%, 80%)`;
    return pastelColor;
  }
  
  const categoryColors = colors[category];
  const randomIndex = Math.floor(Math.random() * categoryColors.length);
  return categoryColors[randomIndex];
};

export const useUnitTypes = () => {
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  
  // Load unit types and categories from localStorage on mount
  useEffect(() => {
    const storedUnitTypes = loadFromLocalStorage(STORAGE_KEY, []);
    const storedCategories = loadFromLocalStorage(CATEGORIES_STORAGE_KEY, []);
    
    setUnitTypes(storedUnitTypes);
    setCustomCategories(storedCategories);
  }, []);

  // Save unit types and categories to localStorage whenever they change
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEY, unitTypes);
  }, [unitTypes]);
  
  useEffect(() => {
    saveToLocalStorage(CATEGORIES_STORAGE_KEY, customCategories);
  }, [customCategories]);

  const addUnitType = useCallback(() => {
    const newId = `unit-${Date.now()}`;
    const defaultCategory = "residential" as UnitType["category"];
    
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

  // Get unit type by ID
  const getUnitTypeById = useCallback((id: string) => {
    return unitTypes.find(unit => unit.id === id);
  }, [unitTypes]);

  // Add a new custom category
  const addCustomCategory = useCallback((categoryName: string) => {
    // Convert to lowercase for consistency
    const normalizedName = categoryName.toLowerCase().trim();
    
    // Check if this category already exists (either predefined or custom)
    if ([...DEFAULT_CATEGORIES, ...customCategories].includes(normalizedName)) {
      return false;
    }
    
    setCustomCategories(prev => [...prev, normalizedName]);
    return true;
  }, [customCategories]);

  // Get all available categories (default + custom)
  const getAllCategories = useCallback(() => {
    return [...DEFAULT_CATEGORIES, ...customCategories] as UnitType["category"][];
  }, [customCategories]);

  return {
    unitTypes,
    addUnitType,
    removeUnitType,
    updateUnitType,
    calculateTotalArea,
    getUnitTypeById,
    addCustomCategory,
    getAllCategories
  };
};
