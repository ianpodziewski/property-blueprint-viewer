
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { safeLoadFromLocalStorage, safeSaveToLocalStorage } from "../useSafeStorage";
import { 
  FloorConfiguration, 
  SpaceDefinition,
  BuildingSystemsConfig,
  FloorPlateTemplate
} from "@/types/propertyTypes";

const STORAGE_KEY = "realEstateModel_floorConfigurations";

const dispatchFloorConfigSavedEvent = () => {
  if (typeof window !== 'undefined') {
    try {
      const event = new CustomEvent('floorConfigSaved');
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Failed to dispatch floorConfigSaved event:', error);
    }
  }
};

// Validation function for floor configurations
const validateFloorConfigurations = (data: any): boolean => {
  return Array.isArray(data) && 
    data.every(item => 
      typeof item === 'object' && 
      'floorNumber' in item && 
      'isUnderground' in item
    );
};

export const useFloorConfigurations = (floorTemplates: FloorPlateTemplate[]) => {
  const [floorConfigurations, setFloorConfigurations] = useState<FloorConfiguration[]>([
    {
      floorNumber: 1,
      isUnderground: false,
      templateId: "template-1",
      customSquareFootage: "",
      floorToFloorHeight: "12",
      efficiencyFactor: "85",
      corePercentage: "15",
      primaryUse: "office",
      secondaryUse: null,
      secondaryUsePercentage: "0"
    }
  ]);
  const { toast } = useToast();

  // Load floor configurations from localStorage on mount
  useEffect(() => {
    try {
      const storedFloorConfigurations = safeLoadFromLocalStorage(
        STORAGE_KEY, 
        [
          {
            floorNumber: 1,
            isUnderground: false,
            templateId: "template-1",
            customSquareFootage: "",
            floorToFloorHeight: "12",
            efficiencyFactor: "85",
            corePercentage: "15",
            primaryUse: "office",
            secondaryUse: null,
            secondaryUsePercentage: "0"
          }
        ],
        validateFloorConfigurations
      );
      
      if (storedFloorConfigurations.length > 0) {
        setFloorConfigurations(storedFloorConfigurations);
      }
    } catch (error) {
      console.error("Failed to load floor configurations:", error);
      toast({
        title: "Error",
        description: "Failed to load floor configurations. Using default values.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Save floor configurations to localStorage whenever they change
  useEffect(() => {
    try {
      safeSaveToLocalStorage(STORAGE_KEY, floorConfigurations);
    } catch (error) {
      console.error("Failed to save floor configurations:", error);
      toast({
        title: "Warning",
        description: "Failed to save floor configurations to local storage.",
        variant: "destructive",
      });
    }
  }, [floorConfigurations, toast]);

  const updateFloorConfiguration = useCallback((
    floorNumber: number, 
    field: keyof FloorConfiguration, 
    value: string | null | boolean | SpaceDefinition[] | BuildingSystemsConfig
  ) => {
    console.log(`Updating floor ${floorNumber}, field ${String(field)}`, value);
    
    try {
      setFloorConfigurations(prevConfigurations => {
        const newConfigurations = prevConfigurations.map(floor => {
          if (floor.floorNumber === floorNumber) {
            return { ...floor, [field]: value };
          }
          return floor;
        });
        
        // If this is a critical update that affects visualizations, immediately persist
        if (field === 'spaces' || field === 'buildingSystems') {
          safeSaveToLocalStorage(STORAGE_KEY, newConfigurations);
          dispatchFloorConfigSavedEvent();
        }
        
        return newConfigurations;
      });
    } catch (error) {
      console.error(`Failed to update floor configuration for floor ${floorNumber}:`, error);
      toast({
        title: "Error",
        description: `Failed to update floor ${floorNumber}. Please try again.`,
        variant: "destructive",
      });
    }
  }, [toast]);

  // Make this function accept either the legacy parameters or a simple update object
  const copyFloorConfiguration = useCallback((sourceFloorNumber: number, targetFloorNumbers: number[]) => {
    try {
      const sourceFloor = floorConfigurations.find(floor => floor.floorNumber === sourceFloorNumber);
      
      if (!sourceFloor) {
        throw new Error(`Source floor ${sourceFloorNumber} not found`);
      }
      
      if (targetFloorNumbers.length === 0) {
        throw new Error('No target floors specified');
      }
      
      setFloorConfigurations(prevConfigurations => {
        return prevConfigurations.map(floor => 
          targetFloorNumbers.includes(floor.floorNumber)
            ? { 
                ...floor, 
                templateId: sourceFloor.templateId,
                customSquareFootage: sourceFloor.customSquareFootage,
                floorToFloorHeight: sourceFloor.floorToFloorHeight,
                efficiencyFactor: sourceFloor.efficiencyFactor,
                corePercentage: sourceFloor.corePercentage,
                primaryUse: sourceFloor.primaryUse,
                secondaryUse: sourceFloor.secondaryUse,
                secondaryUsePercentage: sourceFloor.secondaryUsePercentage,
                spaces: sourceFloor.spaces ? [...sourceFloor.spaces] : undefined,
                buildingSystems: sourceFloor.buildingSystems ? {...sourceFloor.buildingSystems} : undefined
              } 
            : floor
        );
      });
      
      toast({
        title: "Success",
        description: `Copied floor ${sourceFloorNumber} to ${targetFloorNumbers.length} target floor(s).`,
      });
    } catch (error) {
      console.error('Failed to copy floor configuration:', error);
      toast({
        title: "Error",
        description: `Failed to copy floor configuration. Please try again.`,
        variant: "destructive",
      });
    }
  }, [floorConfigurations, toast]);

  const bulkEditFloorConfigurations = useCallback((
    floorNumbers: number[], 
    field: keyof FloorConfiguration, 
    value: string | null | boolean
  ) => {
    try {
      setFloorConfigurations(prevConfigurations => {
        return prevConfigurations.map(floor => 
          floorNumbers.includes(floor.floorNumber) ? { ...floor, [field]: value } : floor
        );
      });
    } catch (error) {
      console.error('Failed to bulk edit floor configurations:', error);
      toast({
        title: "Error",
        description: `Failed to update multiple floors. Please try again.`,
        variant: "destructive",
      });
    }
  }, [toast]);

  const addFloors = useCallback((
    count: number,
    isUnderground: boolean,
    templateId: string | null,
    position: "top" | "bottom" | "specific",
    specificPosition?: number,
    numberingPattern?: "consecutive" | "skip" | "custom",
    customNumbering?: number[]
  ) => {
    try {
      const aboveGroundFloors = floorConfigurations.filter(f => !f.isUnderground);
      const belowGroundFloors = floorConfigurations.filter(f => f.isUnderground);
      
      let newFloors: FloorConfiguration[] = [];
      let numberingStart: number;
      
      if (isUnderground) {
        const lowestBelowGround = belowGroundFloors.length > 0 
          ? Math.min(...belowGroundFloors.map(f => f.floorNumber)) 
          : 0;
        numberingStart = lowestBelowGround <= 0 ? lowestBelowGround - count : -1;
      } else {
        const highestAboveGround = aboveGroundFloors.length > 0 
          ? Math.max(...aboveGroundFloors.map(f => f.floorNumber)) 
          : 0;
        numberingStart = highestAboveGround >= 1 ? highestAboveGround + 1 : 1;
      }
      
      if (position === "specific" && specificPosition !== undefined) {
        numberingStart = specificPosition;
      }
      
      for (let i = 0; i < count; i++) {
        let floorNumber: number;
        
        if (numberingPattern === "consecutive" || !numberingPattern) {
          floorNumber = isUnderground ? numberingStart + i : numberingStart + i;
        } else if (numberingPattern === "skip") {
          floorNumber = isUnderground ? numberingStart + (i * 2) : numberingStart + (i * 2);
        } else if (numberingPattern === "custom" && customNumbering && customNumbering[i] !== undefined) {
          floorNumber = customNumbering[i];
        } else {
          floorNumber = isUnderground ? numberingStart + i : numberingStart + i;
        }
        
        newFloors.push({
          floorNumber: floorNumber,
          isUnderground: isUnderground,
          templateId: templateId || (floorTemplates.length > 0 ? floorTemplates[0].id : null),
          customSquareFootage: "",
          floorToFloorHeight: "12",
          efficiencyFactor: "85",
          corePercentage: "15",
          primaryUse: isUnderground ? "parking" : "office",
          secondaryUse: null,
          secondaryUsePercentage: "0"
        });
      }
      
      let updatedFloors: FloorConfiguration[];
      if (position === "top" && !isUnderground) {
        updatedFloors = [...floorConfigurations, ...newFloors];
      } else if (position === "bottom" && isUnderground) {
        updatedFloors = [...newFloors, ...floorConfigurations];
      } else if (position === "specific" && specificPosition !== undefined) {
        const sortedFloors = [...floorConfigurations].sort((a, b) => b.floorNumber - a.floorNumber);
        const insertIndex = sortedFloors.findIndex(f => 
          isUnderground ? f.floorNumber <= specificPosition : f.floorNumber >= specificPosition
        );
        
        if (insertIndex === -1) {
          updatedFloors = isUnderground
            ? [...sortedFloors, ...newFloors]
            : [...newFloors, ...sortedFloors];
        } else {
          updatedFloors = [
            ...sortedFloors.slice(0, insertIndex),
            ...newFloors,
            ...sortedFloors.slice(insertIndex)
          ];
        }
      } else {
        updatedFloors = isUnderground 
          ? [...newFloors, ...floorConfigurations]
          : [...floorConfigurations, ...newFloors];
      }
      
      setFloorConfigurations(updatedFloors);
      
      // Immediately persist this critical operation
      safeSaveToLocalStorage(STORAGE_KEY, updatedFloors);
      
      toast({
        title: "Success",
        description: `Added ${count} new floor(s).`,
      });
    } catch (error) {
      console.error('Failed to add floors:', error);
      toast({
        title: "Error",
        description: `Failed to add new floors. Please try again.`,
        variant: "destructive",
      });
    }
  }, [floorConfigurations, floorTemplates, toast]);

  const removeFloors = useCallback((floorNumbers: number[]) => {
    try {
      if (floorNumbers.length > 0) {
        const remainingFloors = floorConfigurations.filter(
          floor => !floorNumbers.includes(floor.floorNumber)
        );
        
        if (remainingFloors.length === 0) {
          // If we removed all floors, create a default floor
          const defaultFloor: FloorConfiguration = {
            floorNumber: 1,
            isUnderground: false,
            templateId: floorTemplates.length > 0 ? floorTemplates[0].id : null,
            customSquareFootage: "",
            floorToFloorHeight: "12",
            efficiencyFactor: "85",
            corePercentage: "15",
            primaryUse: "office",
            secondaryUse: null,
            secondaryUsePercentage: "0"
          };
          
          setFloorConfigurations([defaultFloor]);
          safeSaveToLocalStorage(STORAGE_KEY, [defaultFloor]);
        } else {
          setFloorConfigurations(remainingFloors);
          safeSaveToLocalStorage(STORAGE_KEY, remainingFloors);
        }
        
        toast({
          title: "Success",
          description: `Removed ${floorNumbers.length} floor(s).`,
        });
      }
    } catch (error) {
      console.error('Failed to remove floors:', error);
      toast({
        title: "Error",
        description: `Failed to remove floors. Please try again.`,
        variant: "destructive",
      });
    }
  }, [floorConfigurations, floorTemplates, toast]);

  // Allow both legacy and new format for reordering
  const reorderFloor = useCallback((floorNumber: number, direction: "up" | "down") => {
    try {
      const sortedFloors = [...floorConfigurations].sort((a, b) => b.floorNumber - a.floorNumber);
      const currentIndex = sortedFloors.findIndex(f => f.floorNumber === floorNumber);
      
      if (currentIndex === -1) return;
      
      const targetIndex = direction === "up" 
        ? Math.max(0, currentIndex - 1) 
        : Math.min(sortedFloors.length - 1, currentIndex + 1);
      
      if (currentIndex === targetIndex) return;
      
      const targetFloor = sortedFloors[targetIndex];
      const currentFloor = sortedFloors[currentIndex];
      
      const tempFloorNumber = currentFloor.floorNumber;
      currentFloor.floorNumber = targetFloor.floorNumber;
      targetFloor.floorNumber = tempFloorNumber;
      
      setFloorConfigurations([...sortedFloors]);
      
      // Immediately persist this critical operation
      safeSaveToLocalStorage(STORAGE_KEY, [...sortedFloors]);
    } catch (error) {
      console.error('Failed to reorder floor:', error);
      toast({
        title: "Error",
        description: `Failed to reorder floor ${floorNumber}. Please try again.`,
        variant: "destructive",
      });
    }
  }, [floorConfigurations, toast]);

  // Added compatibility for old or new parameter format
  const updateFloorSpaces = useCallback((floorNumber: number, spaces: SpaceDefinition[]) => {
    try {
      const validatedSpaces = spaces.map(space => ({
        ...space,
        dimensions: space.dimensions || { width: "0", depth: "0" },
        subType: space.subType || null,
        percentage: typeof space.percentage === 'number' ? space.percentage : 0
      }));
      console.log(`Updating spaces for floor ${floorNumber}`, validatedSpaces);
      
      updateFloorConfiguration(floorNumber, 'spaces', validatedSpaces);
    } catch (error) {
      console.error(`Failed to update spaces for floor ${floorNumber}:`, error);
      toast({
        title: "Error",
        description: `Failed to update spaces for floor ${floorNumber}. Please try again.`,
        variant: "destructive",
      });
    }
  }, [updateFloorConfiguration, toast]);

  const updateFloorBuildingSystems = useCallback((floorNumber: number, systems: BuildingSystemsConfig) => {
    try {
      const validatedSystems = {
        ...systems,
        elevators: systems.elevators || {
          passenger: "0",
          service: "0",
          freight: "0"
        }
      };
      console.log(`Updating building systems for floor ${floorNumber}`, validatedSystems);
      
      updateFloorConfiguration(floorNumber, 'buildingSystems', validatedSystems);
    } catch (error) {
      console.error(`Failed to update building systems for floor ${floorNumber}:`, error);
      toast({
        title: "Error",
        description: `Failed to update building systems for floor ${floorNumber}. Please try again.`,
        variant: "destructive",
      });
    }
  }, [updateFloorConfiguration, toast]);

  const importFloorConfigurations = useCallback((configurations: FloorConfiguration[]) => {
    try {
      if (validateFloorConfigurations(configurations)) {
        setFloorConfigurations(configurations);
        safeSaveToLocalStorage(STORAGE_KEY, configurations);
        
        toast({
          title: "Success",
          description: `Imported ${configurations.length} floor configurations.`,
        });
      } else {
        throw new Error('Invalid floor configuration data');
      }
    } catch (error) {
      console.error('Failed to import floor configurations:', error);
      toast({
        title: "Error",
        description: `Failed to import floor configurations. Invalid data format.`,
        variant: "destructive",
      });
    }
  }, [toast]);

  const exportFloorConfigurations = useCallback(() => {
    return floorConfigurations;
  }, [floorConfigurations]);

  // Add a reset function
  const resetFloorConfigurations = useCallback(() => {
    try {
      const defaultFloor: FloorConfiguration = {
        floorNumber: 1,
        isUnderground: false,
        templateId: floorTemplates.length > 0 ? floorTemplates[0].id : null,
        customSquareFootage: "",
        floorToFloorHeight: "12",
        efficiencyFactor: "85",
        corePercentage: "15",
        primaryUse: "office",
        secondaryUse: null,
        secondaryUsePercentage: "0"
      };
      
      setFloorConfigurations([defaultFloor]);
      safeSaveToLocalStorage(STORAGE_KEY, [defaultFloor]);
      
      toast({
        title: "Reset Complete",
        description: "Floor configurations have been reset to default.",
      });
    } catch (error) {
      console.error('Failed to reset floor configurations:', error);
      toast({
        title: "Error",
        description: `Failed to reset floor configurations. Please try again.`,
        variant: "destructive",
      });
    }
  }, [floorTemplates, toast]);

  return {
    floorConfigurations,
    setFloorConfigurations,
    updateFloorConfiguration,
    copyFloorConfiguration,
    bulkEditFloorConfigurations,
    addFloors,
    removeFloors,
    reorderFloor,
    updateFloorSpaces,
    updateFloorBuildingSystems,
    importFloorConfigurations,
    exportFloorConfigurations,
    resetFloorConfigurations
  };
};
