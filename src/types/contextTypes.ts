
import { ModelState, ValidationError } from './modelTypes';
import { Dispatch } from 'react';

// Define generic action interface
export interface Action<T = string, P = any> {
  type: T;
  payload?: P;
}

// Model section updaters
export type SectionUpdater<T extends keyof Omit<ModelState, 'validation' | 'navigation' | 'lastSaved'>> = {
  data: ModelState[T];
  update: (updates: Partial<ModelState[T]>) => void;
  validation: ValidationError[];
  isDirty: boolean;
  resetDirty: () => void;
};

// Navigation state
export type NavigationContextType = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  dirtyFields: ModelState['navigation']['dirtyFields'];
  hasDirtyFields: boolean;
  navigateWithConfirmation: (tab: string) => void;
};

// Save state
export type SaveContextType = {
  saveModel: () => void;
  lastSaved: string | null;
  formattedLastSaved: string;
  isSaving?: boolean;
  handleSave?: () => void;
};
