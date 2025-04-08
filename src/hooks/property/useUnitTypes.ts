import { useState, useEffect, useCallback } from "react";
import { UnitType } from "@/types/unitMixTypes";
import { saveToLocalStorage, loadFromLocalStorage } from "@/hooks/useLocalStoragePersistence";

const STORAGE_KEY = "realEstateModel_unitTypes";
const CATEGORIES_STORAGE_KEY = "realEstateModel_unitCategories";
const CATEGORY_COLORS_KEY = "realEstateModel_categoryColors";
const CATEGORY_DESCRIPTIONS_KEY = "realEstateModel_categoryDescriptions";

// Empty array for default categories - no predefined categories
const DEFAULT_CATEGORIES: string[] = [];

// Function to generate a random color if no color is provided
const generateRandomColor = (): string => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 80%)`;
};

export const useUnitTypes = () => {
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>({});
  const [categoryDescriptions, setCategoryDescriptions] = useState<Record<string, string>>({});
  const [recentlyDeletedCategory, setRecentlyDeletedCategory] = useState<{
    name: string;
    unitTypes: UnitType[];
    color: string;
    description: string;
  } | null>(null);
  
  // Load data from localStorage on mount
  useEffect(() => {
    const storedUnitTypes = loadFromLocalStorage(STORAGE_KEY, []);
    const storedCategories = loadFromLocalStorage(CATEGORIES_STORAGE_KEY, []);
    const storedColors = loadFromLocalStorage(CATEGORY_COLORS_KEY, {});
    const storedDescriptions = loadFromLocalStorage(CATEGORY_DESCRIPTIONS_KEY, {});
    
    setUnitTypes(storedUnitTypes);
    setCustomCategories(storedCategories);
    setCategoryColors(storedColors);
    setCategoryDescriptions(storedDescriptions);
  }, []);

  // Save data to localStorage whenever they change
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEY, unitTypes);
  }, [unitTypes]);
  
  useEffect(() => {
    saveToLocalStorage(CATEGORIES_STORAGE_KEY, customCategories);
  }, [customCategories]);

  useEffect(() => {
    saveToLocalStorage(CATEGORY_COLORS_KEY, categoryColors);
  }, [categoryColors]);

  useEffect(() => {
    saveToLocalStorage(CATEGORY_DESCRIPTIONS_KEY, categoryDescriptions);
  }, [categoryDescriptions]);

  // Get color for a specific category
  const getCategoryColor = useCallback((category: string): string => {
    return categoryColors[category] || generateRandomColor();
  }, [categoryColors]);

  const addUnitType = useCallback(() => {
    // If there are no categories, we can't add unit types
    if ([...DEFAULT_CATEGORIES, ...customCategories].length === 0) {
      return "";
    }
    
    const newId = `unit-${Date.now()}`;
    const defaultCategory = customCategories[0] || DEFAULT_CATEGORIES[0];
    
    const newUnitType: UnitType = {
      id: newId,
      name: "New Unit Type",
      category: defaultCategory,
      typicalSize: "0",
      count: "0",
      color: getCategoryColor(defaultCategory)
    };
    
    setUnitTypes(prev => [...prev, newUnitType]);
    return newId;
  }, [customCategories, getCategoryColor]);

  const removeUnitType = useCallback((id: string) => {
    setUnitTypes(prev => prev.filter(unit => unit.id !== id));
  }, []);

  const updateUnitType = useCallback((id: string, field: keyof UnitType, value: any) => {
    setUnitTypes(prev => prev.map(unit => {
      if (unit.id === id) {
        // If category changes, also update the color
        if (field === 'category') {
          return { ...unit, [field]: value, color: getCategoryColor(value as string) };
        }
        return { ...unit, [field]: value };
      }
      return unit;
    }));
  }, [getCategoryColor]);

  const calculateTotalArea = useCallback(() => {
    return unitTypes.reduce((sum, unit) => {
      const size = parseInt(unit.typicalSize) || 0;
      const count = parseInt(unit.count) || 0;
      return sum + (size * count);
    }, 0);
  }, [unitTypes]);

  const getUnitTypeById = useCallback((id: string) => {
    return unitTypes.find(unit => unit.id === id);
  }, [unitTypes]);

  const addCustomCategory = useCallback((categoryName: string, color: string, description: string) => {
    // Convert to lowercase for consistency
    const normalizedName = categoryName.toLowerCase().trim();
    
    // Check if this category already exists
    if ([...DEFAULT_CATEGORIES, ...customCategories].includes(normalizedName)) {
      return false;
    }
    
    setCustomCategories(prev => [...prev, normalizedName]);
    setCategoryColors(prev => ({ ...prev, [normalizedName]: color }));
    setCategoryDescriptions(prev => ({ ...prev, [normalizedName]: description }));
    return true;
  }, [customCategories]);

  const removeCategory = useCallback((categoryName: string) => {
    // Save the category data for potential undo
    const categoryUnitTypes = unitTypes.filter(unit => unit.category === categoryName);
    setRecentlyDeletedCategory({
      name: categoryName,
      unitTypes: categoryUnitTypes,
      color: categoryColors[categoryName] || "",
      description: categoryDescriptions[categoryName] || ""
    });
    
    // Remove the category
    setCustomCategories(prev => prev.filter(c => c !== categoryName));
    
    // Remove all unit types in this category
    setUnitTypes(prev => prev.filter(unit => unit.category !== categoryName));
    
    // Remove the category color and description
    setCategoryColors(prev => {
      const newColors = { ...prev };
      delete newColors[categoryName];
      return newColors;
    });
    
    setCategoryDescriptions(prev => {
      const newDescriptions = { ...prev };
      delete newDescriptions[categoryName];
      return newDescriptions;
    });
  }, [unitTypes, categoryColors, categoryDescriptions]);

  const undoRemoveCategory = useCallback(() => {
    if (!recentlyDeletedCategory) return false;
    
    // Restore the category
    setCustomCategories(prev => [...prev, recentlyDeletedCategory.name]);
    
    // Restore the unit types
    setUnitTypes(prev => [...prev, ...recentlyDeletedCategory.unitTypes]);
    
    // Restore the category color and description
    setCategoryColors(prev => ({ 
      ...prev, 
      [recentlyDeletedCategory.name]: recentlyDeletedCategory.color 
    }));
    
    setCategoryDescriptions(prev => ({ 
      ...prev, 
      [recentlyDeletedCategory.name]: recentlyDeletedCategory.description 
    }));
    
    // Clear the recently deleted category
    setRecentlyDeletedCategory(null);
    
    return true;
  }, [recentlyDeletedCategory]);

  const getAllCategories = useCallback(() => {
    return [...DEFAULT_CATEGORIES, ...customCategories];
  }, [customCategories]);

  const getCategoryDescription = useCallback((category: string) => {
    return categoryDescriptions[category] || "";
  }, [categoryDescriptions]);

  const resetAllData = useCallback(() => {
    setUnitTypes([]);
    setCustomCategories([]);
    setCategoryColors({});
    setCategoryDescriptions({});
    setRecentlyDeletedCategory(null);
  }, []);

  return {
    unitTypes,
    addUnitType,
    removeUnitType,
    updateUnitType,
    calculateTotalArea,
    getUnitTypeById,
    addCustomCategory,
    removeCategory,
    undoRemoveCategory,
    getAllCategories,
    getCategoryColor,
    getCategoryDescription,
    hasCategories: [...DEFAULT_CATEGORIES, ...customCategories].length > 0,
    recentlyDeletedCategory,
    resetAllData
  };
};
