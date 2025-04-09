
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
import { Floor } from "@/hooks/usePropertyState";
import { createFloorUsageTemplate } from "@/utils/floorManagement";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SaveAsTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceFloor: Floor | null;
  projectId: string;
  onComplete: () => Promise<void>;
}

const SaveAsTemplateModal = ({
  isOpen,
  onClose,
  sourceFloor,
  projectId,
  onComplete,
}: SaveAsTemplateModalProps) => {
  const [templateName, setTemplateName] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sourceFloor) {
      toast.error("Source floor not specified");
      return;
    }
    
    if (!templateName.trim()) {
      toast.error("Template name is required");
      return;
    }
    
    setIsSaving(true);
    try {
      await createFloorUsageTemplate(
        projectId,
        templateName.trim(),
        sourceFloor.templateId,
        sourceFloor.id
      );
      
      toast.success(`Saved template "${templateName}" successfully`);
      await onComplete();
      onClose();
      setTemplateName("");
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Save Floor as Template</DialogTitle>
            <DialogDescription>
              {sourceFloor ? (
                <>Save the configuration of "{sourceFloor.label}" as a reusable template.</>
              ) : (
                <>Select a floor to save as a template.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="mt-1"
                placeholder="Enter a name for this template"
                disabled={isSaving}
                required
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} type="button" disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !sourceFloor || !templateName.trim()}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Template"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SaveAsTemplateModal;
