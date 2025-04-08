
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { 
  FloorConfiguration, 
  FloorPlateTemplate, 
  SpaceType, 
  UnitMix,
  BuildingSystemsConfig,
  SpaceDefinition
} from '@/types/propertyTypes';
import { loadFromLocalStorage, saveToLocalStorage } from '@/hooks/useLocalStoragePersistence';
import { toast } from '@/components/ui/use-toast';

// Define the state structure
export interface PropertyState {
  // Project Info
  projectName: string;
  projectLocation: string;
  projectType: string;
  
  // Building Parameters
  farAllowance: string;
  totalLandArea: string;
  buildingFootprint: string;
  
  // Derived building values (calculated)
  totalBuildableArea: number;
  totalAboveGroundArea: number;
  totalBelowGroundArea: number;
  actualFar: number;
  
  // Floor Templates
  floorTemplates: FloorPlateTemplate[];
  
  // Floor Configurations
  floorConfigurations: FloorConfiguration[];
  isProcessingOperation: boolean;
  
  // Space Types
  spaceTypes: SpaceType[];
  totalAllocatedArea: number;
  
  // Unit Mix
  unitMixes: UnitMix[];
  
  // State version for migrations
  stateVersion: number;
}

// Define action types
type PropertyAction =
  | { type: 'SET_PROJECT_INFO'; field: 'projectName' | 'projectLocation' | 'projectType'; value: string }
  | { type: 'SET_BUILDING_PARAM'; field: 'farAllowance' | 'totalLandArea' | 'buildingFootprint'; value: string }
  | { type: 'UPDATE_CALCULATED_VALUES'; totalAboveGround: number; totalBelowGround: number; actualFar: number }
  | { type: 'SET_FLOOR_TEMPLATES'; templates: FloorPlateTemplate[] }
  | { type: 'ADD_FLOOR_TEMPLATE'; template: Omit<FloorPlateTemplate, 'id'> }
  | { type: 'UPDATE_FLOOR_TEMPLATE'; id: string; updates: Partial<FloorPlateTemplate> }
  | { type: 'REMOVE_FLOOR_TEMPLATE'; id: string }
  | { type: 'SET_FLOOR_CONFIGURATIONS'; configurations: FloorConfiguration[] }
  | { type: 'UPDATE_FLOOR_CONFIGURATION'; floorNumber: number; field: keyof FloorConfiguration; value: any }
  | { type: 'COPY_FLOOR_CONFIGURATION'; sourceFloorNumber: number; targetFloorNumbers: number[] }
  | { type: 'BULK_EDIT_FLOORS'; floorNumbers: number[]; field: keyof FloorConfiguration; value: any }
  | { type: 'ADD_FLOORS'; params: {
      count: number;
      isUnderground: boolean;
      templateId: string | null;
      position: "top" | "bottom" | "specific";
      specificPosition?: number;
      numberingPattern?: "consecutive" | "skip" | "custom";
      customNumbering?: number[];
    }}
  | { type: 'REMOVE_FLOORS'; floorNumbers: number[] }
  | { type: 'REORDER_FLOOR'; floorNumber: number; direction: 'up' | 'down' }
  | { type: 'UPDATE_FLOOR_SPACES'; floorNumber: number; spaces: SpaceDefinition[] }
  | { type: 'UPDATE_FLOOR_BUILDING_SYSTEMS'; floorNumber: number; systems: BuildingSystemsConfig }
  | { type: 'SET_PROCESSING_STATE'; isProcessing: boolean }
  | { type: 'SET_SPACE_TYPES'; spaceTypes: SpaceType[] }
  | { type: 'ADD_SPACE_TYPE' }
  | { type: 'REMOVE_SPACE_TYPE'; id: string }
  | { type: 'UPDATE_SPACE_TYPE'; id: string; field: keyof SpaceType; value: string }
  | { type: 'UPDATE_SPACE_TYPE_FLOOR_ALLOCATION'; id: string; floor: number; value: string }
  | { type: 'SET_UNIT_MIXES'; unitMixes: UnitMix[] }
  | { type: 'ADD_UNIT_MIX' }
  | { type: 'REMOVE_UNIT_MIX'; id: string }
  | { type: 'UPDATE_UNIT_MIX'; id: string; field: keyof UnitMix; value: string }
  | { type: 'RESET_ALL_DATA' };

