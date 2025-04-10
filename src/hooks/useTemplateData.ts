
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { FloorPlateTemplate } from '@/hooks/usePropertyState';
import { transformFloorPlateTemplates } from '@/utils/propertyDataTransformers';

export function useTemplateData(projectId: string | null) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [floorPlateTemplates, setFloorPlateTemplates] = useState<FloorPlateTemplate[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    if (!projectId || !user) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: templateError } = await supabase
        .from('floor_plate_templates')
        .select('*')
        .eq('project_id', projectId);
        
      if (templateError) throw templateError;
      
      const transformedTemplates = transformFloorPlateTemplates(data);
      setFloorPlateTemplates(transformedTemplates);
      return transformedTemplates;
    } catch (error) {
      console.error("Error loading floor plate templates:", error);
      setError(error instanceof Error ? error.message : "Failed to load templates");
      return [];
    } finally {
      setLoading(false);
    }
  }, [projectId, user]);

  const addFloorPlateTemplate = async (template: Omit<FloorPlateTemplate, 'id'>) => {
    if (!projectId || !user) return null;
    
    try {
      const dbTemplate = {
        project_id: projectId,
        name: template.name,
        area: template.grossArea,
        width: template.width,
        length: template.length
      };
      
      const { data, error } = await supabase
        .from('floor_plate_templates')
        .insert(dbTemplate)
        .select()
        .single();
        
      if (error) throw error;
      
      const newTemplate: FloorPlateTemplate = {
        id: data.id,
        name: data.name,
        grossArea: Number(data.area),
        width: data.width ? Number(data.width) : undefined,
        length: data.length ? Number(data.length) : undefined
      };
      
      setFloorPlateTemplates(prev => [...prev, newTemplate]);
      return newTemplate;
      
    } catch (error) {
      console.error("Error adding template:", error);
      toast.error("Failed to add floor plate template");
      return null;
    }
  };

  const updateFloorPlateTemplate = async (id: string, updates: Partial<Omit<FloorPlateTemplate, 'id'>>) => {
    if (!projectId || !user) return false;
    
    try {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.grossArea !== undefined) dbUpdates.area = updates.grossArea;
      if (updates.width !== undefined) dbUpdates.width = updates.width;
      if (updates.length !== undefined) dbUpdates.length = updates.length;
      
      const { error } = await supabase
        .from('floor_plate_templates')
        .update(dbUpdates)
        .eq('id', id);
        
      if (error) throw error;
      
      setFloorPlateTemplates(prev => 
        prev.map(template => 
          template.id === id ? { ...template, ...updates } : template
        )
      );
      return true;
      
    } catch (error) {
      console.error("Error updating template:", error);
      toast.error("Failed to update floor plate template");
      return false;
    }
  };

  const deleteFloorPlateTemplate = async (id: string) => {
    if (!projectId || !user) return false;
    
    try {
      const { error } = await supabase
        .from('floor_plate_templates')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setFloorPlateTemplates(prev => prev.filter(template => template.id !== id));
      return true;
      
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete floor plate template");
      return false;
    }
  };

  const getFloorTemplateById = (templateId: string) => {
    return floorPlateTemplates.find(template => template.id === templateId);
  };

  return {
    floorPlateTemplates,
    loading,
    error,
    fetchTemplates,
    addFloorPlateTemplate,
    updateFloorPlateTemplate,
    deleteFloorPlateTemplate,
    getFloorTemplateById
  };
}
