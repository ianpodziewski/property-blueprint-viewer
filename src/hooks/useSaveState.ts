
import { useState, useEffect, useCallback } from 'react';
import { useModelSave } from '../state/modelContext';
import { toast } from '../components/ui/use-toast';

export const useSaveState = () => {
  const { saveModel, lastSaved, formattedLastSaved } = useModelSave();
  const [isSaving, setIsSaving] = useState(false);
  
  // Handle manual save
  const handleSave = useCallback(() => {
    setIsSaving(true);
    
    // Small timeout to show the saving indicator
    setTimeout(() => {
      saveModel();
      setIsSaving(false);
      
      toast({
        title: "Changes Saved",
        description: "Your model has been saved successfully.",
      });
    }, 300);
  }, [saveModel]);
  
  // Format time since last save
  const getTimeSinceLastSave = useCallback(() => {
    if (!lastSaved) return 'Never saved';
    
    const lastSavedDate = new Date(lastSaved);
    const now = new Date();
    const diffMs = now.getTime() - lastSavedDate.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minutes ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
    return `${Math.floor(diffSec / 86400)} days ago`;
  }, [lastSaved]);
  
  const [timeSinceLastSave, setTimeSinceLastSave] = useState(getTimeSinceLastSave());
  
  // Update the time since last save every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSinceLastSave(getTimeSinceLastSave());
    }, 60000);
    
    return () => clearInterval(interval);
  }, [getTimeSinceLastSave]);
  
  return {
    handleSave,
    isSaving,
    lastSaved,
    formattedLastSaved,
    timeSinceLastSave
  };
};
