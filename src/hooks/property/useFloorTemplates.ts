
import { useState, useEffect, useCallback } from "react";
import { saveToLocalStorage, loadFromLocalStorage } from "../useLocalStoragePersistence";
import { FloorPlateTemplate, FloorConfiguration } from "@/types/propertyTypes";

const STORAGE_KEY = "realEstateModel_floorTemplates";

export const useFloorTemplates = (floorConfigurations: FloorConfiguration[], setFloorConfigurations: React.Dispatch<React.SetStateAction<FloorConfiguration[]>>) => {
  const [floorTemplates, setFloorTemplates] = useState<FloorPlateTemplate[]>([
    {
      id: "template-1",
      name: "Standard Floor",
      squareFootage: "10000",
      floorToFloorHeight: "12",
      corePercentage: "15",
      primaryUse: "office"
    }
  ]);

  // Load floor templates from localStorage on mount
  useEffect(() => {
    const storedFloorTemplates = loadFromLocalStorage(STORAGE_KEY, [
      {
        id: "template-1",
        name: "Standard Floor",
        squareFootage: "10000",
        floorToFloorHeight: "12",
        corePercentage: "15",
        primaryUse: "office"
      }
    ]);
    
    // Migrate stored data to remove efficiency factor if it exists
    const migratedTemplates = storedFloorTemplates.map(template => {
      if ('efficiencyFactor' in template) {
        const { efficiencyFactor, ...rest } = template as any;
        return rest;
      }
      return template;
    });
    
    setFloorTemplates(migratedTemplates);
  }, []);

  // Save floor templates to localStorage whenever they change
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEY, floorTemplates);
  }, [floorTemplates]);

  const addFloorTemplate = useCallback((template: Omit<FloorPlateTemplate, "id">) => {
    const newId = `template-${floorTemplates.length + 1}`;
    console.log(`Creating new template with ID: ${newId} and data:`, template);
    
    const newTemplate: FloorPlateTemplate = {
      id: newId,
      name: template.name,
      squareFootage: template.squareFootage,
      floorToFloorHeight: template.floorToFloorHeight,
      corePercentage: template.corePercentage,
      primaryUse: template.primaryUse,
      description: template.description || ""
    };
    
    console.log("Final template being added:", newTemplate);
    setFloorTemplates(prev => [...prev, newTemplate]);
  }, [floorTemplates]);

  const updateFloorTemplate = useCallback((id: string, template: Partial<FloorPlateTemplate>) => {
    setFloorTemplates(
      floorTemplates.map(existingTemplate => 
        existingTemplate.id === id ? { ...existingTemplate, ...template } : existingTemplate
      )
    );
  }, [floorTemplates]);

  const removeFloorTemplate = useCallback((id: string) => {
    if (floorTemplates.length > 1) {
      setFloorTemplates(floorTemplates.filter(template => template.id !== id));
      
      const firstTemplateId = floorTemplates.find(t => t.id !== id)?.id || null;
      setFloorConfigurations(
        floorConfigurations.map(floor => 
          floor.templateId === id ? { ...floor, templateId: firstTemplateId } : floor
        )
      );
    }
  }, [floorTemplates, floorConfigurations, setFloorConfigurations]);

  return {
    floorTemplates,
    addFloorTemplate,
    updateFloorTemplate,
    removeFloorTemplate
  };
};
