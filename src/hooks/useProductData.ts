
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { UnitType, Product } from '@/hooks/usePropertyState';
import { transformUnitTypes } from '@/utils/propertyDataTransformers';

export function useProductData(projectId: string | null) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!projectId || !user) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: unitTypesError } = await supabase
        .from('unit_types')
        .select('*')
        .eq('project_id', projectId);
        
      if (unitTypesError) throw unitTypesError;
      
      const transformedProducts = transformUnitTypes(data);
      setProducts(transformedProducts);
      return transformedProducts;
    } catch (error) {
      console.error("Error loading products:", error);
      setError(error instanceof Error ? error.message : "Failed to load products");
      return [];
    } finally {
      setLoading(false);
    }
  }, [projectId, user]);

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

  return {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    addUnitType,
    updateUnitType,
    deleteUnitType
  };
}
