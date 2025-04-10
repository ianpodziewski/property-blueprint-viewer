
import { useState } from "react";
import { PlusCircle, Pencil, Trash2, X, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
import { Product, UnitType } from "@/hooks/usePropertyState";

const formatNumber = (num: number | undefined): string => {
  return num === undefined || isNaN(num) ? "" : num.toLocaleString('en-US');
};

// Define props interface for the component
interface UnitMixProps {
  products: Product[];
  onAddProduct: (name: string) => Promise<Product | null>;
  onUpdateProduct: (id: string, name: string) => Promise<boolean>;
  onDeleteProduct: (id: string) => Promise<boolean>;
  onAddUnitType: (productId: string, unit: Omit<UnitType, 'id'>) => Promise<UnitType | null>;
  onUpdateUnitType: (productId: string, unitId: string, updates: Partial<Omit<UnitType, 'id'>>) => Promise<boolean>;
  onDeleteUnitType: (productId: string, unitId: string) => Promise<boolean>;
}

const UnitMix = ({ 
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddUnitType,
  onUpdateUnitType,
  onDeleteUnitType
}: UnitMixProps) => {
  // Changed the initial state to an empty object so all products start collapsed
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Product modal state
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isDeleteProductDialogOpen, setIsDeleteProductDialogOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [productNameError, setProductNameError] = useState("");
  
  // Unit type form state
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [showUnitTypeForm, setShowUnitTypeForm] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [isDeleteUnitDialogOpen, setIsDeleteUnitDialogOpen] = useState(false);
  const [deleteUnitInfo, setDeleteUnitInfo] = useState<{productId: string, unitId: string} | null>(null);
  
  // Unit type form fields
  const [unitType, setUnitType] = useState("");
  const [numberOfUnits, setNumberOfUnits] = useState("");
  const [width, setWidth] = useState("");
  const [length, setLength] = useState("");
  const [grossArea, setGrossArea] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Debug logging
  console.log("UnitMix rendering with products:", products);
  
  // Toggle product expansion
  const toggleProductExpansion = (productId: string) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };
  
  // Handle opening the add product dialog
  const handleAddProduct = () => {
    setProductName("");
    setProductNameError("");
    setEditingProductId(null);
    setIsProductDialogOpen(true);
  };
  
  // Handle opening the edit product dialog
  const handleEditProduct = (product: Product) => {
    setProductName(product.name);
    setProductNameError("");
    setEditingProductId(product.id);
    setIsProductDialogOpen(true);
  };
  
  // Handle deleting a product
  const handleDeleteProductConfirm = (id: string) => {
    setDeleteProductId(id);
    setIsDeleteProductDialogOpen(true);
  };
  
  const handleDeleteProduct = async () => {
    if (deleteProductId) {
      setIsSubmitting(true);
      const success = await onDeleteProduct(deleteProductId);
      setIsSubmitting(false);
      
      if (success) {
        setIsDeleteProductDialogOpen(false);
        setDeleteProductId(null);
      }
    }
  };
  
  // Handle saving a product
  const handleSaveProduct = async () => {
    // Validate product name
    if (!productName.trim()) {
      setProductNameError("Product name is required");
      return;
    }
    
    // Check for duplicate product name
    const isDuplicate = products.some(
      p => p.name.toLowerCase() === productName.trim().toLowerCase() && 
        p.id !== editingProductId
    );
    
    if (isDuplicate) {
      setProductNameError("A product with this name already exists");
      return;
    }
    
    setIsSubmitting(true);
    let success = false;
    
    if (editingProductId) {
      success = await onUpdateProduct(editingProductId, productName);
    } else {
      const result = await onAddProduct(productName);
      success = !!result;
    }
    
    setIsSubmitting(false);
    
    if (success) {
      setIsProductDialogOpen(false);
      setProductName("");
      setProductNameError("");
    }
  };
  
  // Handle showing the unit type form
  const handleShowUnitTypeForm = (productId: string, unitId?: string) => {
    setActiveProductId(productId);
    setFormErrors({});
    
    if (unitId) {
      // Editing existing unit
      const product = products.find(p => p.id === productId);
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
      // Adding new unit
      resetUnitTypeForm();
      setEditingUnitId(null);
    }
    
    setShowUnitTypeForm(true);
    
    // Make sure the product section is expanded
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: true
    }));
  };
  
  // Reset unit type form fields
  const resetUnitTypeForm = () => {
    setUnitType("");
    setNumberOfUnits("");
    setWidth("");
    setLength("");
    setGrossArea("");
  };
  
  // Handle unit type form cancellation
  const handleCancelUnitTypeForm = () => {
    setShowUnitTypeForm(false);
    setEditingUnitId(null);
    resetUnitTypeForm();
    setFormErrors({});
  };
  
  // Handle numeric input changes
  const handleNumericChange = (value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    setter(numericValue);
  };
  
  // Calculate gross area when width and length are provided
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
  
  // Handle unit type form submission
  const handleSaveUnitType = async () => {
    // Validate form inputs
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
    
    // Check for duplicate unit type within the same product
    if (activeProductId) {
      const product = products.find(p => p.id === activeProductId);
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
      setIsSubmitting(true);
      let success = false;
      
      const unitData = {
        unitType: unitType.trim(),
        numberOfUnits: parseFloat(numberOfUnits),
        width: width ? parseFloat(width) : undefined,
        length: length ? parseFloat(length) : undefined,
        grossArea: parseFloat(grossArea)
      };
      
      if (editingUnitId) {
        success = await onUpdateUnitType(activeProductId, editingUnitId, unitData);
      } else {
        const result = await onAddUnitType(activeProductId, unitData);
        success = !!result;
      }
      
      setIsSubmitting(false);
      
      if (success) {
        setShowUnitTypeForm(false);
        resetUnitTypeForm();
      }
    }
  };
  
  // Handle deleting a unit type
  const handleDeleteUnitConfirm = (productId: string, unitId: string) => {
    setDeleteUnitInfo({ productId, unitId });
    setIsDeleteUnitDialogOpen(true);
  };
  
  const handleDeleteUnit = async () => {
    if (deleteUnitInfo) {
      setIsSubmitting(true);
      const success = await onDeleteUnitType(deleteUnitInfo.productId, deleteUnitInfo.unitId);
      setIsSubmitting(false);
      
      if (success) {
        setIsDeleteUnitDialogOpen(false);
        setDeleteUnitInfo(null);
      }
    }
  };
  
  return (
    <>
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex-1"></div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddProduct}
          >
            <PlusCircle className="h-4 w-4 mr-1" /> Add Product
          </Button>
        </div>
        
        <div className="pt-2">
          {products.length === 0 ? (
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
              {products.map((product) => {
                const isExpanded = !!expandedProducts[product.id];
                
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
                      <CardContent className="py-4 px-4">
                        {/* Unit types list */}
                        {product.unitTypes.length === 0 ? (
                          <div className="text-center py-4 text-gray-500">
                            No unit types added yet
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {product.unitTypes.map((unit) => (
                              <div 
                                key={unit.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                              >
                                <div>
                                  <div className="font-medium">{unit.unitType}</div>
                                  <div className="text-sm text-gray-500">
                                    {formatNumber(unit.grossArea)} sf | {unit.numberOfUnits} units
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
                          </div>
                        )}
                        
                        {/* Show unit type form if active */}
                        {showUnitTypeForm && activeProductId === product.id ? (
                          <>
                            <Separator className="my-4" />
                            <div className="space-y-4">
                              <h4 className="font-medium text-sm">
                                {editingUnitId ? "Edit Unit Type" : "Add Unit Type"}
                              </h4>
                              
                              <div className="grid gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="unit-type">Unit Type</Label>
                                  <Input 
                                    id="unit-type"
                                    value={unitType}
                                    onChange={(e) => setUnitType(e.target.value)}
                                    placeholder="Studio, 1BR/1BA, etc."
                                    className={formErrors.unitType ? "border-red-500" : ""}
                                  />
                                  {formErrors.unitType && (
                                    <div className="text-xs text-red-500">{formErrors.unitType}</div>
                                  )}
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="number-of-units">Number of Units</Label>
                                  <Input 
                                    id="number-of-units"
                                    type="number"
                                    min="1"
                                    value={numberOfUnits}
                                    onChange={(e) => handleNumericChange(e.target.value, setNumberOfUnits)}
                                    placeholder="Number of units"
                                    className={formErrors.numberOfUnits ? "border-red-500" : ""}
                                  />
                                  {formErrors.numberOfUnits && (
                                    <div className="text-xs text-red-500">{formErrors.numberOfUnits}</div>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="unit-width">Width (ft)</Label>
                                    <Input 
                                      id="unit-width"
                                      value={width}
                                      onChange={(e) => handleWidthChange(e.target.value)}
                                      placeholder="Optional"
                                      className={formErrors.width ? "border-red-500" : ""}
                                    />
                                    {formErrors.width && (
                                      <div className="text-xs text-red-500">{formErrors.width}</div>
                                    )}
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="unit-length">Length (ft)</Label>
                                    <Input 
                                      id="unit-length"
                                      value={length}
                                      onChange={(e) => handleLengthChange(e.target.value)}
                                      placeholder="Optional"
                                      className={formErrors.length ? "border-red-500" : ""}
                                    />
                                    {formErrors.length && (
                                      <div className="text-xs text-red-500">{formErrors.length}</div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="unit-gross-area">
                                    Gross Area (sf)
                                    {width && length ? (
                                      <span className="ml-2 text-xs text-gray-500">(Calculated)</span>
                                    ) : null}
                                  </Label>
                                  <Input 
                                    id="unit-gross-area"
                                    value={grossArea}
                                    onChange={(e) => handleNumericChange(e.target.value, setGrossArea)}
                                    placeholder="Enter area"
                                    className={`${formErrors.grossArea ? "border-red-500" : ""} ${
                                      width && length ? "bg-gray-50" : ""
                                    }`}
                                  />
                                  {formErrors.grossArea && (
                                    <div className="text-xs text-red-500">{formErrors.grossArea}</div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={handleCancelUnitTypeForm} disabled={isSubmitting}>
                                  <X className="h-4 w-4 mr-2" /> Cancel
                                </Button>
                                <Button onClick={handleSaveUnitType} disabled={isSubmitting}>
                                  {isSubmitting ? (
                                    <>
                                      <span className="animate-spin mr-2">◌</span> 
                                      {editingUnitId ? "Updating..." : "Saving..."}
                                    </>
                                  ) : (
                                    <>
                                      <Check className="h-4 w-4 mr-2" /> {editingUnitId ? "Update" : "Save"}
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-4"
                            onClick={() => handleShowUnitTypeForm(product.id)}
                          >
                            <PlusCircle className="h-4 w-4 mr-1" /> Add Unit Type
                          </Button>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Add/Edit Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingProductId ? "Edit Product" : "Add Product"}</DialogTitle>
            <DialogDescription>
              {editingProductId 
                ? "Modify the product details"
                : "Create a new product"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">Product Name</Label>
              <Input
                id="product-name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Residential, Commercial, etc."
                className={productNameError ? "border-red-500" : ""}
              />
              {productNameError && (
                <div className="text-xs text-red-500">{productNameError}</div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProductDialogOpen(false)} disabled={isSubmitting}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button onClick={handleSaveProduct} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">◌</span> 
                  {editingProductId ? "Updating..." : "Saving..."}
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" /> {editingProductId ? "Update" : "Save"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Product Confirmation Dialog */}
      <AlertDialog open={isDeleteProductDialogOpen} onOpenChange={setIsDeleteProductDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product and all its unit types? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProduct} 
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
      
      {/* Delete Unit Type Confirmation Dialog */}
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
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUnit} 
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

export default UnitMix;
