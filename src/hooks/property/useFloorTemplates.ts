
import { useState, useEffect, useCallback } from "react";
import { saveToLocalStorage, loadFromLocalStorage } from "../useLocalStoragePersistence";
import { FloorPlateTemplate } from "@/types/propertyTypes";

const STORAGE_KEY = "realEstateModel_floorTemplates";

export const useFloorTemplates = () => {
  const [floorTemplates, setFloorTemplates] = useState<FloorPlateTemplate[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load floor templates from localStorage on mount
  useEffect(() => {
    const storedFloorTemplates = loadFromLocalStorage<FloorPlateTemplate[]>(STORAGE_KEY, []);
    
    // Migrate stored data to remove efficiency factor if it exists
    const migratedTemplates = storedFloorTemplates.map(template => {
      if ('efficiencyFactor' in template) {
        const { efficiencyFactor, ...rest } = template as any;
        return rest;
      }
      return template;
    });
    
    console.log("Loaded floor templates from localStorage:", migratedTemplates);
    setFloorTemplates(migratedTemplates);
    setIsInitialized(true);
  }, []);

  // Save floor templates to localStorage whenever they change
  useEffect(() => {
    if (isInitialized) {
      saveToLocalStorage(STORAGE_KEY, floorTemplates);
      console.log("Saved floor templates to localStorage:", floorTemplates);
      
      // Dispatch a custom event to notify other components that templates have changed
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('floorTemplatesChanged', { detail: floorTemplates });
        window.dispatchEvent(event);
      }
    }
  }, [floorTemplates, isInitialized]);

  const addFloorTemplate = useCallback((template: Omit<FloorPlateTemplate, "id">) => {
    const newId = `template-${Date.now()}`;
    console.log(`Creating new template with ID: ${newId} and data:`, template);
    
    const newTemplate: FloorPlateTemplate = {
      id: newId,
      name: template.name,
      squareFootage: template.squareFootage,
      floorToFloorHeight: template.floorToFloorHeight,
      corePercentage: template.corePercentage || "15",
      primaryUse: template.primaryUse || "office",
      description: template.description || ""
    };
    
    console.log("Final template being added:", newTemplate);
    setFloorTemplates(prev => [...prev, newTemplate]);
  }, []);

  const updateFloorTemplate = useCallback((id: string, template: Partial<FloorPlateTemplate>) => {
    setFloorTemplates(
      floorTemplates.map(existingTemplate => 
        existingTemplate.id === id ? { ...existingTemplate, ...template } : existingTemplate
      )
    );
  }, [floorTemplates]);

  const removeFloorTemplate = useCallback((id: string) => {
    setFloorTemplates(floorTemplates.filter(template => template.id !== id));
    
    // Note: Floor configurations using this template will need to be updated separately
    // This is now handled in the component that calls this function
  }, [floorTemplates]);

  // Reset all floor templates
  const resetAllData = useCallback(() => {
    setFloorTemplates([]);
  }, []);

  return {
    floorTemplates,
    addFloorTemplate,
    updateFloorTemplate,
    removeFloorTemplate,
    resetAllData
  };
};
