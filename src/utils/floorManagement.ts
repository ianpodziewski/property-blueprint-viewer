
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

/**
 * Duplicates a floor with its template and unit allocations
 * @param floorId The ID of the floor to duplicate
 * @param newLabel The label for the new floor
 * @param newPosition The position for the new floor
 * @returns The ID of the newly created floor
 */
export const duplicateFloor = async (
  floorId: string,
  newLabel: string,
  newPosition: number
): Promise<string> => {
  try {
    // Get the source floor
    const { data: sourceFloor, error: floorError } = await supabase
      .from("floors")
      .select()
      .eq("id", floorId)
      .single();

    if (floorError || !sourceFloor) {
      console.error("Error getting source floor:", floorError);
      throw new Error("Failed to find source floor");
    }

    // Create the new floor
    const newFloorId = uuidv4();
    const { error: newFloorError } = await supabase
      .from("floors")
      .insert({
        id: newFloorId,
        label: newLabel,
        position: newPosition,
        template_id: sourceFloor.template_id,
        project_id: sourceFloor.project_id
      });

    if (newFloorError) {
      console.error("Error creating new floor:", newFloorError);
      throw new Error("Failed to create new floor");
    }

    // Get the unit allocations from the source floor
    const { data: allocations, error: allocationsError } = await supabase
      .from("unit_allocations")
      .select()
      .eq("floor_id", floorId);

    if (allocationsError) {
      console.error("Error getting unit allocations:", allocationsError);
      throw new Error("Failed to get unit allocations");
    }

    // Create new unit allocations for the new floor
    if (allocations && allocations.length > 0) {
      const newAllocations = allocations.map(allocation => ({
        floor_id: newFloorId,
        unit_type_id: allocation.unit_type_id,
        quantity: allocation.quantity
      }));

      const { error: newAllocationsError } = await supabase
        .from("unit_allocations")
        .insert(newAllocations);

      if (newAllocationsError) {
        console.error("Error creating new allocations:", newAllocationsError);
        throw new Error("Failed to create unit allocations");
      }
    }

    return newFloorId;
  } catch (error) {
    console.error("Error duplicating floor:", error);
    throw error;
  }
};

/**
 * Creates multiple floors with the same template
 * @param projectId Project ID
 * @param templateId Floor plate template ID
 * @param startFloor Starting floor number
 * @param endFloor Ending floor number
 * @param labelPrefix Prefix for floor labels
 * @returns Array of created floor IDs
 */
export const createBulkFloors = async (
  projectId: string,
  templateId: string,
  startFloor: number,
  endFloor: number,
  labelPrefix: string
): Promise<string[]> => {
  try {
    // Validate projectId is provided and not empty
    if (!projectId || projectId.trim() === '') {
      throw new Error("Project ID is required for creating floors");
    }
    
    const floorIds: string[] = [];
    const floorsToCreate = [];
    
    console.log(`Creating bulk floors for project: ${projectId}`);
    
    // Get the current max position to start positioning new floors
    const { data: existingFloors, error: floorsError } = await supabase
      .from("floors")
      .select("position")
      .eq("project_id", projectId) // Ensure projectId is passed correctly
      .order("position", { ascending: false })
      .limit(1);
      
    if (floorsError) {
      console.error("Error getting existing floors:", floorsError);
      throw new Error("Failed to get existing floors");
    }
    
    let startPosition = existingFloors && existingFloors.length > 0 ? existingFloors[0].position + 1 : 1;
    
    console.log(`Starting position for new floors: ${startPosition}`);
    
    // Create floors from start to end
    for (let i = startFloor; i <= endFloor; i++) {
      const floorId = uuidv4();
      floorIds.push(floorId);
      
      floorsToCreate.push({
        id: floorId,
        label: `${labelPrefix} ${i}`,
        position: startPosition + (i - startFloor),
        project_id: projectId,
        template_id: templateId
      });
    }
    
    console.log(`Creating ${floorsToCreate.length} floors for project ${projectId}`);
    
    // Insert all floors
    const { error: insertError } = await supabase
      .from("floors")
      .insert(floorsToCreate);
      
    if (insertError) {
      console.error("Error creating bulk floors:", insertError);
      throw new Error("Failed to create floors");
    }
    
    return floorIds;
  } catch (error) {
    console.error("Error creating bulk floors:", error);
    throw error;
  }
};

