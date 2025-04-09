
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { 
  FloorPlateTemplate, 
  UnitType, 
  Product, 
  Floor 
} from '@/hooks/usePropertyState';

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

// Define the shape of floor plate template data from Supabase
interface FloorPlateTemplateData {
  area: number;
  created_at: string;
  id: string;
  name: string;
  project_id: string;
  updated_at: string;
  width: number | null;
  length: number | null;
}

// Define the shape of unit type data from Supabase
interface UnitTypeData {
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

export function useSupabasePropertyData(projectId: string | null) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [floorPlateTemplates, setFloorPlateTemplates] = useState<FloorPlateTemplate[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [unitAllocations, setUnitAllocations] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadAttempts, setLoadAttempts] = useState<number>(0);

  const loadProjectData = useCallback(async () => {
    if (!projectId || !user) {
      setLoading(false);
      if (!projectId) setError("No project ID provided");
      if (!user) setError("User not authenticated");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Loading project data for project ${projectId}, attempt #${loadAttempts + 1}`);
      
      // Load project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();
        
      if (projectError) throw projectError;
      if (!projectData) throw new Error('Project not found');
      
      // Ensure all required properties exist with default values if not present
      const completeProjectData: ProjectData = {
        id: projectData.id,
        name: projectData.name,
        location: projectData.location,
        project_type: projectData.project_type,
        user_id: projectData.user_id,
        far_allowance: projectData.far_allowance || 0,
        lot_size: projectData.lot_size || 0,
        max_buildable_area: projectData.max_buildable_area || 0,
      };
      
      setProjectData(completeProjectData);
      
      // Load floor plate templates
      const { data: templateData, error: templateError } = await supabase
        .from('floor_plate_templates')
        .select('*')
        .eq('project_id', projectId);
        
      if (templateError) throw templateError;
      
      // Transform to match internal format
      const transformedTemplates = (templateData || []).map((template: FloorPlateTemplateData) => ({
        id: template.id,
        name: template.name,
        grossArea: Number(template.area),
        width: template.width ? Number(template.width) : undefined,
        length: template.length ? Number(template.length) : undefined
      }));
      
      setFloorPlateTemplates(transformedTemplates);
      
      // Load unit types and organize by product
      const { data: unitTypesData, error: unitTypesError } = await supabase
        .from('unit_types')
        .select('*')
        .eq('project_id', projectId);
        
      if (unitTypesError) throw unitTypesError;
      
      // Group unit types by category (which serves as our "product")
      const productMap = new Map<string, Product>();
      (unitTypesData || []).forEach((unitType: UnitTypeData) => {
        const category = unitType.category;
        
        if (!productMap.has(category)) {
          productMap.set(category, {
            id: crypto.randomUUID(), // Create a client-side ID for the product
            name: category,
            unitTypes: [],
          });
        }
        
        const product = productMap.get(category)!;
        product.unitTypes.push({
          id: unitType.id,
          unitType: unitType.name,
          numberOfUnits: unitType.units,
          grossArea: Number(unitType.area),
          width: unitType.width ? Number(unitType.width) : undefined,
          length: unitType.length ? Number(unitType.length) : undefined
        });
      });
      
      setProducts(Array.from(productMap.values()));
      
      // Load floors
      const { data: floorData, error: floorError } = await supabase
        .from('floors')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: false });
        
      if (floorError) throw floorError;
      
      // Transform to match internal format
      const transformedFloors = (floorData || []).map(floor => ({
        id: floor.id,
        label: floor.label,
        position: floor.position,
        templateId: floor.template_id || '',
      }));
      
      setFloors(transformedFloors);
      
      // Load unit allocations
      const { data: unitAllocData, error: unitAllocError } = await supabase
        .from('unit_allocations')
        .select(`
          id, quantity, floor_id, unit_type_id,
          floors!inner(id, project_id)
        `)
        .eq('floors.project_id', projectId);
        
      if (unitAllocError) throw unitAllocError;
      
      setUnitAllocations(unitAllocData || []);
      console.log("Project data loaded successfully");
    } catch (error) {
      console.error("Error loading project data:", error);
      setError(error instanceof Error ? error.message : "Failed to load project data");
      toast.error("Could not load project data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [projectId, user, loadAttempts]);

  const reloadProjectData = () => {
    setLoadAttempts(prev => prev + 1);
  };

  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);

  const updateProjectInfo = async (updates: Partial<ProjectData>) => {
    if (!projectId || !user || !projectData) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setProjectData({ ...projectData, ...updates });
      
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to save project information");
    } finally {
      setSaving(false);
    }
  };

