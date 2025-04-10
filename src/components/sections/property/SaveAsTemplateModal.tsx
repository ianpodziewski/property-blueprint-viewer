
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  onComplete: () => Promise<void>;
  sourceFloor: Floor;
  projectId: string;
}

const SaveAsTemplateModal = ({
  isOpen,
  onClose,
  onComplete,
  sourceFloor,
  projectId,
}: SaveAsTemplateModalProps) => {
  const [templateName, setTemplateName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const handleClose = () => {
    setTemplateName("");
    setIsSaving(false);
    onClose();
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }
    
    setIsSaving(true);
    try {
      // Since the createFloorUsageTemplate function was removed, 
      // we'll implement similar functionality directly
      const templateId = crypto.randomUUID();
      
      // First, fetch the source floor's template to get area info
      const { data: sourceTemplate, error: templateFetchError } = await supabase
        .from('floor_plate_templates')
        .select('area, width, length')
        .eq('id', sourceFloor.templateId)
        .single();
      
      if (templateFetchError) {
        throw templateFetchError;
      }
      
      // Save the template details with the required area field
      const { error: templateError } = await supabase
        .from('floor_plate_templates')
        .insert({
          id: templateId,
          name: templateName.trim(),
          project_id: projectId,
          area: sourceTemplate.area || 0,
          width: sourceTemplate.width,
          length: sourceTemplate.length
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
      handleClose();
    } catch (error) {
      console.error("Error saving floor template:", error);
      toast.error("Failed to save floor template");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            Create a reusable template from this floor's unit mix
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              placeholder="Enter template name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              disabled={isSaving}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !templateName.trim()}>
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
      </DialogContent>
    </Dialog>
  );
};

export default SaveAsTemplateModal;
