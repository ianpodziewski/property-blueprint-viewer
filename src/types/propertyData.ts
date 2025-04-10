
// Type definitions for property data

export interface ProjectData {
  id: string;
  name: string;
  location: string;
  project_type: string;
  far_allowance: number;
  lot_size: number;
  max_buildable_area: number;
  user_id: string;
}

export interface FloorPlateTemplateData {
  area: number;
  created_at: string;
  id: string;
  name: string;
  project_id: string;
  updated_at: string;
  width: number | null;
  length: number | null;
}

export interface UnitTypeData {
  area: number;
  category: string;
  created_at: string;
  id: string;
  name: string;
  project_id: string;
  units: number;
  updated_at: string;
  width: number | null;
  length: number | null;
}

export interface FloorData {
  created_at: string;
  id: string;
  label: string;
  position: number;
  project_id: string;
  template_id: string | null;
  updated_at: string;
  floor_type: string;
}

export interface UnitAllocationData {
  id: string;
  floor_id: string;
  unit_type_id: string;
  quantity: number;
  floors: {
    id: string;
    project_id: string;
  };
}

// Mock type to make the FloorUsageTemplates component work
export interface FloorUsageTemplateData {
  id: string;
  name: string;
  templateId: string;
  projectId: string;
}
