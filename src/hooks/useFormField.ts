
import { useState, useEffect } from 'react';
import { useModel } from '@/context/ModelContext';

export const useFormField = (initialValue: string = '', fieldName: string, sectionKey: string) => {
  const [value, setValue] = useState(initialValue);
  const { setHasUnsavedChanges } = useModel();
  const modelContext = useModel();
  
  // Initialize with value from context if available
  useEffect(() => {
    if (modelContext[sectionKey] && modelContext[sectionKey][fieldName] !== undefined) {
      setValue(modelContext[sectionKey][fieldName]);
    }
  }, [modelContext, sectionKey, fieldName]);
  
  const updateValue = (newValue: string) => {
    setValue(newValue);
    
    // Update the context if there's a setter available
    if (modelContext[sectionKey]) {
      const setterName = `set${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`;
      if (typeof modelContext[sectionKey][setterName] === 'function') {
        modelContext[sectionKey][setterName](newValue);
        setHasUnsavedChanges(true);
        console.log(`[${sectionKey}.${fieldName}] updated:`, newValue);
      } else {
        console.error(`No setter found for field: ${sectionKey}.${setterName}`);
      }
    } else {
      console.error(`Section ${sectionKey} not found in model context`);
    }
  };
  
  return { value, updateValue };
};
