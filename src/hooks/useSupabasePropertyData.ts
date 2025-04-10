import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { 
  FloorPlateTemplate, 
  UnitType, 
  Product, 
  Floor,
  NonRentableSpace,
  AllocationMethod
} from '@/hooks/usePropertyState';
import { useProject } from '@/context/ProjectContext';
import { 
  getNonRentableSpaces,
  createNonRentableSpace,
  updateNonRentableSpace,
  deleteNonRentableSpace
} from '@/utils/floorManagement';

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

interface FloorData {
  created_at: string;
  id: string;
  label: string;
  position: number;
  project_id: string;
  template_id: string | null;
  updated_at: string;
  floor_type: string;
}

export function useSupabasePropertyData(projectId: string | null) {
  const { user } = useAuth();
  const { currentProjectId } = useProject();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [floorPlateTemplates, setFloorPlateTemplates] = useState<FloorPlateTemplate[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [unitAllocations, setUnitAllocations] = useState<any[]>([]);
  const [nonRentableSpaces, setNonRentableSpaces] = useState<NonRentableSpace[]>([]);
  const [nonRentableTypes, setNonRentableTypes] = useState<NonRentableSpace[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadAttempts, setLoadAttempts] = useState<number>(0);

  const effectiveProjectId = projectId || currentProjectId;

  const loadProjectData = useCallback(async () => {
    if (!effectiveProjectId || !user) {
      setLoading(false);
      if (!effectiveProjectId) {
        console.error("No project ID provided - neither via parameter nor via context");
        setError("No project ID provided");
      }
      if (!user) {
        console.error("User not authenticated");
        setError("User not authenticated");
      }
      return;
    }
    
    console.log("========= LOADING PROJECT DATA START =========");
    console.log(`Loading project data for project ${effectiveProjectId}, attempt #${loadAttempts + 1}`);
    setLoading(true);
    setError(null);
    
    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', effectiveProjectId)
        .eq('user_id', user.id)
        .single();
        
      if (projectError) {
        console.error("Error fetching project:", projectError);
        throw projectError;
      }
      
      if (!projectData) {
        console.error("Project not found or access denied");
        throw new Error('Project not found or access denied');
      }
      
      console.log("Project data loaded:", projectData);
      
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
      
      const { data: templateData, error: templateError } = await supabase
        .from('floor_plate_templates')
        .select('*')
        .eq('project_id', effectiveProjectId);
        
      if (templateError) throw templateError;
      
      const transformedTemplates = (templateData || []).map((template: FloorPlateTemplateData) => ({
        id: template.id,
        name: template.name,
        grossArea: Number(template.area),
        width: template.width ? Number(template.width) : undefined,
        length: template.length ? Number(template.length) : undefined
      }));
      
      setFloorPlateTemplates(transformedTemplates);
      
      const { data: unitTypesData, error: unitTypesError } = await supabase
        .from('unit_types')
        .select('*')
        .eq('project_id', effectiveProjectId);
        
      if (unitTypesError) throw unitTypesError;
      
      const productMap = new Map<string, Product>();
      (unitTypesData || []).forEach((unitType: UnitTypeData) => {
        const category = unitType.category;
        
        if (!productMap.has(category)) {
          productMap.set(category, {
            id: crypto.randomUUID(),
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
      
      console.log("Loading floors for project:", effectiveProjectId);
      const { data: floorData, error: floorError } = await supabase
        .from('floors')
        .select('*')
        .eq('project_id', effectiveProjectId)
        .order('position', { ascending: false });
        
      if (floorError) {
        console.error("Error loading floors:", floorError);
        throw floorError;
      }
      
      console.log("Raw floor data loaded from database:", floorData);
      
      const transformedFloors = (floorData || []).map((floor: FloorData) => ({
        id: floor.id,
        label: floor.label,
        position: floor.position,
        templateId: floor.template_id || '',
        projectId: floor.project_id,
        floorType: (floor.floor_type === 'underground' ? 'underground' : 'aboveground') as 'aboveground' | 'underground'
      }));
      
      console.log("Transformed floor data:", transformedFloors);
      setFloors(transformedFloors);
      
      const { data: unitAllocData, error: unitAllocError } = await supabase
        .from('unit_allocations')
        .select(`
          id, quantity, floor_id, unit_type_id,
          floors!inner(id, project_id)
        `)
        .eq('floors.project_id', effectiveProjectId);
        
      if (unitAllocError) throw unitAllocError;
      
      setUnitAllocations(unitAllocData || []);

      // Load non-rentable spaces
      try {
        const nonRentableData = await getNonRentableSpaces(effectiveProjectId);
        
        const transformedNonRentable = (nonRentableData || []).map((space: any) => {
          // Map database allocation method string to our enum type
          let allocationMethod: AllocationMethod = 'uniform';
          
          if (space.allocation_method === 'Uniform Across Floors') {
            allocationMethod = 'uniform';
          } else if (space.allocation_method === 'Specific Floors') {
            allocationMethod = 'specific';
          } else if (space.allocation_method === 'Percentage of Floor Area') {
            allocationMethod = 'percentage';
          }
          
          return {
            id: space.id,
            name: space.name,
            squareFootage: space.square_footage,
            allocationMethod,
            specificFloors: space.specific_floors || []
          };
        });
        
        setNonRentableSpaces(transformedNonRentable);
        setNonRentableTypes(transformedNonRentable);
      } catch (nonRentableError) {
        console.error("Error loading non-rentable spaces:", nonRentableError);
        // Don't throw here, continue loading other data
      }
      
      console.log("Project data loaded successfully");
      console.log("========= LOADING PROJECT DATA END =========");
    } catch (error) {
      console.error("Error loading project data:", error);
      setError(error instanceof Error ? error.message : "Failed to load project data");
      toast.error("Could not load project data. Please try again.");
      console.log("========= LOADING PROJECT DATA ERROR =========");
    } finally {
      setLoading(false);
    }
  }, [effectiveProjectId, user, loadAttempts]);

  const reloadProjectData = useCallback(() => {
    console.log("Triggering project data reload (attempt #" + (loadAttempts + 1) + ")");
    setLoadAttempts(prev => prev + 1);
  }, [loadAttempts]);

  useEffect(() => {
    console.log("useSupabasePropertyData - Effect running with projectId:", effectiveProjectId);
    if (effectiveProjectId) {
      loadProjectData();
    }
  }, [loadProjectData, effectiveProjectId]);

  const updateProjectInfo = async (updates: Partial<ProjectData>) => {
    if (!effectiveProjectId || !user || !projectData) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', effectiveProjectId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setProjectData({ ...projectData, ...updates });
      
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to save project information");
    } finally {
      setSaving(false);
    }
  };

  const addFloorPlateTemplate = async (template: Omit<FloorPlateTemplate, 'id'>) => {
    if (!effectiveProjectId || !user) return null;
    
    try {
      const dbTemplate = {
        project_id: effectiveProjectId,
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
    if (!effectiveProjectId || !user) return false;
    
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
    if (!effectiveProjectId || !user) return false;
    
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
    if (!effectiveProjectId || !user) return null;
    
    const product = products.find(p => p.id === productId);
    if (!product) return null;
    
    try {
      const dbUnitType = {
        project_id: effectiveProjectId,
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
    if (!effectiveProjectId || !user) return false;
    
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
    if (!effectiveProjectId || !user) return false;
    
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
    if (!effectiveProjectId || !user) return null;
    
    try {
      const newPosition = floors.length > 0
        ? Math.max(...floors.map(floor => floor.position)) + 1
        : 1;
      
      const defaultTemplateId = floorPlateTemplates.length > 0
        ? floorPlateTemplates[0].id
        : null;
      
      const dbFloor = {
        project_id: effectiveProjectId,
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
    if (!effectiveProjectId || !user) return;
    
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
    if (!effectiveProjectId || !user) return;
    
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
    if (!effectiveProjectId || !user) return;
    
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

  const addNonRentableType = async (nonRentable: Omit<NonRentableSpace, 'id'>) => {
    if (!effectiveProjectId || !user) return null;
    
    try {
      const { name, squareFootage, allocationMethod, specificFloors = [] } = nonRentable;
      
      // Map TypeScript enum values to database values
      const dbAllocationMethod = 
        allocationMethod === 'uniform' ? 'Uniform Across Floors' :
        allocationMethod === 'specific' ? 'Specific Floors' :
        allocationMethod === 'percentage' ? 'Percentage of Floor Area' : 'Uniform Across Floors';
      
      const id = await createNonRentableSpace(
        effectiveProjectId,
        name,
        squareFootage,
        dbAllocationMethod,
        specificFloors
      );
      
      if (!id) throw new Error("Failed to create non-rentable space");
      
      const newNonRentable: NonRentableSpace = {
        id,
        name,
        squareFootage,
        allocationMethod,
        specificFloors
      };
      
      setNonRentableTypes(prev => [...prev, newNonRentable]);
      setNonRentableSpaces(prev => [...prev, newNonRentable]);
      return newNonRentable;
    } catch (error) {
      console.error("Error adding non-rentable space:", error);
      toast.error("Failed to add non-rentable space");
      return null;
    }
  };

  const updateNonRentableType = async (
    id: string,
    updates: Partial<Omit<NonRentableSpace, 'id'>>
  ) => {
    if (!effectiveProjectId || !user) return false;
    
    try {
      // Map TypeScript enum values to database values if allocationMethod is being updated
      const dbUpdates: any = { ...updates };
      if (updates.allocationMethod) {
        dbUpdates.allocationMethod = 
          updates.allocationMethod === 'uniform' ? 'Uniform Across Floors' :
          updates.allocationMethod === 'specific' ? 'Specific Floors' :
          updates.allocationMethod === 'percentage' ? 'Percentage of Floor Area' : 'Uniform Across Floors';
      }
      
      await updateNonRentableSpace(id, dbUpdates);
      
      setNonRentableSpaces(prev =>
        prev.map(space => space.id === id ? { ...space, ...updates } : space)
      );
      
      setNonRentableTypes(prev =>
        prev.map(space => space.id === id ? { ...space, ...updates } : space)
      );
      
      return true;
    } catch (error) {
      console.error("Error updating non-rentable space:", error);
      toast.error("Failed to update non-rentable space");
      return false;
    }
  };

  const deleteNonRentableType = async (id: string) => {
    if (!effectiveProjectId || !user) return false;
    
    try {
      await deleteNonRentableSpace(id);
      
      setNonRentableSpaces(prev => prev.filter(space => space.id !== id));
      setNonRentableTypes(prev => prev.filter(space => space.id !== id));
      
      return true;
    } catch (error) {
      console.error("Error deleting non-rentable space:", error);
      toast.error("Failed to delete non-rentable space");
      return false;
    }
  };

  return {
    loading,
    saving,
    error,
    projectData,
    floorPlateTemplates,
    products,
    floors,
    nonRentableTypes,
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
    
    addNonRentableType,
    updateNonRentableType,
    deleteNonRentableType,
    
    getFloorTemplateById: (templateId: string) => {
      return floorPlateTemplates.find(template => template.id === templateId);
    }
  };
}
