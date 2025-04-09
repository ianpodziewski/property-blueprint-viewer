
import { extendedSupabase as supabase } from "@/context/ProjectContext";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

/**
 * Duplicates a floor and all its unit allocations
 * @param sourceFloorId - ID of the floor to duplicate
 * @param newLabel - Label for the new floor 
 * @param newPosition - Position value for the new floor
 * @returns The ID of the newly created floor or null on failure
 */
export async function duplicateFloor(
  sourceFloorId: string,
  newLabel: string,
  newPosition: number
): Promise<string | null> {
  try {
    // Begin a Supabase transaction
    const { data: sourceFloor, error: floorError } = await supabase
      .from("floors")
      .select("*")
      .eq("id", sourceFloorId)
      .single();

    if (floorError || !sourceFloor) {
      console.error("Error fetching source floor:", floorError);
      toast.error("Failed to duplicate floor: Source floor not found");
      return null;
    }

    // Create the new floor with copied attributes
    const newFloorId = uuidv4();
    const { error: insertError } = await supabase
      .from("floors")
      .insert({
        id: newFloorId,
        project_id: sourceFloor.project_id,
        label: newLabel,
        position: newPosition,
        template_id: sourceFloor.template_id,
      });

    if (insertError) {
      console.error("Error inserting new floor:", insertError);
      toast.error("Failed to duplicate floor: Could not create new floor");
      return null;
    }

    // Fetch existing unit allocations
    const { data: unitAllocations, error: allocError } = await supabase
      .from("unit_allocations")
      .select("*")
      .eq("floor_id", sourceFloorId);

    if (allocError) {
      console.error("Error fetching unit allocations:", allocError);
      toast.error("Failed to duplicate floor: Could not retrieve unit allocations");
      // Note: We don't return null here as the floor was created, just without allocations
    }

    // Copy unit allocations if they exist
    if (unitAllocations && unitAllocations.length > 0) {
      const newAllocations = unitAllocations.map(alloc => ({
        floor_id: newFloorId,
        unit_type_id: alloc.unit_type_id,
        quantity: alloc.quantity
      }));

      const { error: allocInsertError } = await supabase
        .from("unit_allocations")
        .insert(newAllocations);

      if (allocInsertError) {
        console.error("Error copying unit allocations:", allocInsertError);
        toast.error("Floor duplicated, but unit allocations could not be copied");
      }
    }

    toast.success(`Floor "${newLabel}" successfully created`);
    return newFloorId;
  } catch (error) {
    console.error("Unexpected error in duplicateFloor:", error);
    toast.error("An unexpected error occurred while duplicating the floor");
    return null;
  }
}

/**
 * Creates multiple floors with the same template in bulk
 * @param projectId - ID of the project
 * @param templateId - ID of the floor plate template to use
 * @param startFloor - Starting floor number 
 * @param endFloor - Ending floor number
 * @param labelPrefix - Prefix for floor labels (e.g., "Floor")
 * @returns Array of created floor IDs or empty array on failure
 */
export async function bulkCreateFloors(
  projectId: string,
  templateId: string | null,
  startFloor: number,
  endFloor: number,
  labelPrefix: string = "Floor"
): Promise<string[]> {
  try {
    if (endFloor < startFloor) {
      toast.error("End floor number must be greater than or equal to start floor number");
      return [];
    }

    // Get the max position to ensure new floors are placed above existing ones
    const { data: existingFloors, error: positionError } = await supabase
      .from("floors")
      .select("position")
      .eq("project_id", projectId)
      .order("position", { ascending: false })
      .limit(1);

    let startPosition = 1;
    if (!positionError && existingFloors && existingFloors.length > 0) {
      startPosition = existingFloors[0].position + 1;
    }

    const newFloorIds: string[] = [];
    const floors = [];

    // Create floor entries
    for (let i = startFloor; i <= endFloor; i++) {
      const floorId = uuidv4();
      newFloorIds.push(floorId);

      floors.push({
        id: floorId,
        project_id: projectId,
        label: `${labelPrefix} ${i}`,
        position: startPosition + (i - startFloor),
        template_id: templateId
      });
    }

    // Insert all floors at once
    const { error: insertError } = await supabase
      .from("floors")
      .insert(floors);

    if (insertError) {
      console.error("Error inserting bulk floors:", insertError);
      toast.error("Failed to create floors in bulk");
      return [];
    }

    toast.success(`Created ${floors.length} floors successfully`);
    return newFloorIds;
  } catch (error) {
    console.error("Unexpected error in bulkCreateFloors:", error);
    toast.error("An unexpected error occurred while creating floors");
    return [];
  }
}

