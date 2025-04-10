import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2, X, Check, Copy } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { FloorPlateTemplate, Product, Floor } from "@/hooks/usePropertyState";
import { Separator } from "@/components/ui/separator";
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
import { toast } from "sonner";
import { useProject } from "@/context/ProjectContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import FloorComponentsPanel from "./FloorComponentsPanel";

interface BuildingLayoutProps {
  floors: Floor[];
  templates: FloorPlateTemplate[];
  products: Product[];
  onAddFloor: () => Promise<Floor | null>;
  onUpdateFloor: (id: string, updates: Partial<Floor>) => Promise<void>;
  onDeleteFloor: (id: string) => Promise<void>;
  onUpdateUnitAllocation: (floorId: string, unitTypeId: string, quantity: number) => Promise<void>;
  getUnitAllocation: (floorId: string, unitTypeId: string) => Promise<number>;
  getFloorTemplateById: (templateId: string) => FloorPlateTemplate | undefined;
  onRefreshData: () => Promise<void>;
}

interface BulkAddFloorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: FloorPlateTemplate[];
  onComplete: () => void;
  onAddFloor: () => Promise<Floor | null>;
  onUpdateFloor: (id: string, updates: Partial<Floor>) => Promise<void>;
}

const BuildingLayout = ({
  floors,
  templates,
  products,
  onAddFloor,
  onUpdateFloor,
  onDeleteFloor,
  onUpdateUnitAllocation,
  getUnitAllocation,
  getFloorTemplateById,
  onRefreshData
}: BuildingLayoutProps) => {
  const { currentProjectId } = useProject();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [floorToDelete, setFloorToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingFloorId, setEditingFloorId] = useState<string | null>(null);
  const [floorLabel, setFloorLabel] = useState("");
  const [floorPosition, setFloorPosition] = useState<number | null>(null);
  const [selectedFloorType, setSelectedFloorType] = useState<"aboveground" | "underground">("aboveground");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFloorComponentsPanelOpen, setIsFloorComponentsPanelOpen] = useState(false);
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
  const [selectedFloorLabel, setSelectedFloorLabel] = useState<string | null>(null);

  useEffect(() => {
    console.log("BuildingLayout: Floors data updated:", floors);
  }, [floors]);

  const handleAddFloor = async () => {
    setIsSubmitting(true);
    await onAddFloor();
    setIsSubmitting(false);
  };

  const handleDeleteFloorConfirm = (id: string) => {
    setFloorToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteFloor = async () => {
    if (floorToDelete) {
      setIsSubmitting(true);
      await onDeleteFloor(floorToDelete);
      setIsDeleteDialogOpen(false);
      setFloorToDelete(null);
      setIsSubmitting(false);
    }
  };

  const handleOpenEditDialog = (floor: Floor) => {
    setEditingFloorId(floor.id);
    setFloorLabel(floor.label);
    setFloorPosition(floor.position);
    setSelectedTemplateId(floor.templateId || null);
    setSelectedFloorType(floor.floorType);
    setIsEditDialogOpen(true);
  };

  const handleSaveFloor = async () => {
    if (!editingFloorId) return;

    setIsSubmitting(true);
    try {
      if (floorLabel && floorPosition) {
        await onUpdateFloor(editingFloorId, {
          label: floorLabel,
          position: floorPosition,
          templateId: selectedTemplateId || '',
          floorType: selectedFloorType
        });
        setIsEditDialogOpen(false);
      } else {
        toast.error("Floor label and position are required");
      }
    } catch (error) {
      console.error("Error updating floor:", error);
      toast.error("Failed to update floor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkAddComplete = () => {
    setIsBulkAddModalOpen(false);
    onRefreshData();
  };

  const handleOpenFloorComponentsPanel = (floorId: string, floorLabel: string) => {
    setSelectedFloorId(floorId);
    setSelectedFloorLabel(floorLabel);
    setIsFloorComponentsPanelOpen(true);
  };

  const handleCloseFloorComponentsPanel = () => {
    setIsFloorComponentsPanelOpen(false);
    setSelectedFloorId(null);
    setSelectedFloorLabel(null);
  };

  return (
    <>
      <Collapsible
        open={!isCollapsed}
        onOpenChange={setIsCollapsed}
        className="w-full space-y-2"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Building Layout</h3>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAddFloor}
              disabled={isSubmitting}
            >
              <PlusCircle className="h-4 w-4 mr-1" /> Add Floor
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsBulkAddModalOpen(true)}
              disabled={isSubmitting}
            >
              <Copy className="h-4 w-4 mr-1" /> Bulk Add
            </Button>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                {isCollapsed ? "+" : "-"}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
        
        <CollapsibleContent className="pt-2">
          <div className="text-sm text-gray-500 mb-4">
            Define the floors and their layout for your project
          </div>
          
          {floors.length === 0 ? (
            <Card className="bg-gray-50 border border-dashed border-gray-200">
              <CardContent className="py-6 flex flex-col items-center justify-center text-center">
                <p className="text-gray-500 mb-4">No floors added yet</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddFloor}
                  disabled={isSubmitting}
                >
                  <PlusCircle className="h-4 w-4 mr-1" /> Add your first floor
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {floors.map((floor) => (
                <Card key={floor.id} className="bg-white overflow-hidden">
                  <div className="py-3 px-4 flex items-center justify-between bg-gray-50">
                    <div className="font-medium">
                      {floor.label} (Position: {floor.position})
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0" 
                        onClick={() => handleOpenEditDialog(floor)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleOpenFloorComponentsPanel(floor.id, floor.label)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-settings-2"
                        >
                          <path d="M12 2v2" />
                          <path d="M12 20v2" />
                          <path d="m4.93 4.93 1.41 1.41" />
                          <path d="m17.66 17.66 1.41 1.41" />
                          <path d="M2 12h2" />
                          <path d="M20 12h2" />
                          <path d="m4.93 19.07 1.41-1.41" />
                          <path d="m17.66 6.34 1.41-1.41" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-500" 
                        onClick={() => handleDeleteFloorConfirm(floor.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Floor</DialogTitle>
            <DialogDescription>
              Update the details for this floor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="floor-label">Floor Label</Label>
              <Input
                id="floor-label"
                value={floorLabel}
                onChange={(e) => setFloorLabel(e.target.value)}
                placeholder="e.g., Ground Floor, 1st Floor"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor-position">Floor Position</Label>
              <Input
                id="floor-position"
                type="number"
                value={floorPosition !== null ? floorPosition.toString() : ""}
                onChange={(e) => setFloorPosition(Number(e.target.value))}
                placeholder="e.g., 1, 2, 3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor-template">Floor Template</Label>
              <Select onValueChange={setSelectedTemplateId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a template" defaultValue={selectedTemplateId || undefined} />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="floor-type">Floor Type</Label>
              <Select value={selectedFloorType} onValueChange={(value) => setSelectedFloorType(value as "aboveground" | "underground")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select floor type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aboveground">Aboveground</SelectItem>
                  <SelectItem value="underground">Underground</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSaveFloor} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">◌</span> Updating...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Floor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this floor? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteFloor} 
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

      <BulkAddFloorsModal
        isOpen={isBulkAddModalOpen}
        onClose={() => setIsBulkAddModalOpen(false)}
        templates={templates}
        onComplete={handleBulkAddComplete}
        onAddFloor={onAddFloor}
        onUpdateFloor={onUpdateFloor}
      />

      <FloorComponentsPanel
        isOpen={isFloorComponentsPanelOpen}
        onClose={handleCloseFloorComponentsPanel}
        floorId={selectedFloorId || ""}
        floorLabel={selectedFloorLabel || ""}
      />
    </>
  );
};

interface BulkAddFloorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: FloorPlateTemplate[];
  onComplete: () => void;
  onAddFloor: () => Promise<Floor | null>;
  onUpdateFloor: (id: string, updates: Partial<Floor>) => Promise<void>;
}

const BulkAddFloorsModal: React.FC<BulkAddFloorsModalProps> = ({ isOpen, onClose, templates, onComplete, onAddFloor, onUpdateFloor }) => {
  const [numberOfFloors, setNumberOfFloors] = useState<number>(1);
  const [startingFloorNumber, setStartingFloorNumber] = useState<number>(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(templates.length > 0 ? templates[0].id : null);
  const [floorType, setFloorType] = useState<"aboveground" | "underground">("aboveground");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentProjectId } = useProject();

  const handleBulkAdd = async () => {
    if (!selectedTemplateId) {
      toast.error("Please select a floor template");
      return;
    }

    setIsSubmitting(true);

    try {
      for (let i = 0; i < numberOfFloors; i++) {
        const floorNumber = startingFloorNumber + i;
        const newFloor = await onAddFloor();

        if (newFloor) {
          await onUpdateFloor(newFloor.id, {
            label: `Floor ${floorNumber}`,
            position: floorNumber,
            templateId: selectedTemplateId,
            floorType: floorType
          });
        }
      }

      toast.success(`${numberOfFloors} floors added successfully`);
      onComplete();
      onClose();
    } catch (error) {
      console.error("Error adding floors:", error);
      toast.error("Failed to add floors");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bulk Add Floors</DialogTitle>
          <DialogDescription>
            Quickly add multiple floors to your building layout.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="number-of-floors">Number of Floors</Label>
            <Input
              id="number-of-floors"
              type="number"
              min="1"
              value={numberOfFloors.toString()}
              onChange={(e) => setNumberOfFloors(Number(e.target.value))}
              placeholder="Number of floors to add"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="starting-floor-number">Starting Floor Number</Label>
            <Input
              id="starting-floor-number"
              type="number"
              value={startingFloorNumber.toString()}
              onChange={(e) => setStartingFloorNumber(Number(e.target.value))}
              placeholder="Starting floor number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="floor-template">Floor Template</Label>
            <Select onValueChange={setSelectedTemplateId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a template" defaultValue={selectedTemplateId || undefined} />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="floor-type">Floor Type</Label>
            <Select value={floorType} onValueChange={(value) => setFloorType(value as "aboveground" | "underground")}>
              <SelectTrigger>
                <SelectValue placeholder="Select floor type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aboveground">Aboveground</SelectItem>
                <SelectItem value="underground">Underground</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleBulkAdd} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">◌</span> Adding...
              </>
            ) : (
              "Add Floors"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BuildingLayout;
