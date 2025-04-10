
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
  MoreVertical,
  Loader2,
  CheckCircle,
  XCircle,
  Trash,
  ArrowRight,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  fetchFloorUsageTemplates,
  deleteFloorUsageTemplate,
  applyTemplateToFloors
} from "@/utils/floorManagement";
import { FloorUsageTemplateData } from "@/types/propertyData";

// Define the FloorUsageTemplate interface to match the API response structure
export interface FloorUsageTemplate {
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
      // Since the feature is deprecated, we'll just return an empty array
      const templates = await fetchFloorUsageTemplates(projectId);
      // Transform the API response to match our FloorUsageTemplate interface
      const transformedTemplates: FloorUsageTemplate[] = templates.map((template: FloorUsageTemplateData) => ({
        id: template.id,
        name: template.name,
        templateId: template.templateId || "",
        projectId: template.projectId,
        createdAt: new Date().toISOString() // Default to current date
      }));
      setUsageTemplates(transformedTemplates);
    } catch (error) {
      console.error("Error loading floor usage templates:", error);
      // No toast error since this feature is deprecated
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

  // Always return the deprecation notice
  return (
    <div>
      <Alert variant="warning" className="mb-6">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle>Feature Deprecated</AlertTitle>
        <AlertDescription>
          Floor Usage Templates feature has been deprecated. The related database tables have been removed.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default FloorUsageTemplates;
