
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Unknown',
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  heart_rate INTEGER NOT NULL,
  systolic_bp INTEGER NOT NULL,
  diastolic_bp INTEGER NOT NULL,
  o2_saturation NUMERIC NOT NULL,
  temperature NUMERIC NOT NULL,
  respiratory_rate INTEGER NOT NULL,
  pain_score INTEGER NOT NULL DEFAULT 0,
  gcs_score INTEGER NOT NULL DEFAULT 15,
  arrival_mode TEXT NOT NULL DEFAULT 'Walk-in',
  diabetes BOOLEAN NOT NULL DEFAULT false,
  hypertension BOOLEAN NOT NULL DEFAULT false,
  heart_disease BOOLEAN NOT NULL DEFAULT false,
  risk_score NUMERIC,
  risk_label TEXT,
  explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all patients" ON public.patients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert patients" ON public.patients FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own patients" ON public.patients FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own patients" ON public.patients FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime for patients
ALTER PUBLICATION supabase_realtime ADD TABLE public.patients;
