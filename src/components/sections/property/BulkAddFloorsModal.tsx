
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
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
  const [templateId, setTemplateId] = useState<string>(templates.length > 0 ? templates[0].id : "");
  const [startFloor, setStartFloor] = useState<number>(1);
  const [endFloor, setEndFloor] = useState<number>(5);
  const [labelPrefix, setLabelPrefix] = useState<string>("Floor");
  const [isCreating, setIsCreating] = useState(false);

  // Generate preview of floors to be created
  const previewFloors = () => {
    const floors = [];
    for (let i = startFloor; i <= endFloor; i++) {
      floors.push(`${labelPrefix} ${i}`);
    }
    return floors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!templateId) {
      toast.error("Please select a floor template");
      return;
    }
    
    if (startFloor > endFloor) {
      toast.error("Start floor number must be less than or equal to end floor number");
      return;
    }
    
    if (endFloor - startFloor > 100) {
      toast.error("Cannot create more than 100 floors at once");
      return;
    }
    
    setIsCreating(true);
    try {
      await createBulkFloors(
        projectId,
        templateId,
        startFloor,
        endFloor,
        labelPrefix
      );
      
      toast.success(`Created ${endFloor - startFloor + 1} floors successfully`);
      await onComplete();
      onClose();
    } catch (error) {
      console.error("Error creating bulk floors:", error);
      toast.error("Failed to create floors");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Multiple Floors</DialogTitle>
            <DialogDescription>
              Create multiple floors with the same template in one operation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template" className="col-span-4">
                Floor Template
              </Label>
              <Select 
                value={templateId} 
                onValueChange={setTemplateId}
                disabled={isCreating || templates.length === 0}
              >
                <SelectTrigger id="template" className="col-span-4">
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
              <div>
                <Label htmlFor="start-floor">Start Floor Number</Label>
                <Input
                  id="start-floor"
                  type="number"
                  min="1"
                  value={startFloor}
                  onChange={(e) => setStartFloor(parseInt(e.target.value) || 1)}
                  className="mt-1"
                  disabled={isCreating}
                />
              </div>
              <div>
                <Label htmlFor="end-floor">End Floor Number</Label>
                <Input
                  id="end-floor"
                  type="number"
                  min={startFloor}
                  value={endFloor}
                  onChange={(e) => setEndFloor(parseInt(e.target.value) || startFloor)}
                  className="mt-1"
                  disabled={isCreating}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="label-prefix">Floor Label Prefix</Label>
              <Input
                id="label-prefix"
                value={labelPrefix}
                onChange={(e) => setLabelPrefix(e.target.value)}
                className="mt-1"
                disabled={isCreating}
              />
            </div>
            
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} type="button" disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || templates.length === 0}>
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
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BulkAddFloorsModal;
