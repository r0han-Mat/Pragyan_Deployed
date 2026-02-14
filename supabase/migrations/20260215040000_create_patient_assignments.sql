-- Create a table to track patient assignments to departments
create table if not exists public.patient_assignments (
    id uuid default gen_random_uuid() primary key,
    patient_id uuid references public.patients(id) on delete cascade,
    patient_name text not null,
    department text not null,
    doctor_name text,
    assigned_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies if needed (assuming public access for prototype or authenticated)
alter table public.patient_assignments enable row level security;

create policy "Allow all access for authenticated users"
on public.patient_assignments
for all
to authenticated
using (true)
with check (true);

-- Allow anon for dev if needed (optional)
create policy "Allow all access for anon users"
on public.patient_assignments
for all
to anon
using (true)
with check (true);
