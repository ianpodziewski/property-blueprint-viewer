
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
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProject } from "@/context/ProjectContext";

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
    if (startFloor < 1) return false;
    if (endFloor < startFloor) return false;
    if (endFloor - startFloor > 100) return false;
    if (!effectiveProjectId) return false;
    return true;
  };

  // Simple direct handler for floor creation
  const handleCreateFloors = async () => {
    // Clear previous errors
    setErrorMessage(null);
    
    // Double-check project ID
    if (!effectiveProjectId) {
      setErrorMessage("Project ID is missing. Please reload the page and try again.");
      return;
    }
    
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
      await createBulkFloors(
        effectiveProjectId,
        templateId,
        startFloor,
        endFloor,
        labelPrefix
      );
      
      // Show success message
      toast.success(`Created ${endFloor - startFloor + 1} floors successfully`);
      
      // Refresh data and close modal
      await onComplete();
      onClose();
    } catch (error) {
      console.error("Error creating bulk floors:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to create floors");
      toast.error("Failed to create floors");
    } finally {
      setIsCreating(false);
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
              <Label htmlFor="startFloor">Start Floor Number</Label>
              <Input
                id="startFloor"
                type="number"
                min="1"
                value={startFloor}
                onChange={(e) => setStartFloor(parseInt(e.target.value) || 1)}
                disabled={isCreating}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endFloor">End Floor Number</Label>
              <Input
                id="endFloor"
                type="number"
                min={startFloor}
                value={endFloor}
                onChange={(e) => setEndFloor(parseInt(e.target.value) || startFloor)}
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
              Example: "{labelPrefix} 1", "{labelPrefix} 2", etc.
            </p>
          </div>
          
          {effectiveProjectId && (
            <div className="text-xs text-gray-500">
              Floors will be created for project ID: {effectiveProjectId.substring(0, 8)}...
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