/**
 * Applies a floor's configuration to multiple floors
 * @param sourceFloorId Source floor ID
 * @param targetFloorIds Array of target floor IDs
 * @param replaceExisting Whether to replace existing unit allocations
 */
export const applyFloorToRange = async (
  sourceFloorId: string,
  targetFloorIds: string[],
  replaceExisting: boolean
): Promise<void> => {
  try {
    // Get the source floor's unit allocations
    const { data: sourceAllocations, error: allocationsError } = await supabase
      .from("unit_allocations")
      .select()
      .eq("floor_id", sourceFloorId);
      
    if (allocationsError || !sourceAllocations) {
      console.error("Error getting source allocations:", allocationsError);
      throw new Error("Failed to get source floor allocations");
    }
    
    // Process each target floor
    for (const targetFloorId of targetFloorIds) {
      // Delete existing allocations if specified
      if (replaceExisting) {
        const { error: deleteError } = await supabase
          .from("unit_allocations")
          .delete()
          .eq("floor_id", targetFloorId);
          
        if (deleteError) {
          console.error(`Error deleting allocations for floor ${targetFloorId}:`, deleteError);
          throw new Error("Failed to delete existing allocations");
        }
      }
      
      // Skip this floor if no allocations to copy
      if (sourceAllocations.length === 0) continue;
      
      // Create new allocations based on source
      const newAllocations = sourceAllocations.map(allocation => ({
        floor_id: targetFloorId,
        unit_type_id: allocation.unit_type_id,
        quantity: allocation.quantity
      }));
      
      // Insert new allocations or update existing ones
      if (replaceExisting) {
        // Insert new allocations
        const { error: insertError } = await supabase
          .from("unit_allocations")
          .insert(newAllocations);
          
        if (insertError) {
          console.error(`Error creating allocations for floor ${targetFloorId}:`, insertError);
          throw new Error("Failed to create allocations");
        }
      } else {
        // Upsert each allocation individually
        for (const allocation of sourceAllocations) {
          const { error: upsertError } = await supabase
            .from("unit_allocations")
            .upsert({
              floor_id: targetFloorId,
              unit_type_id: allocation.unit_type_id,
              quantity: allocation.quantity
            }, {
              onConflict: 'floor_id,unit_type_id'
            });
            
          if (upsertError) {
            console.error(`Error upserting allocation for floor ${targetFloorId}:`, upsertError);
            throw new Error("Failed to update allocations");
          }
        }
      }
    }
  } catch (error) {
    console.error("Error applying floor to range:", error);
    throw error;
  }
};

/**
 * Creates a floor usage template from a floor
 * @param projectId Project ID
 * @param name Template name
 * @param floorTemplateId Floor plate template ID
 * @param sourceFloorId Source floor ID to copy allocations from
 * @returns The ID of the created template
 */
export const createFloorUsageTemplate = async (
  projectId: string,
  name: string,
  floorTemplateId: string,
  sourceFloorId: string
): Promise<string> => {
  try {
    // Create the template
    const templateId = uuidv4();
    const { error: templateError } = await supabase
      .from("floor_usage_templates")
      .insert({
        id: templateId,
        name,
        project_id: projectId,
        template_id: floorTemplateId
      });
      
    if (templateError) {
      console.error("Error creating floor usage template:", templateError);
      throw new Error("Failed to create template");
    }
    
    // Get allocations from the source floor
    const { data: allocations, error: allocationsError } = await supabase
      .from("unit_allocations")
      .select()
      .eq("floor_id", sourceFloorId);
      
    if (allocationsError) {
      console.error("Error getting allocations:", allocationsError);
      throw new Error("Failed to get allocations");
    }
    
    // Create template allocations
    if (allocations && allocations.length > 0) {
      const templateAllocations = allocations.map(allocation => ({
        template_id: templateId,
        unit_type_id: allocation.unit_type_id,
        quantity: allocation.quantity
      }));
      
      const { error: allocError } = await supabase
        .from("floor_usage_template_allocations")
        .insert(templateAllocations);
        
      if (allocError) {
        console.error("Error creating template allocations:", allocError);
        throw new Error("Failed to create template allocations");
      }
    }
    
    return templateId;
  } catch (error) {
    console.error("Error creating floor usage template:", error);
    throw error;
  }
};