/**
 * Applies a floor usage template to existing floors
 * @param templateId - ID of the floor usage template to apply
 * @param floorIds - Array of floor IDs to apply the template to
 * @returns Boolean indicating success or failure
 */
export async function applyTemplateToFloors(
  templateId: string,
  floorIds: string[]
): Promise<boolean> {
  try {
    if (!floorIds.length) {
      toast.warning("No floors selected to apply template");
      return false;
    }

    // Get the floor usage template
    const { data: template, error: templateError } = await supabase
      .from("floor_usage_templates")
      .select(`
        *,
        floor_plate_templates!inner(id),
        floor_usage_template_allocations!inner(unit_type_id, quantity)
      `)
      .eq("id", templateId)
      .single();

    if (templateError || !template) {
      console.error("Error fetching floor usage template:", templateError);
      toast.error("Failed to apply template: Template not found");
      return false;
    }

    const floorPlateTemplateId = template.floor_plate_templates.id;
    const allocations = template.floor_usage_template_allocations;

    // Process each floor
    for (const floorId of floorIds) {
      // 1. Update floor template_id if specified
      if (floorPlateTemplateId) {
        const { error: updateError } = await supabase
          .from("floors")
          .update({ template_id: floorPlateTemplateId })
          .eq("id", floorId);

        if (updateError) {
          console.error(`Error updating floor ${floorId}:`, updateError);
          toast.error(`Failed to update template for floor ID ${floorId}`);
          continue; // Try the next floor
        }
      }

      // 2. Delete existing unit allocations for this floor
      const { error: deleteError } = await supabase
        .from("unit_allocations")
        .delete()
        .eq("floor_id", floorId);

      if (deleteError) {
        console.error(`Error deleting unit allocations for floor ${floorId}:`, deleteError);
        toast.error(`Failed to clear existing allocations for floor ID ${floorId}`);
        continue; // Try the next floor
      }

      // 3. Create new unit allocations based on the template
      if (allocations && allocations.length > 0) {
        const newAllocations = allocations.map(alloc => ({
          floor_id: floorId,
          unit_type_id: alloc.unit_type_id,
          quantity: alloc.quantity
        }));

        const { error: insertError } = await supabase
          .from("unit_allocations")
          .insert(newAllocations);

        if (insertError) {
          console.error(`Error inserting allocations for floor ${floorId}:`, insertError);
          toast.error(`Failed to apply unit allocations to floor ID ${floorId}`);
        }
      }
    }

    toast.success(`Template applied to ${floorIds.length} floor(s) successfully`);
    return true;
  } catch (error) {
    console.error("Unexpected error in applyTemplateToFloors:", error);
    toast.error("An unexpected error occurred while applying the template");
    return false;
  }
}

/**
 * Creates a new floor usage template based on a floor's configuration
 * @param projectId - ID of the project
 * @param floorId - ID of the floor to use as template source
 * @param templateName - Name for the new template
 * @returns ID of the newly created template or null on failure
 */
