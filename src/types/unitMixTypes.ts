
export interface UnitType {
  id: string;
  name: string;
  category: "residential" | "office" | "retail" | "hotel" | "amenity" | "other";
  typicalSize: string; // square footage
  count: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface UnitAllocation {
  id: string;
  unitTypeId: string;
  floorNumber: number;
  count: string;
  squareFootage: string; // can differ from typical if customized
  notes?: string;
  status: "planned" | "designed" | "constructed";
}
