import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FloorPlateTemplate } from "@/hooks/usePropertyState";
import { createBulkFloors } from "@/utils/floorManagement";
import { Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProject } from "@/context/ProjectContext";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface BulkAddFloorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: FloorPlateTemplate[];
  projectId: string;
  onComplete: () => Promise<void>;
}

const BulkAddFloorsModal = ({
  isOpen,
  onClose,
  templates,
  projectId,
  onComplete,
}: BulkAddFloorsModalProps) => {
  // Project context as backup
  const { currentProjectId } = useProject();
  
  // Simple state management with direct values
  const [templateId, setTemplateId] = useState(templates.length > 0 ? templates[0].id : "");
  const [startFloor, setStartFloor] = useState(1);
  const [endFloor, setEndFloor] = useState(5);
  const [labelPrefix, setLabelPrefix] = useState("Floor");
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Use project ID from props or fall back to context
  const effectiveProjectId = projectId || currentProjectId;
  
  useEffect(() => {
    // Reset template selection when templates change
    if (templates.length > 0 && !templates.find(t => t.id === templateId)) {
      console.log("Resetting template selection to first available template");
      setTemplateId(templates[0].id);
    }
  }, [templates, templateId]);
  
  // Generate preview of floors to be created
  const previewFloors = () => {
    const floors = [];
    if (startFloor <= endFloor) {
      for (let i = startFloor; i <= endFloor; i++) {
        floors.push(`${labelPrefix} ${i}`);
      }
    }
    return floors;
  };

  // Perform basic validation
  const isValid = () => {
    if (!templateId) return false;
    if (!labelPrefix.trim()) return false;
    if (endFloor < startFloor) return false;
    if (endFloor - startFloor > 100) return false;
    if (!effectiveProjectId) return false;
    return true;
  };
  
  // Handle input changes for floor numbers
  const handleFloorNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const value = e.target.value;
    
    // Allow empty string (for deletion purposes) or valid numbers including negative
    if (value === '' || value === '-') {
      // Set to empty string temporarily in the input, but keep the state as a number
      e.target.value = value;
      
      // If user is typing a minus sign, prepare for a negative number
      // but don't update state yet until they type a digit
      if (value === '-') {
        return;
      }
      
      // If field is empty, default to 0
      setter(0);
      return;
    }
    
    // Check if the input is a valid number (can be negative)
    const parsedValue = parseInt(value, 10);
    if (!isNaN(parsedValue)) {
      setter(parsedValue);
    }
  };
  
  // Directly fetch fresh floors from the database
  const fetchFreshFloors = async () => {
    console.log("Explicitly fetching fresh floors from database");
    if (!effectiveProjectId) {
      console.error("Cannot fetch floors - missing project ID");
      return null;
    }
    
    try {
      const { data: freshFloors, error } = await supabase
        .from('floors')
        .select('*')
        .eq('project_id', effectiveProjectId)
        .order('position', { ascending: false });
        
      if (error) {
        console.error("Error fetching fresh floors:", error);
        return null;
      }
      
      console.log("Fresh floors fetched successfully:", freshFloors);
      return freshFloors;
    } catch (e) {
      console.error("Exception fetching fresh floors:", e);
      return null;
    }
  };

  // Simple direct handler for floor creation with enhanced logging
  const handleCreateFloors = async () => {
    // Clear previous errors
    setErrorMessage(null);
    
    // Double-check project ID
    if (!effectiveProjectId) {
      console.error("Missing project ID for floor creation");
      setErrorMessage("Project ID is missing. Please reload the page and try again.");
      return;
    }
    
    console.log("======== FLOOR CREATION PROCESS START ========");
    console.log("Creating floors with the following values:");
    console.log("- Project ID:", effectiveProjectId);
    console.log("- Template ID:", templateId);
    console.log("- Start Floor:", startFloor);
    console.log("- End Floor:", endFloor);
    console.log("- Label Prefix:", labelPrefix);
    
    // Set loading state
    setIsCreating(true);
    
    try {
      // Call the floor creation function
      const result = await createBulkFloors(
        effectiveProjectId,
        templateId,
        startFloor,
        endFloor,
        labelPrefix
      );
      
      console.log("Floor creation completed, result:", result);
      
      // Show success message
      toast.success(`Created ${endFloor - startFloor + 1} floors successfully`);
      
      // Explicitly fetch fresh floors to verify they were created
      const freshFloors = await fetchFreshFloors();
      console.log("Floors in database after creation:", freshFloors);
      
      // Refresh data with explicit logging
      console.log("Calling onComplete() to refresh UI data");
      await onComplete();
      console.log("onComplete() finished execution");
      
      // Close modal
      console.log("Closing modal");
      onClose();
      console.log("Modal closed");
      
      // Add a delayed second refresh as a fallback
      setTimeout(async () => {
        console.log("Executing delayed second refresh");
        await onComplete();
        console.log("Delayed refresh complete");
      }, 1000);
      
    } catch (error) {
      console.error("Error creating bulk floors:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to create floors");
      toast.error("Failed to create floors");
    } finally {
      setIsCreating(false);
      console.log("======== FLOOR CREATION PROCESS END ========");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Multiple Floors</DialogTitle>
          <DialogDescription>
            Create multiple floors with the same template in one operation.
          </DialogDescription>
        </DialogHeader>
        
        {errorMessage && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template">Floor Template</Label>
            <Select
              value={templateId}
              onValueChange={setTemplateId}
              disabled={isCreating || templates.length === 0}
            >
              <SelectTrigger id="template">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.length > 0 ? (
                  templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No templates available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="startFloor">Start Floor Number</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">Negative numbers represent underground floors</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="startFloor"
                value={startFloor.toString()}
                onChange={(e) => handleFloorNumberChange(e, setStartFloor)}
                disabled={isCreating}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endFloor">End Floor Number</Label>
              <Input
                id="endFloor"
                value={endFloor.toString()}
                onChange={(e) => handleFloorNumberChange(e, setEndFloor)}
                disabled={isCreating}
              />
              {endFloor < startFloor && (
                <p className="text-sm text-red-500 mt-1">
                  End floor must be greater than or equal to start floor
                </p>
              )}
              {(endFloor - startFloor) > 100 && (
                <p className="text-sm text-red-500 mt-1">
                  Cannot create more than 100 floors at once
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="labelPrefix">Floor Label Prefix</Label>
            <Input
              id="labelPrefix"
              value={labelPrefix}
              onChange={(e) => setLabelPrefix(e.target.value)}
              disabled={isCreating}
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: "{labelPrefix} -1", "{labelPrefix} 1", etc.
            </p>
          </div>
          
          {effectiveProjectId && (
            <div className="text-xs text-gray-500">
              Floors will be created for project ID: {effectiveProjectId}
            </div>
          )}
          
          {previewFloors().length > 0 && (
            <div className="border rounded-md p-3 mt-2 bg-gray-50">
              <Label className="mb-2 block">Preview ({previewFloors().length} floors)</Label>
              <div className="text-sm text-gray-600 max-h-24 overflow-y-auto">
                {previewFloors().map((floor, index) => (
                  <div key={index} className="mb-1">
                    {floor}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <DialogFooter className="pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              type="button" 
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateFloors}
              disabled={!isValid() || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Floors"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkAddFloorsModal;
