
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { debounce } from '../utils/debounce';
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/localStorage';
import { ModelState } from '../types/modelTypes';
import { modelReducer } from './modelReducer';
import { initialModelState } from './initialState';

// Create the context
type ModelContextType = {
  state: ModelState;
  dispatch: React.Dispatch<any>;
  saveModel: () => void;
};

const ModelContext = createContext<ModelContextType | undefined>(undefined);

// Local storage key
const LOCAL_STORAGE_KEY = 'real_estate_model';

// Provider component
interface ModelProviderProps {
  children: ReactNode;
}

export const ModelProvider: React.FC<ModelProviderProps> = ({ children }) => {
  // Load initial state from localStorage or use default
  const loadedState = loadFromLocalStorage<ModelState>(LOCAL_STORAGE_KEY);
  const [state, dispatch] = useReducer(modelReducer, loadedState || initialModelState);

  // Save the current state
  const saveModel = () => {
    saveToLocalStorage(LOCAL_STORAGE_KEY, state);
    dispatch({ 
      type: 'UPDATE_LAST_SAVED', 
      payload: new Date().toISOString() 
    });
  };

  // Debounced auto-save
  const debouncedSave = debounce(() => {
    saveToLocalStorage(LOCAL_STORAGE_KEY, state);
    dispatch({ 
      type: 'UPDATE_LAST_SAVED', 
      payload: new Date().toISOString() 
    });
  }, 30000); // 30 seconds

  // Auto-save effect
  useEffect(() => {
    debouncedSave();
    return () => {
      // Save on unmount
      saveToLocalStorage(LOCAL_STORAGE_KEY, state);
    };
  }, [state]);

  return (
    <ModelContext.Provider value={{ state, dispatch, saveModel }}>
      {children}
    </ModelContext.Provider>
  );
};

// Custom hook to use the context
export const useModelContext = (): ModelContextType => {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error('useModelContext must be used within a ModelProvider');
  }
  return context;
};

// Hook to access and update specific sections with validation
export const useModelSection = <T extends keyof Omit<ModelState, 'validation' | 'navigation' | 'lastSaved'>>(
  sectionName: T
) => {
  const { state, dispatch } = useModelContext();
  
  const updateSection = (updates: Partial<ModelState[T]>) => {
    dispatch({
      type: `UPDATE_${sectionName.toUpperCase()}`,
      payload: updates
    });

    // Mark section as dirty
    dispatch({
      type: 'SET_DIRTY_FIELDS',
      payload: { [sectionName]: true }
    });
  };
  
  const resetDirty = () => {
    dispatch({
      type: 'SET_DIRTY_FIELDS',
      payload: { [sectionName]: false }
    });
  };
  
  return {
    data: state[sectionName],
    update: updateSection,
    validation: state.validation[sectionName as keyof ModelState['validation']],
    isDirty: state.navigation.dirtyFields[sectionName as keyof ModelState['navigation']['dirtyFields']],
    resetDirty
  };
};

// Hook for navigation state
export const useModelNavigation = () => {
  const { state, dispatch } = useModelContext();
  
  const setActiveTab = (tab: string) => {
    dispatch({
      type: 'SET_ACTIVE_TAB',
      payload: tab
    });
  };
  
  const hasDirtyFields = Object.values(state.navigation.dirtyFields).some(Boolean);
  
  return {
    activeTab: state.navigation.activeTab,
    setActiveTab,
    dirtyFields: state.navigation.dirtyFields,
    hasDirtyFields
  };
};

// Utility hook for saving state
export const useModelSave = () => {
  const { saveModel, state } = useModelContext();
  
  return {
    saveModel,
    lastSaved: state.lastSaved,
    formattedLastSaved: state.lastSaved 
      ? new Date(state.lastSaved).toLocaleString() 
      : 'Never'
  };
};
