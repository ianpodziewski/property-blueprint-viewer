
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Floor, FloorPlateTemplate } from "@/hooks/usePropertyState";
import { 
  fetchFloorUsageTemplates, 
  applyTemplateToFloors, 
  deleteFloorUsageTemplate 
} from "@/utils/floorManagement";
import { 
  MoreVertical,
  Loader2,
  CheckCircle,
  XCircle,
  Trash,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface FloorUsageTemplate {
  id: string;
  name: string;
  templateId: string;
  projectId: string;
  createdAt: string;
}

interface FloorUsageTemplatesProps {
  floors: Floor[];
  templates: FloorPlateTemplate[];
  projectId: string;
  onRefresh: () => Promise<void>;
}

const FloorUsageTemplates = ({
  floors,
  templates,
  projectId,
  onRefresh
}: FloorUsageTemplatesProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [usageTemplates, setUsageTemplates] = useState<FloorUsageTemplate[]>([]);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<FloorUsageTemplate | null>(null);
  const [selectedFloorIds, setSelectedFloorIds] = useState<Record<string, boolean>>({});
  const [isApplying, setIsApplying] = useState(false);
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});

  // Load floor usage templates
  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const templates = await fetchFloorUsageTemplates(projectId);
      setUsageTemplates(templates);
    } catch (error) {
      console.error("Error loading floor usage templates:", error);
      toast.error("Failed to load floor templates");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [projectId]);

  const getTemplateName = (templateId: string | undefined) => {
    if (!templateId) return "Unknown Template";
    const template = templates.find(t => t.id === templateId);
    return template ? template.name : "Unknown Template";
  };

  const handleDelete = async (templateId: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      setIsDeleting(prev => ({ ...prev, [templateId]: true }));
      try {
        await deleteFloorUsageTemplate(templateId);
        await loadTemplates();
        toast.success("Template deleted successfully");
      } catch (error) {
        console.error("Error deleting template:", error);
        toast.error("Failed to delete template");
      } finally {
        setIsDeleting(prev => ({ ...prev, [templateId]: false }));
      }
    }
  };

  const openApplyModal = (template: FloorUsageTemplate) => {
    setSelectedTemplate(template);
    setSelectedFloorIds({});
    setApplyModalOpen(true);
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return;
    
    const floorIds = Object.entries(selectedFloorIds)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);
      
    if (floorIds.length === 0) {
      toast.error("Please select at least one floor");
      return;
    }
    
    setIsApplying(true);
    try {
      await applyTemplateToFloors(selectedTemplate.id, floorIds);
      await onRefresh();
      setApplyModalOpen(false);
      toast.success(`Template applied to ${floorIds.length} floors`);
    } catch (error) {
      console.error("Error applying template:", error);
      toast.error("Failed to apply template");
    } finally {
      setIsApplying(false);
    }
  };

  const toggleAllFloors = (checked: boolean) => {
    const newSelection: Record<string, boolean> = {};
    floors.forEach(floor => {
      newSelection[floor.id] = checked;
    });
    setSelectedFloorIds(newSelection);
  };

  const toggleFloor = (floorId: string, checked: boolean) => {
    setSelectedFloorIds(prev => ({
      ...prev,
      [floorId]: checked
    }));
  };

  const selectedCount = Object.values(selectedFloorIds).filter(Boolean).length;

  return (
    <div>
      {usageTemplates.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="py-3">
            <CardTitle className="text-lg">Floor Usage Templates</CardTitle>
            <CardDescription>Apply saved floor configurations to multiple floors</CardDescription>
          </CardHeader>
          <CardContent className="py-2 px-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template Name</TableHead>
                  <TableHead>Base Floor Template</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : (
                  usageTemplates.map(template => (
                    <TableRow key={template.id}>
                      <TableCell>{template.name}</TableCell>
                      <TableCell>{getTemplateName(template.templateId)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              disabled={isDeleting[template.id]}
                            >
                              {isDeleting[template.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreVertical className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openApplyModal(template)}>
                              <ArrowRight className="h-4 w-4 mr-2" /> Apply to Floors
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(template.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash className="h-4 w-4 mr-2" /> Delete Template
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Apply template modal */}
      <Dialog open={applyModalOpen} onOpenChange={setApplyModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Apply Template to Floors</DialogTitle>
            <DialogDescription>
              {selectedTemplate ? `Apply "${selectedTemplate.name}" to the selected floors` : ''}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="flex justify-between items-center pb-2">
              <Label>Select Floors</Label>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="select-all"
                  checked={floors.length > 0 && selectedCount === floors.length}
                  onCheckedChange={(checked) => toggleAllFloors(checked === true)}
                />
                <Label 
                  htmlFor="select-all"
                  className="text-sm font-normal"
                >
                  Select All
                </Label>
              </div>
            </div>
            
            <div className="border rounded-md p-3 h-48 overflow-y-auto">
              {floors.length === 0 ? (
                <p className="text-gray-500 text-sm">No floors available</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {floors.map((floor) => (
                    <div key={floor.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`floor-${floor.id}`}
                        checked={!!selectedFloorIds[floor.id]}
                        onCheckedChange={(checked) => toggleFloor(floor.id, checked === true)}
                      />
                      <Label 
                        htmlFor={`floor-${floor.id}`}
                        className="text-sm font-normal"
                      >
                        {floor.label}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 rounded-md p-3 mt-3 flex items-center">
              {selectedCount > 0 ? (
                <div className="flex items-center text-sm text-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {selectedCount} floor{selectedCount !== 1 && 's'} selected
                </div>
              ) : (
                <div className="flex items-center text-sm text-orange-700">
                  <XCircle className="h-4 w-4 mr-2" />
                  No floors selected
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setApplyModalOpen(false)}
              disabled={isApplying}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApplyTemplate} 
              disabled={selectedCount === 0 || isApplying}
            >
              {isApplying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                "Apply Template"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FloorUsageTemplates;
