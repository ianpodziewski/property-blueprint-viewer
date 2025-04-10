
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

export async function createFloorUsageTemplate(
  projectId: string,
  templateName: string,
  floorTemplateId: string,
  sourceFloorId: string
): Promise<string> {
  console.log(`Creating floor usage template "${templateName}" for project ${projectId}`);
  
  try {
    // Create the template record
    const templateId = crypto.randomUUID();
    
    const { error: insertError } = await supabase
      .from('floor_usage_templates')
      .insert({
        id: templateId,
        project_id: projectId,
        name: templateName,
        template_id: floorTemplateId
      });
    
    if (insertError) {
      console.error("Error creating floor usage template:", insertError);
      throw insertError;
    }
    
    // Get the unit allocations from the source floor
    const { data: allocations, error: fetchError } = await supabase
      .from('unit_allocations')
      .select('unit_type_id, quantity')
      .eq('floor_id', sourceFloorId);
    
    if (fetchError) {
      console.error("Error fetching allocations for template:", fetchError);
      throw fetchError;
    }
    
    if (allocations && allocations.length > 0) {
      // Create allocation records for the template
      const templateAllocations = allocations.map(alloc => ({
        floor_usage_template_id: templateId,
        unit_type_id: alloc.unit_type_id,
        quantity: alloc.quantity
      }));
      
      const { error: allocError } = await supabase
        .from('floor_usage_template_allocations')
        .insert(templateAllocations);
      
      if (allocError) {
        console.error("Error creating template allocations:", allocError);
        throw allocError;
      }
    }
    
    console.log(`Successfully created floor usage template with ID ${templateId}`);
    return templateId;
    
  } catch (error) {
    console.error("Error in createFloorUsageTemplate:", error);
    toast.error("Failed to create floor template");
    throw error;
  }
}

export async function fetchFloorUsageTemplates(projectId: string) {
  console.log(`Fetching floor usage templates for project ${projectId}`);
  
  try {
    const { data, error } = await supabase
      .from('floor_usage_templates')
      .select('*')
      .eq('project_id', projectId)
      .order('name');
    
    if (error) {
      console.error("Error fetching floor usage templates:", error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} templates`);
    return data || [];
    
  } catch (error) {
    console.error("Error in fetchFloorUsageTemplates:", error);
    toast.error("Failed to fetch floor templates");
    throw error;
  }
}

export async function applyTemplateToFloors(
  templateId: string,
  floorIds: string[]
): Promise<void> {
  console.log(`Applying template ${templateId} to ${floorIds.length} floors`);
  
  try {
    // Get template allocations
    const { data: templateAllocations, error: fetchError } = await supabase
      .from('floor_usage_template_allocations')
      .select('unit_type_id, quantity')
      .eq('floor_usage_template_id', templateId);
    
    if (fetchError) {
      console.error("Error fetching template allocations:", fetchError);
      throw fetchError;
    }
    
    if (!templateAllocations || templateAllocations.length === 0) {
      console.log("No allocations found for this template");
      return;
    }
    
    // Process each floor
    for (const floorId of floorIds) {
      console.log(`Processing floor ${floorId}`);
      
      // Remove existing allocations
      const { error: deleteError } = await supabase
        .from('unit_allocations')
        .delete()
        .eq('floor_id', floorId);
      
      if (deleteError) {
        console.error(`Error deleting allocations for floor ${floorId}:`, deleteError);
        throw deleteError;
      }
      
      // Create new allocations based on template
      const newAllocations = templateAllocations.map(alloc => ({
        floor_id: floorId,
        unit_type_id: alloc.unit_type_id,
        quantity: alloc.quantity
      }));
      
      const { error: insertError } = await supabase
        .from('unit_allocations')
        .insert(newAllocations);
      
      if (insertError) {
        console.error(`Error inserting allocations for floor ${floorId}:`, insertError);
        throw insertError;
      }
    }
    
    console.log("Successfully applied template to all floors");
  } catch (error) {
    console.error("Error in applyTemplateToFloors:", error);
    toast.error("Failed to apply template to floors");
    throw error;
  }
}

export async function deleteFloorUsageTemplate(templateId: string): Promise<void> {
  console.log(`Deleting floor usage template ${templateId}`);
  
  try {
    // First delete associated allocations
    const { error: allocDeleteError } = await supabase
      .from('floor_usage_template_allocations')
      .delete()
      .eq('floor_usage_template_id', templateId);
    
    if (allocDeleteError) {
      console.error("Error deleting template allocations:", allocDeleteError);
      throw allocDeleteError;
    }
    
    // Then delete the template itself
    const { error: templateDeleteError } = await supabase
      .from('floor_usage_templates')
      .delete()
      .eq('id', templateId);
    
    if (templateDeleteError) {
      console.error("Error deleting template:", templateDeleteError);
      throw templateDeleteError;
    }
    
    console.log("Successfully deleted floor usage template");
  } catch (error) {
    console.error("Error in deleteFloorUsageTemplate:", error);
    toast.error("Failed to delete floor template");
    throw error;
  }
}

export async function getNonRentableSpaces(projectId: string) {
  console.log(`Fetching non-rentable spaces for project ${projectId}`);
  
  try {
    const { data, error } = await supabase
      .from('non_rentable_spaces')
      .select('*')
      .eq('project_id', projectId)
      .order('name');
    
    if (error) {
      console.error("Error fetching non-rentable spaces:", error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} non-rentable spaces`);
    return data || [];
    
  } catch (error) {
    console.error("Error in getNonRentableSpaces:", error);
    toast.error("Failed to fetch non-rentable spaces");
    throw error;
  }
}

