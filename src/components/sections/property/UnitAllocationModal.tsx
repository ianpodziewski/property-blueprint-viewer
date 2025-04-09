
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FloorPlateTemplate, Product } from "@/hooks/usePropertyState";
import { toast } from "sonner";

interface UnitAllocationModalProps {
  floorId: string;
  products: Product[];
  floorTemplate?: FloorPlateTemplate;
  onUpdateUnitAllocation: (floorId: string, unitTypeId: string, quantity: number) => Promise<void>;
  getUnitAllocation: (floorId: string, unitTypeId: string) => Promise<number>;
  onClose: () => void;
}

interface UnitAllocation {
  unitTypeId: string;
  productId: string;
  unitTypeName: string;
  productName: string;
  area: number;
  quantity: number;
  isLoading: boolean;
}

const UnitAllocationModal: React.FC<UnitAllocationModalProps> = ({
  floorId,
  products,
  floorTemplate,
  onUpdateUnitAllocation,
  getUnitAllocation,
  onClose
}) => {
  const [allocations, setAllocations] = useState<UnitAllocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate floor area
  const floorArea = floorTemplate?.grossArea || 0;

  // Load initial allocations
  useEffect(() => {
    const loadAllocations = async () => {
      setIsLoading(true);
      
      try {
        const allUnitTypes: UnitAllocation[] = [];
        
        for (const product of products) {
          for (const unitType of product.unitTypes) {
            // Get current allocation for this unit type
            const quantity = await getUnitAllocation(floorId, unitType.id);
            
            allUnitTypes.push({
              unitTypeId: unitType.id,
              productId: product.id,
              unitTypeName: unitType.unitType,
              productName: product.name,
              area: unitType.grossArea,
              quantity,
              isLoading: false
            });
          }
        }
        
        setAllocations(allUnitTypes);
      } catch (error) {
        console.error("Error loading unit allocations:", error);
        toast.error("Failed to load unit allocations");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAllocations();
  }, [floorId, products, getUnitAllocation]);

  // Update a single allocation
  const handleUpdateAllocation = async (unitTypeId: string, quantity: number) => {
    // Update local state first for immediate feedback
    setAllocations(prev => 
      prev.map(alloc => 
        alloc.unitTypeId === unitTypeId 
          ? { ...alloc, quantity, isLoading: true } 
          : alloc
      )
    );
    
    try {
      await onUpdateUnitAllocation(floorId, unitTypeId, quantity);
    } catch (error) {
      console.error("Error updating allocation:", error);
      toast.error("Failed to update allocation");
      
      // Revert on error
      setAllocations(prev => 
        prev.map(alloc => 
          alloc.unitTypeId === unitTypeId 
            ? { ...alloc, quantity: 0, isLoading: false } 
            : alloc
        )
      );
    } finally {
      // Update loading state
      setAllocations(prev => 
        prev.map(alloc => 
          alloc.unitTypeId === unitTypeId 
            ? { ...alloc, isLoading: false } 
            : alloc
        )
      );
    }
  };

  // Save all allocations
  const handleSaveAll = async () => {
    setIsSaving(true);
    
    try {
      // Update all allocations that have changed
      const promises = allocations.map(alloc => 
        onUpdateUnitAllocation(floorId, alloc.unitTypeId, alloc.quantity)
      );
      
      await Promise.all(promises);
      toast.success("Unit allocations updated successfully");
      onClose();
    } catch (error) {
      console.error("Error saving allocations:", error);
      toast.error("Failed to save allocations");
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate total allocated area
  const totalAllocatedArea = allocations.reduce(
    (sum, alloc) => sum + (alloc.area * alloc.quantity), 
    0
  );
  
  // Calculate percentage of floor used
  const percentUsed = floorArea > 0 
    ? Math.round((totalAllocatedArea / floorArea) * 100) 
    : 0;
  
  // Check if over-allocated
  const isOverAllocated = percentUsed > 100;

  if (isLoading) {
    return (
      <Dialog open onOpenChange={() => !isSaving && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Loading Unit Allocations</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={() => !isSaving && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Edit Unit Allocations</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 my-2">
          <div className="flex items-center justify-between text-sm border-b pb-2">
            <span className="font-medium">Floor area:</span>
            <span>{floorTemplate ? floorTemplate.grossArea.toLocaleString() : "N/A"} sf</span>
          </div>
          
          <div className="flex items-center justify-between text-sm border-b pb-2">
            <span className="font-medium">Allocated area:</span>
            <span className={isOverAllocated ? "text-red-600 font-medium" : ""}>
              {totalAllocatedArea.toLocaleString()} sf ({percentUsed}%)
            </span>
          </div>
          
          {isOverAllocated && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
              Warning: The total allocated area exceeds the floor area.
            </div>
          )}
          
          <div className="space-y-6 pt-2">
            {products.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No unit types defined. Please add unit types first.
              </div>
            ) : (
              products.map(product => {
                const productAllocations = allocations.filter(
                  alloc => alloc.productId === product.id
                );
                
                if (productAllocations.length === 0) return null;
                
                return (
                  <div key={product.id} className="space-y-3">
                    <h3 className="font-medium text-sm text-gray-700">{product.name}</h3>
                    
                    <div className="space-y-2">
                      {productAllocations.map(allocation => (
                        <div key={allocation.unitTypeId} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-5 text-sm">{allocation.unitTypeName}</div>
                          <div className="col-span-3 text-sm text-gray-600 text-right">
                            {allocation.area.toLocaleString()} sf
                          </div>
                          <div className="col-span-3 relative">
                            <Input
                              type="number"
                              min="0"
                              value={allocation.quantity}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                if (value >= 0) {
                                  handleUpdateAllocation(allocation.unitTypeId, value);
                                }
                              }}
                              className="text-right pr-4"
                            />
                            {allocation.isLoading && (
                              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                              </div>
                            )}
                          </div>
                          <div className="col-span-1 text-sm text-gray-600 text-center">
                            units
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => !isSaving && onClose()} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSaveAll} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UnitAllocationModal;
