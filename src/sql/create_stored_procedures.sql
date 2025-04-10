
-- Create stored procedures for non_rentable_spaces
CREATE OR REPLACE FUNCTION public.get_non_rentable_spaces(p_project_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    square_footage INTEGER,
    allocation_method TEXT,
    specific_floors INTEGER[],
    project_id UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ns.id,
        ns.name,
        ns.square_footage,
        ns.allocation_method,
        ns.specific_floors,
        ns.project_id,
        ns.created_at,
        ns.updated_at
    FROM 
        public.non_rentable_spaces ns
    WHERE 
        ns.project_id = p_project_id
    ORDER BY 
        ns.name;
END; $$;

CREATE OR REPLACE FUNCTION public.create_non_rentable_space(
    p_id UUID,
    p_project_id UUID,
    p_name TEXT,
    p_square_footage INTEGER,
    p_allocation_method TEXT,
    p_specific_floors INTEGER[]
) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO public.non_rentable_spaces (
        id,
        project_id,
        name,
        square_footage,
        allocation_method,
        specific_floors
    ) VALUES (
        p_id,
        p_project_id,
        p_name,
        p_square_footage,
        p_allocation_method,
        p_specific_floors
    );
END; $$;

CREATE OR REPLACE FUNCTION public.update_non_rentable_space(
    p_id UUID,
    p_name TEXT,
    p_square_footage INTEGER,
    p_allocation_method TEXT,
    p_specific_floors INTEGER[]
) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    UPDATE public.non_rentable_spaces
    SET 
        name = COALESCE(p_name, name),
        square_footage = COALESCE(p_square_footage, square_footage),
        allocation_method = COALESCE(p_allocation_method, allocation_method),
        specific_floors = COALESCE(p_specific_floors, specific_floors),
        updated_at = now()
    WHERE 
        id = p_id;
END; $$;

CREATE OR REPLACE FUNCTION public.delete_non_rentable_space(
    p_id UUID
) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM public.non_rentable_spaces
    WHERE id = p_id;
END; $$;
