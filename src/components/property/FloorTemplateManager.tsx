
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Edit, Copy, Plus, Trash, AlertTriangle } from "lucide-react";
import { FloorPlateTemplate } from "@/types/propertyTypes";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";

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
  const [editMode, setEditMode] = useState<"create" | "edit" | "view">("view");
  const [currentTemplate, setCurrentTemplate] = useState<TemplateFormData>(defaultTemplateData);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const handleCreateNew = () => {
    setCurrentTemplate(defaultTemplateData);
    setEditMode("create");
  };

  const handleEdit = (template: FloorPlateTemplate) => {
    setCurrentTemplate({
      id: template.id,
      name: template.name,
      squareFootage: template.squareFootage,
      floorToFloorHeight: template.floorToFloorHeight || "12",
      primaryUse: template.primaryUse || "office",
      efficiencyFactor: template.efficiencyFactor || "85",
      corePercentage: template.corePercentage || "15",
      description: template.description || ""
    });
    setEditMode("edit");
  };

  const handleDuplicate = (template: FloorPlateTemplate) => {
    setCurrentTemplate({
      name: `${template.name} (Copy)`,
      squareFootage: template.squareFootage,
      floorToFloorHeight: template.floorToFloorHeight || "12",
      primaryUse: template.primaryUse || "office",
      efficiencyFactor: template.efficiencyFactor || "85",
      corePercentage: template.corePercentage || "15",
      description: template.description || ""
    });
    setEditMode("create");
  };

  const handleDelete = (templateId: string) => {
    setTemplateToDelete(templateId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      removeTemplate(templateToDelete);
      setDeleteConfirmOpen(false);
      setTemplateToDelete(null);
    }
  };

  const handleSave = () => {
    if (editMode === "create") {
      addTemplate({
        name: currentTemplate.name || "New Template",
        squareFootage: currentTemplate.squareFootage,
        floorToFloorHeight: currentTemplate.floorToFloorHeight,
        primaryUse: currentTemplate.primaryUse,
        efficiencyFactor: currentTemplate.efficiencyFactor,
        corePercentage: currentTemplate.corePercentage,
        description: currentTemplate.description
      });
    } else if (editMode === "edit" && currentTemplate.id) {
      updateTemplate(currentTemplate.id, {
        name: currentTemplate.name || "Updated Template",
        squareFootage: currentTemplate.squareFootage,
        floorToFloorHeight: currentTemplate.floorToFloorHeight,
        primaryUse: currentTemplate.primaryUse,
        efficiencyFactor: currentTemplate.efficiencyFactor,
        corePercentage: currentTemplate.corePercentage,
        description: currentTemplate.description
      });
    }
    setEditMode("view");
  };

  const handleCancel = () => {
    setEditMode("view");
    setCurrentTemplate(defaultTemplateData);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId === selectedTemplateId ? null : templateId);
  };

  const renderForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="template-name">Template Name</Label>
        <Input
          id="template-name"
          value={currentTemplate.name}
          onChange={(e) => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
          placeholder="Standard Office Floor"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="template-area">Gross Area (sq ft)</Label>
          <Input
            id="template-area"
            type="number"
            value={currentTemplate.squareFootage}
            onChange={(e) => setCurrentTemplate({ ...currentTemplate, squareFootage: e.target.value })}
            placeholder="10000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="template-height">Floor-to-Floor Height (ft)</Label>
          <Input
            id="template-height"
            type="number"
            value={currentTemplate.floorToFloorHeight}
            onChange={(e) => setCurrentTemplate({ ...currentTemplate, floorToFloorHeight: e.target.value })}
            placeholder="12"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="template-use">Primary Use</Label>
          <Select
            value={currentTemplate.primaryUse}
            onValueChange={(value) => setCurrentTemplate({ ...currentTemplate, primaryUse: value })}
          >
            <SelectTrigger id="template-use">
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
        </div>
        <div className="space-y-2">
          <Label htmlFor="template-efficiency">Efficiency Factor (%)</Label>
          <Input
            id="template-efficiency"
            type="number"
            value={currentTemplate.efficiencyFactor}
            onChange={(e) => setCurrentTemplate({ ...currentTemplate, efficiencyFactor: e.target.value })}
            placeholder="85"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="template-description">Description (Optional)</Label>
        <Input
          id="template-description"
          value={currentTemplate.description}
          onChange={(e) => setCurrentTemplate({ ...currentTemplate, description: e.target.value })}
          placeholder="Description of this template"
        />
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          {editMode === "create" ? "Create Template" : "Update Template"}
        </Button>
      </div>
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
                onClick={() => handleTemplateSelect(template.id)}
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
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(template.id);
                        }}
                        className="px-2 h-8 text-red-500 hover:text-red-700"
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
            onClick={() => handleEdit(template)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" /> Edit Template
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDuplicate(template)}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" /> Duplicate
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Floor Templates</DialogTitle>
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
              <p>
                Are you sure you want to delete this template? This action cannot be undone.
              </p>
              {templateToDelete && templates.some(t => t.id === templateToDelete) && (
                <p className="mt-2 font-medium">
                  "{templates.find(t => t.id === templateToDelete)?.name}"
                </p>
              )}
              <p className="mt-3 text-amber-600 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                <span>Floors currently using this template will not be affected.</span>
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              <Trash className="h-4 w-4 mr-2" /> Delete Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// Helper function to get color based on use type
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