// Storage keys
const STORAGE_KEYS = {
  PROPERTY_STATE: "realEstateModel_propertyState",
  STATE_VERSION: 1 // Increment when making breaking changes to state structure
};

// Initial state
const initialState: PropertyState = {
  projectName: "",
  projectLocation: "",
  projectType: "",
  farAllowance: "1.5",
  totalLandArea: "0",
  buildingFootprint: "0",
  totalBuildableArea: 0,
  totalAboveGroundArea: 0,
  totalBelowGroundArea: 0,
  actualFar: 0,
  floorTemplates: [
    {
      id: "template-1",
      name: "Standard Floor",
      squareFootage: "10000",
      floorToFloorHeight: "12",
      efficiencyFactor: "85",
      corePercentage: "15",
      primaryUse: "office"
    }
  ],
  floorConfigurations: [
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
  isProcessingOperation: false,
  spaceTypes: [
    { 
      id: "space-1", 
      type: "office", 
      squareFootage: "0",
      units: "0", 
      phase: "1",
      efficiencyFactor: "85",
      floorAllocation: {}
    }
  ],
  totalAllocatedArea: 0,
  unitMixes: [
    { id: "unit-1", type: "Studio", count: "0", squareFootage: "0" }
  ],
  stateVersion: STORAGE_KEYS.STATE_VERSION
};

// Helper function to generate a new ID
const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
};

// Create dispatcher to send custom events
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