/**
 * Fetches floor usage templates for a project
 * @param projectId Project ID
 * @returns Array of floor usage templates
 */
export const fetchFloorUsageTemplates = async (projectId: string) => {
  try {
    if (!projectId || projectId.trim() === '') {
      console.warn("No project ID provided for fetching floor usage templates");
      return [];
    }
    
    const { data: templates, error } = await supabase
      .from("floor_usage_templates")
      .select()
      .eq("project_id", projectId);
      
    if (error) {
      console.error("Error fetching floor usage templates:", error);
      throw new Error("Failed to fetch templates");
    }
    
    return templates || [];
  } catch (error) {
    console.error("Error fetching floor usage templates:", error);
    // Return empty array instead of throwing to prevent UI errors
    return [];
  }
};

/**
 * Deletes a floor usage template
 * @param templateId Template ID
 */
export const deleteFloorUsageTemplate = async (templateId: string): Promise<void> => {
  try {
    // Delete template allocations first
    const { error: allocsError } = await supabase
      .from("floor_usage_template_allocations")
      .delete()
      .eq("template_id", templateId);
      
    if (allocsError) {
      console.error("Error deleting template allocations:", allocsError);
      throw new Error("Failed to delete template allocations");
    }
    
    // Delete the template
    const { error } = await supabase
      .from("floor_usage_templates")
      .delete()
      .eq("id", templateId);
      
    if (error) {
      console.error("Error deleting floor usage template:", error);
      throw new Error("Failed to delete template");
    }
  } catch (error) {
    console.error("Error deleting floor usage template:", error);
    throw error;
  }
};

/**
 * Applies a floor usage template to floors
 * @param templateId Template ID
 * @param floorIds Array of floor IDs to apply the template to
 */
export const applyTemplateToFloors = async (
  templateId: string,
  floorIds: string[]
): Promise<void> => {
  try {
    if (!templateId || templateId.trim() === '') {
      throw new Error("No template ID provided");
    }
    
    if (!floorIds || floorIds.length === 0) {
      throw new Error("No floor IDs provided");
    }
    
    // Get template allocations
    const { data: templateAllocations, error: allocsError } = await supabase
      .from("floor_usage_template_allocations")
      .select()
      .eq("template_id", templateId);
      
    if (allocsError) {
      console.error("Error getting template allocations:", allocsError);
      throw new Error("Failed to get template allocations");
    }
    
    // No allocations to apply
    if (!templateAllocations || templateAllocations.length === 0) {
      return;
    }
    
    // Apply to each floor
    for (const floorId of floorIds) {
      // Delete existing allocations
      const { error: deleteError } = await supabase
        .from("unit_allocations")
        .delete()
        .eq("floor_id", floorId);
        
      if (deleteError) {
        console.error(`Error deleting allocations for floor ${floorId}:`, deleteError);
        throw new Error("Failed to delete existing allocations");
      }
      
      // Create new allocations based on template
      const newAllocations = templateAllocations.map(allocation => ({
        floor_id: floorId,
        unit_type_id: allocation.unit_type_id,
        quantity: allocation.quantity
      }));
      
      const { error: insertError } = await supabase
        .from("unit_allocations")
        .insert(newAllocations);
        
      if (insertError) {
        console.error(`Error creating allocations for floor ${floorId}:`, insertError);
        throw new Error("Failed to create allocations");
      }
    }
  } catch (error) {
    console.error("Error applying template to floors:", error);
    throw error;
  }
};
