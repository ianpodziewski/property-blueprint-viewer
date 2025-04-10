
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { BuildingComponentCategory } from '@/components/sections/property/BuildingComponents';

export function useBuildingComponents(projectId: string | null) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<BuildingComponentCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    if (!projectId || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('building_component_categories')
        .select('*')
        .eq('project_id', projectId)
        .order('name');

      if (error) throw error;

      const formattedCategories: BuildingComponentCategory[] = (data || []).map(item => ({
        id: item.id,
        name: item.name
      }));

      setCategories(formattedCategories);
    } catch (err) {
      console.error('Error loading building component categories:', err);
      setError(err instanceof Error ? err.message : 'Error loading building components');
      toast.error('Could not load building components. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [projectId, user]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const addCategory = async (name: string): Promise<BuildingComponentCategory | null> => {
    if (!projectId || !user) return null;

    try {
      const { data, error } = await supabase
        .from('building_component_categories')
        .insert({
          project_id: projectId,
          name: name.trim()
        })
        .select()
        .single();

      if (error) throw error;

      const newCategory: BuildingComponentCategory = {
        id: data.id,
        name: data.name
      };

      setCategories(prev => [...prev, newCategory]);
      toast.success('Building component added successfully');
      return newCategory;
    } catch (err) {
      console.error('Error adding building component category:', err);
      toast.error('Failed to add building component');
      return null;
    }
  };

  const updateCategory = async (id: string, name: string): Promise<boolean> => {
    if (!projectId || !user) return false;

    try {
      const { error } = await supabase
        .from('building_component_categories')
        .update({ name: name.trim() })
        .eq('id', id)
        .eq('project_id', projectId);

      if (error) throw error;

      setCategories(prev =>
        prev.map(category => (category.id === id ? { ...category, name: name.trim() } : category))
      );
      
      toast.success('Building component updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating building component category:', err);
      toast.error('Failed to update building component');
      return false;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    if (!projectId || !user) return false;

    try {
      const { error } = await supabase
        .from('building_component_categories')
        .delete()
        .eq('id', id)
        .eq('project_id', projectId);

      if (error) throw error;

      setCategories(prev => prev.filter(category => category.id !== id));
      toast.success('Building component deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting building component category:', err);
      toast.error('Failed to delete building component');
      return false;
    }
  };

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    reloadCategories: loadCategories
  };
}
