
import { useState, useEffect, useCallback } from "react";
import { saveToLocalStorage, loadFromLocalStorage } from "../useLocalStoragePersistence";
import { 
  FloorConfiguration, 
  SpaceDefinition,
  BuildingSystemsConfig,
  FloorPlateTemplate
} from "@/types/propertyTypes";
import { toast } from "@/components/ui/use-toast";
import { useUIRecovery } from "@/App";

const STORAGE_KEY = "realEstateModel_floorConfigurations";

// Create a custom event for floor configuration changes
export const FLOOR_CONFIG_EVENT = "floorConfigSaved";

// Improved event dispatcher with detailed logging
const dispatchFloorConfigEvent = (eventName: string, detail: any = {}) => {
  if (typeof window !== 'undefined') {
    try {
      console.log(`Dispatching ${eventName} event with details:`, detail);
      const event = new CustomEvent(eventName, { 
        bubbles: false,
        detail
      });
      window.dispatchEvent(event);
      console.log(`${eventName} event dispatched successfully`);
    } catch (error) {
      console.error(`Error dispatching ${eventName} event:`, error);
    }
  }
};

export const useFloorConfigurations = (floorTemplates: FloorPlateTemplate[]) => {
  const { startProcessing, endProcessing } = useUIRecovery();
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
  const [lastOperation, setLastOperation] = useState<{ 
    type: string; 
    timestamp: number;
    data?: any;
  } | null>(null);

  // Load configurations from localStorage
  useEffect(() => {
    try {
      console.log("Loading floor configurations from storage");
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
        console.log("Loaded floor configurations:", storedFloorConfigurations.length);
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

  // Save configurations to localStorage
  useEffect(() => {
    try {
      console.log("Saving floor configurations to storage:", floorConfigurations.length);
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

  // Process state changes safely
  const safeSetFloorConfigurations = useCallback((updaterOrValue: FloorConfiguration[] | ((prev: FloorConfiguration[]) => FloorConfiguration[])) => {
    try {
      console.log("Starting safe floor configuration update");
      startProcessing();
      setIsProcessingOperation(true);
      
      setFloorConfigurations(updaterOrValue);
      
      // Schedule processing state to end
      setTimeout(() => {
        console.log("Ending processing state after configuration update");
        setIsProcessingOperation(false);
        endProcessing();
        
        // Notify that configurations have been updated
        dispatchFloorConfigEvent(FLOOR_CONFIG_EVENT, { 
          operation: "update",
          timestamp: Date.now()
        });
      }, 100);
    } catch (error) {
      console.error("Error updating floor configurations:", error);
      setIsProcessingOperation(false);
      endProcessing();
      
      toast({
        title: "Error updating floors",
        description: "There was an error updating the floor configurations. Please try again.",
        variant: "destructive"
      });
    }
  }, [startProcessing, endProcessing]);

  // Update a single floor configuration
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
      
      setLastOperation({
        type: "update",
        timestamp: Date.now(),
        data: { floorNumber, field }
      });
      
      if (field === 'spaces' || field === 'buildingSystems') {
        dispatchFloorConfigEvent(FLOOR_CONFIG_EVENT, {
          operation: "updateSpecial",
          floorNumber,
          field,
          timestamp: Date.now()
        });
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

  // Copy floor configuration to other floors
  const copyFloorConfiguration = useCallback((sourceFloorNumber: number, targetFloorNumbers: number[]) => {
    try {
      console.log(`Copying floor ${sourceFloorNumber} to floors:`, targetFloorNumbers);
      const sourceFloor = floorConfigurations.find(floor => floor.floorNumber === sourceFloorNumber);
      
      if (sourceFloor && targetFloorNumbers.length > 0) {
        startProcessing();
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
        
        setLastOperation({
          type: "copy",
          timestamp: Date.now(),
          data: { sourceFloorNumber, targetFloorNumbers }
        });
        
        toast({
          title: "Floor copied",
          description: `Floor ${sourceFloorNumber} has been copied to selected floors.`
        });
      }
    } catch (error) {
      console.error("Error copying floor configuration:", error);
      endProcessing();
      toast({
        title: "Error copying floor",
        description: "There was an error copying the floor configuration. Please try again.",
        variant: "destructive"
      });
    }
  }, [floorConfigurations, safeSetFloorConfigurations, startProcessing, endProcessing]);

  // Bulk edit multiple floors
  const bulkEditFloorConfigurations = useCallback((
    floorNumbers: number[], 
    field: keyof FloorConfiguration, 
    value: string | null | boolean
  ) => {
    try {
      console.log(`Bulk editing floors ${floorNumbers.join(', ')}, setting ${String(field)} to`, value);
      startProcessing();
      safeSetFloorConfigurations(prevFloors =>
        prevFloors.map(floor => 
          floorNumbers.includes(floor.floorNumber) ? { ...floor, [field]: value } : floor
        )
      );
      
      setLastOperation({
        type: "bulkEdit",
        timestamp: Date.now(),
        data: { floorNumbers, field, value }
      });
    } catch (error) {
      console.error("Error bulk editing floors:", error);
      endProcessing();
      toast({
        title: "Error updating floors",
        description: "There was an error updating multiple floors. Please try again.",
        variant: "destructive"
      });
    }
  }, [safeSetFloorConfigurations, startProcessing, endProcessing]);

  // Add new floors
  const addFloors = useCallback((
    count: number,
    isUnderground: boolean,
    templateId: string | null,
    position: "top" | "bottom" | "specific",
    specificPosition?: number,
    numberingPattern?: "consecutive" | "skip" | "custom",
    customNumbering?: number[]
  ) => {
    console.log(`Adding ${count} ${isUnderground ? 'underground' : 'above-ground'} floors`);
    startProcessing();
    
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
    
    safeSetFloorConfigurations(updatedFloors);
    
    setLastOperation({
      type: "add",
      timestamp: Date.now(),
      data: { count, isUnderground, position }
    });
    
    toast({
      title: "Floors added",
      description: `${count} floor${count > 1 ? 's' : ''} added successfully.`
    });
  }, [floorConfigurations, safeSetFloorConfigurations, startProcessing]);

  // Completely revised floor removal process
  const removeFloors = useCallback((floorNumbers: number[]) => {
    if (floorNumbers.length === 0) return;
    
    try {
      console.log("Starting floor removal process for floors:", floorNumbers);
      
      // Start UI processing state
      startProcessing();
      setIsProcessingOperation(true);
      
      // Create a separate function for the actual removal to isolate it
      const performRemoval = () => {
        console.log("Performing floor removal");
        
        const remainingFloors = floorConfigurations.filter(
          floor => !floorNumbers.includes(floor.floorNumber)
        );
        
        let updatedFloors = remainingFloors;
        
        if (remainingFloors.length === 0) {
          console.log("No floors remain, creating default floor");
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
        
        console.log("Setting new floor configurations:", updatedFloors.length);
        setFloorConfigurations(updatedFloors);
        
        // Record the operation
        setLastOperation({
          type: "remove",
          timestamp: Date.now(),
          data: { floorNumbers }
        });
      };
      
      // Execute the removal
      performRemoval();
      
      // Show success message
      toast({
        title: "Floors removed",
        description: `${floorNumbers.length} floor(s) have been removed.`
      });
      
      // Schedule UI recovery in phases to ensure cleanup is complete
      setTimeout(() => {
        console.log("First phase of UI recovery after floor removal");
        setIsProcessingOperation(false);
        
        // Dispatch event to notify components
        dispatchFloorConfigEvent(FLOOR_CONFIG_EVENT, {
          operation: "remove",
          floorNumbers,
          timestamp: Date.now()
        });
        
        // Second phase ensures all DOM operations have completed
        setTimeout(() => {
          console.log("Second phase of UI recovery after floor removal");
          endProcessing();
          
          // Verify DOM state and force refresh if needed
          const domCleanup = () => {
            console.log("Performing DOM cleanup verification");
            // Check for any stuck dialogs or modals
            document.querySelectorAll('[role="dialog"]').forEach(dialog => {
              if (dialog.getAttribute('data-state') === 'open') {
                console.log("Found open dialog after floor removal, forcing close");
                dialog.setAttribute('data-state', 'closed');
                
                // Remove from DOM after animation completes
                setTimeout(() => {
                  if (dialog.parentNode) {
                    dialog.parentNode.removeChild(dialog);
                  }
                }, 300);
              }
            });
          };
          
          domCleanup();
        }, 300);
      }, 200);
      
    } catch (error) {
      console.error("Error removing floors:", error);
      setIsProcessingOperation(false);
      endProcessing();
      
      toast({
        title: "Error removing floors",
        description: "There was an error removing the selected floors. Please try again.",
        variant: "destructive"
      });
    }
  }, [floorConfigurations, floorTemplates, startProcessing, endProcessing]);

  // Reorder a floor
  const reorderFloor = useCallback((floorNumber: number, direction: "up" | "down") => {
    try {
      console.log(`Reordering floor ${floorNumber} ${direction}`);
      startProcessing();
      
      const sortedFloors = [...floorConfigurations].sort((a, b) => b.floorNumber - a.floorNumber);
      const currentIndex = sortedFloors.findIndex(f => f.floorNumber === floorNumber);
      
      if (currentIndex === -1) {
        console.log("Floor not found, cancelling reorder");
        endProcessing();
        return;
      }
      
      const targetIndex = direction === "up" 
        ? Math.max(0, currentIndex - 1) 
        : Math.min(sortedFloors.length - 1, currentIndex + 1);
      
      if (currentIndex === targetIndex) {
        console.log("No change in position, cancelling reorder");
        endProcessing();
        return;
      }
      
      const targetFloor = sortedFloors[targetIndex];
      const currentFloor = sortedFloors[currentIndex];
      
      const tempFloorNumber = currentFloor.floorNumber;
      currentFloor.floorNumber = targetFloor.floorNumber;
      targetFloor.floorNumber = tempFloorNumber;
      
      safeSetFloorConfigurations([...sortedFloors]);
      
      setLastOperation({
        type: "reorder",
        timestamp: Date.now(),
        data: { floorNumber, direction }
      });
    } catch (error) {
      console.error("Error reordering floor:", error);
      endProcessing();
      toast({
        title: "Error reordering floor",
        description: "There was an error reordering the floor. Please try again.",
        variant: "destructive"
      });
    }
  }, [floorConfigurations, safeSetFloorConfigurations, startProcessing, endProcessing]);

  // Update floor spaces
  const updateFloorSpaces = useCallback((floorNumber: number, spaces: SpaceDefinition[]) => {
    try {
      console.log(`Updating spaces for floor ${floorNumber}`);
      startProcessing();
      
      const validatedSpaces = spaces.map(space => ({
        ...space,
        dimensions: space.dimensions || { width: "0", depth: "0" },
        subType: space.subType || null,
        percentage: typeof space.percentage === 'number' ? space.percentage : 0
      }));
      
      updateFloorConfiguration(floorNumber, 'spaces', validatedSpaces);
    } catch (error) {
      console.error(`Error updating spaces for floor ${floorNumber}:`, error);
      endProcessing();
      toast({
        title: "Error updating spaces",
        description: `Could not update spaces for floor ${floorNumber}. Please try again.`,
        variant: "destructive"
      });
    }
  }, [updateFloorConfiguration, startProcessing, endProcessing]);

  // Update floor building systems
  const updateFloorBuildingSystems = useCallback((floorNumber: number, systems: BuildingSystemsConfig) => {
    try {
      console.log(`Updating building systems for floor ${floorNumber}`);
      startProcessing();
      
      const validatedSystems = {
        ...systems,
        elevators: systems.elevators || {
          passenger: "0",
          service: "0",
          freight: "0"
        }
      };
      
      updateFloorConfiguration(floorNumber, 'buildingSystems', validatedSystems);
    } catch (error) {
      console.error(`Error updating building systems for floor ${floorNumber}:`, error);
      endProcessing();
      toast({
        title: "Error updating building systems",
        description: `Could not update building systems for floor ${floorNumber}. Please try again.`,
        variant: "destructive"
      });
    }
  }, [updateFloorConfiguration, startProcessing, endProcessing]);

  // Import floor configurations
  const importFloorConfigurations = useCallback((configurations: FloorConfiguration[]) => {
    try {
      console.log("Importing floor configurations:", configurations.length);
      startProcessing();
      
      if (configurations && configurations.length > 0) {
        safeSetFloorConfigurations(configurations);
        
        setLastOperation({
          type: "import",
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error("Error importing floor configurations:", error);
      endProcessing();
      toast({
        title: "Error importing configurations",
        description: "There was an error importing the floor configurations. Please try again.",
        variant: "destructive"
      });
    }
  }, [safeSetFloorConfigurations, startProcessing, endProcessing]);

  // Export floor configurations
  const exportFloorConfigurations = useCallback(() => {
    console.log("Exporting floor configurations");
    return floorConfigurations;
  }, [floorConfigurations]);

  // Reset floor configurations
  const resetFloorConfigurations = useCallback(() => {
    console.log("Resetting floor configurations to default");
    startProcessing();
    
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
    
    setLastOperation({
      type: "reset",
      timestamp: Date.now()
    });
    
    toast({
      title: "Floor configurations reset",
      description: "Floor configurations have been reset to default."
    });
  }, [floorTemplates, safeSetFloorConfigurations, startProcessing]);

  // Listen for DOM events
  useEffect(() => {
    // Setup event listener for helping trace any issues with UI interactivity
    const handleUIEvent = (e: MouseEvent) => {
      if (isProcessingOperation) {
        console.log("UI event while processing:", e.type, e.target);
      }
    };
    
    document.addEventListener('click', handleUIEvent, true);
    
    return () => {
      document.removeEventListener('click', handleUIEvent, true);
    };
  }, [isProcessingOperation]);

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
    isProcessingOperation,
    lastOperation
  };
};
