
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Extended database types without the removed tables
export interface ExtendedDatabase extends Database {
  public: Database['public'] & {
    Tables: Database['public']['Tables'] & {
      // The floor_usage_templates and floor_usage_template_allocations tables have been removed
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
