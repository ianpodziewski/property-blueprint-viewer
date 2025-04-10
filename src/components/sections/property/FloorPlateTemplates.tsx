import { useState } from "react";
import { PlusCircle, Pencil, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FloorPlateTemplate } from "@/hooks/usePropertyState";

const formatNumber = (num: number | undefined): string => {
  return num === undefined || isNaN(num) ? "" : num.toLocaleString('en-US');
};

// Define props interface for the component
interface FloorPlateTemplatesProps {
  templates: FloorPlateTemplate[];
  onAddTemplate: (template: Omit<FloorPlateTemplate, 'id'>) => Promise<FloorPlateTemplate | null>;
  onUpdateTemplate: (id: string, updates: Partial<Omit<FloorPlateTemplate, 'id'>>) => Promise<boolean>;
  onDeleteTemplate: (id: string) => Promise<boolean>;
}

const FloorPlateTemplates = ({ 
  templates, 
  onAddTemplate, 
  onUpdateTemplate, 
  onDeleteTemplate 
}: FloorPlateTemplatesProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<FloorPlateTemplate | null>(null);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [templateName, setTemplateName] = useState("");
  const [templateWidth, setTemplateWidth] = useState("");
  const [templateLength, setTemplateLength] = useState("");
  const [templateGrossArea, setTemplateGrossArea] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Debug logging to track template state
  console.log("FloorPlateTemplates rendering with templates:", templates);
  
  // Check if template name already exists
  const isNameDuplicate = (name: string, excludeId?: string): boolean => {
    return templates.some(
      template => template.name.toLowerCase() === name.toLowerCase() && template.id !== excludeId
    );
  };
  
  // Handle opening the add template dialog
  const handleAddTemplate = () => {
    resetForm();
    setEditingTemplate(null);
    setIsDialogOpen(true);
  };
  
  // Handle opening the edit template dialog
  const handleEditTemplate = (template: FloorPlateTemplate) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateWidth(template.width ? String(template.width) : "");
    setTemplateLength(template.length ? String(template.length) : "");
    setTemplateGrossArea(String(template.grossArea));
    setIsDialogOpen(true);
  };
  
  // Handle opening the delete confirmation dialog
  const handleDeleteConfirm = (id: string) => {
    setDeleteTemplateId(id);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle deleting a template
  const handleDeleteTemplate = async () => {
    if (deleteTemplateId) {
      setIsSubmitting(true);
      const success = await onDeleteTemplate(deleteTemplateId);
      setIsSubmitting(false);
      
      if (success) {
        setIsDeleteDialogOpen(false);
        setDeleteTemplateId(null);
      }
    }
  };
  
  // Reset form fields
  const resetForm = () => {
    setTemplateName("");
    setTemplateWidth("");
    setTemplateLength("");
    setTemplateGrossArea("");
    setFormErrors({});
  };
  
  // Automatically calculate gross area when width and length are provided
  const calculateGrossArea = () => {
    const width = parseFloat(templateWidth);
    const length = parseFloat(templateLength);
    
    if (!isNaN(width) && !isNaN(length)) {
      const area = width * length;
      setTemplateGrossArea(String(Math.round(area)));
    }
  };
  
  // Handle width change
  const handleWidthChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    setTemplateWidth(numericValue);
    
    if (numericValue && templateLength) {
      calculateGrossArea();
    }
  };
  
  // Handle length change
  const handleLengthChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    setTemplateLength(numericValue);
    
    if (numericValue && templateWidth) {
      calculateGrossArea();
    }
  };
  
  // Handle gross area change
  const handleGrossAreaChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setTemplateGrossArea(numericValue);
  };
  
  // Validate form inputs
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!templateName.trim()) {
      errors.name = "Template name is required";
    } else if (isNameDuplicate(templateName, editingTemplate?.id)) {
      errors.name = "A template with this name already exists";
    }
    
    if (templateWidth && isNaN(parseFloat(templateWidth))) {
      errors.width = "Width must be a number";
    }
    
    if (templateLength && isNaN(parseFloat(templateLength))) {
      errors.length = "Length must be a number";
    }
    
    if (!templateGrossArea) {
      errors.grossArea = "Gross area is required";
    } else if (isNaN(parseFloat(templateGrossArea))) {
      errors.grossArea = "Gross area must be a number";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle saving a template
  const handleSaveTemplate = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      
      const templateData = {
        name: templateName.trim(),
        width: templateWidth ? parseFloat(templateWidth) : undefined,
        length: templateLength ? parseFloat(templateLength) : undefined,
        grossArea: parseFloat(templateGrossArea)
      };
      
      let success = false;
      
      if (editingTemplate) {
        success = await onUpdateTemplate(editingTemplate.id, templateData);
      } else {
        const result = await onAddTemplate(templateData);
        success = !!result;
      }
      
      setIsSubmitting(false);
      
      if (success) {
        setIsDialogOpen(false);
        resetForm();
      }
    }
  };
  
  return (
    <>
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex-1"></div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddTemplate}
          >
            <PlusCircle className="h-4 w-4 mr-1" /> Add Template
          </Button>
        </div>
        
        <div className="pt-2">
          {templates.length === 0 ? (
            <Card className="bg-gray-50 border border-dashed border-gray-200">
              <CardContent className="py-6 flex flex-col items-center justify-center text-center">
                <p className="text-gray-500 mb-4">No floor plate templates yet</p>
                <Button variant="outline" size="sm" onClick={handleAddTemplate}>
                  <PlusCircle className="h-4 w-4 mr-1" /> Add your first template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {templates.map((template) => (
                <Card key={template.id} className="bg-white">
                  <CardContent className="py-3 px-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-gray-500">
                        {template.width && template.length 
                          ? `${template.width}' × ${template.length}' = ${formatNumber(template.grossArea)} sf` 
                          : `${formatNumber(template.grossArea)} sf`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0" 
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-500" 
                        onClick={() => handleDeleteConfirm(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Add/Edit Template Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Template" : "Add Template"}</DialogTitle>
            <DialogDescription>
              {editingTemplate 
                ? "Modify the floor plate template details"
                : "Create a new floor plate template"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Residential Floor, Retail Level, etc."
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && (
                <div className="text-xs text-red-500">{formErrors.name}</div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template-width">Width (ft)</Label>
                <Input
                  id="template-width"
                  value={templateWidth}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  placeholder="Optional"
                  className={formErrors.width ? "border-red-500" : ""}
                />
                {formErrors.width && (
                  <div className="text-xs text-red-500">{formErrors.width}</div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="template-length">Length (ft)</Label>
                <Input
                  id="template-length"
                  value={templateLength}
                  onChange={(e) => handleLengthChange(e.target.value)}
                  placeholder="Optional"
                  className={formErrors.length ? "border-red-500" : ""}
                />
                {formErrors.length && (
                  <div className="text-xs text-red-500">{formErrors.length}</div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template-gross-area">
                Gross Area (sf)
                {templateWidth && templateLength ? (
                  <span className="ml-2 text-xs text-gray-500">(Calculated)</span>
                ) : null}
              </Label>
              <Input
                id="template-gross-area"
                value={templateGrossArea}
                onChange={(e) => handleGrossAreaChange(e.target.value)}
                placeholder="Enter area"
                className={`${formErrors.grossArea ? "border-red-500" : ""} ${
                  templateWidth && templateLength ? "bg-gray-50" : ""
                }`}
              />
              {formErrors.grossArea && (
                <div className="text-xs text-red-500">{formErrors.grossArea}</div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button onClick={handleSaveTemplate} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">◌</span> 
                  {editingTemplate ? "Updating..." : "Saving..."}
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" /> {editingTemplate ? "Update" : "Save"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this floor plate template? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTemplate} 
              className="bg-red-500 hover:bg-red-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">◌</span> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FloorPlateTemplates;
