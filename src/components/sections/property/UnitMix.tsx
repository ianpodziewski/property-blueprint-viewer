import { useState, useEffect } from "react";
import { PlusCircle, Pencil, Trash2, X, Check, ChevronDown, ChevronUp } from "lucide-react";
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
import { Product, UnitType } from "@/hooks/usePropertyState";

const formatNumber = (num: number | undefined): string => {
  return num === undefined || isNaN(num) ? "" : num.toLocaleString('en-US');
};

const UnitMix = () => {
  const { property, setHasUnsavedChanges } = useModel();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isDeleteProductDialogOpen, setIsDeleteProductDialogOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [productNameError, setProductNameError] = useState("");
  
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [showUnitTypeForm, setShowUnitTypeForm] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [isDeleteUnitDialogOpen, setIsDeleteUnitDialogOpen] = useState(false);
  const [deleteUnitInfo, setDeleteUnitInfo] = useState<{productId: string, unitId: string} | null>(null);
  
  const [unitType, setUnitType] = useState("");
  const [numberOfUnits, setNumberOfUnits] = useState("");
  const [width, setWidth] = useState("");
  const [length, setLength] = useState("");
  const [grossArea, setGrossArea] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  console.log("UnitMix rendering with products:", property.products);
  
  useEffect(() => {
    console.log("UnitMix products updated:", property.products);
  }, [property.products]);
  
  const toggleProductExpansion = (productId: string) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };
  
  const handleAddProduct = () => {
    setProductName("");
    setProductNameError("");
    setEditingProductId(null);
    setIsProductDialogOpen(true);
  };
  
  const handleEditProduct = (product: Product) => {
    setProductName(product.name);
    setProductNameError("");
    setEditingProductId(product.id);
    setIsProductDialogOpen(true);
  };
  
  const handleDeleteProductConfirm = (id: string) => {
    setDeleteProductId(id);
    setIsDeleteProductDialogOpen(true);
  };
  
  const handleDeleteProduct = () => {
    if (deleteProductId) {
      property.deleteProduct(deleteProductId);
      setHasUnsavedChanges(true);
      setIsDeleteProductDialogOpen(false);
      setDeleteProductId(null);
    }
  };
  
  const handleSaveProduct = () => {
    if (!productName.trim()) {
      setProductNameError("Product name is required");
      return;
    }
    
    const isDuplicate = property.products.some(
      p => p.name.toLowerCase() === productName.trim().toLowerCase() && 
        p.id !== editingProductId
    );
    
    if (isDuplicate) {
      setProductNameError("A product with this name already exists");
      return;
    }
    
    if (editingProductId) {
      property.updateProduct(editingProductId, productName);
    } else {
      property.addProduct(productName);
    }
    
    setHasUnsavedChanges(true);
    setIsProductDialogOpen(false);
    setProductName("");
    setProductNameError("");
  };
  
  const handleShowUnitTypeForm = (productId: string, unitId?: string) => {
    setActiveProductId(productId);
    setFormErrors({});
    
    if (unitId) {
      const product = property.products.find(p => p.id === productId);
      const unit = product?.unitTypes.find(u => u.id === unitId);
      
      if (unit) {
        setEditingUnitId(unitId);
        setUnitType(unit.unitType);
        setNumberOfUnits(String(unit.numberOfUnits));
        setWidth(unit.width ? String(unit.width) : "");
        setLength(unit.length ? String(unit.length) : "");
        setGrossArea(String(unit.grossArea));
      }
    } else {
      resetUnitTypeForm();
      setEditingUnitId(null);
    }
    
    setShowUnitTypeForm(true);
    
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: true
    }));
  };
  
  const resetUnitTypeForm = () => {
    setUnitType("");
    setNumberOfUnits("");
    setWidth("");
    setLength("");
    setGrossArea("");
  };
  
  const handleCancelUnitTypeForm = () => {
    setShowUnitTypeForm(false);
    setEditingUnitId(null);
    resetUnitTypeForm();
    setFormErrors({});
  };
  
  const handleNumericChange = (value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    setter(numericValue);
  };
  
  const calculateGrossArea = () => {
    const widthValue = parseFloat(width);
    const lengthValue = parseFloat(length);
    
    if (!isNaN(widthValue) && !isNaN(lengthValue)) {
      const area = widthValue * lengthValue;
      setGrossArea(String(Math.round(area)));
      return true;
    }
    return false;
  };
  
  const handleWidthChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    setWidth(numericValue);
    
    if (numericValue && length) {
      calculateGrossArea();
    }
  };
  
  const handleLengthChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    setLength(numericValue);
    
    if (numericValue && width) {
      calculateGrossArea();
    }
  };
  
  const handleSaveUnitType = () => {
    const errors: Record<string, string> = {};
    
    if (!unitType.trim()) {
      errors.unitType = "Unit Type is required";
    }
    
    if (!numberOfUnits) {
      errors.numberOfUnits = "Number of units is required";
    } else if (isNaN(parseFloat(numberOfUnits)) || parseFloat(numberOfUnits) <= 0) {
      errors.numberOfUnits = "Number of units must be a positive number";
    }
    
    if (width && (isNaN(parseFloat(width)) || parseFloat(width) <= 0)) {
      errors.width = "Width must be a positive number";
    }
    
    if (length && (isNaN(parseFloat(length)) || parseFloat(length) <= 0)) {
      errors.length = "Length must be a positive number";
    }
    
    if (!grossArea) {
      errors.grossArea = "Gross area is required";
    } else if (isNaN(parseFloat(grossArea)) || parseFloat(grossArea) <= 0) {
      errors.grossArea = "Gross area must be a positive number";
    }
    
    if (activeProductId) {
      const product = property.products.find(p => p.id === activeProductId);
      const isDuplicate = product?.unitTypes.some(
        u => u.unitType.toLowerCase() === unitType.trim().toLowerCase() && 
            u.id !== editingUnitId
      );
      
      if (isDuplicate) {
        errors.unitType = "This unit type already exists in this product";
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    if (activeProductId) {
      const unitData = {
        unitType: unitType.trim(),
        numberOfUnits: parseFloat(numberOfUnits),
        width: width ? parseFloat(width) : undefined,
        length: length ? parseFloat(length) : undefined,
        grossArea: parseFloat(grossArea)
      };
      
      if (editingUnitId) {
        property.updateUnitType(activeProductId, editingUnitId, unitData);
      } else {
        property.addUnitType(activeProductId, unitData);
      }
      
      setHasUnsavedChanges(true);
      setShowUnitTypeForm(false);
      resetUnitTypeForm();
    }
  };
  
  const handleDeleteUnitConfirm = (productId: string, unitId: string) => {
    setDeleteUnitInfo({ productId, unitId });
    setIsDeleteUnitDialogOpen(true);
  };
  
  const handleDeleteUnit = () => {
    if (deleteUnitInfo) {
      property.deleteUnitType(deleteUnitInfo.productId, deleteUnitInfo.unitId);
      setHasUnsavedChanges(true);
      setIsDeleteUnitDialogOpen(false);
      setDeleteUnitInfo(null);
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
              onClick={handleAddProduct}
            >
              <PlusCircle className="h-4 w-4 mr-1" /> Add Product
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
          
          {property.products.length === 0 ? (
            <Card className="bg-gray-50 border border-dashed border-gray-200">
              <CardContent className="py-6 flex flex-col items-center justify-center text-center">
                <p className="text-gray-500 mb-4">No products added yet</p>
                <Button variant="outline" size="sm" onClick={handleAddProduct}>
                  <PlusCircle className="h-4 w-4 mr-1" /> Add your first product
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {property.products.map((product) => {
                const isExpanded = expandedProducts[product.id] !== false;
                
                return (
                  <Card key={product.id} className="bg-white overflow-hidden">
                    <div 
                      className="py-3 px-4 flex items-center justify-between cursor-pointer bg-gray-50"
                      onClick={() => toggleProductExpansion(product.id)}
                    >
                      <div className="font-medium flex items-center">
                        {isExpanded ? 
                          <ChevronDown className="h-4 w-4 mr-2" /> : 
                          <ChevronUp className="h-4 w-4 mr-2" />
                        }
                        {product.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProduct(product);
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
                            handleDeleteProductConfirm(product.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <CardContent className="p-4 pt-3">
                        {product.unitTypes.length === 0 && !showUnitTypeForm && (
                          <div className="text-sm text-gray-500 py-2">
                            No unit types added yet
                          </div>
                        )}
                        
                        {product.unitTypes.map((unit) => (
                          <div 
                            key={unit.id} 
                            className="py-2 px-1 flex items-center justify-between border-b last:border-0"
                          >
                            <div>
                              <div className="font-medium">{unit.unitType}</div>
                              <div className="text-sm text-gray-500">
                                {unit.numberOfUnits} unit{unit.numberOfUnits !== 1 ? 's' : ''}, {formatNumber(unit.grossArea)} sf
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0" 
                                onClick={() => handleShowUnitTypeForm(product.id, unit.id)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-red-500" 
                                onClick={() => handleDeleteUnitConfirm(product.id, unit.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        {showUnitTypeForm && activeProductId === product.id ? (
                          <div className="mt-4 p-3 border rounded-md bg-gray-50">
                            <div className="text-sm font-medium mb-3">
                              {editingUnitId ? "Edit Unit Type" : "Add Unit Type"}
                            </div>
                            <div className="space-y-3">
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
                              
                              <div className="space-y-2">
                                <Label htmlFor="number-of-units"># of Units</Label>
                                <Input
                                  id="number-of-units"
                                  value={numberOfUnits}
                                  onChange={(e) => handleNumericChange(e.target.value, setNumberOfUnits)}
                                  className={formErrors.numberOfUnits ? "border-red-500" : ""}
                                />
                                {formErrors.numberOfUnits && (
                                  <div className="text-xs text-red-500">{formErrors.numberOfUnits}</div>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3">
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
                                  onChange={(e) => handleNumericChange(e.target.value, setGrossArea)}
                                  readOnly={!!(width && length)}
                                  className={`${formErrors.grossArea ? "border-red-500" : ""} ${
                                    width && length ? "bg-gray-50" : ""
                                  }`}
                                />
                                {formErrors.grossArea && (
                                  <div className="text-xs text-red-500">{formErrors.grossArea}</div>
                                )}
                              </div>
                              
                              <div className="flex justify-end gap-2 pt-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={handleCancelUnitTypeForm}
                                >
                                  <X className="h-4 w-4 mr-1" /> Cancel
                                </Button>
                                <Button 
                                  size="sm" 
                                  onClick={handleSaveUnitType}
                                >
                                  <Check className="h-4 w-4 mr-1" /> {editingUnitId ? "Update" : "Save"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleShowUnitTypeForm(product.id)}
                              className="mt-1"
                            >
                              <PlusCircle className="h-4 w-4 mr-1" /> Add Unit Type
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
      
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingProductId ? "Edit Product" : "Add Product"}</DialogTitle>
            <DialogDescription>
              {editingProductId 
                ? "Update the product name"
                : "Enter a name for the new product category"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">Product Name</Label>
              <Input
                id="product-name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className={productNameError ? "border-red-500" : ""}
                autoFocus
              />
              {productNameError && (
                <div className="text-xs text-red-500">{productNameError}</div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button onClick={handleSaveProduct}>
              <Check className="h-4 w-4 mr-2" /> {editingProductId ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteProductDialogOpen} onOpenChange={setIsDeleteProductDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? 
              This will remove all unit types within this product.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={isDeleteUnitDialogOpen} onOpenChange={setIsDeleteUnitDialogOpen}>
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
