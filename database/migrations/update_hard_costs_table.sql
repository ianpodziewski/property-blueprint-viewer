
-- Add unit_type_id column to hard_costs table if it doesn't exist
ALTER TABLE hard_costs ADD COLUMN IF NOT EXISTS unit_type_id UUID REFERENCES unit_types(id) ON DELETE CASCADE;

-- Add a comment to the column
COMMENT ON COLUMN hard_costs.unit_type_id IS 'Optional reference to a specific unit type for more granular cost tracking';