export async function createTemplateFromFloor(
  projectId: string,
  floorId: string,
  templateName: string
): Promise<string | null> {
  try {
    // Get floor data and its template
    const { data: floor, error: floorError } = await supabase
      .from("floors")
      .select("*")
      .eq("id", floorId)
      .single();

    if (floorError || !floor) {
      console.error("Error fetching floor:", floorError);
      toast.error("Failed to create template: Source floor not found");
      return null;
    }

    // Create the new floor usage template
    const newTemplateId = uuidv4();
    const { error: templateError } = await supabase
      .from("floor_usage_templates")
      .insert({
        id: newTemplateId,
        project_id: projectId,
        name: templateName,
        template_id: floor.template_id
      });

    if (templateError) {
      console.error("Error creating floor usage template:", templateError);
      toast.error("Failed to create floor usage template");
      return null;
    }

    // Fetch existing unit allocations
    const { data: unitAllocations, error: allocError } = await supabase
      .from("unit_allocations")
      .select("*")
      .eq("floor_id", floorId);

    if (allocError) {
      console.error("Error fetching unit allocations:", allocError);
      toast.error("Template created, but without unit allocations");
      return newTemplateId; // Return template ID even though allocations failed
    }

    // Copy unit allocations to the template if they exist
    if (unitAllocations && unitAllocations.length > 0) {
      const templateAllocations = unitAllocations.map(alloc => ({
        template_id: newTemplateId,
        unit_type_id: alloc.unit_type_id,
        quantity: alloc.quantity
      }));

      const { error: allocInsertError } = await supabase
        .from("floor_usage_template_allocations")
        .insert(templateAllocations);

      if (allocInsertError) {
        console.error("Error copying unit allocations to template:", allocInsertError);
        toast.error("Template created, but unit allocations could not be copied");
      }
    }

    toast.success(`Floor usage template "${templateName}" created successfully`);
    return newTemplateId;
  } catch (error) {
    console.error("Unexpected error in createTemplateFromFloor:", error);
    toast.error("An unexpected error occurred while creating the template");
    return null;
  }
}

/**
 * Save the current floor usage template with updated unit allocations
 * @param templateId - ID of the template to update
 * @param unitAllocations - Array of {unitTypeId, quantity} objects
 * @returns Boolean indicating success or failure
 */
export async function updateFloorUsageTemplate(
  templateId: string, 
  unitAllocations: Array<{ unitTypeId: string, quantity: number }>
): Promise<boolean> {
  try {
    // Delete existing allocations
    const { error: deleteError } = await supabase
      .from("floor_usage_template_allocations")
      .delete()
      .eq("template_id", templateId);
      
    if (deleteError) {
      console.error("Error deleting existing allocations:", deleteError);
      toast.error("Failed to update template: Could not clear existing allocations");
      return false;
    }
    
    // Add new allocations if there are any
    if (unitAllocations && unitAllocations.length > 0) {
      const newAllocations = unitAllocations
        .filter(alloc => alloc.quantity > 0) // Only insert non-zero allocations
        .map(alloc => ({
          template_id: templateId,
          unit_type_id: alloc.unitTypeId,
          quantity: alloc.quantity
        }));
        
      if (newAllocations.length > 0) {
        const { error: insertError } = await supabase
          .from("floor_usage_template_allocations")
          .insert(newAllocations);
          
        if (insertError) {
          console.error("Error inserting new allocations:", insertError);
          toast.error("Failed to update template allocations");
          return false;
        }
      }
    }
    
    toast.success("Floor usage template updated successfully");
    return true;
  } catch (error) {
    console.error("Unexpected error in updateFloorUsageTemplate:", error);
    toast.error("An unexpected error occurred while updating the template");
    return false;
  }
}

/**
 * Get all floor usage templates for a project
 * @param projectId - ID of the project
 * @returns Array of floor usage templates with their allocations
 */
export async function getFloorUsageTemplates(projectId: string) {
  try {
    const { data, error } = await supabase
      .from("floor_usage_templates")
      .select(`
        *,
        floor_plate_templates(id, name, area),
        floor_usage_template_allocations(
          unit_type_id, 
          quantity,
          unit_types:unit_types(id, name, area, category)
        )
      `)
      .eq("project_id", projectId);

    if (error) {
      console.error("Error fetching floor usage templates:", error);
      toast.error("Failed to load floor templates");
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error in getFloorUsageTemplates:", error);
    toast.error("An unexpected error occurred while fetching templates");
    return [];
  }
}

/**
 * Delete a floor usage template
 * @param templateId - ID of the template to delete
 * @returns Boolean indicating success or failure
 */
export async function deleteFloorUsageTemplate(templateId: string): Promise<boolean> {
  try {
    // The allocations will be deleted automatically through the CASCADE constraint
    const { error } = await supabase
      .from("floor_usage_templates")
      .delete()
      .eq("id", templateId);

    if (error) {
      console.error("Error deleting floor usage template:", error);
      toast.error("Failed to delete floor template");
      return false;
    }

    toast.success("Floor template deleted successfully");
    return true;
  } catch (error) {
    console.error("Unexpected error in deleteFloorUsageTemplate:", error);
    toast.error("An unexpected error occurred while deleting the template");
    return false;
  }
}