// Reducer function
const propertyReducer = (state: PropertyState, action: PropertyAction): PropertyState => {
  switch (action.type) {
    case 'SET_PROJECT_INFO':
      return {
        ...state,
        [action.field]: action.value
      };
      
    case 'SET_BUILDING_PARAM':
      return {
        ...state,
        [action.field]: action.value
      };
      
    case 'UPDATE_CALCULATED_VALUES':
      return {
        ...state,
        totalBuildableArea: action.totalAboveGround + action.totalBelowGround,
        totalAboveGroundArea: action.totalAboveGround,
        totalBelowGroundArea: action.totalBelowGround,
        actualFar: action.actualFar
      };
      
    case 'SET_FLOOR_TEMPLATES':
      return {
        ...state,
        floorTemplates: action.templates
      };
      
    case 'ADD_FLOOR_TEMPLATE': {
      const newId = `template-${state.floorTemplates.length + 1}`;
      const newTemplate: FloorPlateTemplate = {
        id: newId,
        name: action.template.name,
        squareFootage: action.template.squareFootage,
        floorToFloorHeight: action.template.floorToFloorHeight,
        efficiencyFactor: action.template.efficiencyFactor,
        corePercentage: action.template.corePercentage,
        primaryUse: action.template.primaryUse,
        description: action.template.description || ""
      };
      
      return {
        ...state,
        floorTemplates: [...state.floorTemplates, newTemplate]
      };
    }
    
    case 'UPDATE_FLOOR_TEMPLATE':
      return {
        ...state,
        floorTemplates: state.floorTemplates.map(template => 
          template.id === action.id ? { ...template, ...action.updates } : template
        )
      };
      
    case 'REMOVE_FLOOR_TEMPLATE': {
      if (state.floorTemplates.length <= 1) {
        // Don't remove the last template
        return state;
      }
      
      const firstTemplateId = state.floorTemplates.find(t => t.id !== action.id)?.id || null;
      
      return {
        ...state,
        floorTemplates: state.floorTemplates.filter(template => template.id !== action.id),
        floorConfigurations: state.floorConfigurations.map(floor => 
          floor.templateId === action.id ? { ...floor, templateId: firstTemplateId } : floor
        )
      };
    }
    
    case 'SET_FLOOR_CONFIGURATIONS':
      return {
        ...state,
        floorConfigurations: action.configurations
      };
      
    case 'UPDATE_FLOOR_CONFIGURATION':
      return {
        ...state,
        floorConfigurations: state.floorConfigurations.map(floor => {
          if (floor.floorNumber === action.floorNumber) {
            return { ...floor, [action.field]: action.value };
          }
          return floor;
        })
      };
      
    case 'COPY_FLOOR_CONFIGURATION': {
      const sourceFloor = state.floorConfigurations.find(floor => 
        floor.floorNumber === action.sourceFloorNumber
      );
      
      if (!sourceFloor || action.targetFloorNumbers.length === 0) {
        return state;
      }
      
      return {
        ...state,
        floorConfigurations: state.floorConfigurations.map(floor => 
          action.targetFloorNumbers.includes(floor.floorNumber)
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
      };
    }
    
    case 'BULK_EDIT_FLOORS':
      return {
        ...state,
        floorConfigurations: state.floorConfigurations.map(floor => 
          action.floorNumbers.includes(floor.floorNumber) 
            ? { ...floor, [action.field]: action.value } 
            : floor
        )
      };
      
    case 'ADD_FLOORS': {
      const { count, isUnderground, templateId, position, specificPosition, numberingPattern, customNumbering } = action.params;
      
      const aboveGroundFloors = state.floorConfigurations.filter(f => !f.isUnderground);
      const belowGroundFloors = state.floorConfigurations.filter(f => f.isUnderground);
      
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
        updatedFloors = [...state.floorConfigurations, ...newFloors];
      } else if (position === "bottom" && isUnderground) {
        updatedFloors = [...newFloors, ...state.floorConfigurations];
      } else if (position === "specific" && specificPosition !== undefined) {
        const sortedFloors = [...state.floorConfigurations].sort((a, b) => b.floorNumber - a.floorNumber);
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
          ? [...newFloors, ...state.floorConfigurations]
          : [...state.floorConfigurations, ...newFloors];
      }
      
      return {
        ...state,
        floorConfigurations: updatedFloors
      };
    }
    
    case 'REMOVE_FLOORS': {
      if (action.floorNumbers.length === 0) return state;
      
      const remainingFloors = state.floorConfigurations.filter(
        floor => !action.floorNumbers.includes(floor.floorNumber)
      );
      
      let updatedFloors = remainingFloors;
      
      if (remainingFloors.length === 0) {
        const defaultFloor: FloorConfiguration = {
          floorNumber: 1,
          isUnderground: false,
          templateId: state.floorTemplates[0]?.id || null,
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
      
      // Trigger UI refresh
      setTimeout(() => {
        dispatchFloorConfigSavedEvent();
      }, 100);
      
      return {
        ...state,
        floorConfigurations: updatedFloors
      };
    }
    
    case 'REORDER_FLOOR': {
      const sortedFloors = [...state.floorConfigurations].sort((a, b) => b.floorNumber - a.floorNumber);
      const currentIndex = sortedFloors.findIndex(f => f.floorNumber === action.floorNumber);
      
      if (currentIndex === -1) return state;
      
      const targetIndex = action.direction === "up" 
        ? Math.max(0, currentIndex - 1) 
        : Math.min(sortedFloors.length - 1, currentIndex + 1);
      
      if (currentIndex === targetIndex) return state;
      
      const targetFloor = sortedFloors[targetIndex];
      const currentFloor = sortedFloors[currentIndex];
      
      const tempFloorNumber = currentFloor.floorNumber;
      currentFloor.floorNumber = targetFloor.floorNumber;
      targetFloor.floorNumber = tempFloorNumber;
      
      return {
        ...state,
        floorConfigurations: [...sortedFloors]
      };
    }
    
    case 'UPDATE_FLOOR_SPACES': {
      const validatedSpaces = action.spaces.map(space => ({
        ...space,
        dimensions: space.dimensions || { width: "0", depth: "0" },
        subType: space.subType || null,
        percentage: typeof space.percentage === 'number' ? space.percentage : 0
      }));
      
      return {
        ...state,
        floorConfigurations: state.floorConfigurations.map(floor => {
          if (floor.floorNumber === action.floorNumber) {
            return { ...floor, spaces: validatedSpaces };
          }
          return floor;
        })
      };
    }
    
    case 'UPDATE_FLOOR_BUILDING_SYSTEMS': {
      const validatedSystems = {
        ...action.systems,
        elevators: action.systems.elevators || {
          passenger: "0",
          service: "0",
          freight: "0"
        }
      };
      
      return {
        ...state,
        floorConfigurations: state.floorConfigurations.map(floor => {
          if (floor.floorNumber === action.floorNumber) {
            return { ...floor, buildingSystems: validatedSystems };
          }
          return floor;
        })
      };
    }
    
    case 'SET_PROCESSING_STATE':
      return {
        ...state,
        isProcessingOperation: action.isProcessing
      };
    
    case 'SET_SPACE_TYPES':
      return {
        ...state,
        spaceTypes: action.spaceTypes,
        totalAllocatedArea: action.spaceTypes.reduce((total, space) => {
          return total + (parseFloat(space.squareFootage) || 0);
        }, 0)
      };
      
    case 'ADD_SPACE_TYPE': {
      const newSpaceType: SpaceType = { 
        id: generateId('space'), 
        type: "", 
        squareFootage: "0", 
        units: "0", 
        phase: "1",
        efficiencyFactor: "85",
        floorAllocation: {} 
      };
      
      const updatedSpaceTypes = [...state.spaceTypes, newSpaceType];
      
      return {
        ...state,
        spaceTypes: updatedSpaceTypes,
        totalAllocatedArea: updatedSpaceTypes.reduce((total, space) => {
          return total + (parseFloat(space.squareFootage) || 0);
        }, 0)
      };
    }
    
    case 'REMOVE_SPACE_TYPE': {
      if (state.spaceTypes.length <= 1) {
        return state;
      }
      
      const updatedSpaceTypes = state.spaceTypes.filter(space => space.id !== action.id);
      
      return {
        ...state,
        spaceTypes: updatedSpaceTypes,
        totalAllocatedArea: updatedSpaceTypes.reduce((total, space) => {
          return total + (parseFloat(space.squareFootage) || 0);
        }, 0)
      };
    }
    
    case 'UPDATE_SPACE_TYPE': {
      const updatedSpaceTypes = state.spaceTypes.map(space => 
        space.id === action.id ? { ...space, [action.field]: action.value } : space
      );
      
      return {
        ...state,
        spaceTypes: updatedSpaceTypes,
        totalAllocatedArea: updatedSpaceTypes.reduce((total, space) => {
          return total + (parseFloat(space.squareFootage) || 0);
        }, 0)
      };
    }
    
    case 'UPDATE_SPACE_TYPE_FLOOR_ALLOCATION': {
      const updatedSpaceTypes = state.spaceTypes.map(space => {
        if (space.id === action.id) {
          const updatedAllocation = { ...space.floorAllocation };
          updatedAllocation[action.floor] = action.value;
          return { ...space, floorAllocation: updatedAllocation };
        }
        return space;
      });
      
      return {
        ...state,
        spaceTypes: updatedSpaceTypes
      };
    }
    
    case 'SET_UNIT_MIXES':
      return {
        ...state,
        unitMixes: action.unitMixes
      };
      
    case 'ADD_UNIT_MIX': {
      const newId = generateId('unit');
      return {
        ...state,
        unitMixes: [...state.unitMixes, { id: newId, type: "", count: "0", squareFootage: "0" }]
      };
    }
    
    case 'REMOVE_UNIT_MIX': {
      if (state.unitMixes.length <= 1) {
        return state;
      }
      
      return {
        ...state,
        unitMixes: state.unitMixes.filter(unit => unit.id !== action.id)
      };
    }
    
    case 'UPDATE_UNIT_MIX':
      return {
        ...state,
        unitMixes: state.unitMixes.map(unit => 
          unit.id === action.id ? { ...unit, [action.field]: action.value } : unit
        )
      };
      
    case 'RESET_ALL_DATA':
      return initialState;
      
    default:
      return state;
  }
};

// Create the context
type PropertyContextType = {
  state: PropertyState;
  dispatch: React.Dispatch<PropertyAction>;
};

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

// Provider component
export const PropertyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(propertyReducer, initialState, (initial) => {
    try {
      // Load state from localStorage
      const savedState = loadFromLocalStorage(STORAGE_KEYS.PROPERTY_STATE, null);
      
      if (savedState) {
        // Check if we need to migrate data
        if (!savedState.stateVersion || savedState.stateVersion < STORAGE_KEYS.STATE_VERSION) {
          console.log('Migrating property state data...');
          // Implement migration logic here if needed
          return {
            ...initial,
            ...savedState,
            stateVersion: STORAGE_KEYS.STATE_VERSION
          };
        }
        return savedState;
      }
    } catch (error) {
      console.error('Failed to load property state:', error);
      toast({
        title: "Error loading saved data",
        description: "Your previous settings could not be loaded. Starting with defaults.",
        variant: "destructive",
      });
    }
    
    return initial;
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      saveToLocalStorage(STORAGE_KEYS.PROPERTY_STATE, state);
    } catch (error) {
      console.error('Failed to save property state:', error);
    }
  }, [state]);

  // Calculate building areas and FAR whenever floor configurations or templates change
  useEffect(() => {
    let aboveGround = 0;
    let belowGround = 0;

    state.floorConfigurations.forEach(floor => {
      let squareFootage = 0;
      if (floor.templateId) {
        const template = state.floorTemplates.find(t => t.id === floor.templateId);
        if (template) {
          squareFootage = parseFloat(template.squareFootage) || 0;
        }
      }

      if (floor.customSquareFootage) {
        squareFootage = parseFloat(floor.customSquareFootage) || 0;
      }

      if (floor.isUnderground) {
        belowGround += squareFootage;
      } else {
        aboveGround += squareFootage;
      }
    });

    const landArea = parseFloat(state.totalLandArea) || 0;
    const actualFar = landArea > 0 ? aboveGround / landArea : 0;

    dispatch({ 
      type: 'UPDATE_CALCULATED_VALUES', 
      totalAboveGround: aboveGround,
      totalBelowGround: belowGround,
      actualFar
    });
  }, [state.floorConfigurations, state.floorTemplates, state.totalLandArea]);

  return (
    <PropertyContext.Provider value={{ state, dispatch }}>
      {children}
    </PropertyContext.Provider>
  );
};

