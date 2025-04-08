
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { loadFromLocalStorage, saveToLocalStorage } from '@/hooks/useLocalStoragePersistence';

// State types
export interface ModelState {
  isLoading: boolean;
  lastOperation: string | null;
  operationStatus: 'idle' | 'pending' | 'success' | 'error';
  errorMessage: string | null;
  uiLocked: boolean;
}

// Initial state
const initialState: ModelState = {
  isLoading: false,
  lastOperation: null,
  operationStatus: 'idle',
  errorMessage: null,
  uiLocked: false
};

// Action types
type ModelAction = 
  | { type: 'OPERATION_START'; payload: string }
  | { type: 'OPERATION_SUCCESS' }
  | { type: 'OPERATION_FAILURE'; payload: string }
  | { type: 'RESET_UI_STATE' }
  | { type: 'LOCK_UI' }
  | { type: 'UNLOCK_UI' };

// Reducer function
function modelReducer(state: ModelState, action: ModelAction): ModelState {
  switch (action.type) {
    case 'OPERATION_START':
      return {
        ...state,
        isLoading: true,
        lastOperation: action.payload,
        operationStatus: 'pending',
        errorMessage: null
      };
    case 'OPERATION_SUCCESS':
      return {
        ...state,
        isLoading: false,
        operationStatus: 'success'
      };
    case 'OPERATION_FAILURE':
      return {
        ...state,
        isLoading: false,
        operationStatus: 'error',
        errorMessage: action.payload
      };
    case 'RESET_UI_STATE':
      return {
        ...initialState
      };
    case 'LOCK_UI':
      return {
        ...state,
        uiLocked: true
      };
    case 'UNLOCK_UI':
      return {
        ...state,
        uiLocked: false
      };
    default:
      return state;
  }
}

// Create context
const ModelStateContext = createContext<{
  state: ModelState;
  dispatch: React.Dispatch<ModelAction>;
} | undefined>(undefined);

// Provider component
export const ModelStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(modelReducer, initialState);
  
  useEffect(() => {
    // Add a global error handler to detect and recover from UI issues
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      dispatch({ type: 'OPERATION_FAILURE', payload: event.message });
      // Attempt to recover UI state
      setTimeout(() => {
        dispatch({ type: 'RESET_UI_STATE' });
      }, 1000);
    };
    
    window.addEventListener('error', handleGlobalError);
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);
  
  const value = { state, dispatch };
  
  return (
    <ModelStateContext.Provider value={value}>
      {children}
    </ModelStateContext.Provider>
  );
};

// Custom hook to use the context
export const useModelStateContext = () => {
  const context = useContext(ModelStateContext);
  if (context === undefined) {
    throw new Error('useModelStateContext must be used within a ModelStateProvider');
  }
  return context;
};

// Helper hooks for specific operations
export const useUIRecovery = () => {
  const { state, dispatch } = useModelStateContext();
  
  const resetUIState = () => {
    dispatch({ type: 'RESET_UI_STATE' });
  };
  
  const lockUI = () => {
    dispatch({ type: 'LOCK_UI' });
  };
  
  const unlockUI = () => {
    dispatch({ type: 'UNLOCK_UI' });
  };
  
  return { 
    isUILocked: state.uiLocked,
    resetUIState,
    lockUI,
    unlockUI
  };
};

// Operation tracking and error handling hook
export const useOperationTracking = () => {
  const { state, dispatch } = useModelStateContext();
  
  const trackOperation = (operationName: string) => {
    try {
      dispatch({ type: 'OPERATION_START', payload: operationName });
      return () => dispatch({ type: 'OPERATION_SUCCESS' });
    } catch (error) {
      dispatch({ 
        type: 'OPERATION_FAILURE', 
        payload: error instanceof Error ? error.message : 'Unknown error' 
      });
      return () => {};
    }
  };
  
  return {
    isLoading: state.isLoading,
    lastOperation: state.lastOperation,
    operationStatus: state.operationStatus,
    errorMessage: state.errorMessage,
    trackOperation
  };
};
