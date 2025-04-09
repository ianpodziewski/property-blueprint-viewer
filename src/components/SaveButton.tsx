
import React from 'react';
import { Button } from './ui/button';
import { Save, RotateCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useSaveState } from '../hooks/useSaveState';

export const SaveButton = () => {
  const { handleSave, isSaving, timeSinceLastSave } = useSaveState();
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2"
          variant="outline"
        >
          {isSaving ? (
            <>
              <RotateCw className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save
            </>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Last saved: {timeSinceLastSave}</p>
      </TooltipContent>
    </Tooltip>
  );
};
