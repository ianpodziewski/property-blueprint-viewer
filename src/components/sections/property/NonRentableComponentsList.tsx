
import { useState } from "react";
import { BuildingComponentCategory } from "@/hooks/usePropertyState";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
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

interface NonRentableComponentsListProps {
  components: BuildingComponentCategory[];
  onEdit: (id: string, name: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

const NonRentableComponentsList = ({
  components,
  onEdit,
  onDelete,
}: NonRentableComponentsListProps) => {
  const [editingComponent, setEditingComponent] = useState<BuildingComponentCategory | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteComponentId, setDeleteComponentId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditClick = (component: BuildingComponentCategory) => {
    setEditingComponent(component);
    setEditName(component.name);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteComponentId(id);
  };

  const handleSaveEdit = async () => {
    if (editingComponent && editName.trim()) {
      setIsEditing(true);
      try {
        const success = await onEdit(editingComponent.id, editName.trim());
        if (success) {
          setEditingComponent(null);
        }
      } finally {
        setIsEditing(false);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteComponentId) {
      setIsDeleting(true);
      try {
        const success = await onDelete(deleteComponentId);
        if (success) {
          setDeleteComponentId(null);
        }
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (components.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-gray-200 rounded-md bg-gray-50">
        <p className="text-gray-500">No non-rentable components defined yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {components.map((component) => (
          <div
            key={component.id}
            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md"
          >
            <span className="font-medium">{component.name}</span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditClick(component)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteClick(component.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <AlertDialog
        open={!!editingComponent}
        onOpenChange={(open) => !open && setEditingComponent(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Component</AlertDialogTitle>
            <AlertDialogDescription>
              Change the name of this non-rentable component.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Component name"
              className="w-full"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSaveEdit}
              disabled={isEditing || !editName.trim()}
            >
              {isEditing ? "Saving..." : "Save"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={!!deleteComponentId}
        onOpenChange={(open) => !open && setDeleteComponentId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Component</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this component? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NonRentableComponentsList;