  const addFloorPlateTemplate = async (template: Omit<FloorPlateTemplate, 'id'>) => {
    if (!projectId || !user) return null;
    
    try {
      // Convert from internal format to database format
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
      
      // Create new template with server-generated ID
      const newTemplate: FloorPlateTemplate = {
        id: data.id,
        name: data.name,
        grossArea: Number(data.area),
        width: data.width ? Number(data.width) : undefined,
        length: data.length ? Number(data.length) : undefined
      };
      
      // Update local state
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
      // Convert from internal format to database format
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
      
      // Update local state
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
      
      // Update local state
      setFloorPlateTemplates(prev => prev.filter(template => template.id !== id));
      return true;
      
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete floor plate template");
      return false;
    }
  };

  const addProduct = async (name: string) => {
    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: name.trim(),
      unitTypes: []
    };
    
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  };

  const updateProduct = async (id: string, name: string) => {
    const productToUpdate = products.find(product => product.id === id);
    if (!productToUpdate) return false;
    
    try {
      const updates = productToUpdate.unitTypes.map(unit => ({
        id: unit.id,
        category: name.trim()
      }));
      
      if (updates.length > 0) {
        const promises = updates.map(update => 
          supabase
            .from('unit_types')
            .update({ category: update.category })
            .eq('id', update.id)
        );
        
        await Promise.all(promises);
      }
      
      setProducts(prev => 
        prev.map(product => 
          product.id === id ? { ...product, name: name.trim() } : product
        )
      );
      
      return true;
    } catch (error) {
      console.error("Error updating product category:", error);
      toast.error("Failed to update product category");
      return false;
    }
  };

  const deleteProduct = async (id: string) => {
    const productToDelete = products.find(product => product.id === id);
    if (!productToDelete) return false;
    
    try {
      if (productToDelete.unitTypes.length > 0) {
        const unitTypeIds = productToDelete.unitTypes.map(unit => unit.id);
        const { error } = await supabase
          .from('unit_types')
          .delete()
          .in('id', unitTypeIds);
          
        if (error) throw error;
      }
      
      setProducts(prev => prev.filter(product => product.id !== id));
      
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product and its unit types");
      return false;
    }
  };

  const addUnitType = async (productId: string, unit: Omit<UnitType, 'id'>) => {
    if (!projectId || !user) return null;
    
    const product = products.find(p => p.id === productId);
    if (!product) return null;
    
    try {
      const dbUnitType = {
        project_id: projectId,
        category: product.name,
        name: unit.unitType.trim(),
        area: unit.grossArea,
        units: unit.numberOfUnits,
        width: unit.width,
        length: unit.length
      };
      
      const { data, error } = await supabase
        .from('unit_types')
        .insert(dbUnitType)
        .select()
        .single();
        
      if (error) throw error;
      
      const newUnitType: UnitType = {
        id: data.id,
        unitType: data.name,
        numberOfUnits: data.units,
        grossArea: Number(data.area),
        width: data.width ? Number(data.width) : undefined,
        length: data.length ? Number(data.length) : undefined
      };
      
      setProducts(prev =>
        prev.map(p =>
          p.id === productId
            ? { ...p, unitTypes: [...p.unitTypes, newUnitType] }
            : p
        )
      );
      
      return newUnitType;
      
    } catch (error) {
      console.error("Error adding unit type:", error);
      toast.error("Failed to add unit type");
      return null;
    }
  };

  const updateUnitType = async (productId: string, unitId: string, updates: Partial<Omit<UnitType, 'id'>>) => {
    if (!projectId || !user) return false;
    
    try {
      const dbUpdates: any = {};
      if (updates.unitType !== undefined) dbUpdates.name = updates.unitType.trim();
      if (updates.numberOfUnits !== undefined) dbUpdates.units = updates.numberOfUnits;
      if (updates.grossArea !== undefined) dbUpdates.area = updates.grossArea;
      if (updates.width !== undefined) dbUpdates.width = updates.width;
      if (updates.length !== undefined) dbUpdates.length = updates.length;
      
      const { error } = await supabase
        .from('unit_types')
        .update(dbUpdates)
        .eq('id', unitId);
        
      if (error) throw error;
      
      setProducts(prev =>
        prev.map(product =>
          product.id === productId
            ? {
                ...product,
                unitTypes: product.unitTypes.map(unit =>
                  unit.id === unitId ? { ...unit, ...updates } : unit
                )
              }
            : product
        )
      );
      
      return true;
      
    } catch (error) {
      console.error("Error updating unit type:", error);
      toast.error("Failed to update unit type");
      return false;
    }
  };

  const deleteUnitType = async (productId: string, unitId: string) => {
    if (!projectId || !user) return false;
    
    try {
      const { error } = await supabase
        .from('unit_types')
        .delete()
        .eq('id', unitId);
        
      if (error) throw error;
      
      setProducts(prev =>
        prev.map(product =>
          product.id === productId
            ? {
                ...product,
                unitTypes: product.unitTypes.filter(unit => unit.id !== unitId)
              }
            : product
        )
      );
      
      return true;
      
    } catch (error) {
      console.error("Error deleting unit type:", error);
      toast.error("Failed to delete unit type");
      return false;
    }
  };

  const addFloor = async () => {
    if (!projectId || !user) return null;
    
    try {
      const newPosition = floors.length > 0
        ? Math.max(...floors.map(floor => floor.position)) + 1
        : 1;
      
      const defaultTemplateId = floorPlateTemplates.length > 0
        ? floorPlateTemplates[0].id
        : null;
      
      const dbFloor = {
        project_id: projectId,
        label: `Floor ${newPosition}`,
        position: newPosition,
        template_id: defaultTemplateId
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
        templateId: data.template_id || ""
      };
      
      setFloors(prev => [...prev, newFloor]);
      return newFloor;
      
    } catch (error) {
      console.error("Error adding floor:", error);
      toast.error("Failed to add floor");
      return null;
    }
  };

  const updateFloor = async (id: string, updates: Partial<Omit<Floor, 'id'>>) => {
    if (!projectId || !user) return false;
    
    try {
      const dbUpdates: any = {};
      if (updates.label !== undefined) dbUpdates.label = updates.label;
      if (updates.position !== undefined) dbUpdates.position = updates.position;
      if (updates.templateId !== undefined) dbUpdates.template_id = updates.templateId;
      
      const { error } = await supabase
        .from('floors')
        .update(dbUpdates)
        .eq('id', id);
        
      if (error) throw error;
      
      setFloors(prev =>
        prev.map(floor => floor.id === id ? { ...floor, ...updates } : floor)
      );
      
      return true;
      
    } catch (error) {
      console.error("Error updating floor:", error);
      toast.error("Failed to update floor");
      return false;
    }
  };

  const deleteFloor = async (id: string) => {
    if (!projectId || !user) return false;
    
    try {
      const { error } = await supabase
        .from('floors')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setFloors(prev => prev.filter(floor => floor.id !== id));
      
      return true;
      
    } catch (error) {
      console.error("Error deleting floor:", error);
      toast.error("Failed to delete floor");
      return false;
    }
  };

  const updateUnitAllocation = async (floorId: string, unitTypeId: string, quantity: number) => {
    if (!projectId || !user) return false;
    
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
      
      return true;
      
    } catch (error) {
      console.error("Error updating unit allocation:", error);
      toast.error("Failed to update unit allocation");
      return false;
    }
  };

  const getUnitAllocation = (floorId: string, unitTypeId: string): number => {
    const allocation = unitAllocations.find(
      a => a.floor_id === floorId && a.unit_type_id === unitTypeId
    );
    return allocation ? allocation.quantity : 0;
  };

  return {
    loading,
    saving,
    error,
    projectData,
    floorPlateTemplates,
    products,
    floors,
    updateProjectInfo,
    addFloorPlateTemplate,
    updateFloorPlateTemplate,
    deleteFloorPlateTemplate,
    addProduct,
    updateProduct,
    deleteProduct,
    addUnitType,
    updateUnitType,
    deleteUnitType,
    addFloor,
    updateFloor,
    deleteFloor,
    updateUnitAllocation,
    getUnitAllocation,
    reloadProjectData,
    
    getFloorTemplateById: (templateId: string) => {
      return floorPlateTemplates.find(template => template.id === templateId);
    }
  };
}
