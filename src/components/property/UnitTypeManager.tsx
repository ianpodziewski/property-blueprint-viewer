
import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, Plus, Trash2, Edit, Save, X, RefreshCw } from "lucide-react";
import { useUnitTypes } from "@/hooks/property/useUnitTypes";
import { useUnitAllocations } from "@/hooks/property/useUnitAllocations";
import { UnitType } from "@/types/unitMixTypes";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface UnitTypeManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const UnitTypeManager: React.FC<UnitTypeManagerProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const { 
    unitTypes,
    addUnitType, 
    removeUnitType, 
    updateUnitType,
    addCustomCategory,
    removeCategory,
    undoRemoveCategory,
    getAllCategories,
    getCategoryColor,
    hasCategories,
    recentlyDeletedCategory,
    getCategoryDescription
  } = useUnitTypes();
  
  const { getAllocationsByUnitTypeId } = useUnitAllocations();
  
  const [activeTab, setActiveTab] = useState("all");
  const [editingUnitType, setEditingUnitType] = useState<UnitType | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#E5DEFF");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);
  
  const categories = useMemo(() => getAllCategories(), [getAllCategories]);
  
  const getUnitTypeUsage = useCallback((unitTypeId: string) => {
    const allocations = getAllocationsByUnitTypeId(unitTypeId);
    const totalUnits = allocations.reduce((sum, allocation) => {
      return sum + parseInt(allocation.count as string || "0");
    }, 0);
    
    return {
      totalUnits,
      floorCount: new Set(allocations.map(a => a.floorNumber)).size
    };
  }, [getAllocationsByUnitTypeId]);
  
  const handleAddUnitType = useCallback(() => {
    if (!hasCategories) {
      toast({
        title: "Cannot add unit type",
        description: "Please create at least one category first.",
        variant: "destructive"
      });
      return;
    }
    
    const newUnitId = addUnitType();
    if (newUnitId) {
      setEditingUnitType(
        unitTypes.find(ut => ut.id === newUnitId) || null
      );
    }
  }, [addUnitType, hasCategories, toast, unitTypes]);
  
  const handleSaveUnitType = useCallback(() => {
    if (editingUnitType) {
      // Validation
      if (!editingUnitType.name || editingUnitType.name.trim() === "") {
        toast({
          title: "Invalid unit type name",
          description: "Please provide a name for the unit type.",
          variant: "destructive"
        });
        return;
      }
      
      if (!editingUnitType.typicalSize || parseInt(editingUnitType.typicalSize) <= 0) {
        toast({
          title: "Invalid unit size",
          description: "Please provide a valid size greater than 0.",
          variant: "destructive"
        });
        return;
      }
      
      // All good, clear editing state
      setEditingUnitType(null);
      
      toast({
        title: "Unit type saved",
        description: `"${editingUnitType.name}" has been successfully saved.`
      });
    }
  }, [editingUnitType, toast]);
  
  const handleAddCategory = useCallback(() => {
    if (!newCategoryName || newCategoryName.trim() === "") {
      toast({
        title: "Invalid category name",
        description: "Please provide a name for the category.",
        variant: "destructive"
      });
      return;
    }
    
    const success = addCustomCategory(newCategoryName, newCategoryColor, newCategoryDescription);
    
    if (success) {
      setIsAddingCategory(false);
      setNewCategoryName("");
      setNewCategoryColor("#E5DEFF");
      setNewCategoryDescription("");
      
      toast({
        title: "Category added",
        description: `"${newCategoryName}" has been successfully added.`
      });
    } else {
      toast({
        title: "Category already exists",
        description: "A category with this name already exists.",
        variant: "destructive"
      });
    }
  }, [addCustomCategory, newCategoryName, newCategoryColor, newCategoryDescription, toast]);
  
  const handleDeleteCategory = useCallback((category: string) => {
    setDeletingCategory(category);
  }, []);
  
  const confirmDeleteCategory = useCallback(() => {
    if (!deletingCategory) return;
    
    removeCategory(deletingCategory);
    setDeletingCategory(null);
    setShowUndoToast(true);
    
    toast({
      title: "Category deleted",
      description: (
        <div className="flex items-center justify-between">
          <span>"{deletingCategory}" has been deleted.</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              undoRemoveCategory();
              setShowUndoToast(false);
            }}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Undo
          </Button>
        </div>
      ),
      duration: 5000
    });
  }, [deletingCategory, removeCategory, toast, undoRemoveCategory]);
  
  // Filter unit types based on active tab
  const filteredUnitTypes = useMemo(() => {
    if (activeTab === "all") {
      return unitTypes;
    } else {
      return unitTypes.filter(unit => unit.category === activeTab);
    }
  }, [unitTypes, activeTab]);
  
  // Calculate usage statistics
  const usageStats = useMemo(() => {
    const stats: Record<string, {category: string, count: number, totalArea: number}> = {};
    
    unitTypes.forEach(unitType => {
      const usage = getUnitTypeUsage(unitType.id);
      const category = unitType.category;
      const typicalSize = parseInt(unitType.typicalSize) || 0;
      const totalArea = usage.totalUnits * typicalSize;
      
      if (!stats[category]) {
        stats[category] = {
          category,
          count: 0,
          totalArea: 0
        };
      }
      
      stats[category].count += usage.totalUnits;
      stats[category].totalArea += totalArea;
    });
    
    return Object.values(stats);
  }, [unitTypes, getUnitTypeUsage]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Unit Types</DialogTitle>
          <DialogDescription>
            Create and manage unit types that can be assigned to floors
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Left Column - Categories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Categories</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsAddingCategory(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Category
              </Button>
            </div>
            
            {categories.length > 0 ? (
              <ScrollArea className="h-[300px] border rounded-md p-2">
                <div className="space-y-1">
                  {categories.map(category => (
                    <div 
                      key={category} 
                      className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 group"
                    >
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: getCategoryColor(category) }}
                        />
                        <span className="text-sm font-medium">{category}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={() => handleDeleteCategory(category)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="border rounded-md p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  No categories defined yet. Add your first category to get started.
                </p>
              </div>
            )}
            
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Usage Summary</h3>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Units</TableHead>
                      <TableHead className="text-right">Area (sf)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usageStats.length > 0 ? (
                      usageStats.map(stat => (
                        <TableRow key={stat.category}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: getCategoryColor(stat.category) }}
                              />
                              <span>{stat.category}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{stat.count}</TableCell>
                          <TableCell className="text-right">{stat.totalArea.toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          No usage data available
                        </TableCell>
                      </TableRow>
                    )}
                    {usageStats.length > 0 && (
                      <TableRow>
                        <TableCell className="font-medium">Total</TableCell>
                        <TableCell className="text-right font-medium">
                          {usageStats.reduce((sum, stat) => sum + stat.count, 0)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {usageStats.reduce((sum, stat) => sum + stat.totalArea, 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          
          {/* Right Column - Unit Types */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab} 
                className="w-full"
              >
                <div className="flex items-center justify-between">
                  <TabsList>
                    <TabsTrigger value="all">All Types</TabsTrigger>
                    {categories.map(category => (
                      <TabsTrigger key={category} value={category}>
                        {category}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <Button onClick={handleAddUnitType}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Unit Type
                  </Button>
                </div>
              </Tabs>
            </div>
            
            <ScrollArea className="h-[450px] border rounded-md">
              <div className="p-4 space-y-4">
                {filteredUnitTypes.length > 0 ? (
                  filteredUnitTypes.map(unitType => {
                    const usage = getUnitTypeUsage(unitType.id);
                    const isEditing = editingUnitType?.id === unitType.id;
                    
                    return (
                      <Card key={unitType.id} className="overflow-hidden">
                        <div 
                          className="h-2" 
                          style={{ backgroundColor: unitType.color || getCategoryColor(unitType.category) }}
                        ></div>
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-start justify-between">
                            {isEditing ? (
                              <div className="w-full">
                                <div className="space-y-2">
                                  <div>
                                    <Label htmlFor="unit-name">Name</Label>
                                    <Input
                                      id="unit-name"
                                      value={editingUnitType.name}
                                      onChange={(e) => setEditingUnitType({
                                        ...editingUnitType,
                                        name: e.target.value
                                      })}
                                      placeholder="Unit Type Name"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <Label htmlFor="unit-category">Category</Label>
                                      <Select
                                        value={editingUnitType.category}
                                        onValueChange={(value) => setEditingUnitType({
                                          ...editingUnitType,
                                          category: value,
                                          color: getCategoryColor(value)
                                        })}
                                      >
                                        <SelectTrigger id="unit-category">
                                          <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {categories.map(category => (
                                            <SelectItem key={category} value={category}>
                                              {category}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label htmlFor="unit-size">Size (sq ft)</Label>
                                      <Input
                                        id="unit-size"
                                        type="number"
                                        value={editingUnitType.typicalSize}
                                        onChange={(e) => setEditingUnitType({
                                          ...editingUnitType,
                                          typicalSize: e.target.value
                                        })}
                                        placeholder="0"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <Label htmlFor="unit-description">Description (optional)</Label>
                                    <Textarea
                                      id="unit-description"
                                      value={editingUnitType.description || ""}
                                      onChange={(e) => setEditingUnitType({
                                        ...editingUnitType,
                                        description: e.target.value
                                      })}
                                      placeholder="Enter description"
                                      rows={2}
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div>
                                  <CardTitle className="text-base">{unitType.name}</CardTitle>
                                  <CardDescription className="flex items-center mt-1">
                                    <Badge
                                      variant="outline"
                                      className="mr-2"
                                      style={{ 
                                        backgroundColor: `${getCategoryColor(unitType.category)}40`,
                                        color: getCategoryColor(unitType.category) 
                                      }}
                                    >
                                      {unitType.category}
                                    </Badge>
                                    <span>{parseInt(unitType.typicalSize).toLocaleString()} sq ft</span>
                                  </CardDescription>
                                </div>
                                
                                <div className="flex items-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingUnitType(unitType)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeUnitType(unitType.id)}
                                    disabled={usage.totalUnits > 0}
                                  >
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span>
                                          <Trash2 className={`h-4 w-4 ${usage.totalUnits > 0 ? 'text-muted-foreground' : 'text-red-500'}`} />
                                        </span>
                                      </TooltipTrigger>
                                      {usage.totalUnits > 0 && (
                                        <TooltipContent>
                                          <p>Remove all allocations first</p>
                                        </TooltipContent>
                                      )}
                                    </Tooltip>
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          {!isEditing && unitType.description && (
                            <p className="text-sm text-muted-foreground">
                              {unitType.description}
                            </p>
                          )}
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-between items-center">
                          {isEditing ? (
                            <div className="flex justify-end space-x-2 w-full">
                              <Button
                                variant="outline"
                                onClick={() => setEditingUnitType(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleSaveUnitType}
                              >
                                <Save className="h-4 w-4 mr-1" />
                                Save
                              </Button>
                            </div>
                          ) : (
                            <div className="w-full">
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div>
                                  <span className="font-medium">{usage.totalUnits}</span> units allocated
                                </div>
                                {usage.floorCount > 0 && (
                                  <div>
                                    <span className="font-medium">{usage.floorCount}</span> floors
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium">{(usage.totalUnits * parseInt(unitType.typicalSize)).toLocaleString()}</span> total sq ft
                                </div>
                              </div>
                            </div>
                          )}
                        </CardFooter>
                      </Card>
                    );
                  })
                ) : (
                  <div className="text-center p-8">
                    <p className="text-muted-foreground">No unit types found</p>
                    {activeTab !== "all" ? (
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={handleAddUnitType}
                      >
                        Add Unit Type to {activeTab}
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={handleAddUnitType}
                      >
                        Create Your First Unit Type
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            {unitTypes.length} unit types across {categories.length} categories
          </div>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
      
      {/* Add Category Dialog */}
      <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>
              Create a new category for organizing unit types
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Retail, Office, Residential"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category-color">Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="category-color"
                  type="color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="w-24 h-10"
                />
                <div 
                  className="w-full h-10 rounded-md border"
                  style={{ backgroundColor: newCategoryColor }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category-description">Description (Optional)</Label>
              <Textarea
                id="category-description"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                placeholder="Enter a description for this category"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingCategory(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Category Confirmation */}
      <AlertDialog open={!!deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the category "{deletingCategory}"? 
              This will also remove any unit types associated with this category.
              This action can be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteCategory}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default UnitTypeManager;
