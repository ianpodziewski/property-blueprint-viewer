
import React, { useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/context/ProjectContext';

export interface ComponentCategory {
  id: string;
  name: string;
}

interface BuildingComponentsProps {
  projectId: string;
  componentCategories: ComponentCategory[];
  onAddComponentCategory: (name: string) => Promise<ComponentCategory | null>;
  onUpdateComponentCategory: (id: string, name: string) => Promise<boolean>;
  onDeleteComponentCategory: (id: string) => Promise<boolean>;
}

const BuildingComponents: React.FC<BuildingComponentsProps> = ({
  projectId,
  componentCategories,
  onAddComponentCategory,
  onUpdateComponentCategory,
  onDeleteComponentCategory
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [newComponentName, setNewComponentName] = useState('');
  const [editComponentId, setEditComponentId] = useState<string | null>(null);
  const [editComponentName, setEditComponentName] = useState('');
  const [deleteComponentId, setDeleteComponentId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  const handleAddComponent = async () => {
    if (!newComponentName.trim()) {
      toast.error('Component name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onAddComponentCategory(newComponentName.trim());
      if (result) {
        toast.success('Building component added successfully');
        setIsAddModalOpen(false);
        setNewComponentName('');
      } else {
        toast.error('Failed to add building component');
      }
    } catch (error) {
      console.error('Error adding component:', error);
      toast.error('An error occurred while adding the component');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComponent = async () => {
    if (!editComponentId || !editComponentName.trim()) {
      toast.error('Component name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onUpdateComponentCategory(editComponentId, editComponentName.trim());
      if (result) {
        toast.success('Building component updated successfully');
        setIsEditModalOpen(false);
        setEditComponentId(null);
        setEditComponentName('');
      } else {
        toast.error('Failed to update building component');
      }
    } catch (error) {
      console.error('Error updating component:', error);
      toast.error('An error occurred while updating the component');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComponent = async () => {
    if (!deleteComponentId) return;

    setIsSubmitting(true);
    try {
      const result = await onDeleteComponentCategory(deleteComponentId);
      if (result) {
        toast.success('Building component deleted successfully');
        setIsDeleteConfirmOpen(false);
        setDeleteComponentId(null);
      } else {
        toast.error('Failed to delete building component');
      }
    } catch (error) {
      console.error('Error deleting component:', error);
      toast.error('An error occurred while deleting the component');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (category: ComponentCategory) => {
    setEditComponentId(category.id);
    setEditComponentName(category.name);
    setIsEditModalOpen(true);
  };

  const openDeleteConfirm = (id: string) => {
    setDeleteComponentId(id);
    setIsDeleteConfirmOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-blue-700">Building Components</h3>
          <p className="text-sm text-gray-500">Define non-rentable spaces to ensure complete building allocation</p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Component
        </Button>
      </div>

      {componentCategories.length === 0 ? (
        <Card className="bg-gray-50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-gray-500 mb-4">No building components defined yet</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Component
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {componentCategories.map(category => (
            <Collapsible
              key={category.id}
              open={expandedCategories.has(category.id)}
              className="border rounded-md"
            >
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-t-md">
                <CollapsibleTrigger 
                  onClick={() => toggleCategory(category.id)}
                  className="flex items-center text-sm font-medium hover:text-blue-700 flex-1"
                >
                  {expandedCategories.has(category.id) ? (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2" />
                  )}
                  {category.name}
                </CollapsibleTrigger>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditModal(category)}
                  >
                    <Edit2 className="h-4 w-4 text-gray-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteConfirm(category.id)}
                  >
                    <Trash2 className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              </div>
              <CollapsibleContent className="px-4 pb-4 pt-2">
                <div className="text-sm text-gray-500">
                  This section will be expanded in the next phase to include component details.
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}

      {/* Add Component Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Building Component</DialogTitle>
            <DialogDescription>
              Add a new non-rentable space category to your building.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="component-name">Name</Label>
              <Input
                id="component-name"
                placeholder="e.g. Core/Circulation, Mechanical, Parking"
                value={newComponentName}
                onChange={(e) => setNewComponentName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setNewComponentName('');
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddComponent}
              disabled={isSubmitting || !newComponentName.trim()}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Component Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Building Component</DialogTitle>
            <DialogDescription>
              Update the building component name.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-component-name">Name</Label>
              <Input
                id="edit-component-name"
                placeholder="Component name"
                value={editComponentName}
                onChange={(e) => setEditComponentName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditComponentId(null);
                setEditComponentName('');
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditComponent}
              disabled={isSubmitting || !editComponentName.trim()}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Building Component</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this building component? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteConfirmOpen(false);
                setDeleteComponentId(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteComponent}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuildingComponents;
