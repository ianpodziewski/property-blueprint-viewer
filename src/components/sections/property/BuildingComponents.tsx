
import { useState } from "react";
import { PlusCircle, Pencil, Trash2, X, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
import { useBuildingComponents } from "@/hooks/useBuildingComponents";

// Define component category type
export interface BuildingComponentCategory {
  id: string;
  name: string;
}

// Define props interface for the component
interface BuildingComponentsProps {
  projectId: string | null;
}

const BuildingComponents = ({ projectId }: BuildingComponentsProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Category modal state
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryNameError, setCategoryNameError] = useState("");

  const { 
    categories, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    loading 
  } = useBuildingComponents(projectId);
  
  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  // Handle opening the add category dialog
  const handleAddCategory = () => {
    setCategoryName("");
    setCategoryNameError("");
    setEditingCategoryId(null);
    setIsCategoryDialogOpen(true);
  };
  
  // Handle opening the edit category dialog
  const handleEditCategory = (category: BuildingComponentCategory) => {
    setCategoryName(category.name);
    setCategoryNameError("");
    setEditingCategoryId(category.id);
    setIsCategoryDialogOpen(true);
  };
  
  // Handle deleting a category
  const handleDeleteCategoryConfirm = (id: string) => {
    setDeleteCategoryId(id);
    setIsDeleteCategoryDialogOpen(true);
  };
  
  const handleDeleteCategory = async () => {
    if (deleteCategoryId) {
      setIsSubmitting(true);
      const success = await deleteCategory(deleteCategoryId);
      setIsSubmitting(false);
      
      if (success) {
        setIsDeleteCategoryDialogOpen(false);
        setDeleteCategoryId(null);
      }
    }
  };
  
  // Handle saving a category
  const handleSaveCategory = async () => {
    // Validate category name
    if (!categoryName.trim()) {
      setCategoryNameError("Category name is required");
      return;
    }
    
    // Check for duplicate category name
    const isDuplicate = categories.some(
      c => c.name.toLowerCase() === categoryName.trim().toLowerCase() && 
        c.id !== editingCategoryId
    );
    
    if (isDuplicate) {
      setCategoryNameError("A category with this name already exists");
      return;
    }
    
    setIsSubmitting(true);
    let success = false;
    
    if (editingCategoryId) {
      success = await updateCategory(editingCategoryId, categoryName);
    } else {
      const result = await addCategory(categoryName);
      success = !!result;
    }
    
    setIsSubmitting(false);
    
    if (success) {
      setIsCategoryDialogOpen(false);
      setCategoryName("");
      setCategoryNameError("");
    }
  };
  
  return (
    <>
      <Collapsible
        open={!isCollapsed}
        onOpenChange={setIsCollapsed}
        className="w-full space-y-2"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Building Components</h3>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAddCategory}
            >
              <PlusCircle className="h-4 w-4 mr-1" /> Add Component
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
            Define non-rentable spaces to ensure complete building allocation
          </div>
          
          {loading ? (
            <Card className="bg-gray-50 border border-dashed border-gray-200">
              <CardContent className="py-6 flex flex-col items-center justify-center text-center">
                <p className="text-gray-500 mb-2">Loading components...</p>
              </CardContent>
            </Card>
          ) : categories.length === 0 ? (
            <Card className="bg-gray-50 border border-dashed border-gray-200">
              <CardContent className="py-6 flex flex-col items-center justify-center text-center">
                <p className="text-gray-500 mb-4">No building components defined yet</p>
                <Button variant="outline" size="sm" onClick={handleAddCategory}>
                  <PlusCircle className="h-4 w-4 mr-1" /> Add your first component
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => {
                const isExpanded = expandedCategories[category.id] !== false;
                
                return (
                  <Card key={category.id} className="bg-white overflow-hidden">
                    <div 
                      className="py-3 px-4 flex items-center justify-between cursor-pointer bg-gray-50"
                      onClick={() => toggleCategoryExpansion(category.id)}
                    >
                      <div className="font-medium flex items-center">
                        {isExpanded ? 
                          <ChevronDown className="h-4 w-4 mr-2" /> : 
                          <ChevronUp className="h-4 w-4 mr-2" />
                        }
                        {category.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCategory(category);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-500" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategoryConfirm(category.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <CardContent className="py-4 px-4">
                        {/* Future expansion: Component items will go here */}
                        <div className="text-center py-4 text-gray-500">
                          Details for this component will be added in the next phase
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
      
      {/* Add/Edit Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCategoryId ? "Edit Building Component" : "Add Building Component"}</DialogTitle>
            <DialogDescription>
              {editingCategoryId 
                ? "Modify this non-rentable space category"
                : "Add a new non-rentable space category to your building"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Name</Label>
              <Input
                id="category-name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Core/Circulation, Mechanical, Parking, etc."
                className={categoryNameError ? "border-red-500" : ""}
              />
              {categoryNameError && (
                <div className="text-xs text-red-500">{categoryNameError}</div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)} disabled={isSubmitting}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button onClick={handleSaveCategory} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">◌</span> 
                  {editingCategoryId ? "Updating..." : "Saving..."}
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" /> {editingCategoryId ? "Update" : "Save"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Category Confirmation Dialog */}
      <AlertDialog open={isDeleteCategoryDialogOpen} onOpenChange={setIsDeleteCategoryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Building Component</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this building component? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCategory} 
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
    </>
  );
};

export default BuildingComponents;
