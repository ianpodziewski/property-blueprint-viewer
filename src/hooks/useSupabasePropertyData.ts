
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { 
  FloorPlateTemplate, 
  UnitType, 
  Product, 
  Floor 
} from '@/hooks/usePropertyState';
import { useProject } from '@/context/ProjectContext';
import { useProjectData } from './useProjectData';
import { useTemplateData } from './useTemplateData';
import { useProductData } from './useProductData';
import { useFloorData } from './useFloorData';
import { ProjectData } from '@/types/propertyData';

export type { ProjectData } from '@/types/propertyData';

export function useSupabasePropertyData(projectId: string | null) {
  const { user } = useAuth();
  const { currentProjectId } = useProject();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadAttempts, setLoadAttempts] = useState<number>(0);

  const effectiveProjectId = projectId || currentProjectId;

  // Initialize sub-hooks
  const projectHook = useProjectData(effectiveProjectId);
  const templateHook = useTemplateData(effectiveProjectId);
  const productHook = useProductData(effectiveProjectId);
  const floorHook = useFloorData(effectiveProjectId);

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
      // Load all data in parallel
      await Promise.all([
        projectHook.fetchProjectData(),
        templateHook.fetchTemplates(),
        productHook.fetchProducts(),
        floorHook.fetchFloors(),
        floorHook.fetchUnitAllocations()
      ]);
      
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
  }, [effectiveProjectId, user, loadAttempts, projectHook, templateHook, productHook, floorHook]);

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

  return {
    loading: loading || projectHook.loading || templateHook.loading || productHook.loading || floorHook.loading,
    saving,
    error: error || projectHook.error || templateHook.error || productHook.error || floorHook.error,
    projectData: projectHook.projectData,
    floorPlateTemplates: templateHook.floorPlateTemplates,
    products: productHook.products,
    floors: floorHook.floors,
    
    // Project methods
    updateProjectInfo: projectHook.updateProjectInfo,
    
    // Template methods
    addFloorPlateTemplate: templateHook.addFloorPlateTemplate,
    updateFloorPlateTemplate: templateHook.updateFloorPlateTemplate,
    deleteFloorPlateTemplate: templateHook.deleteFloorPlateTemplate,
    
    // Product methods
    addProduct: productHook.addProduct,
    updateProduct: productHook.updateProduct,
    deleteProduct: productHook.deleteProduct,
    addUnitType: productHook.addUnitType,
    updateUnitType: productHook.updateUnitType,
    deleteUnitType: productHook.deleteUnitType,
    
    // Floor methods
    addFloor: floorHook.addFloor,
    updateFloor: floorHook.updateFloor,
    deleteFloor: floorHook.deleteFloor,
    
    // Unit allocation methods
    updateUnitAllocation: floorHook.updateUnitAllocation,
    getUnitAllocation: floorHook.getUnitAllocation,
    
    // Helpers and utilities
    reloadProjectData,
    getFloorTemplateById: templateHook.getFloorTemplateById
  };
}
