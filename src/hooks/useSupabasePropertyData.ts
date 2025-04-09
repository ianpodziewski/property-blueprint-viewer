import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
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

  // Load project data
  useEffect(() => {
    if (!projectId || !user) return;
    
    async function loadProjectData() {
      setLoading(true);
      setError(null);
      
      try {
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
        const transformedTemplates = (templateData || []).map(template => ({
          id: template.id,
          name: template.name,
          grossArea: Number(template.area),
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
        (unitTypesData || []).forEach(unitType => {
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
      } catch (error) {
        console.error("Error loading project data:", error);
        setError(error instanceof Error ? error.message : "Failed to load project data");
        toast({
          title: "Error",
          description: "Could not load project data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadProjectData();
  }, [projectId, user]);

  // Update project basic info
  const updateProjectInfo = async (updates: Partial<ProjectData>) => {
    if (!projectId || !user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      if (projectData) {
        setProjectData({ ...projectData, ...updates });
      }
      
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: "Failed to save project information",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Add a new floor plate template
  const addFloorPlateTemplate = async (template: Omit<FloorPlateTemplate, 'id'>) => {
    if (!projectId || !user) return null;
    
    try {
      // Convert from internal format to database format
      const dbTemplate = {
        project_id: projectId,
        name: template.name,
        area: template.grossArea,
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
        grossArea: Number(data.area)
      };
      
      // Update local state
      setFloorPlateTemplates(prev => [...prev, newTemplate]);
      return newTemplate;
      
    } catch (error) {
      console.error("Error adding template:", error);
      toast({
        title: "Error",
        description: "Failed to add floor plate template",
        variant: "destructive"
      });
      return null;
    }
  };

  // Update a floor plate template
  const updateFloorPlateTemplate = async (id: string, updates: Partial<Omit<FloorPlateTemplate, 'id'>>) => {
    if (!projectId || !user) return false;
    
    try {
      // Convert from internal format to database format
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.grossArea !== undefined) dbUpdates.area = updates.grossArea;
      
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
      toast({
        title: "Error",
        description: "Failed to update floor plate template",
        variant: "destructive"
      });
      return false;
    }
  };

  // Delete a floor plate template
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
      toast({
        title: "Error",
        description: "Failed to delete floor plate template",
        variant: "destructive"
      });
      return false;
    }
  };

  // Add a product category and return its client-side ID
  const addProduct = async (name: string) => {
    // Since we're using categories in unit_types as products,
    // we just create a client-side product and will use its name as category
    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: name.trim(),
      unitTypes: []
    };
    
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  };

  // Update a product name
  const updateProduct = async (id: string, name: string) => {
    // Find the product to update
    const productToUpdate = products.find(product => product.id === id);
    if (!productToUpdate) return false;
    
    // Since products are just groupings of unit types by category,
    // we need to update all unit types with the old category to the new one
    try {
      // Get all unit types with this product's name as category
      const updates = productToUpdate.unitTypes.map(unit => ({
        id: unit.id,
        category: name.trim()
      }));
      
      // Update each unit type in the database
      if (updates.length > 0) {
        const promises = updates.map(update => 
          supabase
            .from('unit_types')
            .update({ category: update.category })
            .eq('id', update.id)
        );
        
        await Promise.all(promises);
      }
      
      // Update local state
      setProducts(prev => 
        prev.map(product => 
          product.id === id ? { ...product, name: name.trim() } : product
        )
      );
      
      return true;
    } catch (error) {
      console.error("Error updating product category:", error);
      toast({
        title: "Error",
        description: "Failed to update product category",
        variant: "destructive"
      });
      return false;
    }
  };

  // Delete a product and its unit types
  const deleteProduct = async (id: string) => {
    // Find the product to delete
    const productToDelete = products.find(product => product.id === id);
    if (!productToDelete) return false;
    
    try {
      // Delete all unit types with this category
      if (productToDelete.unitTypes.length > 0) {
        const unitTypeIds = productToDelete.unitTypes.map(unit => unit.id);
        const { error } = await supabase
          .from('unit_types')
          .delete()
          .in('id', unitTypeIds);
          
        if (error) throw error;
      }
      
      // Update local state
      setProducts(prev => prev.filter(product => product.id !== id));
      
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product and its unit types",
        variant: "destructive"
      });
      return false;
    }
  };

  // Add a unit type to a product
  const addUnitType = async (productId: string, unit: Omit<UnitType, 'id'>) => {
    if (!projectId || !user) return null;
    
    // Find the product to add the unit type to
    const product = products.find(p => p.id === productId);
    if (!product) return null;
    
    try {
      // Create the unit type in the database
      const dbUnitType = {
        project_id: projectId,
        category: product.name,
        name: unit.unitType.trim(),
        area: unit.grossArea,
        units: unit.numberOfUnits
      };
      
      const { data, error } = await supabase
        .from('unit_types')
        .insert(dbUnitType)
        .select()
        .single();
        
      if (error) throw error;
      
      // Create new unit type with server-generated ID
      const newUnitType: UnitType = {
        id: data.id,
        unitType: data.name,
        numberOfUnits: data.units,
        grossArea: Number(data.area)
      };
      
      // Update local state
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
      toast({
        title: "Error",
        description: "Failed to add unit type",
        variant: "destructive"
      });
      return null;
    }
  };

  // Update a unit type
  const updateUnitType = async (productId: string, unitId: string, updates: Partial<Omit<UnitType, 'id'>>) => {
    if (!projectId || !user) return false;
    
    try {
      // Convert from internal format to database format
      const dbUpdates: any = {};
      if (updates.unitType !== undefined) dbUpdates.name = updates.unitType.trim();
      if (updates.numberOfUnits !== undefined) dbUpdates.units = updates.numberOfUnits;
      if (updates.grossArea !== undefined) dbUpdates.area = updates.grossArea;
      
      const { error } = await supabase
        .from('unit_types')
        .update(dbUpdates)
        .eq('id', unitId);
        
      if (error) throw error;
      
      // Update local state
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
      toast({
        title: "Error",
        description: "Failed to update unit type",
        variant: "destructive"
      });
      return false;
    }
  };

  // Delete a unit type
  const deleteUnitType = async (productId: string, unitId: string) => {
    if (!projectId || !user) return false;
    
    try {
      const { error } = await supabase
        .from('unit_types')
        .delete()
        .eq('id', unitId);
        
      if (error) throw error;
      
      // Update local state
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
      toast({
        title: "Error",
        description: "Failed to delete unit type",
        variant: "destructive"
      });
      return false;
    }
  };

  // Add a floor
  const addFloor = async () => {
    if (!projectId || !user) return null;
    
    try {
      // Calculate the new position
      const newPosition = floors.length > 0
        ? Math.max(...floors.map(floor => floor.position)) + 1
        : 1;
      
      // Get the first template ID if available
      const defaultTemplateId = floorPlateTemplates.length > 0
        ? floorPlateTemplates[0].id
        : null;
      
      // Create the floor in the database
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
      
      // Create new floor with server-generated ID
      const newFloor: Floor = {
        id: data.id,
        label: data.label,
        position: data.position,
        templateId: data.template_id || ""
      };
      
      // Update local state
      setFloors(prev => [...prev, newFloor]);
      return newFloor;
      
    } catch (error) {
      console.error("Error adding floor:", error);
      toast({
        title: "Error",
        description: "Failed to add floor",
        variant: "destructive"
      });
      return null;
    }
  };

  // Update a floor
  const updateFloor = async (id: string, updates: Partial<Omit<Floor, 'id'>>) => {
    if (!projectId || !user) return false;
    
    try {
      // Convert from internal format to database format
      const dbUpdates: any = {};
      if (updates.label !== undefined) dbUpdates.label = updates.label;
      if (updates.position !== undefined) dbUpdates.position = updates.position;
      if (updates.templateId !== undefined) dbUpdates.template_id = updates.templateId;
      
      const { error } = await supabase
        .from('floors')
        .update(dbUpdates)
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setFloors(prev =>
        prev.map(floor => floor.id === id ? { ...floor, ...updates } : floor)
      );
      
      return true;
      
    } catch (error) {
      console.error("Error updating floor:", error);
      toast({
        title: "Error",
        description: "Failed to update floor",
        variant: "destructive"
      });
      return false;
    }
  };

  // Delete a floor
  const deleteFloor = async (id: string) => {
    if (!projectId || !user) return false;
    
    try {
      const { error } = await supabase
        .from('floors')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setFloors(prev => prev.filter(floor => floor.id !== id));
      
      return true;
      
    } catch (error) {
      console.error("Error deleting floor:", error);
      toast({
        title: "Error",
        description: "Failed to delete floor",
        variant: "destructive"
      });
      return false;
    }
  };

  // Update unit allocation for a floor and unit type
  const updateUnitAllocation = async (floorId: string, unitTypeId: string, quantity: number) => {
    if (!projectId || !user) return false;
    
    try {
      // Check if allocation already exists
      const existingAllocation = unitAllocations.find(
        a => a.floor_id === floorId && a.unit_type_id === unitTypeId
      );
      
      if (existingAllocation) {
        // Update existing allocation
        if (quantity === 0) {
          // Delete if quantity is 0
          const { error } = await supabase
            .from('unit_allocations')
            .delete()
            .eq('id', existingAllocation.id);
            
          if (error) throw error;
          
          // Update local state
          setUnitAllocations(prev => 
            prev.filter(a => a.id !== existingAllocation.id)
          );
        } else {
          // Update quantity
          const { error } = await supabase
            .from('unit_allocations')
            .update({ quantity })
            .eq('id', existingAllocation.id);
            
          if (error) throw error;
          
          // Update local state
          setUnitAllocations(prev => 
            prev.map(a => a.id === existingAllocation.id ? { ...a, quantity } : a)
          );
        }
      } else if (quantity > 0) {
        // Create new allocation if quantity > 0
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
        
        // Update local state
        setUnitAllocations(prev => [...prev, data]);
      }
      
      return true;
      
    } catch (error) {
      console.error("Error updating unit allocation:", error);
      toast({
        title: "Error",
        description: "Failed to update unit allocation",
        variant: "destructive"
      });
      return false;
    }
  };

  // Get unit allocation for a specific floor and unit type
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
    
    // Helper method to find a floor template by ID
    getFloorTemplateById: (templateId: string) => {
      return floorPlateTemplates.find(template => template.id === templateId);
    }
  };
}
