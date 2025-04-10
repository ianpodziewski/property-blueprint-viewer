
import { useState } from "react";
import { BuildingComponentCategory } from "@/hooks/usePropertyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import NonRentableComponentModal from "./NonRentableComponentModal";

interface NonRentableComponentsProps {
  components: BuildingComponentCategory[];
  onAddComponent: (name: string) => Promise<BuildingComponentCategory | null>;
  onUpdateComponent: (id: string, name: string) => Promise<boolean>;
  onDeleteComponent: (id: string) => Promise<boolean>;
}

const NonRentableComponents = ({
  components,
  onAddComponent,
  onUpdateComponent,
  onDeleteComponent,
}: NonRentableComponentsProps) => {
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingComponent, setEditingComponent] = useState<BuildingComponentCategory | null>(null);
  const [editName, setEditName] = useState("");

  const handleAddComponent = () => {
    setIsComponentModalOpen(true);
  };

  const handleSaveComponent = async (name: string) => {
    try {
      const result = await onAddComponent(name);
      if (result) {
        toast.success("Component added successfully");
      }
    } catch (error) {
      console.error("Error adding component:", error);
      toast.error("Failed to add component");
    } finally {
      setIsComponentModalOpen(false);
    }
  };

  const handleEdit = (component: BuildingComponentCategory) => {
    setEditingComponent(component);
    setEditName(component.name);
  };

  const handleSaveEdit = async () => {
    if (!editingComponent) return;
    
    try {
      const success = await onUpdateComponent(editingComponent.id, editName);
      if (success) {
        toast.success("Component updated successfully");
      }
      setEditingComponent(null);
      setEditName("");
    } catch (error) {
      console.error("Error updating component:", error);
      toast.error("Failed to update component");
    }
  };

  const handleCancelEdit = () => {
    setEditingComponent(null);
    setEditName("");
  };

  const handleRequestDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    
    try {
      const success = await onDeleteComponent(confirmDeleteId);
      if (success) {
        toast.success("Component deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting component:", error);
      toast.error("Failed to delete component");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div></div>
        <Button
          size="sm"
          onClick={handleAddComponent}
          className="flex items-center gap-1"
        >
          <PlusCircle className="w-4 h-4" />
          Add Component
        </Button>
      </div>

      {components.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-200 rounded-md bg-gray-50">
          <p className="text-gray-500">No non-rentable components defined yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {components.map((component) => (
            <Card key={component.id} className="overflow-hidden">
              <CardContent className="p-0">
                {editingComponent?.id === component.id ? (
                  <div className="p-4 space-y-3">
                    <Label htmlFor={`edit-${component.id}`}>Component Name</Label>
                    <Input
                      id={`edit-${component.id}`}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Enter component name"
                      autoComplete="off"
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm"
                        onClick={handleSaveEdit}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 flex justify-between items-center">
                    <h4 className="text-md font-medium">{component.name}</h4>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEdit(component)}
                          className="cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRequestDelete(component.id)}
                          className="cursor-pointer text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <NonRentableComponentModal
        open={isComponentModalOpen}
        onOpenChange={setIsComponentModalOpen}
        onSave={handleSaveComponent}
      />

      <AlertDialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this building component. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NonRentableComponents;
