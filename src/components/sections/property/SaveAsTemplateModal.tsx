
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
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
      // Since the createFloorUsageTemplate function was removed, 
      // we'll implement similar functionality directly
      const templateId = crypto.randomUUID();
      
      // Save the template details first
      const { error: templateError } = await supabase
        .from('floor_plate_templates')
        .insert({
          id: templateId,
          name: templateName.trim(),
          project_id: projectId
        });
      
      if (templateError) {
        throw templateError;
      }
      
      // Get unit allocations from the source floor
      const { data: allocations, error: allocError } = await supabase
        .from('unit_allocations')
        .select('unit_type_id, quantity')
        .eq('floor_id', sourceFloor.id);
      
      if (allocError) {
        throw allocError;
      }
      
      // If there are allocations, duplicate them for the new template
      if (allocations && allocations.length > 0) {
        // Create new floor to hold the allocations
        const newFloorId = crypto.randomUUID();
        const { error: floorError } = await supabase
          .from('floors')
          .insert({
            id: newFloorId,
            project_id: projectId,
            label: `Template: ${templateName}`,
            position: 0, // Not displayed in UI
            template_id: templateId
          });
          
        if (floorError) {
          throw floorError;
        }
        
        // Duplicate the allocations for the new template floor
        const newAllocations = allocations.map(alloc => ({
          floor_id: newFloorId,
          unit_type_id: alloc.unit_type_id,
          quantity: alloc.quantity
        }));
        
        const { error: allocInsertError } = await supabase
          .from('unit_allocations')
          .insert(newAllocations);
        
        if (allocInsertError) {
          throw allocInsertError;
        }
      }
      
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
