-- Add chief_complaint column to patients table
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS chief_complaint TEXT;

-- Comment on column
COMMENT ON COLUMN public.patients.chief_complaint IS 'The reported symptoms or chief complaint provided by the patient';
