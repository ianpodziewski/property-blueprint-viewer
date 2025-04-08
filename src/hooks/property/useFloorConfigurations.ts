import { useState, useEffect, useCallback } from "react";
import { saveToLocalStorage, loadFromLocalStorage } from "../useLocalStoragePersistence";
import { 
  FloorConfiguration, 
  SpaceDefinition,
  BuildingSystemsConfig,
  FloorPlateTemplate
} from "@/types/propertyTypes";
import { toast } from "@/components/ui/use-toast";

const STORAGE_KEY = "realEstateModel_floorConfigurations";

const dispatchFloorConfigSavedEvent = () => {
  if (typeof window !== 'undefined') {
    try {
      const event = new CustomEvent('floorConfigSaved', { bubbles: false });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Error dispatching floor config event:", error);
    }
  }
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
  
  const [isProcessingOperation, setIsProcessingOperation] = useState(false);

  useEffect(() => {
    try {
      const storedFloorConfigurations = loadFromLocalStorage(STORAGE_KEY, [
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
      
      if (storedFloorConfigurations.length > 0) {
        setFloorConfigurations(storedFloorConfigurations);
      }
    } catch (error) {
      console.error("Error loading floor configurations:", error);
      setFloorConfigurations([{
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
      }]);
    }
  }, []);

  useEffect(() => {
    try {
      saveToLocalStorage(STORAGE_KEY, floorConfigurations);
    } catch (error) {
      console.error("Error saving floor configurations:", error);
      toast({
        title: "Error saving changes",
        description: "There was an error saving your changes. Please try again.",
        variant: "destructive"
      });
    }
  }, [floorConfigurations]);

  const safeSetFloorConfigurations = useCallback((updaterOrValue: FloorConfiguration[] | ((prev: FloorConfiguration[]) => FloorConfiguration[])) => {
    try {
      setIsProcessingOperation(true);
      setFloorConfigurations(updaterOrValue);
      setTimeout(() => setIsProcessingOperation(false), 50);
    } catch (error) {
      console.error("Error updating floor configurations:", error);
      setIsProcessingOperation(false);
      toast({
        title: "Error updating floors",
        description: "There was an error updating the floor configurations. Please try again.",
        variant: "destructive"
      });
    }
  }, []);

  const updateFloorConfiguration = useCallback((
    floorNumber: number, 
    field: keyof FloorConfiguration, 
    value: string | null | boolean | SpaceDefinition[] | BuildingSystemsConfig
  ) => {
    try {
      console.log(`Updating floor ${floorNumber}, field ${String(field)}`, value);
      
      safeSetFloorConfigurations(prevFloors => 
        prevFloors.map(floor => {
          if (floor.floorNumber === floorNumber) {
            const updatedFloor = { ...floor, [field]: value };
            return updatedFloor;
          }
          return floor;
        })
      );
      
      if (field === 'spaces' || field === 'buildingSystems') {
        dispatchFloorConfigSavedEvent();
      }
    } catch (error) {
      console.error(`Error updating floor ${floorNumber}, field ${String(field)}:`, error);
      toast({
        title: "Error updating floor",
        description: `Could not update floor ${floorNumber}. Please try again.`,
        variant: "destructive"
      });
    }
  }, [safeSetFloorConfigurations]);

  const copyFloorConfiguration = useCallback((sourceFloorNumber: number, targetFloorNumbers: number[]) => {
    try {
      const sourceFloor = floorConfigurations.find(floor => floor.floorNumber === sourceFloorNumber);
      
      if (sourceFloor && targetFloorNumbers.length > 0) {
        safeSetFloorConfigurations(prevFloors =>
          prevFloors.map(floor => 
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
          )
        );
        toast({
          title: "Floor copied",
          description: `Floor ${sourceFloorNumber} has been copied to selected floors.`
        });
      }
    } catch (error) {
      console.error("Error copying floor configuration:", error);
      toast({
        title: "Error copying floor",
        description: "There was an error copying the floor configuration. Please try again.",
        variant: "destructive"
      });
    }
  }, [floorConfigurations, safeSetFloorConfigurations]);

  const bulkEditFloorConfigurations = useCallback((
    floorNumbers: number[], 
    field: keyof FloorConfiguration, 
    value: string | null | boolean
  ) => {
    try {
      safeSetFloorConfigurations(prevFloors =>
        prevFloors.map(floor => 
          floorNumbers.includes(floor.floorNumber) ? { ...floor, [field]: value } : floor
        )
      );
    } catch (error) {
      console.error("Error bulk editing floors:", error);
      toast({
        title: "Error updating floors",
        description: "There was an error updating multiple floors. Please try again.",
        variant: "destructive"
      });
    }
  }, [safeSetFloorConfigurations]);

  const addFloors = useCallback((
    count: number,
    isUnderground: boolean,
    templateId: string | null,
    position: "top" | "bottom" | "specific",
    specificPosition?: number,
    numberingPattern?: "consecutive" | "skip" | "custom",
    customNumbering?: number[]
  ) => {
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
        templateId: templateId,
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
  }, [floorConfigurations]);

  const removeFloors = useCallback((floorNumbers: number[]) => {
    if (floorNumbers.length === 0) return;
    
    try {
      console.log("Removing floors:", floorNumbers);
      
      const remainingFloors = floorConfigurations.filter(
        floor => !floorNumbers.includes(floor.floorNumber)
      );
      
      let updatedFloors = remainingFloors;
      
      if (remainingFloors.length === 0) {
        const defaultFloor: FloorConfiguration = {
          floorNumber: 1,
          isUnderground: false,
          templateId: floorTemplates[0]?.id || null,
          customSquareFootage: "",
          floorToFloorHeight: "12",
          efficiencyFactor: "85",
          corePercentage: "15",
          primaryUse: "office",
          secondaryUse: null,
          secondaryUsePercentage: "0"
        };
        
        updatedFloors = [defaultFloor];
      }
      
      safeSetFloorConfigurations(updatedFloors);
      
      toast({
        title: "Floors removed",
        description: `${floorNumbers.length} floor(s) have been removed.`
      });

      setTimeout(() => {
        dispatchFloorConfigSavedEvent();
      }, 100);
      
    } catch (error) {
      console.error("Error removing floors:", error);
      toast({
        title: "Error removing floors",
        description: "There was an error removing the selected floors. Please try again.",
        variant: "destructive"
      });
    }
  }, [floorConfigurations, floorTemplates, safeSetFloorConfigurations]);

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
      
      safeSetFloorConfigurations([...sortedFloors]);
    } catch (error) {
      console.error("Error reordering floor:", error);
      toast({
        title: "Error reordering floor",
        description: "There was an error reordering the floor. Please try again.",
        variant: "destructive"
      });
    }
  }, [floorConfigurations, safeSetFloorConfigurations]);

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
      console.error(`Error updating spaces for floor ${floorNumber}:`, error);
      toast({
        title: "Error updating spaces",
        description: `Could not update spaces for floor ${floorNumber}. Please try again.`,
        variant: "destructive"
      });
    }
  }, [updateFloorConfiguration]);

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
      console.error(`Error updating building systems for floor ${floorNumber}:`, error);
      toast({
        title: "Error updating building systems",
        description: `Could not update building systems for floor ${floorNumber}. Please try again.`,
        variant: "destructive"
      });
    }
  }, [updateFloorConfiguration]);

  const importFloorConfigurations = useCallback((configurations: FloorConfiguration[]) => {
    try {
      if (configurations && configurations.length > 0) {
        safeSetFloorConfigurations(configurations);
      }
    } catch (error) {
      console.error("Error importing floor configurations:", error);
      toast({
        title: "Error importing configurations",
        description: "There was an error importing the floor configurations. Please try again.",
        variant: "destructive"
      });
    }
  }, [safeSetFloorConfigurations]);

  const exportFloorConfigurations = useCallback(() => {
    return floorConfigurations;
  }, [floorConfigurations]);

  const resetFloorConfigurations = useCallback(() => {
    const defaultFloor: FloorConfiguration = {
      floorNumber: 1,
      isUnderground: false,
      templateId: floorTemplates[0]?.id || null,
      customSquareFootage: "",
      floorToFloorHeight: "12",
      efficiencyFactor: "85",
      corePercentage: "15",
      primaryUse: "office",
      secondaryUse: null,
      secondaryUsePercentage: "0"
    };
    safeSetFloorConfigurations([defaultFloor]);
  }, [floorTemplates, safeSetFloorConfigurations]);

  return {
    floorConfigurations,
    setFloorConfigurations: safeSetFloorConfigurations,
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
    resetFloorConfigurations,
    isProcessingOperation
  };
};
