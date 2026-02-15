-- Add department column to patients table
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS department TEXT;

-- Comment on column
COMMENT ON COLUMN public.patients.department IS 'The medical department assigned to the patient via triage';
