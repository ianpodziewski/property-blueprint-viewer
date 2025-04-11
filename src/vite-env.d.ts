
/// <reference types="vite/client" />

// Adding the hard_costs table to allow direct usage in TypeScript
declare namespace Database {
  interface Tables {
    hard_costs: {
      id: string;
      project_id: string;
      property_type: string;
      cost_category: string;
      calculation_method: string;
      rate: number | null;
      total: number | null;
      notes?: string;
      unit_type_id?: string;
      created_at: string;
      updated_at: string;
    }
  }
}
