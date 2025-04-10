
import { useState } from 'react';

export interface FloorPlateTemplate {
  id: string;
  name: string;
  grossArea: number;
  width?: number;
  length?: number;
}

export interface UnitType {
  id: string;
  unitType: string;
  numberOfUnits: number;
  grossArea: number;
  width?: number;
  length?: number;
}

export interface Product {
  id: string;
  name: string;
  unitTypes: UnitType[];
}

export interface Floor {
  id: string;
  label: string;
  position: number;
  templateId: string;
  projectId?: string;
  floorType: 'aboveground' | 'underground';
}

export interface UnitAllocation {
  unitTypeId: string;
  floorId: string;
  quantity: number;
}

export interface NonRentableSpace {
  id: string;
  name: string;
  squareFootage: number;
  allocationMethod: 'Uniform Across Floors' | 'Specific Floors' | 'Percentage of Floor Area';
  specificFloors?: number[];
}

export function usePropertyState() {
  const [floorPlateTemplates, setFloorPlateTemplates] = useState<FloorPlateTemplate[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [unitAllocations, setUnitAllocations] = useState<UnitAllocation[]>([]);
  const [nonRentableSpaces, setNonRentableSpaces] = useState<NonRentableSpace[]>([]);

  return {
    floorPlateTemplates,
    setFloorPlateTemplates,
    products,
    setProducts,
    floors,
    setFloors,
    unitAllocations,
    setUnitAllocations,
    nonRentableSpaces,
    setNonRentableSpaces
  };
}
