
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BuildingComponent {
  id: string;
  projectId: string;
  name: string;
  componentType: string;
  isPercentage: boolean;
  percentage: number;
  squareFootage: number;
  floorId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BuildingComponentFormData {
  name: string;
  componentType: string;
  isPercentage: boolean;
  percentage?: number;
  squareFootage?: number;
  floorId: string | null;
}

export const componentTypes = [
  'Core',
  'Mechanical',
  'Common Area',
  'Parking'
];

export function useBuildingComponents(projectId: string | null) {
  const [buildingComponents, setBuildingComponents] = useState<BuildingComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBuildingComponents = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('building_components')
        .select('*')
        .eq('project_id', projectId);

      if (error) throw error;

      const formattedComponents: BuildingComponent[] = data.map(item => ({
        id: item.id,
        projectId: item.project_id,
        name: item.name,
        componentType: item.component_type,
        isPercentage: item.is_percentage,
        percentage: Number(item.percentage) || 0,
        squareFootage: Number(item.square_footage) || 0,
        floorId: item.floor_id,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      setBuildingComponents(formattedComponents);
    } catch (err) {
      console.error('Error fetching building components:', err);
      setError(err instanceof Error ? err.message : 'Failed to load building components');
      toast.error('Could not load building components data');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const addBuildingComponent = useCallback(async (componentData: BuildingComponentFormData): Promise<BuildingComponent | null> => {
    if (!projectId) return null;

    try {
      const dbData = {
        project_id: projectId,
        name: componentData.name,
        component_type: componentData.componentType,
        is_percentage: componentData.isPercentage,
        percentage: componentData.isPercentage ? componentData.percentage : 0,
        square_footage: !componentData.isPercentage ? componentData.squareFootage : 0,
        floor_id: componentData.floorId
      };

      const { data, error } = await supabase
        .from('building_components')
        .insert(dbData)
        .select()
        .single();

      if (error) throw error;

      const newComponent: BuildingComponent = {
        id: data.id,
        projectId: data.project_id,
        name: data.name,
        componentType: data.component_type,
        isPercentage: data.is_percentage,
        percentage: Number(data.percentage) || 0,
        squareFootage: Number(data.square_footage) || 0,
        floorId: data.floor_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setBuildingComponents(prev => [...prev, newComponent]);
      toast.success('Building component added successfully');
      return newComponent;
    } catch (err) {
      console.error('Error adding building component:', err);
      toast.error('Failed to add building component');
      return null;
    }
  }, [projectId]);

  const updateBuildingComponent = useCallback(async (id: string, componentData: Partial<BuildingComponentFormData>): Promise<boolean> => {
    try {
      const dbUpdates: Record<string, any> = {};
      
      if (componentData.name !== undefined) dbUpdates.name = componentData.name;
      if (componentData.componentType !== undefined) dbUpdates.component_type = componentData.componentType;
      if (componentData.isPercentage !== undefined) {
        dbUpdates.is_percentage = componentData.isPercentage;
        // Reset the other value when switching types
        if (componentData.isPercentage) {
          dbUpdates.square_footage = 0;
        } else {
          dbUpdates.percentage = 0;
        }
      }
      if (componentData.percentage !== undefined) dbUpdates.percentage = componentData.percentage;
      if (componentData.squareFootage !== undefined) dbUpdates.square_footage = componentData.squareFootage;
      if (componentData.floorId !== undefined) dbUpdates.floor_id = componentData.floorId;

      const { error } = await supabase
        .from('building_components')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      setBuildingComponents(prev => 
        prev.map(component => 
          component.id === id 
            ? { 
                ...component, 
                ...componentData,
                name: componentData.name || component.name,
                componentType: componentData.componentType || component.componentType,
                isPercentage: componentData.isPercentage !== undefined ? componentData.isPercentage : component.isPercentage,
                percentage: componentData.percentage !== undefined ? componentData.percentage : component.percentage,
                squareFootage: componentData.squareFootage !== undefined ? componentData.squareFootage : component.squareFootage,
                floorId: componentData.floorId !== undefined ? componentData.floorId : component.floorId,
              } 
            : component
        )
      );
      
      toast.success('Building component updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating building component:', err);
      toast.error('Failed to update building component');
      return false;
    }
  }, []);

  const deleteBuildingComponent = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('building_components')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBuildingComponents(prev => prev.filter(component => component.id !== id));
      toast.success('Building component deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting building component:', err);
      toast.error('Failed to delete building component');
      return false;
    }
  }, []);

  const getComponentsByFloorId = useCallback((floorId: string | null): BuildingComponent[] => {
    if (!floorId) return [];
    
    return buildingComponents.filter(
      component => component.floorId === floorId || component.floorId === null
    );
  }, [buildingComponents]);

  const calculateComponentArea = useCallback((component: BuildingComponent, floorArea: number): number => {
    if (component.isPercentage) {
      return (component.percentage / 100) * floorArea;
    }
    return component.squareFootage;
  }, []);

  return {
    buildingComponents,
    loading,
    error,
    fetchBuildingComponents,
    addBuildingComponent,
    updateBuildingComponent,
    deleteBuildingComponent,
    getComponentsByFloorId,
    calculateComponentArea
  };
}
