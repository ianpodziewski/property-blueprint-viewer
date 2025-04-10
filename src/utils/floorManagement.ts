
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function createBulkFloors(
  projectId: string,
  templateId: string,
  startFloor: number,
  endFloor: number,
  labelPrefix: string,
  floorType: "aboveground" | "underground" = "aboveground"
): Promise<string[]> {
  console.log("Starting bulk floor creation with project ID:", projectId);
  
  if (!projectId) {
    console.error("Missing project ID for floor creation");
    throw new Error("Project ID is required for floor creation");
  }
  
  try {
    // Fetch existing floors to determine the next position
    console.log("Fetching existing floors for project:", projectId);
    const { data: existingFloors, error: fetchError } = await supabase
      .from('floors')
      .select('position')
      .eq('project_id', projectId)
      .order('position', { ascending: false })
      .limit(1);
    
    if (fetchError) {
      console.error("Error fetching existing floors:", fetchError);
      throw fetchError;
    }
    
    console.log("Existing floors data:", existingFloors);
    
    // Determine starting position
    let startPosition = 1;
    if (existingFloors && existingFloors.length > 0) {
      startPosition = existingFloors[0].position + 1;
    }
    
    console.log("Starting position for new floors:", startPosition);
    
    // Prepare floors to create
    const floorsToCreate = [];
    const createdFloorIds = [];
    
    for (let i = startFloor; i <= endFloor; i++) {
      // Format the label based on floor type
      const floorLabel = floorType === "underground" 
        ? `${labelPrefix}${i}` 
        : `${labelPrefix} ${i}`;
        
      const position = startPosition + (i - startFloor);
      
      const floorId = crypto.randomUUID();
      createdFloorIds.push(floorId);
      
      floorsToCreate.push({
        id: floorId,
        project_id: projectId,
        label: floorLabel,
        position: position,
        template_id: templateId,
        floor_type: floorType
      });
      
      console.log(`Prepared floor "${floorLabel}" with ID ${floorId}, type: ${floorType}`);
    }
    
    console.log(`Inserting ${floorsToCreate.length} floors for project ${projectId}`);
    
    const { error: insertError } = await supabase
      .from('floors')
      .insert(floorsToCreate);
    
    if (insertError) {
      console.error("Error inserting floors:", insertError);
      throw insertError;
    }
    
    console.log(`Successfully created ${floorsToCreate.length} floors`);
    return createdFloorIds;
    
  } catch (error) {
    console.error("Error in createBulkFloors:", error);
    toast.error("Failed to create floors");
    throw error;
  }
}

export async function duplicateFloor(
  floorId: string,
  newLabel: string,
  newPosition: number
): Promise<string> {
  console.log(`Duplicating floor ${floorId} to position ${newPosition} with label "${newLabel}"`);
  
  try {
    // Get the original floor data
    const { data: originalFloor, error: fetchError } = await supabase
      .from('floors')
      .select('*, project_id, template_id')
      .eq('id', floorId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching original floor:", fetchError);
      throw fetchError;
    }
    
    if (!originalFloor) {
      throw new Error("Original floor not found");
    }
    
    console.log("Original floor data:", originalFloor);
    
    // Create new floor with same template
    const newFloorId = crypto.randomUUID();
    
    const { error: insertError } = await supabase
      .from('floors')
      .insert({
        id: newFloorId,
        project_id: originalFloor.project_id,
        label: newLabel,
        position: newPosition,
        template_id: originalFloor.template_id
      });
    
    if (insertError) {
      console.error("Error inserting new floor:", insertError);
      throw insertError;
    }
    
    // Get unit allocations from original floor
    const { data: allocations, error: allocError } = await supabase
      .from('unit_allocations')
      .select('unit_type_id, quantity')
      .eq('floor_id', floorId);
    
    if (allocError) {
      console.error("Error fetching original floor allocations:", allocError);
      throw allocError;
    }
    
    // Duplicate unit allocations if any exist
    if (allocations && allocations.length > 0) {
      console.log("Duplicating unit allocations:", allocations);
      
      const newAllocations = allocations.map(alloc => ({
        floor_id: newFloorId,
        unit_type_id: alloc.unit_type_id,
        quantity: alloc.quantity
      }));
      
      const { error: allocInsertError } = await supabase
        .from('unit_allocations')
        .insert(newAllocations);
      
      if (allocInsertError) {
        console.error("Error duplicating unit allocations:", allocInsertError);
        throw allocInsertError;
      }
    }
    
    console.log(`Successfully duplicated floor with ID ${newFloorId}`);
    return newFloorId;
    
  } catch (error) {
    console.error("Error in duplicateFloor:", error);
    toast.error("Failed to duplicate floor");
    throw error;
  }
}

export async function applyFloorToRange(
  sourceFloorId: string,
  targetFloorIds: string[],
  replaceExisting: boolean = true
): Promise<void> {
  console.log(`Applying floor ${sourceFloorId} configuration to ${targetFloorIds.length} floors`);
  
  try {
    // Get source floor unit allocations
    const { data: sourceAllocations, error: fetchError } = await supabase
      .from('unit_allocations')
      .select('unit_type_id, quantity')
      .eq('floor_id', sourceFloorId);
    
    if (fetchError) {
      console.error("Error fetching source floor allocations:", fetchError);
      throw fetchError;
    }
    
    console.log("Source allocations:", sourceAllocations);
    
    if (!sourceAllocations || sourceAllocations.length === 0) {
      console.log("No allocations found for source floor");
      return;
    }
    
    // Process each target floor
    for (const targetFloorId of targetFloorIds) {
      console.log(`Processing target floor: ${targetFloorId}`);
      
      // If replacing existing, delete current allocations
      if (replaceExisting) {
        console.log(`Removing existing allocations for floor ${targetFloorId}`);
        const { error: deleteError } = await supabase
          .from('unit_allocations')
          .delete()
          .eq('floor_id', targetFloorId);
        
        if (deleteError) {
          console.error(`Error deleting allocations for floor ${targetFloorId}:`, deleteError);
          throw deleteError;
        }
      }
      
      // Create new allocations based on source
      const newAllocations = sourceAllocations.map(alloc => ({
        floor_id: targetFloorId,
        unit_type_id: alloc.unit_type_id,
        quantity: alloc.quantity
      }));
      
      console.log(`Adding ${newAllocations.length} allocations to floor ${targetFloorId}`);
      
      const { error: insertError } = await supabase
        .from('unit_allocations')
        .insert(newAllocations);
      
      if (insertError) {
        console.error(`Error inserting allocations for floor ${targetFloorId}:`, insertError);
        throw insertError;
      }
    }
    
    console.log("Successfully applied floor configuration to all target floors");
  } catch (error) {
    console.error("Error in applyFloorToRange:", error);
    toast.error("Failed to apply floor configuration");
    throw error;
  }
}

// Removed all functions related to floor_usage_templates and floor_usage_template_allocations:
// - createFloorUsageTemplate
// - fetchFloorUsageTemplates
// - applyTemplateToFloors
// - deleteFloorUsageTemplate

