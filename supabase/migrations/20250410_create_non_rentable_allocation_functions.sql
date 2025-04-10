
-- Function to get non-rentable allocations for a project
CREATE OR REPLACE FUNCTION public.get_non_rentable_allocations_for_project(project_id uuid)
RETURNS TABLE(
  id uuid,
  floor_id uuid,
  non_rentable_type_id uuid, 
  square_footage numeric,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
AS $$
  SELECT 
    nra.id,
    nra.floor_id,
    nra.non_rentable_type_id,
    nra.square_footage,
    nra.created_at,
    nra.updated_at
  FROM 
    non_rentable_allocations nra
  JOIN 
    floors f ON nra.floor_id = f.id
  WHERE 
    f.project_id = project_id;
$$;

-- Function to insert a new non-rentable allocation
CREATE OR REPLACE FUNCTION public.insert_non_rentable_allocation(
  p_floor_id uuid,
  p_non_rentable_type_id uuid,
  p_square_footage numeric
)
RETURNS TABLE(id uuid)
LANGUAGE plpgsql
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO non_rentable_allocations(
    floor_id,
    non_rentable_type_id,
    square_footage
  ) VALUES (
    p_floor_id,
    p_non_rentable_type_id,
    p_square_footage
  )
  RETURNING id INTO v_id;
  
  RETURN QUERY SELECT v_id;
END;
$$;

-- Function to update an existing non-rentable allocation
CREATE OR REPLACE FUNCTION public.update_non_rentable_allocation(
  p_id uuid,
  p_square_footage numeric
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE non_rentable_allocations
  SET 
    square_footage = p_square_footage,
    updated_at = now()
  WHERE id = p_id;
END;
$$;

-- Function to delete a non-rentable allocation
CREATE OR REPLACE FUNCTION public.delete_non_rentable_allocation(
  p_id uuid
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM non_rentable_allocations
  WHERE id = p_id;
END;
$$;
