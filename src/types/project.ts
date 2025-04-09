
export interface Project {
  id: string;
  user_id: string;
  name: string;
  location: string;
  project_type: string;
  created_at: string;
  updated_at: string;
}

export const PROJECT_TYPES = [
  "Residential",
  "Commercial",
  "Mixed-Use",
  "Industrial",
  "Land Development",
  "Hospitality",
  "Retail"
];
