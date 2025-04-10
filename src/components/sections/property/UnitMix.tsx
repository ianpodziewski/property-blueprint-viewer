
// Only updating the interface definition at the top of the file
interface UnitMixProps {
  products: Product[];
  getUnitAllocation: (floorId: string, unitTypeId: string) => Promise<number>;
  floors?: Floor[]; // Make floors optional since not all usages require it
  onAddProduct?: (name: string) => Promise<Product | null>;
  onUpdateProduct?: (id: string, name: string) => Promise<boolean>;
  onDeleteProduct?: (id: string) => Promise<boolean>;
  onAddUnitType?: (productId: string, unit: Omit<UnitType, 'id'>) => Promise<UnitType | null>;
  onUpdateUnitType?: (productId: string, unitId: string, updates: Partial<Omit<UnitType, 'id'>>) => Promise<boolean>;
  onDeleteUnitType?: (productId: string, unitId: string) => Promise<boolean>;
}
