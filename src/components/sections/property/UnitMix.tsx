
import React from "react";
import { Floor, Product, UnitType } from "@/hooks/usePropertyState";

// Only updating the interface definition at the top of the file
interface UnitMixProps {
  products: Product[];
  getUnitAllocation?: (floorId: string, unitTypeId: string) => Promise<number>;
  floors?: Floor[]; // Make floors optional since not all usages require it
  onAddProduct?: (name: string) => Promise<Product | null>;
  onUpdateProduct?: (id: string, name: string) => Promise<boolean>;
  onDeleteProduct?: (id: string) => Promise<boolean>;
  onAddUnitType?: (productId: string, unit: Omit<UnitType, 'id'>) => Promise<UnitType | null>;
  onUpdateUnitType?: (productId: string, unitId: string, updates: Partial<Omit<UnitType, 'id'>>) => Promise<boolean>;
  onDeleteUnitType?: (productId: string, unitId: string) => Promise<boolean>;
}

// Implement a basic UnitMix component (placeholder)
const UnitMix: React.FC<UnitMixProps> = ({
  products,
  getUnitAllocation,
  floors,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddUnitType,
  onUpdateUnitType,
  onDeleteUnitType
}) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Unit Types Management</h3>
      <div className="text-sm text-gray-500">
        This component manages unit mix and product types
      </div>
    </div>
  );
};

// Export the component as a named export AND a default export for backward compatibility
export { UnitMix };
export default UnitMix;
