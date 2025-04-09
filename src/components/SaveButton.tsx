
import { Button } from "@/components/ui/button";
import { useModel } from "@/context/ModelContext";
import { Save, RotateCw, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const SaveButton = () => {
  const { saveModel, hasUnsavedChanges, lastSaved, isAutoSaving } = useModel();
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  
  // Reset the success state after a delay
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (saveSuccess) {
      timer = setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [saveSuccess]);
  
  // Format the last saved date if available
  const lastSavedText = lastSaved 
    ? `Last saved: ${format(lastSaved, "MMM d, yyyy h:mm a")}`
    : "Not saved yet";
  
  const handleSave = () => {
    saveModel();
    setSaveSuccess(true);
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            onClick={handleSave}
            variant={hasUnsavedChanges ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-1 min-w-[80px] relative"
          >
            {isAutoSaving ? (
              <RotateCw className="h-4 w-4 animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            
            <span>Save</span>
            
            {hasUnsavedChanges && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{lastSavedText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SaveButton;