// Custom hook to use the property context
export const usePropertyContext = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('usePropertyContext must be used within a PropertyProvider');
  }
  return context;
};

// Enhanced hook for global property state
export const useProperty = () => {
  const { state, dispatch } = usePropertyContext();

  // Project Info
  const setProjectName = (value: string) => dispatch({ type: 'SET_PROJECT_INFO', field: 'projectName', value });
  const setProjectLocation = (value: string) => dispatch({ type: 'SET_PROJECT_INFO', field: 'projectLocation', value });
  const setProjectType = (value: string) => dispatch({ type: 'SET_PROJECT_INFO', field: 'projectType', value });

  // Building Parameters
  const setFarAllowance = (value: string) => dispatch({ type: 'SET_BUILDING_PARAM', field: 'farAllowance', value });
  const setTotalLandArea = (value: string) => dispatch({ type: 'SET_BUILDING_PARAM', field: 'totalLandArea', value });
  const setBuildingFootprint = (value: string) => dispatch({ type: 'SET_BUILDING_PARAM', field: 'buildingFootprint', value });

  // Floor Templates
  const addFloorTemplate = (template: Omit<FloorPlateTemplate, "id">) => {
    dispatch({ type: 'ADD_FLOOR_TEMPLATE', template });
  };
  
  const updateFloorTemplate = (id: string, updates: Partial<FloorPlateTemplate>) => {
    dispatch({ type: 'UPDATE_FLOOR_TEMPLATE', id, updates });
  };
  
  const removeFloorTemplate = (id: string) => {
    dispatch({ type: 'REMOVE_FLOOR_TEMPLATE', id });
  };
  
  const resetFloorTemplates = () => {
    const defaultTemplate: FloorPlateTemplate = {
      id: "template-1",
      name: "Standard Floor",
      squareFootage: "10000",
      floorToFloorHeight: "12",
      efficiencyFactor: "85",
      corePercentage: "15",
      primaryUse: "office"
    };
    
    dispatch({ type: 'SET_FLOOR_TEMPLATES', templates: [defaultTemplate] });
  };

  // Floor Configurations
  const updateFloorConfiguration = (floorNumber: number, field: keyof FloorConfiguration, value: any) => {
    try {
      console.log(`Updating floor ${floorNumber}, field ${String(field)}`, value);
      
      dispatch({ type: 'UPDATE_FLOOR_CONFIGURATION', floorNumber, field, value });
      
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
  };
  
  const copyFloorConfiguration = (sourceFloorNumber: number, targetFloorNumbers: number[]) => {
    try {
      dispatch({ type: 'COPY_FLOOR_CONFIGURATION', sourceFloorNumber, targetFloorNumbers });
      toast({
        title: "Floor copied",
        description: `Floor ${sourceFloorNumber} has been copied to selected floors.`
      });
    } catch (error) {
      console.error("Error copying floor configuration:", error);
      toast({
        title: "Error copying floor",
        description: "There was an error copying the floor configuration. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const bulkEditFloorConfigurations = (floorNumbers: number[], field: keyof FloorConfiguration, value: any) => {
    try {
      dispatch({ type: 'BULK_EDIT_FLOORS', floorNumbers, field, value });
    } catch (error) {
      console.error("Error bulk editing floors:", error);
      toast({
        title: "Error updating floors",
        description: "There was an error updating multiple floors. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const addFloors = (
    count: number,
    isUnderground: boolean,
    templateId: string | null,
    position: "top" | "bottom" | "specific",
    specificPosition?: number,
    numberingPattern?: "consecutive" | "skip" | "custom",
    customNumbering?: number[]
  ) => {
    dispatch({ 
      type: 'ADD_FLOORS', 
      params: {
        count,
        isUnderground,
        templateId,
        position,
        specificPosition,
        numberingPattern,
        customNumbering
      }
    });
  };
  
  const removeFloors = (floorNumbers: number[]) => {
    if (floorNumbers.length === 0) return;
    
    try {
      console.log("Removing floors:", floorNumbers);
      
      dispatch({ type: 'SET_PROCESSING_STATE', isProcessing: true });
      dispatch({ type: 'REMOVE_FLOORS', floorNumbers });
      
      toast({
        title: "Floors removed",
        description: `${floorNumbers.length} floor(s) have been removed.`
      });

      // Reset processing state after operation completes
      setTimeout(() => {
        dispatch({ type: 'SET_PROCESSING_STATE', isProcessing: false });
        dispatchFloorConfigSavedEvent();
      }, 100);
    } catch (error) {
      console.error("Error removing floors:", error);
      dispatch({ type: 'SET_PROCESSING_STATE', isProcessing: false });
      toast({
        title: "Error removing floors",
        description: "There was an error removing the selected floors. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const reorderFloor = (floorNumber: number, direction: "up" | "down") => {
    try {
      dispatch({ type: 'REORDER_FLOOR', floorNumber, direction });
    } catch (error) {
      console.error("Error reordering floor:", error);
      toast({
        title: "Error reordering floor",
        description: "There was an error reordering the floor. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const updateFloorSpaces = (floorNumber: number, spaces: SpaceDefinition[]) => {
    try {
      dispatch({ type: 'UPDATE_FLOOR_SPACES', floorNumber, spaces });
    } catch (error) {
      console.error(`Error updating spaces for floor ${floorNumber}:`, error);
      toast({
        title: "Error updating spaces",
        description: `Could not update spaces for floor ${floorNumber}. Please try again.`,
        variant: "destructive"
      });
    }
  };
  
  const updateFloorBuildingSystems = (floorNumber: number, systems: BuildingSystemsConfig) => {
    try {
      dispatch({ type: 'UPDATE_FLOOR_BUILDING_SYSTEMS', floorNumber, systems });
    } catch (error) {
      console.error(`Error updating building systems for floor ${floorNumber}:`, error);
      toast({
        title: "Error updating building systems",
        description: `Could not update building systems for floor ${floorNumber}. Please try again.`,
        variant: "destructive"
      });
    }
  };
  
  const resetFloorConfigurations = () => {
    const defaultFloor: FloorConfiguration = {
      floorNumber: 1,
      isUnderground: false,
      templateId: state.floorTemplates[0]?.id || null,
      customSquareFootage: "",
      floorToFloorHeight: "12",
      efficiencyFactor: "85",
      corePercentage: "15",
      primaryUse: "office",
      secondaryUse: null,
      secondaryUsePercentage: "0"
    };
    
    dispatch({ type: 'SET_FLOOR_CONFIGURATIONS', configurations: [defaultFloor] });
  };

  // Space Types
  const addSpaceType = () => {
    dispatch({ type: 'ADD_SPACE_TYPE' });
  };
  
  const removeSpaceType = (id: string) => {
    dispatch({ type: 'REMOVE_SPACE_TYPE', id });
  };
  
  const updateSpaceType = (id: string, field: keyof SpaceType, value: string) => {
    dispatch({ type: 'UPDATE_SPACE_TYPE', id, field, value });
  };
  
  const updateSpaceTypeFloorAllocation = (id: string, floor: number, value: string) => {
    dispatch({ type: 'UPDATE_SPACE_TYPE_FLOOR_ALLOCATION', id, floor, value });
  };
  
  const resetSpaceTypes = () => {
    const defaultSpaceType: SpaceType = { 
      id: "space-1", 
      type: "office", 
      squareFootage: "0",
      units: "0", 
      phase: "1",
      efficiencyFactor: "85",
      floorAllocation: {}
    };
    
    dispatch({ type: 'SET_SPACE_TYPES', spaceTypes: [defaultSpaceType] });
  };

  // Unit Mix
  const addUnitMix = () => {
    dispatch({ type: 'ADD_UNIT_MIX' });
  };
  
  const removeUnitMix = (id: string) => {
    dispatch({ type: 'REMOVE_UNIT_MIX', id });
  };
  
  const updateUnitMix = (id: string, field: keyof UnitMix, value: string) => {
    dispatch({ type: 'UPDATE_UNIT_MIX', id, field, value });
  };
  
  const resetUnitMix = () => {
    const defaultUnitMix: UnitMix = { 
      id: "unit-1", 
      type: "Studio", 
      count: "0", 
      squareFootage: "0" 
    };
    
    dispatch({ type: 'SET_UNIT_MIXES', unitMixes: [defaultUnitMix] });
  };

  // Reset all data
  const resetAllData = () => {
    dispatch({ type: 'RESET_ALL_DATA' });
  };

  return {
    // Project Information
    projectName: state.projectName, 
    setProjectName,
    projectLocation: state.projectLocation, 
    setProjectLocation,
    projectType: state.projectType, 
    setProjectType,
    
    // Building Parameters
    farAllowance: state.farAllowance, 
    setFarAllowance,
    totalLandArea: state.totalLandArea, 
    setTotalLandArea,
    buildingFootprint: state.buildingFootprint, 
    setBuildingFootprint,
    totalBuildableArea: state.totalBuildableArea,
    totalAboveGroundArea: state.totalAboveGroundArea,
    totalBelowGroundArea: state.totalBelowGroundArea,
    actualFar: state.actualFar,
    
    // Floor Templates
    floorTemplates: state.floorTemplates,
    addFloorTemplate,
    updateFloorTemplate,
    removeFloorTemplate,
    resetFloorTemplates,
    
    // Floor Configurations
    floorConfigurations: state.floorConfigurations,
    updateFloorConfiguration,
    copyFloorConfiguration,
    bulkEditFloorConfigurations,
    addFloors,
    removeFloors,
    reorderFloor,
    updateFloorSpaces,
    updateFloorBuildingSystems,
    resetFloorConfigurations,
    isProcessingOperation: state.isProcessingOperation,
    
    // Space Types
    spaceTypes: state.spaceTypes,
    addSpaceType,
    removeSpaceType,
    updateSpaceType,
    updateSpaceTypeFloorAllocation,
    totalAllocatedArea: state.totalAllocatedArea,
    resetSpaceTypes,
    
    // Unit Mix
    unitMixes: state.unitMixes,
    addUnitMix,
    removeUnitMix,
    updateUnitMix,
    resetUnitMix,
    
    // Reset all data
    resetAllData
  };
};