export async function createNonRentableSpace(
  projectId: string, 
  name: string, 
  squareFootage: number, 
  allocationMethod: string, 
  specificFloors: number[] = []
): Promise<string> {
  console.log(`Creating non-rentable space "${name}" for project ${projectId}`);
  
  try {
    const id = crypto.randomUUID();
    
    const { error } = await supabase
      .from('non_rentable_spaces')
      .insert({
        id,
        project_id: projectId,
        name,
        square_footage: squareFootage,
        allocation_method: allocationMethod,
        specific_floors: specificFloors.length > 0 ? specificFloors : null
      });
    
    if (error) {
      console.error("Error creating non-rentable space:", error);
      throw error;
    }
    
    console.log(`Successfully created non-rentable space with ID ${id}`);
    return id;
    
  } catch (error) {
    console.error("Error in createNonRentableSpace:", error);
    toast.error("Failed to create non-rentable space");
    throw error;
  }
}

export async function updateNonRentableSpace(
  id: string,
  updates: {
    name?: string;
    squareFootage?: number;
    allocationMethod?: string;
    specificFloors?: number[];
  }
): Promise<void> {
  console.log(`Updating non-rentable space ${id}`);
  
  try {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.squareFootage !== undefined) updateData.square_footage = updates.squareFootage;
    if (updates.allocationMethod !== undefined) updateData.allocation_method = updates.allocationMethod;
    if (updates.specificFloors !== undefined) {
      updateData.specific_floors = updates.specificFloors.length > 0 
        ? updates.specificFloors 
        : null;
    }
    
    const { error } = await supabase
      .from('non_rentable_spaces')
      .update(updateData)
      .eq('id', id);
    
    if (error) {
      console.error("Error updating non-rentable space:", error);
      throw error;
    }
    
    console.log(`Successfully updated non-rentable space ${id}`);
  } catch (error) {
    console.error("Error in updateNonRentableSpace:", error);
    toast.error("Failed to update non-rentable space");
    throw error;
  }
}

export async function deleteNonRentableSpace(id: string): Promise<void> {
  console.log(`Deleting non-rentable space ${id}`);
  
  try {
    const { error } = await supabase
      .from('non_rentable_spaces')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting non-rentable space:", error);
      throw error;
    }
    
    console.log(`Successfully deleted non-rentable space ${id}`);
  } catch (error) {
    console.error("Error in deleteNonRentableSpace:", error);
    toast.error("Failed to delete non-rentable space");
    throw error;
  }
}
