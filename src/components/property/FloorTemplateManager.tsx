
import { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Edit, Copy, Plus, Trash, AlertTriangle, Loader, CheckCircle, RefreshCcw } from "lucide-react";
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

const getUseColor = (useType: string): string => {
  const colors: Record<string, string> = {
    "residential": "#3B82F6",
    "office": "#10B981",
    "retail": "#F59E0B",
    "parking": "#6B7280",
    "hotel": "#8B5CF6",
    "amenities": "#EC4899",
    "storage": "#78716C",
    "mechanical": "#475569"
  };
  
  return colors[useType] || "#9CA3AF";
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
  const [currentTemplate, setCurrentTemplate] = useState<TemplateFormData>({...defaultTemplateData});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasFormErrors, setHasFormErrors] = useState(false);
  const [validationMessages, setValidationMessages] = useState<{[key: string]: string}>({});
  const [saveSuccessful, setSaveSuccessful] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  
  const [formModified, setFormModified] = useState(false);
  const originalTemplateRef = useRef<TemplateFormData>({...defaultTemplateData});
  const dialogWasClosedRef = useRef<boolean>(false);
  
  const addDebugLog = (message: string) => {
    setDebugLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
    console.log(`[FloorTemplateManager] ${message}`);
  };

  useEffect(() => {
    if (isOpen) {
      setEditMode("view");
      setCurrentTemplate({...defaultTemplateData});
      setFormModified(false);
      setSaveSuccessful(false);
      setHasFormErrors(false);
      setValidationMessages({});
      originalTemplateRef.current = {...defaultTemplateData};
      setRecoveryMode(false);
      dialogWasClosedRef.current = false;
      addDebugLog("Modal opened, state reset");
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      addDebugLog("Cleanup function executed");
      setDeleteConfirmOpen(false);
      setTemplateToDelete(null);
      setSelectedTemplateId(null);
      setIsProcessing(false);
      setHasFormErrors(false);
      setValidationMessages({});
      setFormModified(false);
      setSaveSuccessful(false);
      setRecoveryMode(false);
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
    
    setCurrentTemplate({...newTemplate});
    originalTemplateRef.current = {...newTemplate};
    setFormModified(false);
    setEditMode("create");
    setSaveSuccessful(false);
    setHasFormErrors(false);
    setValidationMessages({});
    addDebugLog("Create new template mode activated with fresh template data");
  }, []);

  const handleEdit = useCallback((template: FloorPlateTemplate) => {
    const templateToEdit = {
      id: template.id,
      name: template.name || "",
      squareFootage: template.squareFootage || "10000",
      floorToFloorHeight: template.floorToFloorHeight || "12",
      primaryUse: template.primaryUse || "office",
      efficiencyFactor: template.efficiencyFactor || "85",
      corePercentage: template.corePercentage || "15",
      description: template.description || ""
    };
    
    setCurrentTemplate({...templateToEdit});
    originalTemplateRef.current = {...templateToEdit};
    setFormModified(false);
    setEditMode("edit");
    setSaveSuccessful(false);
    setHasFormErrors(false);
    setValidationMessages({});
    addDebugLog(`Edit template mode activated for template ID: ${template.id} with data: ${JSON.stringify(templateToEdit)}`);
  }, []);

  const handleDuplicate = useCallback((template: FloorPlateTemplate) => {
    const duplicatedTemplate = {
      name: `${template.name || "Template"} (Copy)`,
      squareFootage: template.squareFootage || "10000",
      floorToFloorHeight: template.floorToFloorHeight || "12",
      primaryUse: template.primaryUse || "office",
      efficiencyFactor: template.efficiencyFactor || "85",
      corePercentage: template.corePercentage || "15",
      description: template.description || ""
    };
    
    setCurrentTemplate({...duplicatedTemplate});
    originalTemplateRef.current = {...duplicatedTemplate};
    setFormModified(false);
    setEditMode("create");
    setSaveSuccessful(false);
    setHasFormErrors(false);
    setValidationMessages({});
    addDebugLog(`Duplicating template ID: ${template.id} with data: ${JSON.stringify(duplicatedTemplate)}`);
  }, []);

  const handleDelete = useCallback((templateId: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    addDebugLog(`Delete initiated for template ID: ${templateId}`);
    setTemplateToDelete(templateId);
    setDeleteConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!templateToDelete) {
      addDebugLog("Delete cancelled - no template ID");
      return;
    }
    
    addDebugLog(`Confirming deletion of template ID: ${templateToDelete}`);
    setIsProcessing(true);
    
    try {
      if (selectedTemplateId === templateToDelete) {
        addDebugLog("Deselecting template as it's being deleted");
        setSelectedTemplateId(null);
      }
      
      const templateName = templates.find(t => t.id === templateToDelete)?.name || "Template";
      
      removeTemplate(templateToDelete);
      
      toast({
        title: "Template deleted",
        description: `${templateName} has been successfully removed.`,
      });
      
      addDebugLog(`Template ID: ${templateToDelete} deleted successfully`);
      
      const tempId = templateToDelete;
      
      setDeleteConfirmOpen(false);
      setTemplateToDelete(null);
      
      setTimeout(() => {
        addDebugLog(`Post-deletion UI update for template: ${tempId}`);
        setIsProcessing(false);
      }, 50);
    } catch (error) {
      console.error("Error deleting template:", error);
      
      toast({
        title: "Error",
        description: "Failed to delete the template. Please try again or refresh.",
        variant: "destructive",
        action: (
          <Button variant="outline" size="sm" onClick={() => setRecoveryMode(true)}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Recover
          </Button>
        ),
      });
      
      addDebugLog(`Error deleting template: ${error}`);
      setIsProcessing(false);
    }
  }, [templateToDelete, selectedTemplateId, removeTemplate, toast, templates]);

  const cancelDelete = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setDeleteConfirmOpen(false);
    setTemplateToDelete(null);
    addDebugLog("Delete operation cancelled");
  }, []);

  const handleSave = useCallback(() => {
    const formState = {...currentTemplate};
    addDebugLog(`Attempting to save template with data: ${JSON.stringify(formState)}`);
    
    if (!validateTemplateForm()) {
      const validationErrors = JSON.stringify(validationMessages);
      addDebugLog(`Save failed - validation errors: ${validationErrors}`);
      
      toast({
        title: "Validation Error",
        description: "Please check the form for errors and try again.",
        variant: "destructive",
      });
      return;
    }
    
    addDebugLog("Saving template - validation passed");
    setIsProcessing(true);
    setSaveSuccessful(false);
    
    try {
      // Create a template object from the form data
      const templateToSave = {
        name: String(currentTemplate.name || ""),
        squareFootage: String(currentTemplate.squareFootage || "10000"),
        floorToFloorHeight: String(currentTemplate.floorToFloorHeight || "12"),
        primaryUse: String(currentTemplate.primaryUse || "office"),
        efficiencyFactor: String(currentTemplate.efficiencyFactor || "85"),
        corePercentage: String(currentTemplate.corePercentage || "15"),
        description: String(currentTemplate.description || "")
      };
      
      addDebugLog(`Saving template data: ${JSON.stringify(templateToSave)}`);
      
      if (editMode === "create") {
        // Pass the complete template object to addTemplate
        addTemplate(templateToSave);
        
        toast({
          title: "Template created",
          description: "New floor template has been created successfully.",
        });
        addDebugLog(`New template created successfully with data: ${JSON.stringify(templateToSave)}`);
      } else if (editMode === "edit" && currentTemplate.id) {
        updateTemplate(currentTemplate.id, {
          name: templateToSave.name,
          squareFootage: templateToSave.squareFootage,
          floorToFloorHeight: templateToSave.floorToFloorHeight,
          primaryUse: templateToSave.primaryUse,
          efficiencyFactor: templateToSave.efficiencyFactor,
          corePercentage: templateToSave.corePercentage,
          description: templateToSave.description
        });
        
        toast({
          title: "Template updated",
          description: "The floor template has been updated successfully.",
        });
        addDebugLog(`Template ID: ${currentTemplate.id} updated successfully`);
      }
      
      setSaveSuccessful(true);
      setFormModified(false);
      
      setTimeout(() => {
        setEditMode("view");
        setCurrentTemplate({...defaultTemplateData});
      }, 800);
    } catch (error) {
      console.error("Error saving template:", error);
      
      toast({
        title: "Error",
        description: "Failed to save the template. Please try again.",
        variant: "destructive",
      });
      
      setSaveSuccessful(false);
      addDebugLog(`Error saving template: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  }, [editMode, currentTemplate, addTemplate, updateTemplate, toast, validateTemplateForm, validationMessages]);

  const handleCancel = useCallback((event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (formModified) {
      if (window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
        setEditMode("view");
        setCurrentTemplate({...defaultTemplateData});
        setFormModified(false);
        setHasFormErrors(false);
        setValidationMessages({});
        addDebugLog("Cancelled with unsaved changes - changes discarded");
      } else {
        addDebugLog("Cancel declined - keeping unsaved changes");
      }
    } else {
      setEditMode("view");
      setCurrentTemplate({...defaultTemplateData});
      setHasFormErrors(false);
      setValidationMessages({});
      addDebugLog("Cancelled without unsaved changes");
    }
  }, [formModified]);

  const handleTemplateSelect = useCallback((templateId: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    addDebugLog(`Template selection changed to ID: ${templateId}`);
    setSelectedTemplateId(templateId === selectedTemplateId ? null : templateId);
  }, [selectedTemplateId]);

  const handleModalClose = useCallback(() => {
    if (isProcessing) {
      addDebugLog("Close prevented - processing in progress");
      return;
    }
    
    if (deleteConfirmOpen) {
      addDebugLog("Main modal close prevented - delete dialog is open");
      return;
    }
    
    if (editMode !== "view" && formModified) {
      if (confirm("You have unsaved changes. Are you sure you want to close?")) {
        addDebugLog("Modal closed with unsaved changes");
        dialogWasClosedRef.current = true;
        onClose();
      } else {
        addDebugLog("Modal close cancelled - unsaved changes");
      }
    } else {
      addDebugLog("Modal closed normally");
      dialogWasClosedRef.current = true;
      onClose();
    }
  }, [onClose, editMode, isProcessing, formModified, deleteConfirmOpen]);

  const handleInputChange = useCallback((
    field: keyof TemplateFormData,
    value: string
  ) => {
    addDebugLog(`Form field "${field}" changed: ${value}`);
    
    setCurrentTemplate(prev => {
      const updated = { ...prev, [field]: value };
      addDebugLog(`Updated template state: ${JSON.stringify(updated)}`);
      return updated;
    });
    
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

  const handleForceRefresh = useCallback(() => {
    addDebugLog("Force refresh triggered");
    setIsProcessing(true);
    
    setEditMode("view");
    setCurrentTemplate({...defaultTemplateData});
    setDeleteConfirmOpen(false);
    setTemplateToDelete(null);
    setSelectedTemplateId(null);
    setFormModified(false);
    setSaveSuccessful(false);
    setHasFormErrors(false);
    setValidationMessages({});
    setRecoveryMode(false);
    
    toast({
      title: "UI Refreshed",
      description: "The interface has been reset. Please try your action again.",
    });
    
    setIsProcessing(false);
    addDebugLog("Force refresh completed");
  }, [toast]);

  const renderForm = () => (
    <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
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
          onClick={(e) => handleCancel(e)}
          disabled={isProcessing}
          type="button"
        >
          Cancel
        </Button>
        <Button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSave();
          }}
          disabled={isProcessing || hasFormErrors}
          className={saveSuccessful ? "bg-green-600 hover:bg-green-700" : ""}
          type="button"
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
    <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Floor Templates</h3>
        <Button 
          variant="default" 
          size="sm" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleCreateNew();
          }}
          className="flex items-center gap-2"
          disabled={isProcessing}
          type="button"
        >
          <Plus className="h-4 w-4" /> New Template
        </Button>
      </div>
      
      {templates.length === 0 ? (
        <div className="text-center py-8" onClick={(e) => e.stopPropagation()}>
          <p className="text-muted-foreground">No templates created yet</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCreateNew();
            }}
            disabled={isProcessing}
            type="button"
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTemplateSelect(template.id, e);
                }}
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
                          e.preventDefault(); 
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
                          e.preventDefault(); 
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
      
      {recoveryMode && (
        <div className="mt-4 p-3 border border-amber-200 bg-amber-50 rounded-md">
          <p className="text-sm text-amber-700 mb-2 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Experiencing UI issues?
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleForceRefresh();
            }}
            className="w-full bg-white"
            type="button"
          >
            <RefreshCcw className="h-4 w-4 mr-2" /> Reset Interface
          </Button>
        </div>
      )}
    </div>
  );

  const renderTemplatePreview = () => {
    if (!selectedTemplateId) return null;
    
    const template = templates.find(t => t.id === selectedTemplateId);
    if (!template) return null;
    
    return (
      <div className="mt-6 p-4 border rounded-md" onClick={(e) => e.stopPropagation()}>
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
              e.stopPropagation();
              handleEdit(template);
            }}
            className="flex items-center gap-2"
            disabled={isProcessing}
            type="button"
          >
            <Edit className="h-4 w-4" /> Edit Template
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDuplicate(template);
            }}
            className="flex items-center gap-2"
            disabled={isProcessing}
            type="button"
          >
            <Copy className="h-4 w-4" /> Duplicate
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Dialog 
        open={isOpen} 
        onOpenChange={(open) => {
          if (!open && !dialogWasClosedRef.current) {
            handleModalClose();
          }
        }}
      >
        <DialogContent 
          className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" 
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>Manage Floor Templates</DialogTitle>
            <DialogDescription>
              Create and manage floor plate templates for your building design.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4" onClick={(e) => e.stopPropagation()}>
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

      <AlertDialog 
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          if (!open && !isProcessing) {
            cancelDelete();
          }
        }}
      >
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
              
              {templateToDelete && templates.some(t => t.id === templateToDelete) && (
                <div className="mt-2 font-medium">
                  "{templates.find(t => t.id === templateToDelete)?.name}"
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={(e) => {
                cancelDelete(e);
              }}
              disabled={isProcessing}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                confirmDelete(e);
              }}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isProcessing ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                'Delete Template'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FloorTemplateManager;
