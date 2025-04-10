
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Extended database types to include the new tables
export interface ExtendedDatabase extends Database {
  public: Database['public'] & {
    Tables: Database['public']['Tables'] & {
      floor_usage_templates: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          template_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          template_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          template_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      floor_usage_template_allocations: {
        Row: {
          id: string;
          template_id: string;
          unit_type_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          unit_type_id: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string;
          unit_type_id?: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      non_rentable_allocations: {
        Row: {
          id: string;
          floor_id: string;
          non_rentable_type_id: string;
          square_footage: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          floor_id: string;
          non_rentable_type_id: string;
          square_footage: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          floor_id?: string;
          non_rentable_type_id?: string;
          square_footage?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Extended Supabase client type with our custom types
export const extendedSupabase = supabase as any;

interface ProjectContextType {
  currentProjectId: string | null;
  setCurrentProjectId: (id: string | null) => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  console.log('ProjectContext: Current project ID:', currentProjectId);

  return (
    <ProjectContext.Provider value={{ currentProjectId, setCurrentProjectId }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === null) {
    throw new Error(
      'useProject must be used within a ProjectProvider. ' +
      'Make sure the ProjectProvider is correctly wrapping your component tree.'
    );
  }
  return context;
};
