import { ModelState, Action, ActionMap } from '../types/modelTypes';

// Enum for action types
export enum ModelActionTypes {
  UPDATE_PROPERTY = 'UPDATE_PROPERTY',
  UPDATE_DEVELOPMENT_COSTS = 'UPDATE_DEVELOPMENT_COSTS',
  UPDATE_TIMELINE = 'UPDATE_TIMELINE',
  UPDATE_EXPENSES = 'UPDATE_EXPENSES',
  UPDATE_REVENUE = 'UPDATE_REVENUE',
  UPDATE_FINANCING = 'UPDATE_FINANCING',
  UPDATE_DISPOSITION = 'UPDATE_DISPOSITION',
  UPDATE_SENSITIVITY = 'UPDATE_SENSITIVITY',
  UPDATE_VALIDATION = 'UPDATE_VALIDATION',
  SET_ACTIVE_TAB = 'SET_ACTIVE_TAB',
  SET_DIRTY_FIELDS = 'SET_DIRTY_FIELDS',
  UPDATE_LAST_SAVED = 'UPDATE_LAST_SAVED',
  RESET_MODEL = 'RESET_MODEL'
}

// Define payload types for each action
type ModelPayloads = {
  [ModelActionTypes.UPDATE_PROPERTY]: Partial<ModelState['property']>;
  [ModelActionTypes.UPDATE_DEVELOPMENT_COSTS]: Partial<ModelState['developmentCosts']>;
  [ModelActionTypes.UPDATE_TIMELINE]: Partial<ModelState['timeline']>;
  [ModelActionTypes.UPDATE_EXPENSES]: Partial<ModelState['expenses']>;
  [ModelActionTypes.UPDATE_REVENUE]: Partial<ModelState['revenue']>;
  [ModelActionTypes.UPDATE_FINANCING]: Partial<ModelState['financing']>;
  [ModelActionTypes.UPDATE_DISPOSITION]: Partial<ModelState['disposition']>;
  [ModelActionTypes.UPDATE_SENSITIVITY]: Partial<ModelState['sensitivity']>;
  [ModelActionTypes.UPDATE_VALIDATION]: Partial<ModelState['validation']>;
  [ModelActionTypes.SET_ACTIVE_TAB]: string;
  [ModelActionTypes.SET_DIRTY_FIELDS]: Partial<Record<keyof ModelState['navigation']['dirtyFields'], boolean>>;
  [ModelActionTypes.UPDATE_LAST_SAVED]: string;
  [ModelActionTypes.RESET_MODEL]: undefined;
}

export type ModelActions = ActionMap<ModelPayloads>[keyof ActionMap<ModelPayloads>];

// The main reducer function
export const modelReducer = (state: ModelState, action: ModelActions): ModelState => {
  switch (action.type) {
    case ModelActionTypes.UPDATE_PROPERTY:
      return {
        ...state,
        property: {
          ...state.property,
          ...action.payload
        }
      };
      
    case ModelActionTypes.UPDATE_DEVELOPMENT_COSTS:
      return {
        ...state,
        developmentCosts: {
          ...state.developmentCosts,
          ...action.payload
        }
      };
      
    case ModelActionTypes.UPDATE_TIMELINE:
      return {
        ...state,
        timeline: {
          ...state.timeline,
          ...action.payload
        }
      };
      
    case ModelActionTypes.UPDATE_EXPENSES:
      return {
        ...state,
        expenses: {
          ...state.expenses,
          ...action.payload
        }
      };
      
    case ModelActionTypes.UPDATE_REVENUE:
      return {
        ...state,
        revenue: {
          ...state.revenue,
          ...action.payload
        }
      };
      
    case ModelActionTypes.UPDATE_FINANCING:
      return {
        ...state,
        financing: {
          ...state.financing,
          ...action.payload
        }
      };
      
    case ModelActionTypes.UPDATE_DISPOSITION:
      return {
        ...state,
        disposition: {
          ...state.disposition,
          ...action.payload
        }
      };
      
    case ModelActionTypes.UPDATE_SENSITIVITY:
      return {
        ...state,
        sensitivity: {
          ...state.sensitivity,
          ...action.payload
        }
      };
      
    case ModelActionTypes.UPDATE_VALIDATION:
      return {
        ...state,
        validation: {
          ...state.validation,
          ...action.payload
        }
      };
      
    case ModelActionTypes.SET_ACTIVE_TAB:
      return {
        ...state,
        navigation: {
          ...state.navigation,
          activeTab: action.payload
        }
      };
      
    case ModelActionTypes.SET_DIRTY_FIELDS:
      return {
        ...state,
        navigation: {
          ...state.navigation,
          dirtyFields: {
            ...state.navigation.dirtyFields,
            ...action.payload
          }
        }
      };
      
    case ModelActionTypes.UPDATE_LAST_SAVED:
      return {
        ...state,
        lastSaved: action.payload
      };
      
    case ModelActionTypes.RESET_MODEL:
      return {
        ...state,
        // Reset all fields but keep navigation state
        navigation: state.navigation
      };
      
    default:
      return state;
  }
};
