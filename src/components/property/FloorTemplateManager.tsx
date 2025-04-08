import { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Edit, Copy, Plus, Trash, AlertTriangle, Loader, CheckCircle } from "lucide-react";
import { FloorPlateTemplate } from "@/types/propertyTypes";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface FloorTemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
  templates: FloorPlateTemplate[];
  addTemplate: (template: Omit<FloorPlateTemplate, "id">) => void;
  updateTemplate: (id: string, template: Partial<FloorPlateTemplate>) => void;
  removeTemplate: (id: string) => void;
}

interface TemplateFormData {
  id?: string;
  name: string;
  squareFootage: string;
  floorToFloorHeight: string;
  primaryUse: string;
  efficiencyFactor: string;
  corePercentage: string;
  description: string;
}

const defaultTemplateData: TemplateFormData = {
  name: "",
  squareFootage: "10000",
  floorToFloorHeight: "12",
  primaryUse: "office",
  efficiencyFactor: "85",
  corePercentage: "15",
  description: ""
};

const FloorTemplateManager = ({
  isOpen,
  onClose,
  templates,
  addTemplate,
  updateTemplate,
  removeTemplate
}: FloorTemplateManagerProps) => {
  const { toast } = useToast();
  
  const [editMode, setEditMode] = useState<"create" | "edit" | "view">("view");
  const [currentTemplate, setCurrentTemplate] = useState<TemplateFormData>(defaultTemplateData);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasFormErrors, setHasFormErrors] = useState(false);
  const [validationMessages, setValidationMessages] = useState<{[key: string]: string}>({});
  const [saveSuccessful, setSaveSuccessful] = useState(false);
  
  const [formModified, setFormModified] = useState(false);
  const originalTemplateRef = useRef<TemplateFormData>(defaultTemplateData);

  useEffect(() => {
    if (isOpen) {
      setEditMode("view");
      setCurrentTemplate(defaultTemplateData);
      setFormModified(false);
      setSaveSuccessful(false);
      setHasFormErrors(false);
      setValidationMessages({});
      originalTemplateRef.current = {...defaultTemplateData};
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      setDeleteConfirmOpen(false);
      setTemplateToDelete(null);
      setSelectedTemplateId(null);
      setIsProcessing(false);
      setHasFormErrors(false);
      setValidationMessages({});
      setFormModified(false);
      setSaveSuccessful(false);
    };
  }, []);

  const validateTemplateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!currentTemplate.name.trim()) {
      errors.name = "Template name is required";
    }
    
    if (!currentTemplate.squareFootage || parseFloat(currentTemplate.squareFootage) <= 0) {
      errors.squareFootage = "Valid square footage is required";
    }
    
    if (!currentTemplate.floorToFloorHeight || parseFloat(currentTemplate.floorToFloorHeight) <= 0) {
      errors.floorToFloorHeight = "Valid floor height is required";
    }
    
    if (!currentTemplate.primaryUse) {
      errors.primaryUse = "Primary use is required";
    }
    
    if (!currentTemplate.efficiencyFactor || 
        parseFloat(currentTemplate.efficiencyFactor) < 0 || 
        parseFloat(currentTemplate.efficiencyFactor) > 100) {
      errors.efficiencyFactor = "Efficiency factor must be between 0-100%";
    }
    
    setValidationMessages(errors);
    setHasFormErrors(Object.keys(errors).length > 0);
    
    return Object.keys(errors).length === 0;
  };

  const handleCreateNew = useCallback(() => {
    const newTemplate = {
      name: "",
      squareFootage: "10000",
      floorToFloorHeight: "12",
      primaryUse: "office",
      efficiencyFactor: "85",
      corePercentage: "15",
      description: ""
    };
    
    setCurrentTemplate(newTemplate);
    originalTemplateRef.current = {...newTemplate};
    setFormModified(false);
    setEditMode("create");
    setSaveSuccessful(false);
    setHasFormErrors(false);
    setValidationMessages({});
  }, []);

  const handleEdit = useCallback((template: FloorPlateTemplate) => {
    const templateToEdit = {
      id: template.id,
      name: template.name,
      squareFootage: template.squareFootage,
      floorToFloorHeight: template.floorToFloorHeight || "12",
      primaryUse: template.primaryUse || "office",
      efficiencyFactor: template.efficiencyFactor || "85",
      corePercentage: template.corePercentage || "15",
      description: template.description || ""
    };
    
    setCurrentTemplate(templateToEdit);
    originalTemplateRef.current = {...templateToEdit};
    setFormModified(false);
    setEditMode("edit");
    setSaveSuccessful(false);
    setHasFormErrors(false);
    setValidationMessages({});
  }, []);

  const handleDuplicate = useCallback((template: FloorPlateTemplate) => {
    const duplicatedTemplate = {
      name: `${template.name} (Copy)`,
      squareFootage: template.squareFootage,
      floorToFloorHeight: template.floorToFloorHeight || "12",
      primaryUse: template.primaryUse || "office",
      efficiencyFactor: template.efficiencyFactor || "85",
      corePercentage: template.corePercentage || "15",
      description: template.description || ""
    };
    
    setCurrentTemplate(duplicatedTemplate);
    originalTemplateRef.current = {...duplicatedTemplate};
    setFormModified(false);
    setEditMode("create");
    setSaveSuccessful(false);
    setHasFormErrors(false);
    setValidationMessages({});
  }, []);

  const handleDelete = useCallback((templateId: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    setTemplateToDelete(templateId);
    setDeleteConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!templateToDelete) return;
    
    setIsProcessing(true);
    
    try {
      if (selectedTemplateId === templateToDelete) {
        setSelectedTemplateId(null);
      }
      
      removeTemplate(templateToDelete);
      
      toast({
        title: "Template deleted",
        description: "The floor template has been successfully removed.",
      });
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "Failed to delete the template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmOpen(false);
      setTemplateToDelete(null);
      setIsProcessing(false);
    }
  }, [templateToDelete, selectedTemplateId, removeTemplate, toast]);

  const cancelDelete = useCallback(() => {
    setDeleteConfirmOpen(false);
    setTemplateToDelete(null);
  }, []);

  const handleSave = useCallback(() => {
    if (!validateTemplateForm()) {
      toast({
        title: "Validation Error",
        description: "Please check the form for errors and try again.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    setSaveSuccessful(false);
    
    try {
      const templateToSave = {
        name: currentTemplate.name,
        squareFootage: currentTemplate.squareFootage,
        floorToFloorHeight: currentTemplate.floorToFloorHeight,
        primaryUse: currentTemplate.primaryUse,
        efficiencyFactor: currentTemplate.efficiencyFactor,
        corePercentage: currentTemplate.corePercentage,
        description: currentTemplate.description
      };
      
      if (editMode === "create") {
        addTemplate(templateToSave);
        toast({
          title: "Template created",
          description: "New floor template has been created successfully.",
        });
      } else if (editMode === "edit" && currentTemplate.id) {
        updateTemplate(currentTemplate.id, templateToSave);
        toast({
          title: "Template updated",
          description: "The floor template has been updated successfully.",
        });
      }
      
      setSaveSuccessful(true);
      setFormModified(false);
      setTimeout(() => {
        setEditMode("view");
      }, 800);
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save the template. Please try again.",
        variant: "destructive",
      });
      setSaveSuccessful(false);
    } finally {
      setIsProcessing(false);
    }
  }, [editMode, currentTemplate, addTemplate, updateTemplate, toast, validateTemplateForm]);

  const handleCancel = useCallback(() => {
    if (formModified) {
      if (window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
        setEditMode("view");
        setCurrentTemplate(defaultTemplateData);
        setFormModified(false);
        setHasFormErrors(false);
        setValidationMessages({});
      }
    } else {
      setEditMode("view");
      setCurrentTemplate(defaultTemplateData);
      setHasFormErrors(false);
      setValidationMessages({});
    }
  }, [formModified]);

  const handleTemplateSelect = useCallback((templateId: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setSelectedTemplateId(templateId === selectedTemplateId ? null : templateId);
  }, [selectedTemplateId]);

  const handleModalClose = useCallback(() => {
    if (isProcessing) return;
    
    if (editMode !== "view" && formModified) {
      if (confirm("You have unsaved changes. Are you sure you want to close?")) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [onClose, editMode, isProcessing, formModified]);

  const handleInputChange = useCallback((
    field: keyof TemplateFormData,
    value: string
  ) => {
    setCurrentTemplate(prev => ({ ...prev, [field]: value }));
    
    if (!formModified) {
      setFormModified(true);
    }
    
    if (validationMessages[field]) {
      setValidationMessages(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
      
      if (Object.keys(validationMessages).length <= 1) {
        setHasFormErrors(false);
      }
    }
  }, [formModified, validationMessages]);

  const renderForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="template-name">Template Name</Label>
        <Input
          id="template-name"
          value={currentTemplate.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Standard Office Floor"
          disabled={isProcessing}
          className={validationMessages.name ? "border-red-500" : ""}
          aria-invalid={!!validationMessages.name}
        />
        {validationMessages.name && (
          <p className="text-xs text-red-500 mt-1">{validationMessages.name}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="template-area">Gross Area (sq ft)</Label>
          <Input
            id="template-area"
            type="number"
            value={currentTemplate.squareFootage}
            onChange={(e) => handleInputChange('squareFootage', e.target.value)}
            placeholder="10000"
            disabled={isProcessing}
            className={validationMessages.squareFootage ? "border-red-500" : ""}
            aria-invalid={!!validationMessages.squareFootage}
          />
          {validationMessages.squareFootage && (
            <p className="text-xs text-red-500 mt-1">{validationMessages.squareFootage}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="template-height">Floor-to-Floor Height (ft)</Label>
          <Input
            id="template-height"
            type="number"
            value={currentTemplate.floorToFloorHeight}
            onChange={(e) => handleInputChange('floorToFloorHeight', e.target.value)}
            placeholder="12"
            disabled={isProcessing}
            className={validationMessages.floorToFloorHeight ? "border-red-500" : ""}
            aria-invalid={!!validationMessages.floorToFloorHeight}
          />
          {validationMessages.floorToFloorHeight && (
            <p className="text-xs text-red-500 mt-1">{validationMessages.floorToFloorHeight}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="template-use">Primary Use</Label>
          <Select
            value={currentTemplate.primaryUse}
            onValueChange={(value) => handleInputChange('primaryUse', value)}
            disabled={isProcessing}
          >
            <SelectTrigger 
              id="template-use"
              className={validationMessages.primaryUse ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select use" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="office">Office</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="parking">Parking</SelectItem>
              <SelectItem value="hotel">Hotel</SelectItem>
              <SelectItem value="amenities">Amenities</SelectItem>
              <SelectItem value="storage">Storage</SelectItem>
              <SelectItem value="mechanical">Mechanical</SelectItem>
            </SelectContent>
          </Select>
          {validationMessages.primaryUse && (
            <p className="text-xs text-red-500 mt-1">{validationMessages.primaryUse}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="template-efficiency">Efficiency Factor (%)</Label>
          <Input
            id="template-efficiency"
            type="number"
            value={currentTemplate.efficiencyFactor}
            onChange={(e) => handleInputChange('efficiencyFactor', e.target.value)}
            placeholder="85"
            disabled={isProcessing}
            min="0"
            max="100"
            className={validationMessages.efficiencyFactor ? "border-red-500" : ""}
            aria-invalid={!!validationMessages.efficiencyFactor}
          />
          {validationMessages.efficiencyFactor && (
            <p className="text-xs text-red-500 mt-1">{validationMessages.efficiencyFactor}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="template-description">Description (Optional)</Label>
        <Input
          id="template-description"
          value={currentTemplate.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Description of this template"
          disabled={isProcessing}
        />
      </div>
      
      {hasFormErrors && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm mt-4">
          <p className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Please correct the errors above before saving.
          </p>
        </div>
      )}
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          variant="outline" 
          onClick={handleCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          disabled={isProcessing || hasFormErrors}
          className={saveSuccessful ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {isProcessing ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              <span>{editMode === "create" ? "Creating..." : "Updating..."}</span>
            </>
          ) : saveSuccessful ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>Saved Successfully</span>
            </>
          ) : (
            editMode === "create" ? "Create Template" : "Update Template"
          )}
        </Button>
      </div>
      
      {editMode === "create" && (
        <div className="text-xs text-muted-foreground mt-2 text-center">
          All fields (except Description) are required.
        </div>
      )}
    </div>
  );

  const renderTemplateList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Floor Templates</h3>
        <Button 
          variant="default" 
          size="sm" 
          onClick={handleCreateNew}
          className="flex items-center gap-2"
          disabled={isProcessing}
        >
          <Plus className="h-4 w-4" /> New Template
        </Button>
      </div>
      
      {templates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No templates created yet</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={handleCreateNew}
            disabled={isProcessing}
          >
            Create Your First Template
          </Button>
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {templates.map((template) => (
              <Card 
                key={template.id} 
                className={`overflow-hidden transition-colors ${
                  selectedTemplateId === template.id ? 'border-primary' : ''
                }`}
                onClick={(e) => handleTemplateSelect(template.id, e)}
              >
                <CardContent className="p-0">
                  <div className="flex justify-between items-center p-4 cursor-pointer">
                    <div className="space-y-1">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {template.squareFootage} sq ft • {template.floorToFloorHeight || "12"}' height
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className="capitalize"
                          style={{ 
                            backgroundColor: `${getUseColor(template.primaryUse || "office")}20`,
                            borderColor: getUseColor(template.primaryUse || "office")
                          }}
                        >
                          {template.primaryUse || "office"}
                        </Badge>
                        <Badge variant="outline">
                          {template.efficiencyFactor || "85"}% efficient
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(template);
                        }}
                        className="px-2 h-8"
                        disabled={isProcessing}
                        type="button"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicate(template);
                        }}
                        className="px-2 h-8"
                        disabled={isProcessing}
                        type="button"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => handleDelete(template.id, e)}
                        className="px-2 h-8 text-red-500 hover:text-red-700"
                        disabled={isProcessing}
                        type="button"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );

  const renderTemplatePreview = () => {
    if (!selectedTemplateId) return null;
    
    const template = templates.find(t => t.id === selectedTemplateId);
    if (!template) return null;
    
    return (
      <div className="mt-6 p-4 border rounded-md">
        <h3 className="text-sm font-medium mb-3">Template Preview</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="space-y-2">
              <div className="w-full aspect-[3/2] bg-muted/30 rounded-md border flex items-center justify-center">
                <div 
                  className="w-2/3 h-3/4 rounded-md" 
                  style={{ 
                    backgroundColor: `${getUseColor(template.primaryUse || "office")}40`,
                    borderColor: getUseColor(template.primaryUse || "office"),
                    borderWidth: 1
                  }}
                ></div>
              </div>
              <div className="text-center text-sm text-muted-foreground">Visual representation</div>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium mb-2">Key Metrics</h4>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt>Gross Area:</dt>
                <dd>{parseInt(template.squareFootage).toLocaleString()} sq ft</dd>
              </div>
              <div className="flex justify-between">
                <dt>Rentable Area:</dt>
                <dd>
                  {Math.round(parseInt(template.squareFootage) * (parseInt(template.efficiencyFactor || "85") / 100)).toLocaleString()} sq ft
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Core Area:</dt>
                <dd>
                  {Math.round(parseInt(template.squareFootage) * (1 - (parseInt(template.efficiencyFactor || "85") / 100))).toLocaleString()} sq ft
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Floor Height:</dt>
                <dd>{template.floorToFloorHeight || "12"} ft</dd>
              </div>
              <div className="flex justify-between">
                <dt>Primary Use:</dt>
                <dd className="capitalize">{template.primaryUse || "office"}</dd>
              </div>
              {template.description && (
                <div className="pt-2 mt-2 border-t">
                  <dt className="mb-1">Description:</dt>
                  <dd className="text-muted-foreground">{template.description}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
        <div className="flex justify-end mt-4 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.preventDefault();
              handleEdit(template);
            }}
            className="flex items-center gap-2"
            disabled={isProcessing}
          >
            <Edit className="h-4 w-4" /> Edit Template
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.preventDefault();
              handleDuplicate(template);
            }}
            className="flex items-center gap-2"
            disabled={isProcessing}
          >
            <Copy className="h-4 w-4" /> Duplicate
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Floor Templates</DialogTitle>
            <DialogDescription>
              Create and manage floor plate templates for your building design.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {editMode === "view" ? (
              <div className="space-y-4">
                {renderTemplateList()}
                {renderTemplatePreview()}
              </div>
            ) : (
              renderForm()
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
              
              {templateToDelete && templates.some(t => t.id === templateToDelete) && (
                <div className="mt-2 font-medium">
                  "{templates.find(t => t.id === templateToDelete)?.name}"
                </div>
              )}
              
              <div className="mt-3 text-amber-600 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                <span>Floors currently using this template will not be affected.</span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete} disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive hover:bg-destructive/90"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" /> Deleting...
                </>
              ) : (
                <>
                  <Trash className="h-4 w-4 mr-2" /> Delete Template
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const getUseColor = (spaceType: string) => {
  const colors: Record<string, string> = {
    "residential": "#3B82F6",
    "office": "#10B981",
    "retail": "#F59E0B",
    "parking": "#6B7280",
    "hotel": "#8B5CF6",
    "amenities": "#EC4899",
    "storage": "#78716C",
    "mechanical": "#475569",
  };
  
  return colors[spaceType] || "#9CA3AF";
};

export default FloorTemplateManager;
