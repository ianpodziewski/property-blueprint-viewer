
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Floor } from '@/hooks/usePropertyState';
import { transformFloors } from '@/utils/propertyDataTransformers';

export function useFloorData(projectId: string | null) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [unitAllocations, setUnitAllocations] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchFloors = useCallback(async () => {
    if (!projectId || !user) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: floorError } = await supabase
        .from('floors')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: false });
        
      if (floorError) {
        console.error("Error loading floors:", floorError);
        throw floorError;
      }
      
      const transformedFloors = transformFloors(data);
      setFloors(transformedFloors);
      return transformedFloors;
    } catch (error) {
      console.error("Error loading floors:", error);
      setError(error instanceof Error ? error.message : "Failed to load floors");
      return [];
    } finally {
      setLoading(false);
    }
  }, [projectId, user]);

  const fetchUnitAllocations = useCallback(async () => {
    if (!projectId || !user) return [];
    
    try {
      const { data, error: unitAllocError } = await supabase
        .from('unit_allocations')
        .select(`
          id, quantity, floor_id, unit_type_id,
          floors!inner(id, project_id)
        `)
        .eq('floors.project_id', projectId);
        
      if (unitAllocError) throw unitAllocError;
      
      setUnitAllocations(data || []);
      return data || [];
    } catch (error) {
      console.error("Error loading unit allocations:", error);
      return [];
    }
  }, [projectId, user]);

  const addFloor = async () => {
    if (!projectId || !user) return null;
    
    try {
      const newPosition = floors.length > 0
        ? Math.max(...floors.map(floor => floor.position)) + 1
        : 1;
      
      const defaultTemplateId = null; // This will be set by the caller if needed
      
      const dbFloor = {
        project_id: projectId,
        label: `Floor ${newPosition}`,
        position: newPosition,
        template_id: defaultTemplateId,
        floor_type: 'aboveground'
      };
      
      const { data, error } = await supabase
        .from('floors')
        .insert(dbFloor)
        .select()
        .single();
        
      if (error) throw error;
      
      const newFloor: Floor = {
        id: data.id,
        label: data.label,
        position: data.position,
        templateId: data.template_id || "",
        floorType: (data.floor_type === 'underground' ? 'underground' : 'aboveground') as 'aboveground' | 'underground',
        projectId: data.project_id
      };
      
      setFloors(prev => [...prev, newFloor]);
      return newFloor;
      
    } catch (error) {
      console.error("Error adding floor:", error);
      toast.error("Failed to add floor");
      return null;
    }
  };

  const updateFloor = async (id: string, updates: Partial<Floor>): Promise<void> => {
    if (!projectId || !user) return;
    
    try {
      const dbUpdates: any = {};
      if (updates.label !== undefined) dbUpdates.label = updates.label;
      if (updates.position !== undefined) dbUpdates.position = updates.position;
      if (updates.templateId !== undefined) dbUpdates.template_id = updates.templateId;
      if (updates.floorType !== undefined) dbUpdates.floor_type = updates.floorType;
      
      const { error } = await supabase
        .from('floors')
        .update(dbUpdates)
        .eq('id', id);
        
      if (error) throw error;
      
      setFloors(prev =>
        prev.map(floor => floor.id === id ? { ...floor, ...updates } : floor)
      );
      
    } catch (error) {
      console.error("Error updating floor:", error);
      toast.error("Failed to update floor");
      throw error;
    }
  };

  const deleteFloor = async (id: string): Promise<void> => {
    if (!projectId || !user) return;
    
    try {
      const { error } = await supabase
        .from('floors')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setFloors(prev => prev.filter(floor => floor.id !== id));
      
    } catch (error) {
      console.error("Error deleting floor:", error);
      toast.error("Failed to delete floor");
      throw error;
    }
  };

  const updateUnitAllocation = async (floorId: string, unitTypeId: string, quantity: number): Promise<void> => {
    if (!projectId || !user) return;
    
    try {
      const existingAllocation = unitAllocations.find(
        a => a.floor_id === floorId && a.unit_type_id === unitTypeId
      );
      
      if (existingAllocation) {
        if (quantity === 0) {
          const { error } = await supabase
            .from('unit_allocations')
            .delete()
            .eq('id', existingAllocation.id);
            
          if (error) throw error;
          
          setUnitAllocations(prev => 
            prev.filter(a => a.id !== existingAllocation.id)
          );
        } else {
          const { error } = await supabase
            .from('unit_allocations')
            .update({ quantity })
            .eq('id', existingAllocation.id);
            
          if (error) throw error;
          
          setUnitAllocations(prev => 
            prev.map(a => a.id === existingAllocation.id ? { ...a, quantity } : a)
          );
        }
      } else if (quantity > 0) {
        const { data, error } = await supabase
          .from('unit_allocations')
          .insert({
            floor_id: floorId,
            unit_type_id: unitTypeId,
            quantity
          })
          .select()
          .single();
          
        if (error) throw error;
        
        setUnitAllocations(prev => [...prev, data]);
      }
      
    } catch (error) {
      console.error("Error updating unit allocation:", error);
      toast.error("Failed to update unit allocation");
      throw error;
    }
  };

  const getUnitAllocation = async (floorId: string, unitTypeId: string): Promise<number> => {
    const allocation = unitAllocations.find(
      a => a.floor_id === floorId && a.unit_type_id === unitTypeId
    );
    return Promise.resolve(allocation ? allocation.quantity : 0);
  };

  return {
    floors,
    unitAllocations,
    loading,
    error,
    fetchFloors,
    fetchUnitAllocations,
    addFloor,
    updateFloor,
    deleteFloor,
    updateUnitAllocation,
    getUnitAllocation
  };
}
