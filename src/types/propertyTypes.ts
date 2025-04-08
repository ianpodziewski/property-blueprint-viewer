
// Shared types for property modeling components

export interface SpaceType {
  id: string;
  type: string;
  squareFootage: string;
  units: string;
  phase: string;
  efficiencyFactor: string;
  floorAllocation: Record<number, string>; // floor number -> percentage
}

export interface UnitMix {
  id: string;
  type: string;
  count: string;
  squareFootage: string;
}

export interface Issue {
  type: string;
  message: string;
  severity: 'warning' | 'error';
}

export interface FloorPlateTemplate {
  id: string;
  name: string;
  squareFootage: string;
  floorToFloorHeight: string;
  efficiencyFactor: string;
  corePercentage: string;
}

export interface SpaceDefinition {
  id: string;
  name: string;  // Required in FloorConfigurationManager
  type: string;
  subType: string | null;  // Required to match what FloorEditor expects
  squareFootage: string;
  dimensions: {  // Required to match what FloorEditor expects
    width: string;
    depth: string;
  };
  isRentable: boolean;
  percentage: number;  // Required to match what FloorEditor expects
}

export interface BuildingSystemsConfig {
  elevators: {  // Changed from optional to required
    passenger: string;
    service: string;
    freight: string;
  };
  hvacSystem?: string;
  hvacZones?: string;
  floorLoadCapacity?: string;
  ceilingHeight?: string;
  plenumHeight?: string;
}

export interface FloorConfiguration {
  floorNumber: number;
  isUnderground: boolean;
  templateId: string | null;
  customSquareFootage: string;
  floorToFloorHeight: string;
  efficiencyFactor: string;
  corePercentage: string;
  primaryUse: string;
  secondaryUse: string | null;
  secondaryUsePercentage: string;
  spaces?: SpaceDefinition[];
  buildingSystems?: BuildingSystemsConfig;
}
