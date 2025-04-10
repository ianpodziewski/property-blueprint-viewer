import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { Floor, FloorPlateTemplate, Product } from "@/hooks/usePropertyState";
import BulkAddFloorsModal from "./BulkAddFloorsModal";
import FloorUsageTemplates from "./FloorUsageTemplates";
import BuildingSummaryPanel from "./BuildingSummaryPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UnitMix from "./UnitMix";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useModel } from "@/context/ModelContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

// Create a constant for feature flags
const FEATURES = {
  FLOOR_USAGE_TEMPLATES: false, // Set to false to disable the feature
};

interface BuildingLayoutProps {
  floors: Floor[];
  templates: FloorPlateTemplate[];
  products: Product[];
  onAddFloor: () => Promise<Floor | null>;
  onUpdateFloor: (id: string, updates: Partial<Floor>) => Promise<void>;
  onDeleteFloor: (id: string) => Promise<void>;
  onUpdateUnitAllocation: (floorId: string, unitTypeId: string, quantity: number) => Promise<void>;
  getUnitAllocation: (floorId: string, unitTypeId: string) => Promise<Promise<number>>;
  getFloorTemplateById: (templateId: string) => FloorPlateTemplate | undefined;
  projectId: string | null;
  onRefreshData: () => Promise<void>;
}

const BuildingLayout: React.FC<BuildingLayoutProps> = ({
  floors,
  templates,
  products,
  onAddFloor,
  onUpdateFloor,
  onDeleteFloor,
  onUpdateUnitAllocation,
  getUnitAllocation,
  getFloorTemplateById,
  projectId,
  onRefreshData
}) => {
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { setHasUnsavedChanges } = useModel();
  const [editFloorId, setEditFloorId] = useState<string | null>(null);
  const [editedLabel, setEditedLabel] = useState('');
  const [editedPosition, setEditedPosition] = useState<number | undefined>(undefined);
  const [editedTemplateId, setEditedTemplateId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteFloorId, setDeleteFloorId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editedFloorType, setEditedFloorType] = useState<"aboveground" | "underground">("aboveground");

  const handleDataRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddFloor = async () => {
    await onAddFloor();
  };

  const handleOpenEditModal = (floorId: string) => {
    const floor = floors.find(f => f.id === floorId);
    if (floor) {
      setEditFloorId(floorId);
      setEditedLabel(floor.label);
      setEditedPosition(floor.position);
      setEditedTemplateId(floor.templateId || null);
      setEditedFloorType(floor.floorType);
      setIsEditModalOpen(true);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditFloorId(null);
  };

  const handleSaveFloor = async () => {
    if (!editFloorId || editedPosition === undefined) return;
    
    try {
      await onUpdateFloor(editFloorId, {
        label: editedLabel,
        position: editedPosition,
        templateId: editedTemplateId || '',
        floorType: editedFloorType
      });
      toast.success("Floor updated successfully");
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error("Error updating floor:", error);
      toast.error("Failed to update floor");
    } finally {
      handleCloseEditModal();
    }
  };

  const handleOpenDeleteModal = (floorId: string) => {
    setDeleteFloorId(floorId);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteFloorId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteFloorId) return;
    
    try {
      await onDeleteFloor(deleteFloorId);
      toast.success("Floor deleted successfully");
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error("Error deleting floor:", error);
      toast.error("Failed to delete floor");
    } finally {
      handleCloseDeleteModal();
    }
  };

  const getTemplateName = (templateId: string | undefined) => {
    if (!templateId) return "None";
    const template = templates.find(t => t.id === templateId);
    return template ? template.name : "Unknown Template";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Building Layout</h3>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDataRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={handleAddFloor}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Floor
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="floors">
        <TabsList className="mb-4">
          <TabsTrigger value="floors">Floors</TabsTrigger>
          <TabsTrigger value="summary">Building Summary</TabsTrigger>
          <TabsTrigger value="units">Unit Mix</TabsTrigger>
        </TabsList>
        
        <TabsContent value="floors" className="space-y-4">
          {/* Only render the FloorUsageTemplates component if the feature is enabled */}
          {FEATURES.FLOOR_USAGE_TEMPLATES && (
            <FloorUsageTemplates 
              floors={floors}
              templates={templates}
              projectId={projectId || ''}
              onRefresh={onRefreshData}
            />
          )}
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Template</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {floors.map((floor) => (
                <TableRow key={floor.id}>
                  <TableCell>{floor.label} <Badge variant="outline">{floor.floorType}</Badge></TableCell>
                  <TableCell>{floor.position}</TableCell>
                  <TableCell>{getTemplateName(floor.templateId)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEditModal(floor.id)}>
                          Edit Floor
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDeleteModal(floor.id)} className="text-red-500">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        
        <TabsContent value="summary">
          <BuildingSummaryPanel 
            floors={floors}
            getFloorTemplateById={getFloorTemplateById}
            templates={templates}
            products={products}
            getUnitAllocation={getUnitAllocation}
          />
        </TabsContent>
        
        <TabsContent value="units">
          <UnitMix 
            floors={floors}
            products={products}
            getUnitAllocation={getUnitAllocation}
          />
        </TabsContent>
      </Tabs>
      
      {/* Modals */}
      <BulkAddFloorsModal
        open={isBulkAddModalOpen}
        onOpenChange={setIsBulkAddModalOpen}
        onRefresh={handleDataRefresh}
        templates={templates}
        projectId={projectId || ''}
      />
      
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Floor</DialogTitle>
            <DialogDescription>
              Make changes to your floor here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="label" className="text-right">
                Label
              </Label>
              <Input 
                id="label" 
                value={editedLabel} 
                onChange={(e) => setEditedLabel(e.target.value)} 
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right">
                Position
              </Label>
              <Input
                type="number"
                id="position"
                value={editedPosition !== undefined ? editedPosition.toString() : ''}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setEditedPosition(isNaN(value) ? undefined : value);
                }}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template" className="text-right">
                Template
              </Label>
              <select
                id="template"
                className="col-span-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={editedTemplateId || ''}
                onChange={(e) => setEditedTemplateId(e.target.value)}
              >
                <option value="">None</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="floor-type" className="text-right">
                Floor Type
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="aboveground"
                    checked={editedFloorType === "aboveground"}
                    onCheckedChange={(checked) => checked && setEditedFloorType("aboveground")}
                  />
                  <Label htmlFor="aboveground">Aboveground</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="underground"
                    checked={editedFloorType === "underground"}
                    onCheckedChange={(checked) => checked && setEditedFloorType("underground")}
                  />
                  <Label htmlFor="underground">Underground</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleCloseEditModal}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSaveFloor}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Floor</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this floor? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleCloseDeleteModal}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuildingLayout;
