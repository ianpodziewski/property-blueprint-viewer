
import { useState } from "react";
import { PlusCircle, Pencil, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useModel } from "@/context/ModelContext";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { UnitType } from "@/hooks/usePropertyState";

const formatNumber = (num: number | undefined): string => {
  return num === undefined || isNaN(num) ? "" : num.toLocaleString('en-US');
};

const UnitMix = () => {
  const { property, setHasUnsavedChanges } = useModel();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitType | null>(null);
  const [deleteUnitId, setDeleteUnitId] = useState<string | null>(null);
  
  // Form state
  const [product, setProduct] = useState("");
  const [unitType, setUnitType] = useState("");
  const [width, setWidth] = useState("");
  const [length, setLength] = useState("");
  const [grossArea, setGrossArea] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Debug logging to track unit state
  console.log("UnitMix rendering with units:", property.unitMix);
  
  // Check if unit already exists
  const isDuplicate = (product: string, unitType: string, excludeId?: string): boolean => {
    return property.unitMix.some(
      unit => 
        unit.product.toLowerCase() === product.toLowerCase() && 
        unit.unitType.toLowerCase() === unitType.toLowerCase() && 
        unit.id !== excludeId
    );
  };
  
  // Handle opening the add unit dialog
  const handleAddUnit = () => {
    resetForm();
    setEditingUnit(null);
    setIsDialogOpen(true);
  };
  
  // Handle opening the edit unit dialog
  const handleEditUnit = (unit: UnitType) => {
    setEditingUnit(unit);
    setProduct(unit.product);
    setUnitType(unit.unitType);
    setWidth(unit.width ? String(unit.width) : "");
    setLength(unit.length ? String(unit.length) : "");
    setGrossArea(String(unit.grossArea));
    setIsDialogOpen(true);
  };
  
  // Handle opening the delete confirmation dialog
  const handleDeleteConfirm = (id: string) => {
    setDeleteUnitId(id);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle deleting a unit
  const handleDeleteUnit = () => {
    if (deleteUnitId) {
      property.deleteUnitType(deleteUnitId);
      setHasUnsavedChanges(true);
      setIsDeleteDialogOpen(false);
      setDeleteUnitId(null);
    }
  };
  
  // Reset form fields
  const resetForm = () => {
    setProduct("");
    setUnitType("");
    setWidth("");
    setLength("");
    setGrossArea("");
    setFormErrors({});
  };
  
  // Automatically calculate gross area when width and length are provided
  const calculateGrossArea = () => {
    const widthValue = parseFloat(width);
    const lengthValue = parseFloat(length);
    
    if (!isNaN(widthValue) && !isNaN(lengthValue)) {
      const area = widthValue * lengthValue;
      setGrossArea(String(Math.round(area)));
    }
  };
  
  // Handle width change
  const handleWidthChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    setWidth(numericValue);
    
    if (numericValue && length) {
      calculateGrossArea();
    }
  };
  
  // Handle length change
  const handleLengthChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    setLength(numericValue);
    
    if (numericValue && width) {
      calculateGrossArea();
    }
  };
  
  // Handle gross area change
  const handleGrossAreaChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setGrossArea(numericValue);
  };
  
  // Validate form inputs
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!product.trim()) {
      errors.product = "Product is required";
    }
    
    if (!unitType.trim()) {
      errors.unitType = "Unit Type is required";
    } else if (isDuplicate(product, unitType, editingUnit?.id)) {
      errors.unitType = "This unit type already exists";
    }
    
    if (width && isNaN(parseFloat(width))) {
      errors.width = "Width must be a number";
    }
    
    if (length && isNaN(parseFloat(length))) {
      errors.length = "Length must be a number";
    }
    
    if (!grossArea) {
      errors.grossArea = "Gross area is required";
    } else if (isNaN(parseFloat(grossArea))) {
      errors.grossArea = "Gross area must be a number";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle saving a unit
  const handleSaveUnit = () => {
    if (validateForm()) {
      const unitData = {
        product: product.trim(),
        unitType: unitType.trim(),
        width: width ? parseFloat(width) : undefined,
        length: length ? parseFloat(length) : undefined,
        grossArea: parseFloat(grossArea)
      };
      
      if (editingUnit) {
        property.updateUnitType(editingUnit.id, unitData);
      } else {
        property.addUnitType(unitData);
      }
      
      setHasUnsavedChanges(true);
      setIsDialogOpen(false);
      resetForm();
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
          <h3 className="text-lg font-medium">Unit Mix</h3>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAddUnit}
            >
              <PlusCircle className="h-4 w-4 mr-1" /> Add Unit Type
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
            Define the types of units for your development
          </div>
          
          {property.unitMix.length === 0 ? (
            <Card className="bg-gray-50 border border-dashed border-gray-200">
              <CardContent className="py-6 flex flex-col items-center justify-center text-center">
                <p className="text-gray-500 mb-4">No unit types added yet</p>
                <Button variant="outline" size="sm" onClick={handleAddUnit}>
                  <PlusCircle className="h-4 w-4 mr-1" /> Add your first unit type
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {property.unitMix.map((unit) => (
                <Card key={unit.id} className="bg-white">
                  <CardContent className="py-3 px-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{unit.product}: {unit.unitType}</div>
                      <div className="text-sm text-gray-500">
                        {formatNumber(unit.grossArea)} sf
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0" 
                        onClick={() => handleEditUnit(unit)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-500" 
                        onClick={() => handleDeleteConfirm(unit.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
      
      {/* Add/Edit Unit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingUnit ? "Edit Unit Type" : "Add Unit Type"}</DialogTitle>
            <DialogDescription>
              {editingUnit 
                ? "Modify the unit type details"
                : "Create a new unit type"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <Input
                id="product"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className={formErrors.product ? "border-red-500" : ""}
              />
              {formErrors.product && (
                <div className="text-xs text-red-500">{formErrors.product}</div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit-type">Unit Type</Label>
              <Input
                id="unit-type"
                value={unitType}
                onChange={(e) => setUnitType(e.target.value)}
                className={formErrors.unitType ? "border-red-500" : ""}
              />
              {formErrors.unitType && (
                <div className="text-xs text-red-500">{formErrors.unitType}</div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width (ft)</Label>
                <Input
                  id="width"
                  value={width}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  className={formErrors.width ? "border-red-500" : ""}
                />
                {formErrors.width && (
                  <div className="text-xs text-red-500">{formErrors.width}</div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="length">Length (ft)</Label>
                <Input
                  id="length"
                  value={length}
                  onChange={(e) => handleLengthChange(e.target.value)}
                  className={formErrors.length ? "border-red-500" : ""}
                />
                {formErrors.length && (
                  <div className="text-xs text-red-500">{formErrors.length}</div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gross-area">
                Gross Area (sf)
                {width && length ? (
                  <span className="ml-2 text-xs text-gray-500">(Calculated)</span>
                ) : null}
              </Label>
              <Input
                id="gross-area"
                value={grossArea}
                onChange={(e) => handleGrossAreaChange(e.target.value)}
                readOnly={!!(width && length)}
                className={`${formErrors.grossArea ? "border-red-500" : ""} ${
                  width && length ? "bg-gray-50" : ""
                }`}
              />
              {formErrors.grossArea && (
                <div className="text-xs text-red-500">{formErrors.grossArea}</div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button onClick={handleSaveUnit}>
              <Check className="h-4 w-4 mr-2" /> {editingUnit ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Unit Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this unit type? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUnit} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UnitMix;
