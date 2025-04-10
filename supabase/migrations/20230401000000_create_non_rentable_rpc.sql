
-- Create an RPC function to check and create the non_rentable_types table if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_non_rentable_types_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'non_rentable_types'
  ) THEN
    -- Create the table if it doesn't exist
    CREATE TABLE public.non_rentable_types (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      square_footage NUMERIC NOT NULL DEFAULT 0,
      allocation_method TEXT NOT NULL DEFAULT 'uniform',
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
    
    -- Create updated_at trigger
    CREATE TRIGGER set_non_rentable_types_updated_at
    BEFORE UPDATE ON public.non_rentable_types
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;
