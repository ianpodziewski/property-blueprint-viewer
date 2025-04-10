
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { ProjectData } from '@/types/propertyData';

export function useProjectData(projectId: string | null) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectData = useCallback(async () => {
    if (!projectId || !user) {
      if (!projectId) {
        console.error("No project ID provided");
        setError("No project ID provided");
      }
      if (!user) {
        console.error("User not authenticated");
        setError("User not authenticated");
      }
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();
        
      if (projectError) {
        console.error("Error fetching project:", projectError);
        throw projectError;
      }
      
      if (!data) {
        console.error("Project not found or access denied");
        throw new Error('Project not found or access denied');
      }
      
      const completeProjectData: ProjectData = {
        id: data.id,
        name: data.name,
        location: data.location,
        project_type: data.project_type,
        user_id: data.user_id,
        far_allowance: data.far_allowance || 0,
        lot_size: data.lot_size || 0,
        max_buildable_area: data.max_buildable_area || 0,
      };
      
      setProjectData(completeProjectData);
      return completeProjectData;
    } catch (error) {
      console.error("Error loading project data:", error);
      setError(error instanceof Error ? error.message : "Failed to load project data");
      toast.error("Could not load project data. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [projectId, user]);

  const updateProjectInfo = async (updates: Partial<ProjectData>) => {
    if (!projectId || !user || !projectData) return false;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setProjectData({ ...projectData, ...updates });
      return true;
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to save project information");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    projectData,
    loading,
    saving,
    error,
    fetchProjectData,
    updateProjectInfo
  };
}
